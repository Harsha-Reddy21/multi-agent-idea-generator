"""FAISS similarity search serializers for vector database operations."""

from typing import List
from uuid import UUID

from pydantic import Field

from data_service.serializers.base import BaseSerializer

# Request/Response Models


class FormDataEntry(BaseSerializer):
    """Form data entry for FAISS search operations."""

    questionId: str
    question: str
    answer: str


class SearchRequest(BaseSerializer):
    """Request model for text-based similarity search."""

    submission_id: UUID = Field(
        ..., alias="submission-id", description="UUID of the submission"
    )
    form_id: str = Field(
        ..., alias="form-id", description="UUID of the form (SubmissionForms.id)"
    )
    form_data: List[FormDataEntry] = Field(
        ..., alias="form-data", description="Form data as a list of entries"
    )


class SearchResult(BaseSerializer):
    """Model for a single search result."""

    air_number: str = Field(..., description="AIR number identifier")
    title: str = Field(..., description="Title of the item")
    similarity_score: float = Field(
        ..., description="Similarity score (higher is better)"
    )
