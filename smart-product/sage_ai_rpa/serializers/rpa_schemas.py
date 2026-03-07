"""
Serializers for RPA-related data structures.

This module contains Pydantic models for serializing RPA job data,
automation results, and form data.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class QueueJobInfo(BaseModel):
    """Information about a pending RPA job from the queue."""

    rpa_status_id: UUID = Field(..., description="RPA status record ID")
    submission_id: UUID = Field(..., description="Submission ID")
    form_schema_id: UUID = Field(..., description="Form schema ID")
    form_type: str = Field(..., description="Form type identifier")
    created_at: datetime = Field(..., description="When the job was queued")

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class RPAJobRequest(BaseModel):
    """Request model for RPA job execution."""

    submission_id: str = Field(..., description="Submission ID to process")
    email: str = Field(..., description="User email")
    form_type: str = Field(..., description="Form type identifier")
    form_id: Optional[str] = Field(None, description="Form ID")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "submission_id": "2f479c93-f516-4b66-968e-8fd66c55a541",
                "email": "user@example.com",
                "form_type": "ai-registry-form",
                "form_id": "ai-registry-form",
            }
        }


class FormDataItem(BaseModel):
    """Individual form field data item."""

    questionId: str = Field(..., description="Question identifier")
    question: str = Field(..., description="Question text")
    answer: Optional[str] = Field(None, description="Answer value")
    type: str = Field(..., description="Field type (text, dropdown, radio, etc.)")
    options: Optional[List[str]] = Field(None, description="Available options for select/radio")

    class Config:
        """Pydantic configuration."""

        populate_by_name = True


class AutomationResult(BaseModel):
    """Result of form automation process."""

    success: bool = Field(..., description="Whether automation succeeded")
    message: str = Field(..., description="Result message")
    matched_count: int = Field(0, description="Number of questions successfully filled")
    skipped_count: int = Field(0, description="Number of questions skipped")
    failed_count: int = Field(0, description="Number of questions that failed to fill")
    unmatched_questions: List[FormDataItem] = Field(default_factory=list, description="Questions not matched in form")
    failed_questions: List[FormDataItem] = Field(default_factory=list, description="Questions that failed to fill")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Form automation completed successfully",
                "matched_count": 45,
                "skipped_count": 5,
                "failed_count": 0,
                "unmatched_questions": [],
                "failed_questions": [],
            }
        }


class RPAStatusResponse(BaseModel):
    """RPA status information."""

    id: int = Field(..., description="RPA status ID")
    submission_id: str = Field(..., description="Associated submission ID")
    form_schema_id: int = Field(..., description="Form schema ID")
    status: str = Field(..., description="Current status (processing, completed, failed)")
    total_questions: int = Field(..., description="Total number of questions")
    filled_questions: int = Field(0, description="Number of successfully filled questions")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="Creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class RPAJobResponse(BaseModel):
    """Response model for RPA job execution."""

    success: bool = Field(..., description="Whether the job succeeded")
    message: str = Field(..., description="Response message")
    submission_id: Optional[str] = Field(None, description="Submission ID processed")
    filled_questions: Optional[int] = Field(None, description="Number of questions filled")
    total_questions: Optional[int] = Field(None, description="Total number of questions")
    status: Optional[str] = Field(None, description="Final RPA status")
    error_details: Optional[str] = Field(None, description="Detailed error information")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "success": True,
                "message": "RPA job completed successfully",
                "submission_id": "2f479c93-f516-4b66-968e-8fd66c55a541",
                "filled_questions": 45,
                "total_questions": 45,
                "status": "completed",
            }
        }


class BatchProcessRequest(BaseModel):
    """Request model for batch processing."""

    form_type: Optional[str] = Field(None, description="Filter by form type")
    limit: int = Field(10, description="Maximum number of submissions to process")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "form_type": "ai-registry-form",
                "limit": 10,
            }
        }


class BatchProcessResponse(BaseModel):
    """Response model for batch processing."""

    success: bool = Field(..., description="Whether batch processing succeeded")
    message: str = Field(..., description="Response message")
    processed_count: int = Field(0, description="Number of submissions processed")
    success_count: int = Field(0, description="Number of successful submissions")
    failed_count: int = Field(0, description="Number of failed submissions")
    results: List[RPAJobResponse] = Field(default_factory=list, description="Individual job results")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Batch processing completed",
                "processed_count": 10,
                "success_count": 9,
                "failed_count": 1,
                "results": [],
            }
        }
