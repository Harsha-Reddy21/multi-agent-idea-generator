
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from services.llm_service import LLMService
from services.agent_chat import agent_app
import logging
import re
from html import unescape
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class ChatService:

    SESSION_RETENTION_DAYS = 30
    SESSIONS_PER_PAGE = 100
    CACHE_TTL = 86400  # 1 day in seconds
    SESSION_TITLE_MAX_LENGTH = 41
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        # TODO: Initialize database connection (e.g., SQLAlchemy)
        # TODO: Initialize cache service (e.g., Redis)
        # self.db = None  # Database connection
        # self.cache = None  # Cache service
    
    def _parse_html_to_sections(self, html_content: str) -> Dict[str, str]:
        """
        Parse HTML content into document sections.
        Maps headings to section keys expected by the agent system.
        
        Expected sections:
        - solution_overview (General Information)
        - ai_registry (AI Registry)
        - digital_legal (Legal Information)
        - security_architecture (Security)
        - third_party (Third Party)
        """
        sections = {
            "solution_overview": "",
            "ai_registry": "",
            "digital_legal": "",
            "security_architecture": "",
            "third_party": "",
        }
        
        if not html_content or not html_content.strip():
            return sections
        
        try:
            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Map headings to section keys (case-insensitive)
            heading_to_section = {
                'general information': 'solution_overview',
                'solution overview': 'solution_overview',
                'solution': 'solution_overview',
                'ai registry': 'ai_registry',
                'ai registry & innovation pipeline': 'ai_registry',
                'ai registry & innovation': 'ai_registry',
                'legal information': 'digital_legal',
                'digital legal': 'digital_legal',
                'privacy': 'digital_legal',
                'security': 'security_architecture',
                'security architecture': 'security_architecture',
                'third party': 'third_party',
                'third party engagement': 'third_party',
                'data information': 'ai_registry',  # Fallback mapping
            }
            
            current_section = None
            current_content = []
            
            # Process all elements in order
            for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote']):
                # Check if this is a heading
                if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    # Save previous section content if any
                    if current_section and current_content:
                        content_text = ' '.join(current_content).strip()
                        if content_text:
                            if sections[current_section]:
                                sections[current_section] += "\n\n" + content_text
                            else:
                                sections[current_section] = content_text
                        current_content = []
                    
                    # Check if this heading maps to a section
                    heading_text = element.get_text().strip().lower()
                    for key, section_key in heading_to_section.items():
                        if key in heading_text:
                            current_section = section_key
                            break
                else:
                    # This is content (paragraph, list, etc.)
                    if current_section:
                        text = element.get_text().strip()
                        if text:
                            current_content.append(text)
            
            # Save last section content
            if current_section and current_content:
                content_text = ' '.join(current_content).strip()
                if content_text:
                    if sections[current_section]:
                        sections[current_section] += "\n\n" + content_text
                    else:
                        sections[current_section] = content_text
            
            # If no sections were found, extract all text and put in solution_overview
            if not any(sections.values()):
                all_text = soup.get_text(separator=' ', strip=True)
                if all_text:
                    sections["solution_overview"] = all_text
            
        except Exception as e:
            logger.warning(f"Error parsing HTML with BeautifulSoup: {e}. Falling back to simple extraction.")
            # Fallback: simple text extraction
            text = re.sub(r'<[^>]+>', ' ', html_content)
            text = unescape(text).strip()
            if text:
                sections["solution_overview"] = text
        
        return sections
    
    def _format_chat_history(self, chat_history: List[Dict]) -> List[str]:
        """
        Convert chat history from List[Dict] format to List[str] format
        expected by the agent system.
        """
        if not chat_history:
            return []
        
        formatted = []
        for msg in chat_history[-10:]:  # Last 10 messages
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if content:
                formatted.append(f"{role}: {content}")
        
        return formatted
    
    async def get_response(
        self,
        user_message: str,
        document_content: str = "",
        chat_history: List[Dict] = None,
        request_id: str = "unknown",
        assistant_id: str = "smart-product-dev"
    ) -> Dict[str, Any]:

        try:
            logger.info(f"[{request_id}] Generating response using multi-agent system")
            logger.info(f"[{request_id}] User message: {user_message[:200]}")

            # Parse HTML document into sections
            document_sections = self._parse_html_to_sections(document_content)
            logger.info(f"[{request_id}] Parsed document sections: {list(document_sections.keys())}")
            
            # Format chat history
            formatted_history = self._format_chat_history(chat_history or [])
            logger.info(f"[{request_id}] Formatted chat history: {len(formatted_history)} messages")
            
            # Prepare input for agent system
            agent_input = {
                "user_query": user_message,
                "document": document_sections,
                "chat_history": formatted_history,
            }
            
            logger.info(f"[{request_id}] Invoking agent graph...")
            
            # Invoke the agent graph (synchronous call)
            result = agent_app.invoke(agent_input)
            
            logger.info(f"[{request_id}] Agent graph completed")
            logger.info(f"[{request_id}] Intent: {result.get('intent')}")
            logger.info(f"[{request_id}] Relevance score: {result.get('relevance_score')}")
            logger.info(f"[{request_id}] Ambiguity score: {result.get('ambiguity_score')}")
            
            # Extract response and confidence score
            response_text = result.get("chat_response", "")
            confidence_score = result.get("confidence_score", 0.5)
            
            # Convert confidence score from 0-1 to 0-100 for frontend
            confidence_percentage = int(confidence_score * 100)
            
            # If no response from chat_responder, use document suggestions or fallback
            if not response_text:
                document_suggestions = result.get("document_suggestions")
                if document_suggestions:
                    response_text = "Here are suggested improvements for your document sections:\n\n"
                    for section, suggestion in document_suggestions.items():
                        response_text += f"{section}:\n{suggestion}\n\n"
                else:
                    response_text = "I've reviewed your document. Please provide more details for better feedback."
            
            logger.info(f"[{request_id}] Response generated successfully")
            logger.info(f"[{request_id}] Response length: {len(response_text)} chars")
            logger.info(f"[{request_id}] Confidence score: {confidence_percentage}%")
            
            return {
                "response": response_text,
                "confidence_score": confidence_percentage,
                "request_id": request_id
            }
        except Exception as e:
            logger.error(f"[{request_id}] Error generating response: {e}")
            import traceback
            logger.error(f"[{request_id}] Traceback: {traceback.format_exc()}")
            raise
    
    async def create(
        self,
        chat_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates a new chat entry in the database and updates cache
        
        Args:
            chat_data: Dictionary containing:
                - chatId: Chat session ID
                - assistantId: Assistant/workspace ID
                - userId: User ID
                - sessionTitle: Title for the session
                - session: Session data object
                
        Returns:
            The created chat object
        """
        logger.info("Creating chat session", extra={
            "chatId": chat_data.get("chatId"),
            "assistantId": chat_data.get("assistantId"),
            "userId": chat_data.get("userId"),
        })
        
        # Validate chat session first
        await self.validate_chat_session(chat_data)
        
        try:
            # TODO: Verify assistant exists in database
            # assistant = await get_assistant_by_id(chat_data["assistantId"])
            # if not assistant:
            #     await create_assistant(...)
            
            # TODO: Verify user exists in database
            # user = await get_user_by_email(chat_data["userId"])
            # if not user:
            #     await create_user(chat_data["userId"])
            
            # Truncate sessionTitle to max length
            session_title = chat_data.get("sessionTitle", "")
            truncated_title = (
                session_title[:self.SESSION_TITLE_MAX_LENGTH]
                if len(session_title) > self.SESSION_TITLE_MAX_LENGTH
                else session_title
            )
            
            # Prepare chat record
            chat_record = {
                "chatId": chat_data["chatId"],
                "assistantId": chat_data["assistantId"],
                "userId": chat_data["userId"],
                "sessionTitle": truncated_title,
                "session": chat_data.get("session") if chat_data.get("session") is not None else {"dbgenerated": "null"},
                "createdAt": datetime.now(),
                "updatedAt": datetime.now(),
                "deletedAt": None
            }
            
            # TODO: Save to database
            # created_chat = await self.db.chat.create(chat_record)
            
            # TODO: Update cache
            # cache_key = f"chat:{chat_data['userId']}:{chat_data['assistantId']}"
            # existing_sessions = await self.cache.get(cache_key) or []
            # existing_sessions.append(chat_data["chatId"])
            # await self.cache.set(cache_key, existing_sessions, self.CACHE_TTL)
            
            logger.info("Chat created and cache updated", extra={
                "chatId": chat_data["chatId"],
                "userId": chat_data["userId"],
                "assistantId": chat_data["assistantId"],
            })
            
            # Return created chat (for now, return the record)
            return chat_record
            
        except Exception as e:
            logger.error("Failed to create chat session", extra={
                "error": str(e),
                "chatId": chat_data.get("chatId"),
                "userId": chat_data.get("userId"),
            })
            raise
    
    async def update_chat_title(
        self,
        chat_id: str,
        user_id: str,
        session_title: str,
        chat_title_updation: bool = True,
        session: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Updates an existing chat's title in the database
        
        Args:
            chat_id: The ID of the chat to update
            user_id: The ID of the user making the update
            session_title: The new title for the chat session
            chat_title_updation: If True, only updates sessionTitle; if False, updates both sessionTitle and updatedAt
            session: Optional session data to update
            
        Returns:
            The updated chat object
        """
        logger.info("Updating chat session title", extra={
            "chatId": chat_id,
            "userId": user_id,
            "sessionTitle": session_title,
        })
        
        try:
            # TODO: Verify that the chat exists and belongs to the user
            # chat = await self.db.chat.find_first(
            #     where={
            #         "chatId": chat_id,
            #         "userId": user_id,
            #         "deletedAt": None
            #     }
            # )
            # 
            # if not chat:
            #     raise ValueError("Chat not found or access denied")
            
            # Truncate sessionTitle
            truncated_title = (
                session_title[:self.SESSION_TITLE_MAX_LENGTH]
                if len(session_title) > self.SESSION_TITLE_MAX_LENGTH
                else session_title
            )
            
            # Prepare update data
            update_data = {
                "sessionTitle": truncated_title,
            }
            
            if session:
                update_data["session"] = session
            
            if not chat_title_updation:
                update_data["updatedAt"] = datetime.now()
            
            # TODO: Update in database
            # updated_chat = await self.db.chat.update(
            #     where={"chatId": chat_id},
            #     data=update_data
            # )
            
            logger.info("Chat title updated successfully", extra={
                "chatId": chat_id,
                "userId": user_id,
            })
            
            # TODO: Clear cache
            # await self.clear_chat_cache(user_id, chat["assistantId"], chat_id)
            
            # Return updated chat (for now, return update_data)
            return update_data
            
        except Exception as e:
            logger.error("Failed to update chat title", extra={
                "error": str(e),
                "chatId": chat_id,
                "userId": user_id,
            })
            raise
    
    async def get_sessions(
        self,
        auth: str,
        user_id: str,
        assistant_id: str,
        pagination: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        """
        Gets all valid chat sessions for a user and assistant within the last 30 days
        Performs hard deletion of sessions older than 30 days
        
        Args:
            auth: Authorization header (Bearer token)
            user_id: The user ID
            assistant_id: The assistant ID
            pagination: Optional pagination parameters with 'start' and 'end' keys
            
        Returns:
            Dictionary with data (sessions), total, start, end, and hasMore
        """
        if not user_id or not assistant_id:
            logger.warn("Invalid parameters for getSessions", extra={
                "userId": user_id,
                "assistantId": assistant_id,
            })
            raise ValueError("User ID and Assistant ID are required")
        
        # Set default pagination values
        start = pagination.get("start", 0) if pagination else 0
        end = pagination.get("end") if pagination else None
        
        # TODO: Check cache first
        # cache_key = f"chat:{user_id}:{assistant_id}"
        # session_ids = await self.cache.get(cache_key)
        session_ids = None
        
        # Filter out null or undefined values if they exist
        if session_ids and isinstance(session_ids, list):
            session_ids = [id for id in session_ids if id is not None]
        
        # If not in cache, fetch from Cortex and update cache
        if not session_ids or not isinstance(session_ids, list) or len(session_ids) == 0:
            logger.info("Session IDs not found in cache, fetching from Cortex", extra={
                "cacheKey": f"chat:{user_id}:{assistant_id}",
            })
            session_ids = await self.get_cortex_sessions(auth, user_id, assistant_id)
        
        # TODO: Get all sessions from database that match the session IDs and aren't soft-deleted
        # all_sessions = await self.db.chat.find_many(
        #     where={
        #         "userId": user_id,
        #         "assistantId": assistant_id,
        #         "chatId": {"in": session_ids},
        #         "deletedAt": None,
        #     },
        #     order_by={"createdAt": "desc"},
        # )
        all_sessions = []  # Placeholder
        
        # Total count of all valid sessions
        total = len(all_sessions)
        
        # Apply pagination to the sessions
        paginated_sessions = []
        has_more = False
        
        if start < 0:
            # Negative index (Python-style slicing from the end)
            start_index = max(0, total + start)
            end_index = max(0, total + end) if end is not None else total
            paginated_sessions = all_sessions[start_index:end_index]
            has_more = end_index < total
        else:
            # Positive index (from the beginning)
            start_index = min(start, total)
            end_index = min(end, total) if end else total
            paginated_sessions = all_sessions[start_index:end_index]
            has_more = end_index < total
        
        # Calculate actual start and end indices used
        actual_start = max(0, total + start) if start < 0 else min(start, total)
        actual_end = (
            max(0, total + end) if end is not None else total
            if start < 0
            else min(end if end else actual_start + len(paginated_sessions), total)
        )
        
        logger.info("Successfully retrieved chat sessions", extra={
            "sessionCount": len(paginated_sessions),
        })
        
        return {
            "data": paginated_sessions,
            "total": total,
            "start": actual_start,
            "end": actual_end,
            "hasMore": has_more,
        }
    
    async def get_cortex_sessions(
        self,
        auth: str,
        user_id: str,
        assistant_id: str
    ) -> List[str]:
        """
        Fetches session IDs from Cortex History service
        Returns only sessions within the last 30 days
        Performs cleanup of old sessions
        
        Args:
            auth: Authorization header (Bearer token)
            user_id: The user ID
            assistant_id: The assistant ID
            
        Returns:
            Array of session IDs within the retention period
        """
        logger.info("Fetching sessions from Cortex History service")
        
        try:
            # Set cutoff date (30 days ago)
            cutoff_date = datetime.now() - timedelta(days=self.SESSION_RETENTION_DAYS)
            
            # Set up for pagination
            all_sessions = []
            page = 0
            reached_old_sessions = False
            
            # Paginate through results until we reach sessions older than 30 days
            while not reached_old_sessions:
                start = page * self.SESSIONS_PER_PAGE
                end = (page + 1) * self.SESSIONS_PER_PAGE
                
                # Create query parameters
                query_params = f"start={start}&end={end}"
                
                # Get history sessions from Cortex
                history_sessions = self.llm_service.get_history_sessions(
                    assistant_id,
                    query_params,
                    auth
                )
                
                if not history_sessions or not history_sessions.get("sessions") or not isinstance(history_sessions["sessions"], list):
                    logger.warn("Invalid response from Cortex History service")
                    break
                
                sessions = history_sessions["sessions"]
                
                # If no sessions returned, we've reached the end
                if not sessions or len(sessions) == 0:
                    break
                
                # Check if we've reached sessions older than the cutoff date
                oldest_session = None
                for session in sessions:
                    timestamp = session.get("createdAt") or session.get("lastUpdated")
                    if timestamp:
                        try:
                            session_date = datetime.fromtimestamp(
                                timestamp if isinstance(timestamp, (int, float)) else int(timestamp)
                            )
                            if not oldest_session or session_date < oldest_session:
                                oldest_session = session_date
                        except (ValueError, TypeError):
                            continue
                
                if oldest_session and oldest_session < cutoff_date:
                    reached_old_sessions = True
                    # Filter out sessions older than cutoff date from this batch
                    valid_sessions = [
                        session for session in sessions
                        if self._is_session_valid(session, cutoff_date)
                    ]
                    all_sessions.extend(valid_sessions)
                    break
                
                # Add sessions to our collection
                all_sessions.extend(sessions)
                
                # Move to next page
                page += 1
                
                # Safeguard: if we've already got a lot of sessions or paginated too far, stop
                if len(all_sessions) > 1000 or page > 10:
                    logger.info("Reached pagination limit when fetching sessions", extra={
                        "totalSessions": len(all_sessions),
                        "pages": page,
                    })
                    break
            
            # Filter sessions to only include those associated with the current user
            valid_sessions = [
                session for session in all_sessions
                if self._is_session_for_user(session, user_id)
            ]
            
            session_ids = [session["id"] for session in valid_sessions if session.get("id")]
            
            # TODO: Get existing sessions from database to ensure we only include sessions
            # that actually exist in our database
            # db_sessions = await self.db.chat.find_many(
            #     where={
            #         "userId": user_id,
            #         "assistantId": assistant_id,
            #         "chatId": {"in": session_ids} if session_ids else {"in": ["dummy-id-if-empty"]},
            #     },
            #     select={"chatId": True},
            # )
            # confirmed_session_ids = [session["chatId"] for session in db_sessions]
            confirmed_session_ids = session_ids  # Placeholder
            
            # Wipe old sessions that are no longer valid
            await self.wipe_old_cortex_sessions(user_id, assistant_id, confirmed_session_ids)
            
            # TODO: Cache the valid session IDs
            # cache_key = f"chat:{user_id}:{assistant_id}"
            # await self.cache.set(cache_key, confirmed_session_ids, self.CACHE_TTL)
            
            logger.info("Successfully fetched and cached Cortex sessions", extra={
                "sessionCount": len(confirmed_session_ids),
            })
            
            return confirmed_session_ids
            
        except Exception as e:
            logger.error("Error fetching sessions from Cortex History service", extra={
                "error": str(e),
                "userId": user_id,
                "assistantId": assistant_id,
            })
            return []
    
    def _is_session_valid(self, session: Dict[str, Any], cutoff_date: datetime) -> bool:
        """Check if session is within retention period"""
        timestamp = session.get("createdAt") or session.get("lastUpdated")
        if not timestamp:
            return False
        try:
            session_date = datetime.fromtimestamp(
                timestamp if isinstance(timestamp, (int, float)) else int(timestamp)
            )
            return session_date >= cutoff_date
        except (ValueError, TypeError):
            return False
    
    def _is_session_for_user(self, session: Dict[str, Any], user_id: str) -> bool:
        """Check if session belongs to user"""
        if session.get("userId") and session["userId"] != user_id:
            return False
        if not session.get("id"):
            return False
        return True
    
    async def wipe_old_cortex_sessions(
        self,
        user_id: str,
        assistant_id: str,
        current_session_ids: List[str]
    ) -> None:
        """
        Identifies and deletes sessions that are no longer valid (older than 30 days)
        
        Args:
            user_id: The user ID
            assistant_id: The assistant ID
            current_session_ids: Array of current valid session IDs
        """
        logger.info("Identifying old sessions for deletion")
        
        try:
            # Set cutoff date (30 days ago)
            cutoff_date = datetime.now() - timedelta(days=self.SESSION_RETENTION_DAYS)
            
            # TODO: Get all sessions for this user and assistant from the database
            # db_sessions = await self.db.chat.find_many(
            #     where={
            #         "userId": user_id,
            #         "assistantId": assistant_id,
            #     },
            #     select={"chatId": True, "createdAt": True},
            # )
            db_sessions = []  # Placeholder
            
            # Identify sessions that are either:
            # 1. Not in the current session IDs list, or
            # 2. Older than the cutoff date
            sessions_to_delete = [
                session["chatId"] for session in db_sessions
                if (
                    session["chatId"] not in current_session_ids or
                    datetime.fromisoformat(str(session["createdAt"])) < cutoff_date
                )
            ]
            
            if sessions_to_delete:
                logger.info("Found sessions to delete", extra={
                    "deleteCount": len(sessions_to_delete),
                })
                await self.hard_delete_sessions(sessions_to_delete, user_id, assistant_id)
                logger.info("Completed deletion of old sessions", extra={
                    "assistantId": assistant_id,
                    "userId": user_id,
                    "deletedCount": len(sessions_to_delete),
                })
            else:
                logger.info("No old sessions to delete", extra={
                    "assistantId": assistant_id,
                    "userId": user_id,
                })
        except Exception as e:
            logger.error("Error wiping old Cortex sessions", extra={
                "error": str(e),
                "userId": user_id,
                "assistantId": assistant_id,
            })
            # Don't throw here to prevent failure of the main getSessions flow
    
    async def hard_delete_sessions(
        self,
        session_ids_to_delete: List[str],
        user_id: str,
        assistant_id: str
    ) -> None:
        """
        Permanently deletes sessions from the database and cache
        
        Args:
            session_ids_to_delete: Array of session IDs to delete
            user_id: The user ID
            assistant_id: The assistant ID
        """
        if not session_ids_to_delete:
            logger.info("No sessions to delete")
            return
        
        logger.info("Performing hard deletion of sessions", extra={
            "sessionCount": len(session_ids_to_delete),
        })
        
        try:
            # TODO: Delete sessions from the database
            # delete_result = await self.db.chat.delete_many(
            #     where={"chatId": {"in": session_ids_to_delete}},
            # )
            
            # TODO: Delete session-specific cache entries
            # for session_id in session_ids_to_delete:
            #     session_cache_key = f"chat:{user_id}:{assistant_id}:{session_id}"
            #     await self.cache.delete(session_cache_key)
            
            # TODO: Update the list of sessions in cache
            # cache_key = f"chat:{user_id}:{assistant_id}"
            # cached_sessions = await self.cache.get(cache_key)
            # if cached_sessions and isinstance(cached_sessions, list):
            #     updated_sessions = [
            #         id for id in cached_sessions
            #         if id not in session_ids_to_delete
            #     ]
            #     await self.cache.set(cache_key, updated_sessions, self.CACHE_TTL)
            
            logger.info("Successfully deleted sessions", extra={
                "userId": user_id,
                "assistantId": assistant_id,
            })
        except Exception as e:
            logger.error("Error performing hard deletion of sessions", extra={
                "error": str(e),
                "userId": user_id,
                "assistantId": assistant_id,
                "sessionIds": session_ids_to_delete,
            })
            raise
    
    async def validate_chat_session(self, chat_data: Dict[str, Any]) -> None:
        """
        Validate chat session data
        
        Args:
            chat_data: The chat data to validate
            
        Raises:
            ValueError: If validation fails
        """
        if not chat_data.get("chatId"):
            logger.warn("Validation failed: Chat ID is required")
            raise ValueError("Chat ID is required")
        
        if not chat_data.get("assistantId"):
            logger.warn("Validation failed: Assistant ID is required")
            raise ValueError("Assistant ID is required")
        
        if not chat_data.get("userId"):
            logger.warn("Validation failed: User ID is required")
            raise ValueError("User ID is required")
        
        if not chat_data.get("sessionTitle"):
            logger.warn("Validation failed: Session title is required")
            raise ValueError("Session title is required")
        
        if chat_data.get("session") is None or not isinstance(chat_data.get("session"), dict):
            logger.warn("Validation failed: Session data must be a valid object")
            raise ValueError("Session data must be a valid object")
    
    async def soft_delete_chat(
        self,
        model: str,
        chat_id: str,
        user_id: str
    ) -> None:
        """
        Soft deletes a chat session by setting the deletedAt field
        This keeps the record in the database but excludes it from queries
        
        Args:
            model: The assistant ID
            chat_id: The chat ID to soft delete
            user_id: The user ID
        """
        logger.info("Soft deleting chat", extra={"chatId": chat_id})
        
        try:
            # TODO: Update the chat item in the database to set deletedAt
            # updated_chat = await self.db.chat.update(
            #     where={"chatId": chat_id},
            #     data={"deletedAt": datetime.now()},
            # )
            # 
            # if not updated_chat:
            #     raise ValueError(f"Chat with ID {chat_id} not found")
            
            # TODO: Update the list of chat IDs in the cache
            # await self.update_chat_list_cache(user_id, model, chat_id)
            
            # TODO: Clear the specific chat cache
            # await self.clear_chat_cache(user_id, model, chat_id)
            
            logger.info(f"Chat with ID {chat_id} marked as deleted.")
            logger.info("Chat soft deleted successfully", extra={
                "model": model,
                "chatId": chat_id,
                "userId": user_id,
            })
        except Exception as e:
            logger.error("Failed to soft delete chat", extra={"error": str(e)})
            raise
    
    async def soft_delete_all_chats_for_model(
        self,
        model: str,
        user_id: str
    ) -> Dict[str, int]:
        """
        Soft deletes all chat sessions for a specific user and model by setting the deletedAt field
        
        Args:
            model: The assistant ID
            user_id: The user ID
            
        Returns:
            Dictionary with deletedCount
        """
        logger.info("Soft deleting all chats for model", extra={
            "model": model,
            "userId": user_id,
        })
        
        try:
            # TODO: Get all chat IDs that will be deleted for cache cleanup
            # chats_to_delete = await self.db.chat.find_many(
            #     where={
            #         "assistantId": model,
            #         "userId": user_id,
            #         "deletedAt": None,
            #     },
            #     select={"chatId": True},
            # )
            chats_to_delete = []  # Placeholder
            
            if len(chats_to_delete) == 0:
                logger.info("No chats found to delete for model", extra={
                    "model": model,
                    "userId": user_id,
                })
                return {"deletedCount": 0}
            
            chat_ids = [chat["chatId"] for chat in chats_to_delete]
            
            # TODO: Update all chat items in the database to set deletedAt
            # update_result = await self.db.chat.update_many(
            #     where={
            #         "assistantId": model,
            #         "userId": user_id,
            #         "deletedAt": None,
            #     },
            #     data={"deletedAt": datetime.now()},
            # )
            
            # TODO: Clear the entire chat list cache for this user and model
            # cache_key = f"chat:{user_id}:{model}"
            # await self.cache.delete(cache_key)
            
            # TODO: Clear individual chat caches
            # for chat_id in chat_ids:
            #     try:
            #         await self.clear_chat_cache(user_id, model, chat_id)
            #     except Exception as e:
            #         logger.error("Failed to clear individual chat cache", extra={
            #             "chatId": chat_id,
            #             "error": str(e),
            #         })
            
            logger.info("All chats for model soft deleted successfully", extra={
                "model": model,
                "userId": user_id,
            })
            
            return {"deletedCount": len(chat_ids)}
        except Exception as e:
            logger.error("Failed to soft delete all chats for model", extra={"error": str(e)})
            raise
    
    async def update_chat_list_cache(
        self,
        user_id: str,
        assistant_id: str,
        chat_id: str
    ) -> None:
        """
        Updates the list of chat IDs in cache when a chat is soft deleted
        
        Args:
            user_id: The user ID
            assistant_id: The assistant ID
            chat_id: The chat ID that was soft deleted
        """
        cache_key = f"chat:{user_id}:{assistant_id}"
        
        try:
            # TODO: Get the existing list of chat IDs from cache
            # chat_ids = await self.cache.get(cache_key)
            # 
            # if chat_ids and isinstance(chat_ids, list):
            #     # Remove the soft-deleted chat ID from the list
            #     updated_chat_ids = [id for id in chat_ids if id != chat_id]
            #     
            #     # Update the cache with the new list
            #     await self.cache.set(cache_key, updated_chat_ids, self.CACHE_TTL)
            #     
            #     logger.info("Updated chat list cache after soft deletion", extra={
            #         "newCount": len(updated_chat_ids),
            #     })
            pass
        except Exception as e:
            logger.error("Failed to update chat list cache", extra={"error": str(e)})
            # Don't throw error here to allow the rest of the deletion process to continue
    
    async def clear_chat_cache(
        self,
        user_id: str,
        assistant_id: str,
        chat_id: str
    ) -> None:
        """
        Clears the cache for a specific chat
        
        Args:
            user_id: The user ID
            assistant_id: The assistant ID
            chat_id: The chat ID
        """
        cache_key = f"chat:{user_id}:{assistant_id}:{chat_id}"
        
        try:
            # TODO: Delete from cache
            # await self.cache.delete(cache_key)
            logger.info(f"Cache cleared for chat with key {cache_key}")
        except Exception as e:
            logger.error(f"Failed to clear cache for chat with key {cache_key}", extra={"error": str(e)})
            raise
    
    async def get_chat(
        self,
        user_id: str,
        assistant_id: str,
        chat_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Gets a single chat session by ID
        First checks cache, then database
        
        Args:
            user_id: The user ID
            assistant_id: The assistant ID
            chat_id: The chat ID to retrieve
            
        Returns:
            The chat session if found and authorized, None if not found
            Raises ValueError if unauthorized
        """
        if not user_id or not assistant_id or not chat_id:
            logger.warn("Invalid parameters for getChat", extra={
                "userId": user_id,
                "assistantId": assistant_id,
                "chatId": chat_id,
            })
            raise ValueError("User ID, Assistant ID, and Chat ID are required")
        
        logger.info("Retrieving chat session", extra={
            "userId": user_id,
            "assistantId": assistant_id,
            "chatId": chat_id,
        })
        
        try:
            # TODO: Check cache first
            # cache_key = f"chat:{user_id}:{assistant_id}:{chat_id}"
            # cached_chat = await self.cache.get(cache_key)
            # 
            # if cached_chat:
            #     logger.info("Chat session found in cache")
            #     return cached_chat
            
            # TODO: Not found in cache, check database
            # chat_session = await self.db.chat.find_unique(
            #     where={
            #         "assistantId": assistant_id,
            #         "chatId": chat_id,
            #         "deletedAt": None,
            #     },
            # )
            chat_session = None  # Placeholder
            
            if not chat_session:
                logger.info("Chat session not found in database")
                return None
            
            # Check authorization
            if chat_session.get("userId") != user_id:
                logger.warn("Unauthorized access attempt", extra={
                    "requestingUserId": user_id,
                    "chatUserId": chat_session.get("userId"),
                    "chatId": chat_id,
                    "assistantId": assistant_id,
                })
                raise ValueError("Unauthorized access")
            
            # Convert to chat history session format
            chat_history_session = {
                "chatId": chat_session["chatId"],
                "assistantId": chat_session["assistantId"],
                "userId": chat_session["userId"],
                "sessionTitle": chat_session["sessionTitle"],
                "session": chat_session["session"],
                "createdAt": chat_session["createdAt"],
                "updatedAt": chat_session["updatedAt"],
                "deletedAt": chat_session.get("deletedAt"),
            }
            
            # TODO: Cache the result
            # await self.cache.set(cache_key, chat_history_session, self.CACHE_TTL)
            
            logger.info("Chat session retrieved and cached")
            return chat_history_session
            
        except ValueError:
            raise
        except Exception as e:
            logger.error("Error retrieving chat session", extra={
                "error": str(e),
                "userId": user_id,
                "assistantId": assistant_id,
                "chatId": chat_id,
            })
            raise
    
    async def delete_assistant_with_relations(
        self,
        assistant_id: str
    ) -> Dict[str, int]:
        """
        Delete assistant and all related data using transaction
        Ensures data consistency by deleting chats, user associations, and assistant in one atomic operation
        
        Args:
            assistant_id: The assistant/workspace ID
            
        Returns:
            Object with counts of deleted records
        """
        logger.info("Preparing to delete assistant with all relations", extra={
            "assistantId": assistant_id,
        })
        
        try:
            # TODO: Use database transaction
            # async with self.db.transaction():
            #     # Delete chats
            #     chat_delete_result = await self.db.chat.delete_many(
            #         where={"assistantId": assistant_id},
            #     )
            #     
            #     # Delete user associations
            #     user_association_delete_result = await self.db.userAssistant.delete_many(
            #         where={"assistantId": assistant_id},
            #     )
            #     
            #     # Delete assistant
            #     await self.db.assistant.delete(
            #         where={"assistantId": assistant_id},
            #     )
            #     
            #     result = {
            #         "chatCount": chat_delete_result.count,
            #         "userAssociationCount": user_association_delete_result.count,
            #     }
            
            # TODO: Clear cache after successful transaction
            # await self.cache.clear_by_prefix(f"chat:*:{assistant_id}*")
            
            result = {"chatCount": 0, "userAssociationCount": 0}  # Placeholder
            
            logger.info("Assistant and all relations deleted successfully", extra={
                "assistantId": assistant_id,
                **result,
            })
            
            return result
        except Exception as e:
            logger.error("Failed to delete assistant with relations", extra={
                "assistantId": assistant_id,
                "error": str(e),
            })
            raise
    