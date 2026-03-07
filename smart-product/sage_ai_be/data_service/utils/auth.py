"""
Authentication Utilities
Provides dependency for retrieving the current user from the database.
"""

from fastapi import HTTPException
from fastapi import Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from data_service.db_connection.db import get_db
from data_service.models.users import Users


async def get_current_user(
    x_user_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
    db: AsyncSession = Depends(get_db),
) -> Users:
    """
    Retrieve the current user from the database using the X-WEBAUTH-EMAIL header.

    Args:
        x_user_email (str): The user's email from the request header.
        db (AsyncSession): The database session.

    Returns:
        Users: The user object if found.

    Raises:
        HTTPException: If the user is not found.
    """
    result = await db.execute(select(Users).where(Users.email == x_user_email.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
