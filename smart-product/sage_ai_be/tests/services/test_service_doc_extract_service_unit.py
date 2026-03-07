import asyncio
import datetime
import uuid
import pytest
from dataclasses import dataclass
from typing import List, Optional
from unittest.mock import MagicMock

from data_service.service.doc_extract_service import DocumentExtractionService
from data_service.exceptions.service_errors import DocumentExtractionServiceError
from data_service.constants.extraction_mapping import PREFIX_TO_FORM
from data_service.constants.constants import ProcessingStatus
from data_service.models.document_extract import Block, Answer


@dataclass
class FakeAnswer:
    """Mock Answer object for testing"""

    question_id: str
    answer_text: str
    span_ids: List[int]
    confidence: Optional[float] = 0.0
    provenance: Optional[List[dict]] = None


class DummyResult:
    def __init__(self, items=None, single=None):
        self._items = items or []
        self._single = single

    # For question query: result.scalars().all()
    def scalars(self):
        return self

    def all(self):
        return self._items

    # For submission query: result.scalars().first()
    def first(self):
        return self._items[0] if self._items else None

    # For status/extraction queries: result.scalar_one_or_none()
    def scalar_one_or_none(self):
        return self._single


class FakeQuestion:
    def __init__(self, qid, question_type="Text"):
        self.id = qid
        self.question = f"Question text for {qid}"
        self.question_type = question_type


class FakeProcessingStatus:
    def __init__(self, submission_id, status):
        self.submission_id = submission_id
        self.status = status


class FakeExtraction:
    def __init__(self, submission_id, form_id, data):
        self.submission_id = submission_id
        self.form_id = form_id
        self.extracted_data = data
        self.created_at = datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc)
        self.updated_at = datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc)


class FakeSubmission:
    def __init__(self, submission_id, submitter_id):
        self.id = submission_id
        self.submitter_id = submitter_id


class FakeDB:
    def __init__(
        self,
        question_items=None,
        processing_status=None,
        extraction=None,
        submission=None,
    ):
        self.question_items = question_items or []
        self.processing_status = processing_status
        self.extraction = extraction
        self.submission = submission
        self.query_counter = []

    async def execute(
        self, stmt
    ):  # stmt is a SQLAlchemy selectable; we branch by expected target class name substrings
        text = str(stmt)
        # Rough heuristic: check attribute access patterns
        if "questions" in text.lower():
            return DummyResult(items=self.question_items)
        if "submission_processing_status" in text.lower():
            return DummyResult(single=self.processing_status)
        if "form_extractions" in text.lower():
            return DummyResult(single=self.extraction)
        if "submissions" in text.lower():
            return DummyResult(items=[self.submission] if self.submission else [])
        return DummyResult()


@pytest.fixture
def service():
    """Create service with mocked cortex client"""
    svc = DocumentExtractionService(model_name="fake-model")
    return svc


@pytest.fixture
def sample_blocks():
    """Sample blocks for testing extract_answer_from_blocks"""
    return [
        Block(
            span_id=1,
            file_id="file1",
            file_name="doc1.pdf",
            page_or_slide=1,
            block_index=0,
            text="This is the first block of text.",
            char_start=0,
            char_end=33,
            block_type="paragraph",
        ),
        Block(
            span_id=2,
            file_id="file1",
            file_name="doc1.pdf",
            page_or_slide=1,
            block_index=1,
            text="This is the second block with important information.",
            char_start=34,
            char_end=86,
            block_type="paragraph",
        ),
        Block(
            span_id=3,
            file_id="file1",
            file_name="doc1.pdf",
            page_or_slide=2,
            block_index=0,
            text="Third block on page 2.",
            char_start=87,
            char_end=109,
            block_type="paragraph",
        ),
    ]


@pytest.fixture
def block_lookup(sample_blocks):
    """Block lookup dictionary for extract_answer_from_blocks tests"""
    return {block.span_id: block for block in sample_blocks}


