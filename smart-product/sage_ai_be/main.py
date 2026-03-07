"""
Sage AI Backend - Main Application Entry Point
===============================================

A FastAPI application with health check, S3, database, and Cortex API endpoints.
Organized using modular structure with proper separation of concerns.
"""

import dotenv

dotenv.load_dotenv()

import logging
import json
import sys
import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from starlette.middleware.base import BaseHTTPMiddleware
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.resources import Resource

from data_service.routes.cortex import cortex_router
from data_service.routes.health import health_router
from data_service.routes.users import router as users_router
from data_service.routes.forms import router as forms_router
from data_service.routes.form_dashboard import form_dashboard_router
from data_service.routes.user_submissions import user_submissions_router
from data_service.routes.suggestions import router as suggestions_router
from data_service.routes.service_now import service_now_router
from data_service.routes.enhance_answer import enhance_answer_router
from data_service.routes.score import score_router
from data_service.routes.ai_interaction import router as ai_interaction_router
from data_service.routes.suggestions_coverage import (
    router as check_suggestions_coverage_router,
)
from data_service.routes.ai_feedback import router as ai_feedback_router
from data_service.routes.progress_streaming import router as progress_streaming_router
from data_service.routes.faiss_search import router as faiss_search_router
from data_service.utils.logger import configure_logging
from data_service.utils.embedding_model import load_embedding_model, get_embedding_model
from data_service.service.faiss_service import initialize_faiss_service
from data_service.configurations.settings import settings
from data_service.handlers.exception_handlers import register_exception_handlers
from data_service.clients.http_client import close_all_http_clients

# from data_service.routes.database import db_router


def configure_tracing():
    """
    Configure OpenTelemetry tracing with OTLP exporter (reads from ConfigMap)
    """
    # Read telemetry config from environment (Kubernetes ConfigMap)
    telemetry_config_str = os.getenv("TELEMETRY_CONFIG", "{}")
    app_name = "sage-ai-backend"
    tracer_url = None
    tracer_type = None

    try:
        telemetry_config = json.loads(telemetry_config_str)
        tracer_config = telemetry_config.get("tracerProvider", {})
        tracer_type = tracer_config.get("type")
        tracer_url = tracer_config.get("url")
        app_name = telemetry_config.get("applicationName", app_name)
    except json.JSONDecodeError as e:
        logging.warning("Failed to parse TELEMETRY_CONFIG: %s", e)
        # Continue with defaults if config parsing fails

    # Create resource with service name
    resource = Resource(attributes={"service.name": app_name})

    # Initialize tracer provider (always, for trace ID generation)
    tracer_provider = TracerProvider(resource=resource)

    # Add OTLP exporter only if Jaeger is configured
    if tracer_type and tracer_url:
        # Use insecure (no TLS) for http:// URLs, secure for https://
        use_insecure = tracer_url.startswith("http://")
        otlp_exporter = OTLPSpanExporter(endpoint=tracer_url, insecure=use_insecure)
        tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        logging.info(
            "Tracing configured for %s with %s at %s", app_name, tracer_type, tracer_url
        )
    else:
        logging.info(
            "Tracing enabled for %s (trace IDs generated, but not exported to Jaeger)",
            app_name,
        )

    # Set the tracer provider
    trace.set_tracer_provider(tracer_provider)

    # Instrument SQLAlchemy for automatic database query tracing
    SQLAlchemyInstrumentor().instrument()

    # Instrument requests library for automatic HTTP call tracing
    RequestsInstrumentor().instrument()


# Configure logging
configure_logging()

# Configure tracing
configure_tracing()


# Middleware to add trace ID to response headers
class TraceIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Get current span and add trace_id to response headers
        span = trace.get_current_span()
        if span:
            span_context = span.get_span_context()
            if span_context and span_context.is_valid:
                trace_id = format(span_context.trace_id, "032x")
                response.headers["X-Trace-Id"] = trace_id

        return response


