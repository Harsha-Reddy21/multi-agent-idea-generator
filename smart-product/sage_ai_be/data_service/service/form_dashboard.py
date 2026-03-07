"""
Service layer for the /form-dashboard API endpoint.

Handles business logic for fetching dashboard form data and validating user access.
"""

import logging
from typing import List, Optional, Dict
from uuid import UUID

from data_service.constants.constants import FormType
from data_service.exceptions import DashboardServiceError
from data_service.models.form_rules import FormRules
from data_service.models.form_schemas import FormSchemas
from data_service.models.submission_forms import SubmissionForms

from data_service.serializers.forms import (
    FormDashboardList,
    FormDashboardSummary,
)
from data_service.service.form_rules_evaluator import FormRulesEvaluator
from data_service.utils.error_utils import handle_service_exception
from data_service.utils.validation import validate_and_get_user, validate_uuid_format
from data_service.utils.form_validators import validate_submission_ownership
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

logger = logging.getLogger(__name__)


class FormDashboardService:
    """Service for managing form dashboard operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize FormDashboardService.

        Args:
            db: Database session
        """
        self.db = db
        logger.debug("FormDashboardService initialized")

    async def get_form_dashboard_data(
        self,
        submission_id: str,
        x_webauth_email: Optional[str],
    ) -> FormDashboardList:
        """
        Fetches dashboard form data for a given submission, ensuring the submission belongs to the user.

        Args:
            submission_id: The ID of the submission to filter forms by.
            x_webauth_email: The user's email address from the authentication header.

        Returns:
            FormDashboardList: The dashboard data and status for the forms.

        Raises:
            DashboardServiceError: If the user does not exist, the submission does not exist,
                                  or the submission does not belong to the user, or database errors occur.
        """
        try:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, self.db, DashboardServiceError
            )

            # Validate submission_id format
            validate_uuid_format(submission_id, "submission id", DashboardServiceError)

            logger.info(
                "Fetching dashboard for submission_id=%s, user=%s",
                submission_id,
                x_webauth_email,
            )

            # Validate that the submission exists and belongs to the user
            submission = await validate_submission_ownership(
                submission_id=submission_id,
                user_id=user.id,
                db=self.db,
                error_class=DashboardServiceError,
            )

            # Fetch all forms for the submission with related schemas and rules in one query
            # This eliminates N+1 queries by eager loading FormSchemas and FormRules
            forms_result = await self.db.execute(
                select(SubmissionForms, FormSchemas)
                .join(FormSchemas, SubmissionForms.form_schema_id == FormSchemas.id)
                .where(SubmissionForms.submission_id == submission_id)
            )
            form_data = forms_result.all()
            logger.info(
                "Found %d forms for submission %s", len(form_data), submission_id
            )

            # Fetch all form rules for the schemas in a single query
            schema_ids = [form_schema.id for _, form_schema in form_data]
            rules_result = await self.db.execute(
                select(FormRules).where(FormRules.form_id.in_(schema_ids))
            )
            all_rules = rules_result.scalars().all()

            # Group rules by form_id for quick lookup
            rules_by_schema: Dict[UUID, List[FormRules]] = {}
            for rule in all_rules:
                if rule.form_id not in rules_by_schema:
                    rules_by_schema[rule.form_id] = []
                rules_by_schema[rule.form_id].append(rule)

            # Build the dashboard summary for each form
            summaries: List[FormDashboardSummary] = []
            forms_to_update = []

            for form, form_schema in form_data:
                form_type = form_schema.name if form_schema else "unknown"

                # Special handling: Always re-evaluate WWTP forms to respect journey changes
                wwtp_forms = [FormType.WWTP, FormType.WWTP_NEW_VENDOR]
                should_evaluate = (
                    not form.form_category  # No cached value
                    or form_type in wwtp_forms  # Always re-evaluate WWTP forms
                )

                if not should_evaluate:
                    # Use cached form_category for non-WWTP forms
                    form_category = form.form_category
                    logger.debug(
                        "Using cached form_category '%s' for form %s",
                        form_category,
                        form.id,
                    )
                else:
                    # Get rules for this form schema from the pre-fetched dictionary
                    form_rules = rules_by_schema.get(form_schema.id, [])

                    # Evaluate rules to determine category using the evaluator service
                    form_category = FormRulesEvaluator.evaluate_form_rules(
                        form_rules=form_rules,
                        submission_journey=submission.submission_journey,
                        form_type=form_type,
                    )

                    # Skip forms marked as "exclude" (e.g., WWTP forms with no matching rules)
                    if form_category == "exclude":
                        logger.info(
                            "Excluding form %s (type: %s) - no matching rules for WWTP form",
                            form.id,
                            form_type,
                        )
                        continue

                    # Persist the evaluated category to the database
                    form.form_category = form_category
                    forms_to_update.append(form)
                    logger.info(
                        "Evaluated and set form_category to '%s' for form %s",
                        form_category,
                        form.id,
                    )

                summaries.append(
                    FormDashboardSummary(
                        id=str(form.id),
                        submission_id=str(form.submission_id),
                        category_id=str(submission.category_id),
                        status=form.status,
                        form_type=form_type,
                        category=form_category,
                        final_score=form.final_score,
                    )
                )

            # Commit changes if any forms were updated
            if forms_to_update:
                for form in forms_to_update:
                    self.db.add(form)
                await self.db.commit()
                logger.info(
                    "Persisted form_category for %d forms", len(forms_to_update)
                )

            logger.info(
                "Successfully built dashboard with %d form summaries", len(summaries)
            )

            # Return the dashboard list response
            return FormDashboardList(
                message="Forms fetched successfully",
                data=summaries,
                novelty_score=submission.novelty_score,
            )

        except DashboardServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:  # pylint: disable=broad-except
            # Handle database and unexpected errors
            handle_service_exception(
                e, DashboardServiceError, "retrieve dashboard data"
            )


def get_form_dashboard_service(db: AsyncSession) -> FormDashboardService:
    """
    Get or create FormDashboardService instance.

    Args:
        db: Database session

    Returns:
        FormDashboardService instance
    """
    return FormDashboardService(db)
