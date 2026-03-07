"""
Unit tests for document_extractor.py
=====================================
Tests the DocumentExtractor class for text extraction from various file types.
"""

import pytest
from unittest.mock import MagicMock, patch
import io

from data_service.utils.document_extractor import DocumentExtractor


class TestDocumentExtractorInit:
    """Tests for DocumentExtractor initialization."""

    def test_init_creates_markitdown(self):
        """Test DocumentExtractor initializes with MarkItDown instance."""
        extractor = DocumentExtractor()
        assert extractor.md is not None


class TestDocumentExtractorContentType:
    """Tests for DocumentExtractor extract_content method content type handling."""

    def test_extract_content_unsupported_type(self):
        """Test extract_content returns error for unsupported file types."""
        extractor = DocumentExtractor()
        result = extractor.extract_content(
            file_content=b"test content",
            filename="test.xyz",
            content_type="application/unknown",
        )

        assert result["success"] is False
        assert "Unsupported file type" in result["error"]
        assert result["file_type"] == "unknown"

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_pdf_by_content_type(self, mock_extract):
        """Test extract_content detects PDF by content type."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"pdf content",
            filename="document",
            content_type="application/pdf",
        )

        mock_extract.assert_called_once_with(b"pdf content", "document", "pdf")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_pdf_by_extension(self, mock_extract):
        """Test extract_content detects PDF by file extension."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"pdf content",
            filename="document.pdf",
            content_type="application/octet-stream",
        )

        mock_extract.assert_called_once_with(b"pdf content", "document.pdf", "pdf")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_docx_by_content_type(self, mock_extract):
        """Test extract_content detects DOCX by content type."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"docx content",
            filename="document",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        mock_extract.assert_called_once_with(b"docx content", "document", "docx")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_docx_by_extension(self, mock_extract):
        """Test extract_content detects DOCX by file extension."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"docx content",
            filename="document.docx",
            content_type="application/octet-stream",
        )

        mock_extract.assert_called_once_with(b"docx content", "document.docx", "docx")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_txt_by_content_type(self, mock_extract):
        """Test extract_content detects TXT by content type."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"text content", filename="document", content_type="text/plain"
        )

        mock_extract.assert_called_once_with(b"text content", "document", "txt")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_txt_by_extension(self, mock_extract):
        """Test extract_content detects TXT by file extension."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"text content",
            filename="document.txt",
            content_type="application/octet-stream",
        )

        mock_extract.assert_called_once_with(b"text content", "document.txt", "txt")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_pptx_by_content_type(self, mock_extract):
        """Test extract_content detects PPTX by content type."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"pptx content",
            filename="presentation",
            content_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )

        mock_extract.assert_called_once_with(b"pptx content", "presentation", "pptx")

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_pptx_by_extension(self, mock_extract):
        """Test extract_content detects PPTX by file extension."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"pptx content",
            filename="presentation.pptx",
            content_type="application/octet-stream",
        )

        mock_extract.assert_called_once_with(
            b"pptx content", "presentation.pptx", "pptx"
        )

    @patch.object(DocumentExtractor, "_extract_content_with_markitdown")
    def test_extract_content_msword_content_type(self, mock_extract):
        """Test extract_content detects DOC by msword content type."""
        mock_extract.return_value = {"success": True, "text": "content"}
        extractor = DocumentExtractor()

        extractor.extract_content(
            file_content=b"doc content",
            filename="document.doc",
            content_type="application/msword",
        )

        mock_extract.assert_called_once_with(b"doc content", "document.doc", "docx")

    def test_extract_content_exception_handling(self):
        """Test extract_content handles exceptions gracefully."""
        extractor = DocumentExtractor()

        with patch.object(
            extractor,
            "_extract_content_with_markitdown",
            side_effect=Exception("Test error"),
        ):
            result = extractor.extract_content(
                file_content=b"content",
                filename="test.pdf",
                content_type="application/pdf",
            )

        assert result["success"] is False
        assert "Test error" in result["error"]


class TestMarkItDownExtraction:
    """Tests for _extract_content_with_markitdown method."""

    def test_extract_with_markitdown_success(self):
        """Test successful extraction with MarkItDown."""
        extractor = DocumentExtractor()

        # Create a mock that properly has text_content attribute
        class MockResult:
            text_content = "This is sample text content from the document."

        mock_result = MockResult()

        with patch.object(extractor.md, "convert_stream", return_value=mock_result):
            result = extractor._extract_content_with_markitdown(
                file_content=b"content", filename="test.txt", file_extension="txt"
            )

        assert result["success"] is True
        assert result["text"] == "This is sample text content from the document."
        assert result["file_type"] == "txt"
        assert result["word_count"] == 8
        assert result["char_count"] == 46

    def test_extract_with_markitdown_page_count(self):
        """Test page count detection with separators."""
        extractor = DocumentExtractor()

        mock_result = MagicMock()
        mock_result.text_content = "Page 1 content---Page 2 content---Page 3 content"

        with patch.object(extractor.md, "convert_stream", return_value=mock_result):
            result = extractor._extract_content_with_markitdown(
                file_content=b"content", filename="test.pdf", file_extension="pdf"
            )

        assert result["success"] is True
        assert result["page_count"] == 2  # Two --- separators

    def test_extract_with_markitdown_no_text_content_attr(self):
        """Test extraction when result has no text_content attribute."""
        extractor = DocumentExtractor()

        # Create a simple object without text_content attribute
        class MockResultNoAttr:
            pass

        mock_result = MockResultNoAttr()

        with patch.object(extractor.md, "convert_stream", return_value=mock_result):
            result = extractor._extract_content_with_markitdown(
                file_content=b"content", filename="test.txt", file_extension="txt"
            )

        assert result["success"] is True
        # When no text_content, it falls back to str(result)
        assert "MockResultNoAttr" in result["text"]

    def test_extract_with_markitdown_exception(self):
        """Test extraction handles exceptions."""
        extractor = DocumentExtractor()

        with patch.object(
            extractor.md, "convert_stream", side_effect=Exception("Parse error")
        ):
            result = extractor._extract_content_with_markitdown(
                file_content=b"content", filename="test.pdf", file_extension="pdf"
            )

        assert result["success"] is False
        assert "Parse error" in result["error"]


class TestStaticMethods:
    """Tests for DocumentExtractor static methods."""

    def test_add_page_markers_by_chars(self):
        """Test add_page_markers_by_chars adds page markers."""
        text = "A" * 6000  # 6000 characters = 2 pages at 3000 chars/page
        result, page_count = DocumentExtractor.add_page_markers_by_chars(
            text, chars_per_page=3000
        )

        assert page_count == 2
        assert "--- Page 1 ---" in result
        assert "--- Page 2 ---" in result

    def test_add_page_markers_by_chars_short_text(self):
        """Test add_page_markers_by_chars with short text."""
        text = "Short text"
        result, page_count = DocumentExtractor.add_page_markers_by_chars(
            text, chars_per_page=3000
        )

        assert page_count == 1
        assert "--- Page 1 ---" in result

    def test_add_page_markers_by_chars_empty_text(self):
        """Test add_page_markers_by_chars with empty text."""
        text = ""
        result, page_count = DocumentExtractor.add_page_markers_by_chars(
            text, chars_per_page=3000
        )

        assert page_count == 1
