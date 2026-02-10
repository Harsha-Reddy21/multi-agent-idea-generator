
from typing import List, Dict, Optional, Any
from services.agent_chat import agent_app
import logging
import re
from html import unescape
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class ChatService:
    
    def __init__(self):
        """Initialize the chat service."""
        pass
    
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

    def _sections_to_html(self, sections: Dict[str, str]) -> str:
        """Convert document sections (agent keys or LLM keys) back to HTML for the editor."""
        section_order = [
            "solution_overview",
            "ai_registry",
            "digital_legal",
            "security_architecture",
            "third_party",
        ]
        heading_names = {
            "solution_overview": "General Information",
            "ai_registry": "Data Information",
            "digital_legal": "Legal Information",
            "security_architecture": "Security",
            "third_party": "Third Party Engagement",
        }
        # Normalize keys: lowercase, spaces -> underscores
        def norm(k: str) -> str:
            return k.lower().strip().replace(" ", "_").replace("-", "_")

        sections = sections or {}
        ordered = []
        seen = set()
        for key in section_order:
            for raw_key, content in sections.items():
                if norm(raw_key) == key and content and content.strip():
                    ordered.append((heading_names[key], content.strip()))
                    seen.add(raw_key)
                    break
        for raw_key, content in sections.items():
            if raw_key in seen or not (content and content.strip()):
                continue
            title = heading_names.get(norm(raw_key), raw_key.replace("_", " ").title())
            ordered.append((title, content.strip()))
        parts = []
        for title, content in ordered:
            parts.append(f"<h2>{title}</h2>")
            for block in content.split("\n\n"):
                block = block.strip()
                if block:
                    parts.append(f"<p>{block}</p>")
        return "\n\n".join(parts) if parts else ""
    
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
        """
        Generate a response using the multi-agent system.
        
        Args:
            user_message: The user's message/query
            document_content: HTML content of the document being reviewed
            chat_history: Previous chat messages as list of dicts
            request_id: Unique identifier for this request
            assistant_id: Assistant/workspace ID (unused, kept for compatibility)
            
        Returns:
            Dictionary with 'response', 'confidence_score', and 'request_id'
        """
        try:
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
            
            logger.info(f"Agent input: {agent_input}")
            
            # Invoke the agent graph (synchronous call)
            result = agent_app.invoke(agent_input)
            
            logger.info(f"Agent output: {result}")
            
            # Extract response and confidence score
            response_text = result.get("chat_response", "")
            confidence_score = result.get("confidence_score", 0.5)
            
            # Convert confidence score from 0-1 to 0-100 for frontend
            confidence_percentage = int(confidence_score * 100)
            
            # If no response from chat_responder, use document suggestions or fallback
            document_suggestions = result.get("document_suggestions")
            if not response_text:
                if document_suggestions:
                    response_text = "I've updated your document with the requested content. Review the changes in the editor and accept to apply."
                else:
                    response_text = "I've reviewed your document. Please provide more details for better feedback."

            # When update agent produced suggestions, build HTML for the frontend to apply
            document_content = None
            if document_suggestions:
                document_content = self._sections_to_html(document_suggestions)
                logger.info(f"[{request_id}] Built document_content from suggestions, length: {len(document_content)} chars")

            return {
                "response": response_text,
                "confidence_score": confidence_percentage,
                "request_id": request_id,
                "document_content": document_content,
            }
        except Exception as e:
            logger.error(f"[{request_id}] Error generating response: {e}")
            import traceback
            logger.error(f"[{request_id}] Traceback: {traceback.format_exc()}")
            raise
