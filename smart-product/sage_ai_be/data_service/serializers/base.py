"""
Base Serializer Module
======================
Provides base serializer classes with common Pydantic configuration.
"""

from pydantic import BaseModel, ConfigDict


class BaseSerializer(BaseModel):
    """Base serializer with common Pydantic configuration.

    All serializers should inherit from this class to maintain
    consistent configuration across the application.
    """

    model_config = ConfigDict(
        extra="forbid",
        ser_json_timedelta="iso8601",
        from_attributes=True,
        populate_by_name=True,
    )