# Define lifespan function before FastAPI app initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load resources at application startup"""
    try:
        logging.info("Starting application initialization...")

        # Load embedding model with configurable model name from environment
        model_name = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
        logging.info("Loading embedding model: %s", model_name)
        load_embedding_model(model_name)
        logging.info("Embedding model loaded successfully")

        # Initialize FAISS service if enabled
        if settings.faiss_enabled:
            logging.info("FAISS service is enabled, initializing...")

            # Check if using S3 or local files
            if settings.faiss_use_s3:
                logging.info("FAISS configured to use S3 download")
                if (
                    not settings.faiss_s3_index_key
                    or not settings.faiss_s3_metadata_key
                ):
                    logging.warning(
                        "FAISS S3 download enabled but S3 keys not configured. "
                        "Set FAISS_S3_INDEX_KEY and FAISS_S3_METADATA_KEY in environment."
                    )
                else:
                    try:
                        embedding_model = get_embedding_model()
                        initialize_faiss_service(
                            index_path=settings.faiss_index_path or "faiss_index.index",
                            metadata_path=settings.faiss_metadata_path
                            or "faiss_metadata.parquet",
                            embedding_model=embedding_model,
                            download_from_s3=True,
                            s3_index_key=settings.faiss_s3_index_key,
                            s3_metadata_key=settings.faiss_s3_metadata_key,
                        )
                        logging.info("FAISS service initialized successfully from S3")
                    except Exception as faiss_error:
                        logging.error(
                            "Failed to initialize FAISS service from S3: %s",
                            faiss_error,
                        )
                        # Don't fail startup, but log the error
            else:
                # Use local files
                if not settings.faiss_index_path or not settings.faiss_metadata_path:
                    logging.warning(
                        "FAISS service enabled but local paths not configured. "
                        "Set FAISS_INDEX_PATH and FAISS_METADATA_PATH in environment."
                    )
                else:
                    try:
                        embedding_model = get_embedding_model()
                        initialize_faiss_service(
                            index_path=settings.faiss_index_path,
                            metadata_path=settings.faiss_metadata_path,
                            embedding_model=embedding_model,
                            download_from_s3=False,
                        )
                        logging.info(
                            "FAISS service initialized successfully from local files"
                        )
                    except Exception as faiss_error:
                        logging.error(
                            "Failed to initialize FAISS service from local files: %s",
                            faiss_error,
                        )
                        # Don't fail startup, but log the error
        else:
            logging.info("FAISS service is disabled in configuration")

        logging.info("Application startup completed successfully")
        yield  # Application runs here

    except Exception as e:
        logging.error("Failed to initialize startup resources: %s", e)
        # Don't fail the startup, but log the error
        # The model can be loaded later if needed
        yield  # Still allow app to start

    finally:
        # Cleanup code runs during shutdown
        logging.info("Application shutdown initiated")
        # Add any cleanup logic here if needed (e.g., closing connections)


# FastAPI app initialization
app = FastAPI(
    title="Sage AI Backend API",
    description="API for Sage AI with S3, Database, and Cortex integrations",
    version="1.0.0",
    openapi_version="3.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,  # Use the lifespan function defined above
)


# Register routers
# Health router at root level for standard health check endpoints
app.include_router(health_router)
# API routers under /api prefix
app.include_router(users_router, prefix="/api")
app.include_router(forms_router, prefix="/api")
app.include_router(form_dashboard_router, prefix="/api")
app.include_router(user_submissions_router, prefix="/api")
app.include_router(suggestions_router, prefix="/api")
app.include_router(service_now_router, prefix="/api")
app.include_router(enhance_answer_router, prefix="/api")
app.include_router(score_router, prefix="/api")
app.include_router(check_suggestions_coverage_router, prefix="/api")
app.include_router(ai_feedback_router, prefix="/api")
app.include_router(progress_streaming_router)  # SSE routes include /api prefix
app.include_router(faiss_search_router, prefix="/api")  # FAISS search routes
app.include_router(ai_interaction_router, prefix="/api")

# Remove this Line post testing -> app.include_router(db_router, prefix="/api")
app.include_router(cortex_router, prefix="/api")

# Add middleware
app.add_middleware(TraceIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_methods_list,
    allow_headers=settings.cors_headers_list,
    expose_headers=settings.cors_expose_headers_list,
)

# Initialize Prometheus instrumentation
# This will automatically add /metrics endpoint and collect FastAPI metrics
Instrumentator().instrument(app).expose(app)

# Instrument FastAPI with OpenTelemetry
FastAPIInstrumentor.instrument_app(app)

# Register global exception handlers
register_exception_handlers(app)


# Application lifecycle events
@app.on_event("shutdown")
async def shutdown_event():
    """
    Cleanup resources on application shutdown.
    Closes all HTTP client connections to prevent resource leaks.
    """
    logging.info("Shutting down application, closing HTTP clients...")
    await close_all_http_clients()
    logging.info("HTTP clients closed successfully")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
