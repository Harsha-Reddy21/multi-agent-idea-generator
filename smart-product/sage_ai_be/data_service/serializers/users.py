"""
Serializers for user-related data structures.

This module contains Pydantic models for handling user information,
authentication, and user-related API operations.
"""

import uuid
from datetime import datetime
from typing import Optional

from data_service.serializers.base import BaseSerializer


class UserBase(BaseSerializer):
    """Base model for user data."""

    name: str
    email: str
    role: str


class UserCreate(UserBase):
    """Model for user creation requests."""


class UserRead(UserBase):
    """Model for user read operations."""

    id: uuid.UUID
    is_active: bool
    created_at: datetime


class UserInfoResponse(UserRead):
    """Response model for user information including additional details."""

    anyIdeasSubmitted: str
    department: Optional[str] = None
    title: Optional[str] = None


class ErrorResponse(BaseSerializer):
    """Response model for error information."""

    error: str
    message: str
    status_code: int
