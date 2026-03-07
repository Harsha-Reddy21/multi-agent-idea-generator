"""
ServiceNow Serializers Module
==============================
Pydantic models for ServiceNow API request/response validation.
"""

from typing import List

from pydantic import BaseModel, Field


class ApprovedIdeaUser(BaseModel):
    """User information for an approved idea"""

    user_id: str = Field(..., description="User ID from ServiceNow")
    user_name: str = Field(..., description="Full name of the user")


class ApprovedIdeaDetail(BaseModel):
    """Details of an approved AI system idea"""

    ai_system_name: str = Field(..., description="Name of the AI system")
    problem_statement: str = Field(
        ..., description="Problem statement for the AI system"
    )
    submitted_by: ApprovedIdeaUser = Field(
        ..., description="User who submitted the idea"
    )


class ApprovedIdeasCountResponse(BaseModel):
    """Response model for approved ideas count"""

    count: int = Field(
        ..., description="Number of approved ideas in the specified timeframe"
    )
    days: int = Field(default=30, description="Number of days used for the query")
    message: str = Field(default="Success", description="Response message")


class TopApprovedIdeasResponse(BaseModel):
    """Response model for top approved ideas"""

    ideas: List[ApprovedIdeaDetail] = Field(
        ..., description="List of top approved ideas"
    )
    total_count: int = Field(..., description="Total number of ideas returned")
    message: str = Field(default="Success", description="Response message")


class ApprovedIdeasDashboardResponse(BaseModel):
    """Combined dashboard response with count and top ideas"""

    approved_count: int = Field(
        ..., description="Total count of approved ideas in the last month"
    )
    days: int = Field(default=30, description="Number of days used for count")
    top_ideas: List[ApprovedIdeaDetail] = Field(..., description="Top approved ideas")
    message: str = Field(default="Success", description="Response message")


class ErrorResponse(BaseModel):
    """Error response model"""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Detailed error message")
    status_code: int = Field(..., description="HTTP status code")
