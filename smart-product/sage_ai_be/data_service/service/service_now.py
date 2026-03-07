"""
ServiceNow Service Module
==========================
Business logic for ServiceNow approved ideas operations.
"""

import logging

from data_service.clients.service_now_client import service_now_client
from data_service.exceptions import ServiceNowServiceError
from data_service.serializers.service_now import (
    ApprovedIdeasCountResponse,
    TopApprovedIdeasResponse,
    ApprovedIdeasDashboardResponse,
    ApprovedIdeaDetail,
    ApprovedIdeaUser,
)
from data_service.utils.error_utils import handle_service_exception

logger = logging.getLogger(__name__)


class ServiceNowService:
    """
    Service class for ServiceNow approved ideas operations.

    This service handles all business logic related to retrieving and processing
    approved AI system ideas from ServiceNow.
    """

    def __init__(self):
        """Initialize the ServiceNow service."""
        self.client = service_now_client
        logger.debug("ServiceNowService initialized")

    async def get_approved_ideas_count(
        self, days: int = 30
    ) -> ApprovedIdeasCountResponse:
        """
        Get count of approved AI systems in the last N days

        Args:
            days: Number of days to look back (default: 30)

        Returns:
            ApprovedIdeasCountResponse with count

        Raises:
            ServiceNowServiceError: If ServiceNow API call fails or returns invalid data
        """
        try:
            logger.info("Fetching approved ideas count for days=%d", days)

            count = await self.client.get_approved_ideas_count(days=days)
            logger.info("Successfully retrieved approved ideas count: %d", count)

            return ApprovedIdeasCountResponse(
                count=count,
                days=days,
                message="Successfully retrieved approved ideas count",
            )

        except ServiceNowServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle HTTP and unexpected errors using common pattern
            handle_service_exception(
                e, ServiceNowServiceError, "fetch approved ideas count from ServiceNow"
            )

    async def get_top_approved_ideas(self, limit: int = 2) -> TopApprovedIdeasResponse:
        """
        Get top N approved AI systems with user details

        Args:
            limit: Number of records to return (default: 2)

        Returns:
            TopApprovedIdeasResponse with list of ideas

        Raises:
            ServiceNowServiceError: If ServiceNow API call fails or returns invalid data
        """
        try:
            logger.info("Fetching top approved ideas with limit=%d", limit)

            # Get top ideas
            ideas_data = await self.client.get_top_approved_ideas(limit=limit)
            ideas_list = []

            # Process each idea and fetch user details
            for idea in ideas_data:
                try:
                    # Extract basic idea info
                    ai_system_name = idea.get("ai_system_name", "")
                    problem_statement = idea.get("problem_statement", "")
                    opened_by = idea.get("opened_by", {})

                    # Get user details
                    user_link = opened_by.get("link")
                    user_id = opened_by.get("value", "")
                    user_name = ""

                    if user_link and user_link.strip():
                        try:
                            user_name = await self.client.get_user_details(user_link)
                        except Exception as e:
                            logger.warning(
                                "Failed to fetch user details for %s: %s",
                                user_id,
                                str(e),
                            )
                            user_name = f"User {user_id}"
                    else:
                        user_name = f"User {user_id}" if user_id else "Unknown User"

                    # Create idea detail object
                    idea_detail = ApprovedIdeaDetail(
                        ai_system_name=ai_system_name,
                        problem_statement=problem_statement,
                        submitted_by=ApprovedIdeaUser(
                            user_id=user_id, user_name=user_name
                        ),
                    )

                    ideas_list.append(idea_detail)

                except Exception as e:
                    logger.warning("Failed to process idea: %s", str(e))
                    continue

            logger.info("Successfully retrieved %d top approved ideas", len(ideas_list))

            return TopApprovedIdeasResponse(
                ideas=ideas_list,
                total_count=len(ideas_list),
                message="Successfully retrieved top approved ideas",
            )

        except ServiceNowServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle unexpected errors
            handle_service_exception(
                e, ServiceNowServiceError, "fetch top approved ideas from ServiceNow"
            )

    async def get_approved_ideas_dashboard(
        self, days: int = 30, top_limit: int = 2
    ) -> ApprovedIdeasDashboardResponse:
        """
        Get combined dashboard data: count and top ideas

        Args:
            days: Number of days to look back for count (default: 30)
            top_limit: Number of top ideas to return (default: 2)

        Returns:
            ApprovedIdeasDashboardResponse with count and top ideas

        Raises:
            ServiceNowServiceError: If ServiceNow API calls fail or return invalid data
        """
        try:
            logger.info(
                "Fetching approved ideas dashboard with days=%d, top_limit=%d",
                days,
                top_limit,
            )

            # Get count
            count_result = await self.get_approved_ideas_count(days=days)

            # Get top ideas
            top_ideas_result = await self.get_top_approved_ideas(limit=top_limit)

            logger.info("Successfully retrieved approved ideas dashboard data")

            return ApprovedIdeasDashboardResponse(
                approved_count=count_result.count,
                days=days,
                top_ideas=top_ideas_result.ideas,
                message="Successfully retrieved approved ideas dashboard data",
            )

        except ServiceNowServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle unexpected errors
            handle_service_exception(
                e,
                ServiceNowServiceError,
                "fetch approved ideas dashboard from ServiceNow",
            )


# Singleton instance for backward compatibility
service_now_service = ServiceNowService()
