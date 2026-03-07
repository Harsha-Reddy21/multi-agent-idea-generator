"""
Business logic for user submissions in the data service.

This module contains service-layer functions for retrieving submissions made by a user.
"""

import logging
from uuid import UUID

from data_service.constants.constants import (
    ProcessingStatus,
    FormType,
)
from data_service.exceptions import UserSubmissionsServiceError
from data_service.models.categories import Categories
from data_service.models.submission_processing_status import SubmissionProcessingStatus
from data_service.models.submissions import Submissions
from data_service.models.submission_forms import SubmissionForms
from data_service.models.users import Users
from data_service.serializers.user_submissions import (
    SubmissionsListResponse,
    SubmissionSummary,
    SubmissionStatusResponse,
)
from data_service.utils.error_utils import handle_service_exception
from data_service.utils.validation import validate_and_get_user, validate_uuid_format
from sqlalchemy.future import select

logger = logging.getLogger(__name__)


class UserSubmissionsService:
    """Service for managing user submission operations."""

    def __init__(self, db):
        """
        Initialize UserSubmissionsService.

        Args:
            db: Database session
        """
        self.db = db
        logger.debug("UserSubmissionsService initialized")

    async def get_user_submissions(
        self,
        x_webauth_email: str,
    ) -> SubmissionsListResponse:
        """
        Retrieve a list of submissions for the user identified by X-WEBAUTH-EMAIL.

        Args:
            x_webauth_email: The email address from the X-WEBAUTH-EMAIL header.

        Returns:
            SubmissionsListResponse: A response object containing a list of submissions and a success message.

        Raises:
            UserSubmissionsServiceError: If the email is missing/invalid, user is not found, or database errors occur.
        """
        try:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, self.db, UserSubmissionsServiceError
            )

            logger.info("Fetching submissions for user: %s", x_webauth_email)

            # Query submissions for the user, joining with categories to get category name
            submissions_result = await self.db.execute(
                select(
                    Submissions.id,
                    Submissions.title,
                    Submissions.category_id,
                    Categories.name.label("category_name"),
                    Submissions.status,
                    Submissions.created_at,
                    Submissions.updated_at,
                )
                .join(Categories, Submissions.category_id == Categories.id)
                .where(Submissions.submitter_id == user.id)
            )
            submissions = submissions_result.fetchall()

            logger.info(
                "Found %d submissions for user %s", len(submissions), x_webauth_email
            )

            # Fetch both ai-registry-form and ai-registry-update-form in one query
            ai_registry_forms_result = await self.db.execute(
                select(
                    SubmissionForms.submission_id,
                    SubmissionForms.form_type,
                    SubmissionForms.status,
                    SubmissionForms.id,
                )
                .where(
                    SubmissionForms.submission_id.in_([sub[0] for sub in submissions])
                )
                .where(
                    SubmissionForms.form_type.in_(
                        [FormType.AI_REGISTRY, FormType.AI_REGISTRY_UPDATE]
                    )
                )
            )
            ai_registry_forms = ai_registry_forms_result.fetchall()

            # Create mappings for both form types
            ai_registry_status_map = {}
            ai_registry_update_form_id_map = {}

            for row in ai_registry_forms:
                submission_id = str(row[0])
                form_type = row[1]
                status = row[2]
                form_id = str(row[3])

                if form_type == FormType.AI_REGISTRY:
                    ai_registry_status_map[submission_id] = status
                elif form_type == FormType.AI_REGISTRY_UPDATE:
                    ai_registry_update_form_id_map[submission_id] = form_id

            summaries = []
            for sub in submissions:
                # Unpack row fields with safe conversion

                id_val = str(sub[0]) if sub[0] is not None else ""
                title_val = sub[1] if sub[1] is not None else ""
                category_id_val = str(sub[2]) if sub[2] is not None else ""
                category_name_val = sub[3] if sub[3] is not None else ""
                status_val = sub[4] if sub[4] is not None else ""
                created_at_db = sub[5] if len(sub) > 5 else None

                submitted_at_val = created_at_db

                # Get ai_registry_form_status from the map, None if not found
                ai_registry_form_status = ai_registry_status_map.get(id_val)

                # Get ai_registry_update_form_id from the map, None if not found
                ai_registry_update_form_id = ai_registry_update_form_id_map.get(id_val)

                summaries.append(
                    SubmissionSummary(
                        id=id_val,
                        title=title_val,
                        category_id=category_id_val,
                        category_name=category_name_val,
                        status=status_val,
                        submitted_at=submitted_at_val,
                        ai_registry_form_status=ai_registry_form_status,
                        ai_registry_update_form_id=ai_registry_update_form_id,
                    )
                )

            logger.info("Successfully built %d submission summaries", len(summaries))

            # Return the response with a message and the list of summaries (empty if none)
            return SubmissionsListResponse(
                message="Submissions fetched successfully", data=summaries
            )

        except UserSubmissionsServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle database and unexpected errors
            handle_service_exception(
                e, UserSubmissionsServiceError, "retrieve user submissions"
            )

    async def get_submission_status(
        self,
        submission_id: str,
        x_webauth_email: str,
    ) -> SubmissionStatusResponse:
        """
        Retrieve the processing status for a submission's document extraction.

        This service function queries the SubmissionProcessingStatus table to get
        the current status of background document processing.

        Args:
            submission_id: The UUID of the submission.
            x_webauth_email: The email address from the X-WEBAUTH-EMAIL header.

        Returns:
            SubmissionStatusResponse: A response object containing status details.

        Raises:
            UserSubmissionsServiceError: If authentication fails, UUID is invalid, or database errors occur.
        """
        try:
            # Validate authentication (no user fetch needed for this endpoint)
            await validate_and_get_user(
                x_webauth_email, self.db, UserSubmissionsServiceError
            )

            # Validate UUID format
            submission_uuid = validate_uuid_format(
                submission_id, "submission ID", UserSubmissionsServiceError
            )

            logger.info(
                "Fetching submission status for submission_id: %s", submission_id
            )

            # Query the processing status
            result = await self.db.execute(
                select(SubmissionProcessingStatus).where(
                    SubmissionProcessingStatus.submission_id == submission_uuid
                )
            )
            status_record = result.scalar_one_or_none()

            if not status_record:
                # no processing status exists - documents were uploaded
                logger.info(
                    "No processing status found for submission %s", submission_id
                )
                return SubmissionStatusResponse(
                    submission_id=submission_id,
                    status=ProcessingStatus.COMPLETED,
                    message="No documents provided. Please fill out the forms manually.",
                )

            logger.info(
                "Successfully fetched status for submission %s: %s",
                submission_id,
                status_record.status.value,
            )

            # Return the status response
            return SubmissionStatusResponse(
                submission_id=str(status_record.submission_id),
                status=status_record.status.value,
                message=status_record.message,
            )

        except UserSubmissionsServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle database and unexpected errors
            handle_service_exception(
                e, UserSubmissionsServiceError, "retrieve submission status"
            )


def get_user_submissions_service(db) -> UserSubmissionsService:
    """
    Get or create UserSubmissionsService instance.

    Args:
        db: Database session

    Returns:
        UserSubmissionsService instance
    """
    return UserSubmissionsService(db)
