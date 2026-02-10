
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
    
    def _merge_suggestions_into_html(self, original_html: str, document_suggestions: Dict[str, str]) -> str:
        """
        Merge document suggestions back into the original HTML structure.
        Replaces section content with enhanced versions while preserving structure.
        If original HTML doesn't have section headings, creates them.
        
        Args:
            original_html: Original HTML document content
            document_suggestions: Dictionary mapping section keys to enhanced content
            
        Returns:
            Updated HTML with suggestions merged in
        """
        if not document_suggestions:
            return original_html
        
        try:
            soup = BeautifulSoup(original_html, 'html.parser') if original_html else BeautifulSoup('', 'html.parser')
            
            # Map section keys to heading text and display names
            section_config = {
                'solution_overview': {
                    'headings': ['general information', 'solution overview', 'solution'],
                    'display_name': 'General Information'
                },
                'ai_registry': {
                    'headings': ['ai registry', 'ai registry & innovation pipeline', 'ai registry & innovation'],
                    'display_name': 'AI Registry'
                },
                'digital_legal': {
                    'headings': ['legal information', 'digital legal', 'privacy'],
                    'display_name': 'Legal Information'
                },
                'security_architecture': {
                    'headings': ['security', 'security architecture'],
                    'display_name': 'Security Architecture'
                },
                'third_party': {
                    'headings': ['third party', 'third party engagement'],
                    'display_name': 'Third Party Engagement'
                },
            }
            
            # Check if document has any headings
            existing_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            has_sections = len(existing_headings) > 0
            
            if not has_sections:
                # No sections found - create a new document with all sections
                logger.info("No section headings found in original HTML, creating new document structure")
                soup = BeautifulSoup('', 'html.parser')
                
                # Create sections in order
                section_order = ['solution_overview', 'ai_registry', 'digital_legal', 'security_architecture', 'third_party']
                
                for section_key in section_order:
                    if section_key in document_suggestions:
                        new_content = document_suggestions[section_key]
                        if not new_content or not new_content.strip():
                            continue
                            
                        # Create heading
                        heading = soup.new_tag('h2')
                        heading.string = section_config[section_key]['display_name']
                        soup.append(heading)
                        
                        # Add content after the heading
                        self._add_content_to_soup(soup, new_content, insert_after=heading)
                
                result_html = str(soup)
                logger.info(f"Created new document structure with {len(result_html)} chars")
                logger.info(f"First 500 chars: {result_html[:500]}")
                return result_html
            
            # Document has sections - merge into existing structure
            current_section_key = None
            current_heading_element = None
            content_elements = []
            processed_sections = set()
            
            for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote']):
                if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    # Save previous section if we have suggestions for it
                    if current_section_key and current_section_key in document_suggestions:
                        processed_sections.add(current_section_key)
                        # Replace all content elements with new content
                        new_content = document_suggestions[current_section_key]
                        # Clear existing content elements
                        for elem in content_elements:
                            elem.decompose()
                        # Add new content
                        if new_content:
                            self._add_content_to_soup(soup, new_content, insert_after=current_heading_element)
                    
                    # Reset for new section
                    heading_text = element.get_text().strip().lower()
                    current_section_key = None
                    content_elements = []
                    current_heading_element = element
                    
                    # Find matching section
                    for section_key, config in section_config.items():
                        if any(h in heading_text for h in config['headings']):
                            current_section_key = section_key
                            break
                else:
                    # This is content
                    if current_section_key:
                        content_elements.append(element)
            
            # Handle last section
            if current_section_key and current_section_key in document_suggestions:
                processed_sections.add(current_section_key)
                new_content = document_suggestions[current_section_key]
                for elem in content_elements:
                    elem.decompose()
                if new_content:
                    self._add_content_to_soup(soup, new_content, insert_after=current_heading_element)
            
            # Add any sections that weren't found in the original document
            section_order = ['solution_overview', 'ai_registry', 'digital_legal', 'security_architecture', 'third_party']
            for section_key in section_order:
                if section_key in document_suggestions and section_key not in processed_sections:
                    logger.info(f"Adding missing section: {section_key}")
                    # Add heading
                    heading = soup.new_tag('h2')
                    heading.string = section_config[section_key]['display_name']
                    soup.append(heading)
                    # Add content
                    self._add_content_to_soup(soup, document_suggestions[section_key])
            
            return str(soup)
            
        except Exception as e:
            logger.error(f"Error merging suggestions into HTML: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return original_html
    
    def _add_content_to_soup(self, soup: BeautifulSoup, content: str, insert_after=None):
        """
        Helper method to add content to soup, handling both HTML and plain text.
        
        Args:
            soup: BeautifulSoup object
            content: Content to add (HTML or plain text)
            insert_after: Element to insert after (if None, appends to soup)
        """
        if not content or not content.strip():
            return
        
        current_insert_point = insert_after
        
        # Check if content is HTML or plain text
        if content.strip().startswith('<') and '>' in content:
            # Content is HTML, parse and insert
            new_soup = BeautifulSoup(content, 'html.parser')
            for child in new_soup.children:
                if hasattr(child, 'name') and child.name:
                    if current_insert_point:
                        current_insert_point.insert_after(child.extract())
                        current_insert_point = child
                    else:
                        soup.append(child.extract())
        else:
            # Content is plain text, convert to paragraphs
            paragraphs = content.split('\n\n')
            for para_text in paragraphs:
                if para_text.strip():
                    new_p = soup.new_tag('p')
                    # Preserve line breaks but clean up
                    para_text = para_text.replace('\n', ' ').strip()
                    new_p.string = para_text
                    if current_insert_point:
                        current_insert_point.insert_after(new_p)
                        current_insert_point = new_p
                    else:
                        soup.append(new_p)
    
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
            document_suggestions = result.get("document_suggestions", {})
            
            logger.info(f"[{request_id}] ========== DOCUMENT SUGGESTIONS CHECK ==========")
            logger.info(f"[{request_id}] document_suggestions type: {type(document_suggestions)}")
            logger.info(f"[{request_id}] document_suggestions is dict: {isinstance(document_suggestions, dict)}")
            logger.info(f"[{request_id}] document_suggestions keys: {list(document_suggestions.keys()) if isinstance(document_suggestions, dict) else 'N/A'}")
            logger.info(f"[{request_id}] document_suggestions empty: {not document_suggestions}")
            if isinstance(document_suggestions, dict) and document_suggestions:
                for key, value in document_suggestions.items():
                    logger.info(f"[{request_id}]   - {key}: {len(str(value))} chars")
            logger.info(f"[{request_id}] ================================================")
            
            # Convert confidence score from 0-1 to 0-100 for frontend
            confidence_percentage = int(confidence_score * 100)
            
            # If no response from chat_responder, use document suggestions or fallback
            if not response_text:
                if document_suggestions:
                    response_text = "Here are suggested improvements for your document sections:\n\n"
                    for section, suggestion in document_suggestions.items():
                        response_text += f"{section}:\n{suggestion}\n\n"
                else:
                    response_text = "I've reviewed your document. Please provide more details for better feedback."
            
            # Merge document suggestions into HTML if available
            updated_document_html = None
            if document_suggestions and isinstance(document_suggestions, dict) and len(document_suggestions) > 0:
                logger.info(f"[{request_id}] ✅ Document suggestions received: {list(document_suggestions.keys())}")
                logger.info(f"[{request_id}] Original HTML length: {len(document_content)} chars")
                updated_document_html = self._merge_suggestions_into_html(document_content, document_suggestions)
                logger.info(f"[{request_id}] ✅ Merged document suggestions into HTML ({len(updated_document_html)} chars)")
                logger.info(f"[{request_id}] First 500 chars of merged HTML: {updated_document_html[:500]}")
            else:
                logger.warning(f"[{request_id}] ⚠️ No document suggestions in result or empty dict")
                logger.warning(f"[{request_id}] document_suggestions value: {document_suggestions}")
                logger.warning(f"[{request_id}] document_suggestions type: {type(document_suggestions)}")
            
            response_data = {
                "response": response_text,
                "confidence_score": confidence_percentage,
                "request_id": request_id
            }
            
            # Include updated document HTML if available
            if updated_document_html:
                response_data["document_suggestions"] = updated_document_html
                logger.info(f"[{request_id}] Added document_suggestions to response")
            else:
                logger.info(f"[{request_id}] No document_suggestions to include in response")
            
            return response_data
        except Exception as e:
            logger.error(f"[{request_id}] Error generating response: {e}")
            import traceback
            logger.error(f"[{request_id}] Traceback: {traceback.format_exc()}")
            raise