@pytest.fixture
def disable_llm_gateway(monkeypatch):
    """Disable LLM gateway so tests use cortex client."""
    from data_service.configurations import settings as settings_module

    monkeypatch.setattr(settings_module.settings, "use_llm_gateway", False)
    monkeypatch.setattr(settings_module.settings, "use_dual_api_race", False)


@pytest.mark.asyncio
async def test_fetch_text_questions_filters_excluded_forms(service, monkeypatch):
    """Test that questions are filtered based on INCLUDED_QUESTION_IDS and excluded forms."""
    # Patch INCLUDED_QUESTION_IDS on the doc_extract_service module
    from data_service.service import doc_extract_service as des

    monkeypatch.setattr(des, "INCLUDED_QUESTION_IDS", ["AI-Q1", "S-Q3", "L-Q4", "X-Q5"])

    # Create fake questions
    q_items = [
        FakeQuestion("AI-Q1"),
        FakeQuestion(
            "R-Q2"
        ),  # should be excluded by form exclusion (GCO Risk Registry)
        FakeQuestion("S-Q3", question_type="Text (Long Text)"),
        FakeQuestion("L-Q4", question_type="Long Text"),
        FakeQuestion("X-Q5"),  # unknown prefix retained (no form exclusion)
    ]

    # Mock cache_manager.get_text_questions to return our fake questions
    from data_service.utils import cache_manager as cm

    async def mock_get_text_questions(db):
        return q_items

    monkeypatch.setattr(cm.cache_manager, "get_text_questions", mock_get_text_questions)

    fake_db = FakeDB(question_items=q_items)
    questions = await service.fetch_text_questions_from_db(fake_db)
    ids = {q["id"] for q in questions}

    assert "AI-Q1" in ids
    assert "S-Q3" in ids
    assert "L-Q4" in ids
    assert "X-Q5" in ids
    assert "R-Q2" not in ids  # excluded by form exclusion


def test_filter_excluded_questions_by_id(service, monkeypatch):
    """Test that _filter_excluded_questions filters by INCLUDED_QUESTION_IDS."""
    q_items = [FakeQuestion("AI-Q1"), FakeQuestion("AI-Q2"), FakeQuestion("AI-Q3")]

    # Patch INCLUDED_QUESTION_IDS on the doc_extract_service module
    from data_service.service import doc_extract_service as des

    monkeypatch.setattr(des, "INCLUDED_QUESTION_IDS", ["AI-Q1", "AI-Q3"])

    filtered = service._filter_excluded_questions(q_items)
    ids = [q.id for q in filtered]
    assert "AI-Q1" in ids and "AI-Q3" in ids and "AI-Q2" not in ids

    filtered = service._filter_excluded_questions(q_items)
    ids = [q.id for q in filtered]
    assert "AI-Q1" in ids and "AI-Q3" in ids and "AI-Q2" not in ids


def test_build_combined_content(service):
    questions = [
        {"id": "AI-Q1", "question": "Title?"},
        {"id": "S-Q2", "question": "Desc?"},
    ]
    content = service.build_combined_content(questions, "Document body here")
    assert "=== FORM QUESTIONS TO ANSWER ===" in content
    assert "AI-Q1: Title?" in content
    assert "=== DOCUMENT CONTENT ===" in content
    assert "Document body here" in content


@pytest.mark.asyncio
async def test_extract_single_file_success(service, monkeypatch, disable_llm_gateway):
    """Test successful extraction from a single file."""
    # Patch DocumentExtractor.extract_content to simulate successful extraction
    from data_service.utils import document_extractor as de

    def fake_extract_content(
        file_content, filename, content_type, add_page_markers_callback
    ):
        return {"success": True, "text": "Extracted text body"}

    monkeypatch.setattr(
        de.DocumentExtractor, "extract_content", staticmethod(fake_extract_content)
    )

    # Patch cortex client result (used when use_llm_gateway=False)
    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "attempts": 2,
            "parsed_json": {"AI-Q1": ["Answer1"], "S-Q2": ["Answer2"]},
            "validation_passed": True,
            "can_skip_enrichment": False,
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    questions = [{"id": "AI-Q1", "question": "T?"}, {"id": "S-Q2", "question": "D?"}]
    result = await service.extract_single_file_with_content(
        file_name="file.txt",
        file_content=b"abc",
        content_type="text/plain",
        questions=questions,
        doc_executor=None,
    )
    assert result["success"] is True
    assert result["question_answers"]["AI-Q1"] == ["Answer1"]
    assert result["attempts"] == 2


