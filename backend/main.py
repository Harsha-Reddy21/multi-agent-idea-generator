
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
import json
import time
from datetime import datetime
from dotenv import load_dotenv

from services.chat_service import ChatService

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    logger.info(f"✅ Loaded .env file from: {env_path}")
else:
    load_dotenv()  # Try default locations
    logger.warning(f"⚠️  .env file not found at: {env_path}")


app = FastAPI(
    title="Smart Product Profile API",
    description="Document-aware chat agent API",
    version="1.0.0"
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log basic request info
    logger.info(f"Incoming {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response {response.status_code} for {request.method} {request.url.path} (took {process_time:.3f}s)")
    
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
logger.info("=" * 80)
logger.info("Initializing services...")
logger.info("=" * 80)



chat_service = ChatService()



# Request/Response models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    document_content: Optional[str] = None
    chat_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    confidence_score: Optional[int] = None
    document_suggestions: Optional[str] = None  # Updated HTML content with suggestions merged


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Smart Product Profile API is running"
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="API is operational"
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    request_id = f"req_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    
    try:
        logger.info(f"  - Message: {request.message[:200]}...")
        logger.info(f"  - Document content length: {len(request.document_content or '')} chars")
        logger.info(f"  - Chat history count: {len(request.chat_history or [])} messages")
        
        if request.chat_history:
            logger.info(f"  - Chat history:")
            for idx, msg in enumerate(request.chat_history[-3:]):  # Log last 3 messages
                logger.info(f"    [{idx}] {msg.role}: {msg.content[:100]}...")
        
        if not request.message or not request.message.strip():
            logger.warning(f"[{request_id}] Empty message received")
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Convert Pydantic models to dictionaries for chat service
        chat_history_dicts = []
        if request.chat_history:
            for msg in request.chat_history:
                chat_history_dicts.append({
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp
                })

        logger.info(f"  - User message: {request.message}")
        logger.info(f"  - Document content preview: {(request.document_content or '')[:200]}...")
        logger.info(f"  - Chat history items: {len(chat_history_dicts)}")
        
        # Get response from chat service
        response_data = await chat_service.get_response(
            user_message=request.message,
            document_content=request.document_content or "",
            chat_history=chat_history_dicts,
            request_id=request_id
        )
        
        logger.info(f"[{request_id}] Chat service response received")
        logger.info(f"[{request_id}] Response details:")
        logger.info(f"  - Response length: {len(response_data.get('response', ''))} chars")
        logger.info(f"  - Confidence score: {response_data.get('confidence_score')}")
        logger.info(f"  - Response preview: {response_data.get('response', '')[:200]}...")
        logger.info(f"  - Has document_suggestions in response_data: {bool(response_data.get('document_suggestions'))}")
        if response_data.get("document_suggestions"):
            doc_sug = response_data.get("document_suggestions")
            logger.info(f"  - Document suggestions type: {type(doc_sug)}")
            logger.info(f"  - Document suggestions length: {len(str(doc_sug))} chars")
            logger.info(f"  - Document suggestions preview: {str(doc_sug)[:300]}...")
        
        result = ChatResponse(
            response=response_data["response"],
            confidence_score=response_data.get("confidence_score"),
            document_suggestions=response_data.get("document_suggestions")
        )
        
        logger.info(f"[{request_id}] ✅ Request completed successfully")
        logger.info(f"[{request_id}] Response summary:")
        logger.info(f"  - Response length: {len(response_data.get('response', ''))} chars")
        logger.info(f"  - Confidence score: {response_data.get('confidence_score')}")
        logger.info(f"  - Has document_suggestions: {bool(result.document_suggestions)}")
        if result.document_suggestions:
            logger.info(f"  - Document suggestions length: {len(result.document_suggestions)} chars")
            logger.info(f"  - Document suggestions preview: {result.document_suggestions[:300]}...")
        logger.info("=" * 80)
        
        return result
    
    except HTTPException as e:
        logger.error(f"[{request_id}] HTTP Exception: {e.status_code} - {e.detail}")
        logger.info("=" * 80)
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"[{request_id}] Error processing chat request:")
        logger.error(f"[{request_id}] Error type: {type(e).__name__}")
        logger.error(f"[{request_id}] Error message: {str(e)}")
        logger.error(f"[{request_id}] Full traceback:\n{error_trace}")
        logger.info("=" * 80)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
