"""
LLM Service for interacting with Cortex LLM APIs and History service
"""

import os
from typing import Optional, Dict, List, Any
from dotenv import load_dotenv
import requests
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with LLM APIs and Cortex History service"""
    
    def __init__(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        env_path = os.path.join(backend_dir, '.env')
        
        if os.path.exists(env_path):
            load_dotenv(env_path, override=True)
        else:
            load_dotenv(override=True)
        
        self.api_url = os.getenv("API_URL", "https://gateway.apim-dev.lilly.com/cortex/model/ask")
        self.history_api_url = os.getenv("HISTORY_API_URL", "https://gateway.apim-dev.lilly.com/cortex/history")
        self.client_id = os.getenv("CORTEX_CLIENT_ID")    
        self.client_secret = os.getenv("CORTEX_CLIENT_SECRET")
        self.tenant_id = os.getenv("CORTEX_TENANT_ID")

        if not self.client_id or not self.client_secret or not self.tenant_id:
            raise ValueError("CORTEX_CLIENT_ID, CORTEX_CLIENT_SECRET, and CORTEX_TENANT_ID must be set")

    def get_token(self) -> Optional[str]:
        """
        Get OAuth token from Microsoft Azure AD
        
        Returns:
            Access token string or None if failed
        """
        oauth_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"

        payload = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': "client_credentials",
            'scope': "api://Cortex_Engineering.lilly.com/.default"
        }

        try:
            response = requests.post(oauth_url, data=payload, verify=False)
            response.raise_for_status()
            access_token = response.json().get('access_token')
            logger.info("OAuth token obtained successfully")
            return access_token
        except Exception as e:
            logger.error(f"Error obtaining OAuth token: {e}")
            return None

    def generate_response(self, query: str, assistant_id: str = "smart-product-dev") -> Dict[str, Any]:
        """
        Generate response from LLM API (synchronous)
        
        Args:
            query: User query string
            assistant_id: Assistant/workspace ID (default: "smart-product-dev")
            
        Returns:
            Response dictionary from the API
        """
        oauth_token = self.get_token()
        if not oauth_token:
            raise ValueError("Failed to obtain OAuth token")
            
        logger.info(f"Generating response for query: {query[:200]}...")

        
        url = f"{self.api_url}/{assistant_id}"
        params = {'q': query, 'stream': 'false', 'no_summary': 'true'}
        headers = {'Content-Type': 'application/json'}
        headers['Authorization'] = f"Bearer {oauth_token}"
        
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Response from model_ask API received")
            return result
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    def generate_response_text(self, query: str, assistant_id: str = "smart-product-dev") -> str:
        """
        Generate response from LLM API and return just the message content as string.
        Used by agent functions that need synchronous LLM calls.
        
        Args:
            query: User query string
            assistant_id: Assistant/workspace ID (default: "smart-product-dev")
            
        Returns:
            The message content as a string
        """
        result = self.generate_response(query, assistant_id)
        
        # Extract message content from response
        # Cortex API returns: {"message": "...", ...} or {"response": "...", ...}
        message = result.get("message", "")
        if not message and isinstance(result, dict):
            message = result.get("response", "") or result.get("text", "") or str(result)
        
        return message
    
    async def generate_response_async(self, query: str, assistant_id: str = "smart-product-dev") -> Dict[str, Any]:
        """
        Async wrapper for generate_response (for backward compatibility).
        
        Args:
            query: User query string
            assistant_id: Assistant/workspace ID (default: "smart-product-dev")
            
        Returns:
            Response dictionary from the API
        """
        return self.generate_response(query, assistant_id)

    def get_history_sessions(
        self,
        assistant_id: str,
        query_params: str = "",
        auth_header: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get history sessions from Cortex History service
        
        Args:
            assistant_id: The assistant/workspace ID
            query_params: Query parameters string (e.g., "start=0&end=100")
            auth_header: Authorization header (Bearer token)
            
        Returns:
            Dictionary containing sessions array
        """
        if not auth_header:
            oauth_token = self.get_token()
            if not oauth_token:
                raise ValueError("Failed to obtain OAuth token")
            auth_header = f"Bearer {oauth_token}"
        
        url = f"{self.history_api_url}/{assistant_id}/sessions"
        if query_params:
            url = f"{url}?{query_params}"
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': auth_header
        }
        
        try:
            response = requests.get(url, headers=headers, verify=False)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Retrieved {len(result.get('sessions', []))} sessions from Cortex History")
            return result
        except Exception as e:
            logger.error(f"Error fetching history sessions: {e}")
            raise