@pytest.mark.asyncio
async def test_extract_single_file_text_extraction_failure(service, monkeypatch):
    from data_service.utils import document_extractor as de

    def fake_extract_content(
        file_content, filename, content_type, add_page_markers_callback
    ):
        return {"success": False, "error": "cannot read"}

    monkeypatch.setattr(
        de.DocumentExtractor, "extract_content", staticmethod(fake_extract_content)
    )

    questions = [{"id": "AI-Q1", "question": "T?"}]
    result = await service.extract_single_file_with_content(
        file_name="file.txt",
        file_content=b"x",
        content_type="text/plain",
        questions=questions,
        doc_executor=None,
    )
    assert result["success"] is False
    assert result["error"] == "cannot read"
    assert result["attempts"] == 0


@pytest.mark.asyncio
async def test_extract_single_file_llm_failure(
    service, monkeypatch, disable_llm_gateway
):
    """Test LLM failure during extraction."""
    from data_service.utils import document_extractor as de

    def fake_extract_content(
        file_content, filename, content_type, add_page_markers_callback
    ):
        return {"success": True, "text": "some text"}

    monkeypatch.setattr(
        de.DocumentExtractor, "extract_content", staticmethod(fake_extract_content)
    )

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {"success": False, "error": "llm down", "attempts": 3}

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_single_file_with_content(
        file_name="f.txt",
        file_content=b"zzz",
        content_type="text/plain",
        questions=[{"id": "AI-Q1", "question": "T?"}],
        doc_executor=None,
    )
    assert result["success"] is False
    assert result["error"] == "llm down"
    assert result["attempts"] == 3


@pytest.mark.asyncio
async def test_extract_single_file_llm_validation_failure(
    service, monkeypatch, disable_llm_gateway
):
    """Test LLM validation failure during extraction."""
    from data_service.utils import document_extractor as de

    def fake_extract_content(
        file_content, filename, content_type, add_page_markers_callback
    ):
        return {"success": True, "text": "text here"}

    monkeypatch.setattr(
        de.DocumentExtractor, "extract_content", staticmethod(fake_extract_content)
    )

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "attempts": 1,
            "parsed_json": {"AI-Q1": ["A"]},
            "validation_passed": False,
            "validation_errors": ["missing field"],
            "can_skip_enrichment": True,
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_single_file_with_content(
        file_name="f.txt",
        file_content=b"zzz",
        content_type="text/plain",
        questions=[{"id": "AI-Q1", "question": "T?"}],
        doc_executor=None,
    )
    assert result["success"] is True
    assert result["validation_passed"] is False
    assert result["validation_errors"] == ["missing field"]
    assert result["can_skip_enrichment"] is True


