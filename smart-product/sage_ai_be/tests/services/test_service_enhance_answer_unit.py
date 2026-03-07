"""Unit tests for EnhanceAnswerService after refactoring.

Tests the modular architecture with:
- QuestionContextBuilder
- DocumentContextBuilder
- FormDataContextBuilder
- LLMResponseParser
- InputValidator
"""

import asyncio
import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, Mock

from data_service.service.enhance_answer import (
    EnhanceAnswerService,
    enhance_text_service,
)
from data_service.serializers.enhance_answer import (
    EnhanceRequest,
    EnhanceResponse,
    FormDataEntry,
)
from data_service.exceptions.service_errors import EnhanceAnswerServiceError
from data_service.configurations.settings import Settings
from data_service.service.enhance_ans_context_builders import (
    QuestionContextBuilder,
    DocumentContextBuilder,
    FormDataContextBuilder,
)
from data_service.service.llm_response_parser_enhance_ans import LLMResponseParser
from data_service.utils.input_validator import InputValidator


@pytest.fixture
def mock_settings():
    settings = MagicMock(spec=Settings)
    settings.enhancement_default_no_data_message = "No data available"
    settings.enhancement_default_failed_message = "Enhancement failed"
    settings.enhancement_max_user_text_length = 5000
    settings.use_llm_gateway = False
    return settings


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    db.rollback = AsyncMock()
    return db


class FakeQuestion:
    def __init__(self, question_id, question_text):
        self.id = question_id
        self.question = question_text


@pytest.fixture
def enhance_request():
    return EnhanceRequest(
        question_id="Q1",
        submission_id="SUB123",
        form_id="FORM1",
        user_text="This is user input text",
        form_data=[
            FormDataEntry(
                questionId="Q2",
                question="Related question?",
                answer=["Related answer"],
            )
        ],
    )


# ===== Service Initialization Tests =====


def test_service_initialization(mock_db, mock_settings):
    """Test service initializes with modular builders"""
    service = EnhanceAnswerService(mock_db, mock_settings)
    assert service.db == mock_db
    assert service.settings == mock_settings
    # Check new modular components exist
    assert service.question_builder is not None
    assert service.document_builder is not None
    assert service.form_builder is not None
    assert service.response_parser is not None
    assert service.input_validator is not None


# ===== Text Enhancement Tests =====


@pytest.mark.asyncio
async def test_enhance_text_success(mock_db, mock_settings, enhance_request):
    """Test successful text enhancement with mocked builders"""
    service = EnhanceAnswerService(mock_db, mock_settings)

    # Mock the question builder
    service.question_builder.build = AsyncMock(
        return_value={
            "question": "What is your answer?",
            "suggestions": ["Suggestion 1"],
        }
    )

    # Mock the document builder
    service.document_builder.build = AsyncMock(return_value="Document context")

    # Mock the response parser
    service.response_parser.parse = MagicMock(
        return_value={
            "enhanced_answer": "Enhanced text",
            "improvements_summary": "Added clarity",
        }
    )

    llm_response = json.dumps(
        {"enhanced_answer": "Enhanced text", "improvements_summary": "Added clarity"}
    )

    with patch.object(service.cortex_client, "invoke_ask", return_value=llm_response):
        with patch(
            "data_service.service.enhance_answer.create_ai_interaction",
            return_value=AsyncMock(id="INT123"),
        ):
            response = await service.enhance_text(enhance_request)

    assert isinstance(response, EnhanceResponse)
    assert response.reviewed_text == "Enhanced text"
    assert response.rationale == "Added clarity"


@pytest.mark.asyncio
async def test_enhance_text_timeout_error(mock_db, mock_settings, enhance_request):
    """Test timeout error handling"""
    service = EnhanceAnswerService(mock_db, mock_settings)

    # Mock question builder to raise TimeoutError
    service.question_builder.build = AsyncMock(
        side_effect=asyncio.TimeoutError("Connection timeout")
    )

    with pytest.raises(EnhanceAnswerServiceError) as exc_info:
        await service.enhance_text(enhance_request)
    assert exc_info.value.status_code == 504


