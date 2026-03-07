"""
Health Check API Routes
Provides endpoints for application and database health checks.
"""

from fastapi import APIRouter
from sqlalchemy import text
from data_service.db_connection.db import AsyncSessionLocal

health_router = APIRouter()


@health_router.get("/health")
async def health_check():
    """Check the basic health status of the application."""
    return {"status": "healthy"}


@health_router.get("/health/db")
async def db_health_check():
    """Check the database connection health status."""
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "Database connection successful"}
    except Exception as _exc:  # pylint: disable=broad-exception-caught
        return {"status": "Database connection failed", "error": str(_exc)}
