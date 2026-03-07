"""
This module contains the functions for creating a database session and creating the database engine.
"""

import logging
from configuration.settings import settings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

DATABASE_URI = (
    f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}@"
    f"{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

async_engine = create_async_engine(
    DATABASE_URI,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_pre_ping=True,
)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Dependency
async def get_db():
    """
    Dependency function that returns an async database session.
    Yields a database session which is properly closed after the context is exited.
    """
    async with AsyncSessionLocal() as session:
        yield session