@pytest.mark.asyncio
async def test_enhance_text_with_llm_gateway(mock_db, mock_settings, enhance_request):
    """Test enhancement using LLM Gateway"""
    mock_settings.use_llm_gateway = True
    service = EnhanceAnswerService(mock_db, mock_settings)

    service.question_builder.build = AsyncMock(
        return_value={"question": "Question", "suggestions": []}
    )
    service.document_builder.build = AsyncMock(return_value="Doc")
    service.response_parser.parse = MagicMock(
        return_value={
            "enhanced_answer": "Gateway result",
            "improvements_summary": "Summary",
        }
    )

    llm_response = json.dumps(
        {"enhanced_answer": "Gateway result", "improvements_summary": "Summary"}
    )

    with patch.object(
        service.llm_gateway_client, "ask_model", return_value=llm_response
    ):
        with patch(
            "data_service.service.enhance_answer.create_ai_interaction",
            return_value=AsyncMock(id="INT123"),
        ):
            response = await service.enhance_text(enhance_request)

    assert response.reviewed_text == "Gateway result"


# ===== QuestionContextBuilder Tests =====


@pytest.mark.asyncio
async def test_fetch_question_and_suggestions_success(mock_db, mock_settings):
    """Test QuestionContextBuilder fetches question and suggestions"""
    builder = QuestionContextBuilder(mock_db)

    fake_question = FakeQuestion("Q1", "What is the question?")

    with patch.object(
        builder.cache_manager,
        "get_question_with_suggestions",
        return_value={"question": fake_question, "suggestions": ["Tip 1", "Tip 2"]},
    ):
        result = await builder.build("Q1")

    assert result["question"] == "What is the question?"
    assert result["suggestions"] == ["Tip 1", "Tip 2"]


@pytest.mark.asyncio
async def test_fetch_question_no_suggestions(mock_db, mock_settings):
    """Test QuestionContextBuilder handles missing suggestions"""
    builder = QuestionContextBuilder(mock_db)

    fake_question = FakeQuestion("Q1", "Question")

    with patch.object(
        builder.cache_manager,
        "get_question_with_suggestions",
        return_value={"question": fake_question, "suggestions": None},
    ):
        result = await builder.build("Q1")

    assert result["suggestions"] == []


# ===== DocumentContextBuilder Tests =====


@pytest.mark.asyncio
async def test_build_context_success(mock_db, mock_settings, enhance_request):
    """Test DocumentContextBuilder builds context successfully"""
    mock_doc_service = MagicMock()
    mock_doc_service.get_question_extraction = AsyncMock(
        return_value={"extracted_content": "Document text"}
    )

    builder = DocumentContextBuilder(mock_doc_service, "No data available")

    result = await builder.build(
        submission_id="SUB123", form_id="FORM1", question_id="Q1", db=mock_db
    )

    assert result == "Document text"


@pytest.mark.asyncio
async def test_build_context_document_extraction_fails(mock_db, mock_settings):
    """Test DocumentContextBuilder handles extraction failure"""
    mock_doc_service = MagicMock()
    mock_doc_service.get_question_extraction = AsyncMock(
        side_effect=ValueError("Failed")
    )

    builder = DocumentContextBuilder(mock_doc_service, "No data available")

    result = await builder.build(
        submission_id="SUB1", form_id="FORM1", question_id="Q1", db=mock_db
    )

    assert result == "No data available"


@pytest.mark.asyncio
async def test_fetch_document_extraction_success(mock_db, mock_settings):
    """Test DocumentContextBuilder returns extracted content"""
    mock_doc_service = MagicMock()
    mock_doc_service.get_question_extraction = AsyncMock(
        return_value={"extracted_content": "Extracted document"}
    )

    builder = DocumentContextBuilder(mock_doc_service, "No data")

    result = await builder.build(
        submission_id="SUB1", form_id="FORM1", question_id="Q1", db=mock_db
    )

    assert result == "Extracted document"


# ===== FormDataContextBuilder Tests =====


def test_format_form_data_success(mock_db, mock_settings):
    """Test FormDataContextBuilder formats form data"""
    form_data = [
        FormDataEntry(questionId="Q1", question="Q1?", answer=["A1"]),
        FormDataEntry(questionId="Q2", question="Q2?", answer=["A2a", "A2b"]),
    ]

    result = FormDataContextBuilder.build(form_data)

    assert "Q1" in result
    assert "A1" in result


