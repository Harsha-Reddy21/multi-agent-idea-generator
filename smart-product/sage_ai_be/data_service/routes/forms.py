"""
Forms API Routes Module
Handles HTTP requests for form-related operations
"""

import json
import logging
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
    UploadFile,
    File,
    Form,
    Header,
)
from sqlalchemy.ext.asyncio import AsyncSession
from data_service.db_connection.db import get_db
from data_service.models.users import Users
from data_service.serializers.common_fields import (
    CommonFieldsRequest,
    CommonFieldsResponse,
)
from data_service.serializers.forms import (
    FormResponse,
    SubmitFormRequest,
    SubmitFormResponse,
    ErrorResponse,
)
from data_service.service.forms import get_forms_service
from data_service.service.idea_submission import SubmissionService
from data_service.utils.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["Form API's"])


@router.post(
    "/submit-idea",
    status_code=201,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid input data",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error - System error occurred",
        },
    },
)
async def submit_idea(
    submission_journey: str = Form(
        ..., description="JSON string containing form responses"
    ),
    files: List[UploadFile] = File(None, description="Optional files to upload"),
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user),
) -> dict:
    """
    Submit a new idea with optional file attachments

    This endpoint creates a comprehensive submission record including:
    - Main submission entry with journey data
    - Linked form schema validation
    - File uploads to S3 with metadata storage
    - Submission form linking record

    The submission process involves multiple database operations that are handled
    by the SubmissionService to ensure data consistency and proper error
    handling.

    Args:
        submission_journey (str): JSON string containing form data with questions and answers.
            Expected format: {"form_data": [{"questionId": "q1", "question": "What is your idea?",
                             "answer": ["My idea"]}]}
        category_id (str): Category ID that determines the form schema to use
            for validation
        files (List[UploadFile], optional): List of files to upload and attach
            to the submission
        db (AsyncSession): Database session dependency for database operations
        current_user (Users): Current authenticated user from JWT token

    Returns:
        dict: Response containing:
            - message (str): Success message
            - data (dict): Object with submission ID and category ID

    Raises:
        DocumentExtractionServiceError: For submission-related errors (handled by global handler)

    Example:
        POST /forms/submit-idea
        Content-Type: multipart/form-data

        submission_journey: '{"form_data": [...]}'
        files: [file1.pdf, file2.jpg]  (optional)
    """
    submission_service = SubmissionService(db)
    return await submission_service.create_idea_submission(
        submission_journey, files, current_user
    )


@router.get(
    "/get-form-details",
    response_model=FormResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid request - validation error or resource not found",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": (
                "Service unavailable - Database or external service "
                "temporarily unavailable"
            ),
        },
        504: {
            "model": ErrorResponse,
            "description": "Gateway timeout - External service request timed out",
        },
    },
    tags=["Form API's"],
    summary="Get form data by submission id and form id",
    description="Returns the data for a specific form based on "
    "submission id and form id",
)
async def get_form_details(
    form_id: str = Query(..., alias="form-id", description="The ID of the form"),
    submission_id: str = Query(
        ..., alias="submission-id", description="The ID of the submission"
    ),
    db: AsyncSession = Depends(get_db),
    x_webauth_email: Optional[str] = Header(None, alias="X-WEBAUTH-EMAIL"),
) -> FormResponse:
    """
    Retrieve form details for a specific form and submission.

    This endpoint returns the data for a specific form based on the provided
    submission ID and form ID.
    It is used to fetch the form's data, including user responses and metadata,
    for review or editing.

    Args:
        form_id (str): The ID of the form to retrieve.
        submission_id (str): The ID of the submission associated with the form.
        db (AsyncSession): Database session dependency.
        x_webauth_email (Optional[str]): Optional email header for authentication.

    Returns:
        FormResponse: The form data and related information.

    Raises:
        FormDetailsServiceError: For form retrieval errors (handled by global handler)

    Example:
        GET /forms/get-form-details?form-id=abc&submission-id=xyz
    """
    forms_service = get_forms_service(db)
    return await forms_service.get_form_details(
        form_id=form_id,
        submission_id=submission_id,
        x_webauth_email=x_webauth_email,
    )


