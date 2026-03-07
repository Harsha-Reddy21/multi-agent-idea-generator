import logging
from typing import Optional

from data_service.exceptions import UserInfoServiceError
from data_service.models.submissions import Submissions
from data_service.models.users import Users
from data_service.serializers.users import UserInfoResponse
from data_service.utils.error_utils import handle_service_exception
from data_service.utils.validation import validate_auth_header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

logger = logging.getLogger(__name__)


class UsersService:
    """Service for managing user operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize UsersService.

        Args:
            db: Database session
        """
        self.db = db
        logger.debug("UsersService initialized")

    async def get_user_info(
        self,
        x_user_email: str,
        x_user_name: Optional[str],
        x_user_department: Optional[str],
        x_user_title: Optional[str],
    ) -> UserInfoResponse:
        """
        Retrieve or create user information based on authentication headers.

        Args:
            x_user_email: The email address from the X-WEBAUTH-EMAIL header.
            x_user_name: The user's name from the X-USER-NAME header.
            x_user_department: The user's department from the X-USER-DEPARTMENT header.
            x_user_title: The user's title from the X-USER-TITLE header.

        Returns:
            UserInfoResponse: A response object containing the user information.

        Raises:
            UserInfoServiceError: If validation, authorization, or database errors occur.
        """
        try:
            # Validate authentication header
            validate_auth_header(x_user_email, UserInfoServiceError)

            logger.info("Fetching user info for email: %s", x_user_email)

            # Query for the user by email (case-insensitive)
            result = await self.db.execute(
                select(Users).where(Users.email == x_user_email.lower())
            )
            user = result.scalars().first()

            if not user:
                # Create new user with basic info and defaults
                logger.info("Creating new user for email: %s", x_user_email)
                new_user = Users(
                    email=x_user_email.lower(),
                    name=x_user_name,
                    role="submitter",
                    is_active=True,
                )
                self.db.add(new_user)
                await self.db.commit()
                await self.db.refresh(new_user)
                user = new_user

            # Check for submissions - optimize with COUNT instead of fetching all
            from sqlalchemy import func

            sub_count_result = await self.db.execute(
                select(func.count())
                .select_from(Submissions)
                .where(Submissions.submitter_id == user.id)
            )
            submission_count = sub_count_result.scalar()
            any_idea_submitted = "Yes" if submission_count > 0 else "No"

            logger.info(
                "Successfully retrieved user info for %s, submissions: %s",
                x_user_email,
                any_idea_submitted,
            )

            response = UserInfoResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                anyIdeasSubmitted=any_idea_submitted,
                department=x_user_department,
                title=x_user_title,
            )
            return response

        except UserInfoServiceError:
            # Rollback for write operations (user creation)
            await self.db.rollback()
            raise

        except Exception as e:
            # Rollback and handle unexpected errors
            await self.db.rollback()
            handle_service_exception(
                e, UserInfoServiceError, "retrieve user information"
            )


def get_users_service(db: AsyncSession) -> UsersService:
    """
    Get or create UsersService instance.

    Args:
        db: Database session

    Returns:
        UsersService instance
    """
    return UsersService(db)
