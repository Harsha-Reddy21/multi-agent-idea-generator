"""
Document Content Extractor
===========================
Extracts text content from PDF, DOCX, TXT, and PPTX files using MarkItDown
"""

import io
import logging

import re
from pathlib import Path
from typing import Dict, Any, Callable, List, Optional

import pdfminer.high_level
from pdfminer.layout import LTTextContainer
from markitdown import MarkItDown
from data_service.models.document_extract import Block
from data_service.configurations.settings import settings

logger = logging.getLogger(__name__)


class DocumentExtractor:
    """Extract text content from documents using MarkItDown"""

    def __init__(self) -> None:
        self.md = MarkItDown()

    def _extract_content_with_markitdown(
        self, file_content: bytes, filename: str, file_extension: str
    ) -> Dict[str, Any]:
        """
        Extract content using MarkItDown library

        Args:
            file_content: File content as bytes
            filename: Name of the file
            file_extension: File extension (pdf, docx, pptx, txt)

        Returns:
            Dict with extraction results
        """
        try:
            # Create a file-like object
            file_obj = io.BytesIO(file_content)

            # Extract content using MarkItDown
            result = self.md.convert_stream(
                file_obj, file_extension=f".{file_extension}"
            )

            text_content = (
                result.text_content if hasattr(result, "text_content") else str(result)
            )

            # Count pages based on page markers or estimate
            page_count = text_content.count("---") if "---" in text_content else 1

            return {
                "success": True,
                "text": text_content,
                "page_count": page_count,
                "char_count": len(text_content),
                "word_count": len(text_content.split()),
                "file_type": file_extension,
            }

        except Exception as e:
            logger.exception(
                "MarkItDown extraction failed for %s: %s", filename, str(e)
            )
            return {"success": False, "error": str(e), "file_type": file_extension}

    def extract_content(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        add_page_markers_callback: Optional[
            Callable[[str], tuple[str, int]]
        ] = None,  # pylint: disable=unused-argument
    ) -> Dict[str, Any]:
        """
        Synchronous document text extraction using MarkItDown

        Args:
            file_content: File content as bytes
            filename: Name of the file
            content_type: MIME type of the file
            add_page_markers_callback: Optional callback (maintained for backward compatibility)

        Returns:
            Dict with extraction results
        """
        try:
            # Determine file extension
            file_extension = None

            if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
                file_extension = "pdf"
            elif content_type in [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
            ] or filename.lower().endswith(".docx"):
                file_extension = "docx"
            elif content_type == "text/plain" or filename.lower().endswith(".txt"):
                file_extension = "txt"
            elif content_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation" or filename.lower().endswith(
                ".pptx"
            ):
                file_extension = "pptx"
            else:
                return {
                    "success": False,
                    "error": f"Unsupported file type: {content_type}",
                    "file_type": "unknown",
                }

            return self._extract_content_with_markitdown(
                file_content, filename, file_extension
            )

        except Exception as e:
            logger.exception("Text extraction failed for %s: %s", filename, str(e))
            return {"success": False, "error": str(e), "file_type": "unknown"}

    @staticmethod
    def extract_pdf_with_pdfminer(file_bytes: bytes) -> str:
        """
        Extract text from PDF using pdfminer with page markers

        Args:
            file_bytes: PDF file content as bytes

        Returns:
            Text with --- Page N --- markers
        """
        page_texts = []
        file_obj = io.BytesIO(file_bytes)

        for page_num, page_layout in enumerate(
            pdfminer.high_level.extract_pages(file_obj), start=1
        ):
            page_text_parts = []
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    text = element.get_text()
                    if text.strip():
                        page_text_parts.append(text)

            if page_text_parts:
                page_content = "".join(page_text_parts).strip()
                page_texts.append(f"--- Page {page_num} ---\n{page_content}")

        return "\n\n".join(page_texts)

    @staticmethod
    def add_page_markers_by_chars(
        text: str, chars_per_page: int = 3000
    ) -> tuple[str, int]:
        """Add page markers based on character count estimation.

        Args:
            text: Full document text
            chars_per_page: Estimated characters per page (default: 3000)

        Returns:
            tuple: (marked_text, estimated_page_count)
        """
        if len(text) <= chars_per_page:
            return f"--- Page 1 ---\n{text}", 1

        pages = []
        current_pos = 0
        page_num = 1

        while current_pos < len(text):
            end_pos = min(current_pos + chars_per_page, len(text))

            if end_pos < len(text):
                paragraph_break = text.rfind(
                    "\n\n", max(current_pos, end_pos - 500), end_pos
                )
                if paragraph_break > current_pos:
                    end_pos = paragraph_break + 2
                else:
                    line_break = text.rfind(
                        "\n", max(current_pos, end_pos - 500), end_pos
                    )
                    if line_break > current_pos:
                        end_pos = line_break + 1

            page_content = text[current_pos:end_pos].strip()
            if page_content:
                pages.append(f"--- Page {page_num} ---\n{page_content}")
                page_num += 1

            current_pos = end_pos

        return "\n\n".join(pages), len(pages)

    async def extract_blocks(
        self, file_bytes: bytes, file_name: str, file_id: str, file_extension: str
    ) -> List[Block]:
        """
        Extract text blocks from any supported document type using MarkItDown

        Args:
            file_bytes: File content as bytes
            file_name: Name of the file
            file_id: Unique file identifier
            file_extension: File extension (pdf, docx, pptx, txt)

        Returns:
            List of Block objects
        """
        blocks = []
        block_index = 0
        char_offset = 0

        try:
            file_ext = Path(file_name).suffix.lower()

            # Extract content based on file type
            if file_ext == ".pdf":
                # Use pdfminer directly for PDF with page markers
                text_content = self.extract_pdf_with_pdfminer(file_bytes)
            else:
                # Use MarkItDown for DOCX, PPTX, and other formats
                file_obj = io.BytesIO(file_bytes)
                result = self.md.convert_stream(
                    file_obj, file_extension=f".{file_extension}"
                )
                text_content = (
                    result.text_content
                    if hasattr(result, "text_content")
                    else str(result)
                )

            # Parse page/slide-marked content based on file extension
            if file_ext == ".pdf":
                # PDF: --- Page N ---
                pattern = r"---\s*Page\s+(\d+)\s*---"
                splits = re.split(pattern, text_content)

                # splits will be: ['', '1', 'content1', '2', 'content2', ...]
                # Skip first empty element, then process pairs of (page_num, content)
                for i in range(1, len(splits), 2):
                    if i + 1 < len(splits):
                        page_num = int(splits[i])
                        page_content = splits[i + 1].strip()

                        if not page_content:
                            continue

                        # Split page content into sections by double newlines
                        sections = page_content.split("\n\n")

                        for section in sections:
                            section = section.strip()
                            if not section:
                                continue

                            # Determine block type
                            block_type = "paragraph"
                            if section.startswith("#"):
                                block_type = "heading"
                            elif "|" in section and section.count("|") > 2:
                                block_type = "table"
                            elif section.startswith("-") or section.startswith("*"):
                                block_type = "list"

                            blocks.append(
                                Block(
                                    span_id=len(blocks),
                                    file_id=file_id,
                                    file_name=file_name,
                                    page_or_slide=page_num,
                                    block_index=block_index,
                                    text=section,
                                    char_start=char_offset,
                                    char_end=char_offset + len(section),
                                    block_type=block_type,
                                )
                            )

                            char_offset += len(section) + 2  # +2 for \n\n
                            block_index += 1

            elif file_ext in [".pptx", ".ppt"]:
                # PPTX: <!-- Slide number: N -->
                pattern = r"<!--\s*Slide\s+number:\s*(\d+)\s*-->"
                matches = list(re.finditer(pattern, text_content))

                for idx, match in enumerate(matches):
                    slide_num = int(match.group(1))
                    start_pos = match.end()
                    end_pos = (
                        matches[idx + 1].start()
                        if idx + 1 < len(matches)
                        else len(text_content)
                    )
                    slide_content = text_content[start_pos:end_pos].strip()

                    if not slide_content:
                        continue

                    # Split slide content into sections by double newlines
                    sections = slide_content.split("\n\n")

                    for section in sections:
                        section = section.strip()
                        if not section:
                            continue

                        # Determine block type
                        block_type = "paragraph"
                        if section.startswith("#"):
                            block_type = "heading"
                        elif "|" in section and section.count("|") > 2:
                            block_type = "table"
                        elif section.startswith("-") or section.startswith("*"):
                            block_type = "list"

                        blocks.append(
                            Block(
                                span_id=len(blocks),
                                file_id=file_id,
                                file_name=file_name,
                                page_or_slide=slide_num,
                                block_index=block_index,
                                text=section,
                                char_start=char_offset,
                                char_end=char_offset + len(section),
                                block_type=block_type,
                            )
                        )

                        char_offset += len(section) + 2  # +2 for \n\n
                        block_index += 1

            else:
                # DOCX or other formats - no markers
                # For DOCX, calculate page number based on character offset
                sections = text_content.split("\n\n")

                for section in sections:
                    section = section.strip()
                    if not section:
                        continue

                    # Calculate page number based on character offset
                    # For DOCX: use character count / chars_per_page
                    if file_ext == ".docx":
                        page_num = (char_offset // settings.chars_per_page) + 1
                    else:
                        # For other formats without markers, default to page 1
                        page_num = 1

                    # Determine block type
                    block_type = "paragraph"
                    if section.startswith("#"):
                        block_type = "heading"
                    elif "|" in section and section.count("|") > 2:
                        block_type = "table"
                    elif section.startswith("-") or section.startswith("*"):
                        block_type = "list"

                    blocks.append(
                        Block(
                            span_id=len(blocks),
                            file_id=file_id,
                            file_name=file_name,
                            page_or_slide=page_num,
                            block_index=block_index,
                            text=section,
                            char_start=char_offset,
                            char_end=char_offset + len(section),
                            block_type=block_type,
                        )
                    )

                    char_offset += len(section) + 2  # +2 for \n\n
                    block_index += 1

            return blocks

        except Exception as e:
            logger.exception("Block extraction failed for %s: %s", file_name, str(e))
            return []

    async def extract_pdf_blocks(
        self, file_bytes: bytes, file_name: str, file_id: str
    ) -> List[Block]:
        """Extract text blocks from PDF using MarkItDown"""
        return await self.extract_blocks(file_bytes, file_name, file_id, "pdf")

    async def extract_docx_blocks(
        self, file_bytes: bytes, file_name: str, file_id: str
    ) -> List[Block]:
        """Extract text blocks from DOCX using MarkItDown"""
        return await self.extract_blocks(file_bytes, file_name, file_id, "docx")

    async def extract_pptx_blocks(
        self, file_bytes: bytes, file_name: str, file_id: str
    ) -> List[Block]:
        """Extract text blocks from PPTX using MarkItDown"""
        return await self.extract_blocks(file_bytes, file_name, file_id, "pptx")


document_extractor = DocumentExtractor()