@pytest.mark.asyncio
async def test_extract_single_file_with_semaphore(
    service, monkeypatch, disable_llm_gateway
):
    """Test extraction with semaphore limiting concurrency."""
    from data_service.utils import document_extractor as de

    def fake_extract_content(
        file_content, filename, content_type, add_page_markers_callback
    ):
        return {"success": True, "text": "semaphore text"}

    monkeypatch.setattr(
        de.DocumentExtractor, "extract_content", staticmethod(fake_extract_content)
    )

    calls = {"llm": 0}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        calls["llm"] += 1
        return {
            "success": True,
            "attempts": 1,
            "parsed_json": {"AI-Q1": ["A"]},
            "validation_passed": True,
            "can_skip_enrichment": False,
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    sem = asyncio.Semaphore(1)
    res = await service.extract_single_file_with_content(
        file_name="f.txt",
        file_content=b"abc",
        content_type="text/plain",
        questions=[{"id": "AI-Q1", "question": "Q?"}],
        semaphore=sem,
        doc_executor=None,
    )
    assert res["success"] is True
    assert calls["llm"] == 1


def test_group_answers_by_form_prefix(service):
    answers = [
        FakeAnswer(
            question_id="AI-Q1",
            answer_text="A1",
            span_ids=[1],
            confidence=0.9,
            provenance=[],
        ),
        FakeAnswer(
            question_id="S-Q2",
            answer_text="A2",
            span_ids=[2],
            confidence=0.8,
            provenance=[],
        ),
        FakeAnswer(
            question_id="X-Q3",
            answer_text="A3",
            span_ids=[3],
            confidence=0.7,
            provenance=[],
        ),  # Unknown prefix
    ]
    grouped = service.group_answers_by_form_prefix(answers)
    assert "AI-Q1" in grouped["ai-registry-form"]
    assert grouped["ai-registry-form"]["AI-Q1"]["answer_text"] == "A1"
    assert "S-Q2" in grouped["security-arch-form"]
    assert grouped["security-arch-form"]["S-Q2"]["answer_text"] == "A2"
    # X-Q3 should not appear in any form because X prefix is unknown
    assert all("X-Q3" not in v for v in grouped.values())
    # Ensure all forms present even if empty
    for form_name in PREFIX_TO_FORM.values():
        assert form_name in grouped


@pytest.mark.asyncio
async def test_get_question_extraction_success(service):
    submission_uuid = uuid.uuid4()
    form_uuid = uuid.uuid4()
    status = FakeProcessingStatus(submission_uuid, ProcessingStatus.COMPLETED)
    extraction = FakeExtraction(submission_uuid, form_uuid, {"AI-Q1": ["A"]})
    submission = FakeSubmission(submission_uuid, uuid.uuid4())
    fake_db = FakeDB(
        processing_status=status, extraction=extraction, submission=submission
    )

    result = await service.get_question_extraction(
        str(submission_uuid), str(form_uuid), "AI-Q1", fake_db
    )
    assert result["question_id"] == "AI-Q1"
    assert result["extracted_content"] == ["A"]


@pytest.mark.asyncio
async def test_get_question_extraction_validation_errors(service):
    submission_uuid = uuid.uuid4()
    submission = FakeSubmission(submission_uuid, uuid.uuid4())
    with pytest.raises(DocumentExtractionServiceError):
        await service.get_question_extraction(
            "", "x", "y", FakeDB(submission=submission)
        )
    with pytest.raises(DocumentExtractionServiceError):
        # invalid UUID now raises DocumentExtractionServiceError (not ValueError)
        await service.get_question_extraction("abc", "x", "y", FakeDB())
    with pytest.raises(DocumentExtractionServiceError):
        submission_uuid = str(uuid.uuid4())
        await service.get_question_extraction(
            submission_uuid, "", "AI-Q1", FakeDB()
        )  # missing form id
    with pytest.raises(DocumentExtractionServiceError):
        submission_uuid = str(uuid.uuid4())
        form_uuid = str(uuid.uuid4())
        await service.get_question_extraction(
            submission_uuid, form_uuid, "", FakeDB()
        )  # missing question id


@pytest.mark.asyncio
async def test_get_question_extraction_processing_states(service):
    submission_uuid = uuid.uuid4()
    form_uuid = uuid.uuid4()
    submission = FakeSubmission(submission_uuid, uuid.uuid4())
    # Unknown status (None)
    with pytest.raises(DocumentExtractionServiceError) as no_status:
        await service.get_question_extraction(
            str(submission_uuid), str(form_uuid), "AI-Q1", FakeDB(submission=submission)
        )
    assert no_status.value.error == "Not Found"

    # Pending
    pending = FakeProcessingStatus(submission_uuid, ProcessingStatus.PENDING)
    with pytest.raises(DocumentExtractionServiceError) as pend:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(processing_status=pending, submission=submission),
        )
    assert pend.value.error == "Processing Pending"

    # Processing
    processing = FakeProcessingStatus(submission_uuid, ProcessingStatus.PROCESSING)
    with pytest.raises(DocumentExtractionServiceError) as proc:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(processing_status=processing, submission=submission),
        )
    assert proc.value.error == "Processing In Progress"

    # Failed
    failed = FakeProcessingStatus(submission_uuid, ProcessingStatus.FAILED)
    with pytest.raises(DocumentExtractionServiceError) as fail:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(processing_status=failed, submission=submission),
        )
    assert fail.value.error == "Processing Failed"

    # Incomplete (unexpected status value)
    weird = FakeProcessingStatus(submission_uuid, "SOMETHING_ELSE")
    with pytest.raises(DocumentExtractionServiceError) as inc:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(processing_status=weird, submission=submission),
        )
    assert inc.value.error == "Processing Incomplete"