@router.post(
    "/auto-populate/common-fields",
    response_model=CommonFieldsResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid request - validation error or resource not found",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": "Service unavailable - Database temporarily unavailable",
        },
    },
    tags=["Form API's"],
    summary="Auto-populate common fields for a form",
    description="Returns a list of common fields (question_id and answer) for "
    "the given form_type, submission_id, and form_id.",
)
async def auto_populate_common_fields(
    input_data: CommonFieldsRequest,
    db: AsyncSession = Depends(get_db),
    x_webauth_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
) -> CommonFieldsResponse:
    """
    Auto-populate common fields for a form.

    This endpoint returns a list of common fields (question_id and answer) for
    the given form_type, submission_id, and form_id.
    It is used to pre-fill frequently used fields in forms to enhance user
    experience and reduce manual entry.

    Args:
        input_data (CommonFieldsRequest): The request data containing form_type,
            submission_id, and form_id.
        db (AsyncSession): Database session dependency.
        x_webauth_email (str): Email header for authentication.

    Returns:
        CommonFieldsResponse: List of common fields with question IDs and answers.

    Raises:
        AutoPopulateServiceError: For auto-populate errors (handled by global handler)

    Example:
        POST /forms/auto-populate/common-fields
        {
            "form_type": "example-type",
            "submission_id": "submission-uuid",
            "form_id": "form-uuid"
        }
    """
    forms_service = get_forms_service(db)
    return await forms_service.auto_populate_common_fields(input_data, x_webauth_email)


@router.put(
    "/submit-form",
    response_model=SubmitFormResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid request - validation error or resource not found",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": "Service unavailable - Database temporarily unavailable",
        },
    },
    tags=["Form API's"],
    summary="Update form data and status",
    description="Updates form data. If action=save: status→in_progress. "
    "If action=submit: status→completed. "
    "If all forms completed: submission→completed.",
)
async def submit_form_endpoint(
    form_id: str = Query(
        ..., alias="form-id", description="The ID of the form to update"
    ),
    submission_id: str = Query(
        ..., alias="submission-id", description="The ID of the submission"
    ),
    form_data: str = Form(..., description="JSON string containing form data"),
    action: str = Form(..., description="Action to perform: 'save' or 'submit'"),
    files: Optional[List[UploadFile]] = File(
        None, description="Optional files to upload"
    ),
    db: AsyncSession = Depends(get_db),
    x_webauth_email: Optional[str] = Header(None, alias="X-WEBAUTH-EMAIL"),
) -> SubmitFormResponse:
    """
    Update form data and status for a submission.

    This endpoint updates the form data and status for a given form and submission.
    - If action = "save": updates status to "in_progress".
    - If action = "submit": updates status to "completed".
    - If status is already "completed": returns an error, cannot edit.
    - If all forms for the submission are completed: updates submission status to "completed".
    - If action = "submit" and form_type is AiRegistry: triggers RPA automation.

    Uses multipart/form-data format (same as /submit-idea):
       Content-Type: multipart/form-data
       form_data: '{"form_data": [...]}'  (required - JSON string)
       action: 'submit' or 'save'  (required)
       files: [optional files]

    Args:
        form_id (str): The ID of the form to update.
        submission_id (str): The ID of the submission.
        form_data (str): JSON string containing form data.
        action (str): Either "save" or "submit".
        files (Optional[List[UploadFile]]): Optional files to upload.
        db (AsyncSession): Database session dependency.
        x_webauth_email (Optional[str]): Optional email header for authentication.

    Returns:
        SubmitFormResponse: The updated form submission response.

    Raises:
        FormSubmissionServiceError: For form submission errors (handled by global handler)

    Example:
        PUT /forms/submit-form?form-id=abc&submission-id=xyz
        Content-Type: multipart/form-data

        form_data: '{"form_data": [{"questionId": "q1", ...}]}'
        action: 'submit'
        files: [file1.pdf, file2.jpg]  (optional)
    """
    # Parse and validate form_data JSON string
    parsed_form_data = json.loads(form_data)
    validated_request = SubmitFormRequest(form_data=parsed_form_data, action=action)

    # Call service with parsed and validated data
    forms_service = get_forms_service(db)
    return await forms_service.submit_form(
        form_id=form_id,
        submission_id=submission_id,
        form_data=validated_request.form_data.model_dump(),
        action=validated_request.action,
        x_webauth_email=x_webauth_email,
        files=files,
    )