def test_format_form_data_empty(mock_db, mock_settings):
    """Test FormDataContextBuilder handles empty data"""
    assert FormDataContextBuilder.build([]) == ""
    assert FormDataContextBuilder.build(None) == ""


# ===== LLMResponseParser Tests =====


def test_parse_llm_response_valid_json(mock_db, mock_settings):
    """Test LLMResponseParser parses valid JSON"""
    parser = LLMResponseParser("Enhancement failed")

    response = json.dumps(
        {"enhanced_answer": "Enhanced", "improvements_summary": "Details"}
    )

    result = parser.parse(response)

    assert result["enhanced_answer"] == "Enhanced"


def test_parse_llm_response_openai_format(mock_db, mock_settings):
    """Test LLMResponseParser parses OpenAI format"""
    parser = LLMResponseParser("Enhancement failed")

    response = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(
                        {"enhanced_answer": "Result", "improvements_summary": "Summary"}
                    )
                }
            }
        ]
    }

    result = parser.parse(response)

    assert result["enhanced_answer"] == "Result"


def test_parse_llm_response_invalid(mock_db, mock_settings):
    """Test LLMResponseParser handles invalid JSON"""
    parser = LLMResponseParser("Enhancement failed")

    result = parser.parse("invalid json")

    assert result["enhanced_answer"] == "Enhancement failed"


# ===== InputValidator Tests =====


def test_sanitize_user_input_valid(mock_db, mock_settings):
    """Test InputValidator sanitizes valid text"""
    validator = InputValidator(5000)

    result = validator.sanitize_user_text("Valid text")

    assert result == "Valid text"


def test_sanitize_removes_dangerous_patterns(mock_db, mock_settings):
    """Test InputValidator removes dangerous patterns"""
    validator = InputValidator(5000)

    dangerous = "text ``` system: assistant: <|endoftext|>"
    result = validator.sanitize_user_text(dangerous)

    assert "```" not in result
    assert "system:" not in result
    assert "<|endoftext|>" not in result


def test_sanitize_truncates_long_text(mock_db, mock_settings):
    """Test InputValidator truncates long text"""
    validator = InputValidator(100)

    long_text = "a" * 10000
    result = validator.sanitize_user_text(long_text)

    assert len(result) <= 100


# ===== AI Interaction Tests =====


@pytest.mark.asyncio
async def test_ai_interaction_persistence(mock_db, mock_settings, enhance_request):
    """Test AI interaction is persisted"""
    service = EnhanceAnswerService(mock_db, mock_settings)

    service.question_builder.build = AsyncMock(
        return_value={"question": "Question", "suggestions": []}
    )
    service.document_builder.build = AsyncMock(return_value="Doc")
    service.response_parser.parse = MagicMock(
        return_value={"enhanced_answer": "Enhanced", "improvements_summary": "Summary"}
    )

    llm_response = json.dumps(
        {"enhanced_answer": "Enhanced", "improvements_summary": "Summary"}
    )

    mock_interaction = AsyncMock()
    mock_interaction.id = "INT123"

    with patch.object(service.cortex_client, "invoke_ask", return_value=llm_response):
        with patch(
            "data_service.service.enhance_answer.create_ai_interaction",
            return_value=mock_interaction,
        ) as mock_create:
            response = await service.enhance_text(enhance_request)
            mock_create.assert_called_once()
            assert response.interaction_id == "INT123"


@pytest.mark.asyncio
async def test_interaction_failure_non_blocking(
    mock_db, mock_settings, enhance_request
):
    """Test AI interaction failure doesn't block response"""
    service = EnhanceAnswerService(mock_db, mock_settings)

    service.question_builder.build = AsyncMock(
        return_value={"question": "Question", "suggestions": []}
    )
    service.document_builder.build = AsyncMock(return_value="Doc")
    service.response_parser.parse = MagicMock(
        return_value={"enhanced_answer": "Enhanced", "improvements_summary": "Summary"}
    )

    llm_response = json.dumps(
        {"enhanced_answer": "Enhanced", "improvements_summary": "Summary"}
    )

    with patch.object(service.cortex_client, "invoke_ask", return_value=llm_response):
        with patch(
            "data_service.service.enhance_answer.create_ai_interaction",
            side_effect=Exception("DB error"),
        ):
            response = await service.enhance_text(enhance_request)
            assert isinstance(response, EnhanceResponse)
            assert response.interaction_id is None
