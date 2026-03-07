"""
serializer for templates
"""

from typing import List, Optional

from pydantic import Field
from data_service.serializers.base import BaseSerializer


class TemplateBase(BaseSerializer):
    """Base serializer for templates"""

    name: str = Field(..., description="Name of the template", min_length=3)
    content: str = Field(..., description="Content of the template", min_length=3)


class TemplateListItem(TemplateBase):
    """Serializer for template list item"""

    id: int = Field(..., description="Template ID")
    created_by: str = Field(
        ..., description="User ID of the user who created the template"
    )
    modified_by: str = Field(
        ..., description="User ID of the user who modified the template"
    )


class TemplateListResponse(BaseSerializer):
    """Response serializer for list templates"""

    templates: List[TemplateListItem] = Field(..., description="List of templates")
    d_req_id: Optional[str] = Field(None, description="Request ID")


class TemplateRetrieveResponse(BaseSerializer):
    """Response serializer for retrieve template"""

    template: TemplateListItem = Field(..., description="Template")
    d_req_id: Optional[str] = Field(None, description="Request ID")


class TemplateResponse(BaseSerializer):
    """Response serializer for create/update/delete template"""

    message: str = Field(..., description="Template message")
    template: TemplateListItem = Field(..., description="Template")
    d_req_id: Optional[str] = Field(None, description="Request ID")


class TemplateRequest(TemplateBase):
    """Request serializer for create/update template"""


class TemplateDeleteResponse(BaseSerializer):
    """Response serializer for delete template"""

    message: str = Field(..., description="Template delete message")
    d_req_id: Optional[str] = Field(None, description="Request ID")
