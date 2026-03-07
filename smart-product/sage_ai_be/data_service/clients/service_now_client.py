"""
ServiceNow API Client Module
=============================
Handles interactions with the ServiceNow API for approved AI systems data.
"""

import logging
from typing import Dict, Any

from data_service.clients.http_client import get_http_client
from data_service.configurations.settings import settings
from data_service.constants.constants import (
    SERVICE_NOW_STATS_ENDPOINT,
    SERVICE_NOW_TABLE_ENDPOINT,
)

logger = logging.getLogger(__name__)


class ServiceNowClient:
    """Client for ServiceNow API operations using centralized HTTP client"""

    def __init__(self):
        self.base_url = settings.service_now_base_url
        self.username = settings.service_now_username
        self.password = settings.service_now_password
        # Use centralized HTTP client with ServiceNow configuration from settings
        self._http_client = get_http_client(
            name="servicenow",
            base_url=self.base_url,
            auth=(self.username, self.password),
            timeout=settings.service_now_timeout,
            connect_timeout=settings.service_now_connect_timeout,
            max_connections=settings.service_now_max_connections,
            max_keepalive_connections=settings.service_now_max_keepalive_connections,
        )

    async def get_approved_ideas_count(self, days: int = 30) -> int:
        """
        Get count of approved AI systems in the last N days

        Args:
            days: Number of days to look back (default: 30)

        Returns:
            int: Count of approved ideas

        Raises:
            httpx.HTTPStatusError: If API returns error status
            httpx.TimeoutException: If request times out
            httpx.RequestError: If network request fails
            ValueError: If response format is invalid
        """
        url = SERVICE_NOW_STATS_ENDPOINT
        params = {
            "sysparm_query": f"sys_updated_on>=javascript:gs.daysAgoStart({days})",
            "sysparm_count": "true",
        }

        response = await self._http_client.get(url, params=params)
        logger.info("ServiceNow count response: %s", response.status_code)

        result = response.json()
        count = int(result.get("result", {}).get("stats", {}).get("count", "0"))

        return count

    async def get_top_approved_ideas(self, limit: int = 2) -> list[Dict[str, Any]]:
        """
        Get top N approved AI systems ordered by updated date

        Args:
            limit: Number of records to return (default: 2)

        Returns:
            List[Dict]: List of approved ideas

        Raises:
            httpx.HTTPStatusError: If API returns error status
            httpx.TimeoutException: If request times out
            httpx.RequestError: If network request fails
            ValueError: If response format is invalid
        """
        url = SERVICE_NOW_TABLE_ENDPOINT
        params = {
            "sysparm_query": "ORDERBYDESCsys_updated_on",
            "sysparm_limit": str(limit),
        }

        response = await self._http_client.get(url, params=params)
        logger.info("ServiceNow top ideas response: %s", response.status_code)

        result = response.json()
        ideas = result.get("result", [])

        return ideas

    async def get_user_details(self, user_link: str) -> str:
        """
        Get user details from ServiceNow user link

        Args:
            user_link: Full URL to user details endpoint

        Returns:
            str: User name

        Raises:
            httpx.HTTPStatusError: If API returns error status
            httpx.TimeoutException: If request times out
            httpx.RequestError: If network request fails
            ValueError: If response format is invalid
        """
        # Use centralized HTTP client with full URL
        # Since user_link is a full URL, it will override the base_url
        response = await self._http_client.get(user_link)
        logger.info("ServiceNow user details response: %s", response.status_code)

        result = response.json()
        # Extract name from the result object
        user_data = result.get("result", {})
        user_name = user_data.get("name", "")

        return user_name


# Singleton instance
service_now_client = ServiceNowClient()