@pytest.mark.asyncio
async def test_get_question_extraction_not_found_cases(service):
    submission_uuid = uuid.uuid4()
    form_uuid = uuid.uuid4()
    submission = FakeSubmission(submission_uuid, uuid.uuid4())
    completed = FakeProcessingStatus(submission_uuid, ProcessingStatus.COMPLETED)

    # Extraction not found
    with pytest.raises(DocumentExtractionServiceError) as no_extract:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(processing_status=completed, submission=submission),
        )
    assert no_extract.value.error == "Not Found"

    # Question not in extraction
    extraction = FakeExtraction(submission_uuid, form_uuid, {"AI-Q2": ["X"]})
    with pytest.raises(DocumentExtractionServiceError) as no_question:
        await service.get_question_extraction(
            str(submission_uuid),
            str(form_uuid),
            "AI-Q1",
            FakeDB(
                processing_status=completed,
                extraction=extraction,
                submission=submission,
            ),
        )
    assert no_question.value.error == "Not Found"


# ===== Tests for extract_answer_from_blocks method (lines 620-743) =====


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_success(
    service, sample_blocks, block_lookup, monkeypatch, disable_llm_gateway
):
    """Test successful extraction with valid span_ids and provenance"""
    question = {"id": "Q1", "question": "What is important?"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q1",
                "answer": "Important information from the document",
                "span_ids": [1, 2],
                "confidence": 0.95,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks,
        question=question,
        max_retries=3,
        semaphore=None,
        block_lookup=block_lookup,
    )

    assert isinstance(result, Answer)
    assert result.question_id == "Q1"
    assert result.answer_text == "Important information from the document"
    assert result.span_ids == [1, 2]
    assert result.confidence == 0.95
    assert result.provenance is not None
    assert len(result.provenance) == 2
    assert result.provenance[0]["span_id"] == 1
    assert result.provenance[0]["file_name"] == "doc1.pdf"


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_with_semaphore(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test extraction with semaphore (lines 635-642)"""
    question = {"id": "Q2", "question": "Test semaphore"}
    semaphore = asyncio.Semaphore(1)

    calls = []

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        calls.append("llm_called")
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q2",
                "answer": "Answer with semaphore",
                "span_ids": [1],
                "confidence": 0.8,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question, semaphore=semaphore
    )

    assert result.answer_text == "Answer with semaphore"
    assert len(calls) == 1


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_llm_failure(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test LLM failure returns empty Answer (lines 644-659)"""
    question = {"id": "Q3", "question": "This will fail"}

    async def fake_llm_failure(model_name, prompt, max_retries, use_json_parser):
        return {"success": False, "error": "LLM service unavailable"}

    monkeypatch.setattr(
        service.cortex, "ask_model_with_retry_doc_extract", fake_llm_failure
    )

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question
    )

    assert isinstance(result, Answer)
    assert result.question_id == "Q3"
    assert result.answer_text == ""
    assert result.span_ids == []
    assert result.confidence == 0.0
    assert result.provenance is None


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_invalid_span_ids(
    service, sample_blocks, block_lookup, monkeypatch, disable_llm_gateway
):
    """Test filtering invalid span_ids (lines 675-686)"""
    question = {"id": "Q4", "question": "Test invalid spans"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q4",
                "answer": "Answer with some invalid spans",
                "span_ids": [1, 2, 99, 100],  # 99 and 100 don't exist
                "confidence": 0.7,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question, block_lookup=block_lookup
    )

    # Should filter out invalid span_ids 99 and 100
    assert result.span_ids == [1, 2]
    assert len(result.provenance) == 2


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_empty_answer(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test empty answer text returns empty Answer (lines 726-735)"""
    question = {"id": "Q5", "question": "No answer found"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q5",
                "answer": "",  # Empty answer
                "span_ids": [1],
                "confidence": 0.5,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question
    )

    assert result.answer_text == ""
    assert result.span_ids == []
    assert result.confidence == 0.0
    assert result.provenance is None


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_with_provenance(
    service, sample_blocks, block_lookup, monkeypatch, disable_llm_gateway
):
    """Test provenance building (lines 704-720)"""
    question = {"id": "Q6", "question": "Test provenance"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q6",
                "answer": "Answer with detailed provenance",
                "span_ids": [2, 3],
                "confidence": 0.9,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question, block_lookup=block_lookup
    )

    assert len(result.provenance) == 2

    # Check first provenance entry
    prov1 = result.provenance[0]
    assert prov1["span_id"] == 2
    assert prov1["file_name"] == "doc1.pdf"
    assert prov1["page_or_slide"] == 1
    assert prov1["block_index"] == 1
    assert "important information" in prov1["text"]
    assert prov1["char_start"] == 34
    assert prov1["char_end"] == 86
    assert prov1["block_type"] == "paragraph"

    # Check second provenance entry
    prov2 = result.provenance[1]
    assert prov2["span_id"] == 3
    assert prov2["page_or_slide"] == 2


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_no_block_lookup(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test without block_lookup - should still work but no provenance (lines 704-720)"""
    question = {"id": "Q7", "question": "Test without lookup"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q7",
                "answer": "Answer without provenance lookup",
                "span_ids": [1, 2],
                "confidence": 0.85,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question, block_lookup=None  # No block lookup
    )

    assert result.answer_text == "Answer without provenance lookup"
    assert result.span_ids == [1, 2]
    # Provenance should be None when block_lookup is not provided
    assert result.provenance is None


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_exception_handling(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test exception handling (lines 737-743)"""
    question = {"id": "Q8", "question": "This will raise exception"}

    async def fake_llm_exception(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "bad_key": "value"  # Missing required keys, will raise KeyError
            },
        }

    monkeypatch.setattr(
        service.cortex, "ask_model_with_retry_doc_extract", fake_llm_exception
    )

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question
    )

    # Should return empty Answer on exception
    assert isinstance(result, Answer)
    assert result.question_id == "Q8"
    assert result.answer_text == ""
    assert result.span_ids == []
    assert result.confidence == 0.0
    assert result.provenance is None


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_missing_confidence(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test default confidence value when not provided"""
    question = {"id": "Q9", "question": "Missing confidence"}

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q9",
                "answer": "Answer without confidence",
                "span_ids": [1],
                # No confidence field
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    result = await service.extract_answer_from_blocks(
        blocks=sample_blocks, question=question
    )

    assert result.confidence == 0.0  # Default value


@pytest.mark.asyncio
async def test_extract_answer_from_blocks_prompt_formatting(
    service, sample_blocks, monkeypatch, disable_llm_gateway
):
    """Test prompt formatting with blocks (lines 620-630)"""
    question = {"id": "Q10", "question": "Test prompt format"}

    captured_prompt = []

    async def fake_llm(model_name, prompt, max_retries, use_json_parser):
        captured_prompt.append(prompt)
        return {
            "success": True,
            "parsed_json": {
                "question_id": "Q10",
                "answer": "Test",
                "span_ids": [],
                "confidence": 0.5,
            },
        }

    monkeypatch.setattr(service.cortex, "ask_model_with_retry_doc_extract", fake_llm)

    await service.extract_answer_from_blocks(blocks=sample_blocks, question=question)

    # Verify prompt contains formatted blocks
    assert len(captured_prompt) == 1
    prompt = captured_prompt[0]
    assert "[SPAN_1]" in prompt
    assert "[SPAN_2]" in prompt
    assert "[SPAN_3]" in prompt
    assert "Q10:" in prompt
    assert question["question"] in prompt
