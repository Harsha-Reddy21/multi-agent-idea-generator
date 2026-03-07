import asyncio
import uuid
import pytest
from types import SimpleNamespace
from unittest.mock import Mock, patch, AsyncMock

from data_service.service.parallel_extraction_service import ParallelExtractionService
from data_service.service.doc_extract_service import DocumentExtractionService


class DummyUploadFile:
    def __init__(self, filename, content: bytes, content_type="text/plain"):
        self.filename = filename
        self._content = content
        self.content_type = content_type

    async def read(self):
        return self._content

    async def seek(self, pos):
        # no-op for test
        return None


class FakeDB:
    async def execute(self, stmt):
        # Only used for fetching questions; return empty to test branch where no questions
        if "questions" in str(stmt).lower():

            class Result:
                def scalars(self_inner):
                    return self_inner

                def all(self_inner):
                    return []

            return Result()
        return SimpleNamespace(scalar_one_or_none=lambda: None)


@pytest.mark.asyncio
async def test_parallel_extraction_no_questions(monkeypatch):
    service = ParallelExtractionService(max_concurrent=2)

    files = [DummyUploadFile("a.txt", b"1"), DummyUploadFile("b.txt", b"2")]

    # Patch underlying doc service to return no questions (simulate DB result)
    async def fake_fetch_text_questions(db):
        return []

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    from data_service.exceptions.service_errors import ParallelExtractionServiceError

    with pytest.raises(ParallelExtractionServiceError) as exc_info:
        await service.extract_documents_parallel(files, {}, FakeDB())

    assert "No text extraction questions found" in str(exc_info.value)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
@patch("data_service.service.parallel_extraction_service.HybridRetriever")
@patch("data_service.service.parallel_extraction_service.get_embedding_model")
async def test_parallel_extraction_partial_success_with_fallback(
    mock_get_embedding, mock_hybrid_retriever_class, monkeypatch
):
    service = ParallelExtractionService(max_concurrent=2)

    from data_service.models.document_extract import Block, Answer
    from unittest.mock import AsyncMock, Mock

    # Mock the embedding model
    mock_get_embedding.return_value = Mock()

    # Mock HybridRetriever to return a mock instance with retrieve method
    mock_retriever = Mock()
    mock_retriever.retrieve.return_value = []
    mock_hybrid_retriever_class.return_value = mock_retriever

    files = [
        DummyUploadFile("a.pdf", b"pdf content"),
        DummyUploadFile("b.pdf", b"pdf content 2"),
    ]

    async def fake_fetch_text_questions(db):
        return [{"id": "AI-Q1", "question": "Title?"}]

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    # Mock block extraction to return blocks
    async def fake_extract_pdf_blocks(**kwargs):
        file_name = kwargs.get("file_name")
        return [
            Block(
                span_id=1,
                file_id="file_0",
                file_name=file_name,
                text=f"Sample text from {file_name}",
                page_or_slide=1,
                block_index=0,
                char_start=0,
                char_end=100,
                block_type="text",
            )
        ]

    monkeypatch.setattr(
        service.document_extractor,
        "extract_pdf_blocks",
        fake_extract_pdf_blocks,
    )

    # Mock extract_answer_from_blocks
    async def fake_extract_answer_from_blocks(**kwargs):
        question = kwargs.get("question")
        return Answer(
            question_id=question["id"],
            answer_text="Sample answer",
            confidence=0.9,
            span_ids=[1],
        )

    monkeypatch.setattr(
        service.doc_service,
        "extract_answer_from_blocks",
        fake_extract_answer_from_blocks,
    )

    # Mock group_answers_by_form_prefix
    def fake_group_answers(answers):
        return {"AI": [{"question_id": "AI-Q1", "answer": "Sample answer"}]}

    monkeypatch.setattr(
        service.doc_service,
        "group_answers_by_form_prefix",
        fake_group_answers,
    )

    result = await service.extract_documents_parallel(
        files,
        {
            "a.pdf": {"presigned_url": "urlA", "upload_status": "complete"},
            "b.pdf": {"presigned_url": "urlB", "upload_status": "complete"},
        },
        FakeDB(),
    )

    assert result["success"] is True
    assert result["stats"]["total_files"] == 2
    assert result["stats"]["total_blocks_extracted"] > 0
    assert len(result["question_answers"]) > 0
    assert result["metadata_enriched"] is True


@pytest.mark.asyncio
@patch("data_service.service.parallel_extraction_service.HybridRetriever")
@patch("data_service.service.parallel_extraction_service.get_embedding_model")
async def test_parallel_extraction_merge_and_enrich_validation_mixed(
    mock_get_embedding, mock_hybrid_retriever_class, monkeypatch
):
    service = ParallelExtractionService(max_concurrent=2)

    from data_service.models.document_extract import Block, Answer
    from unittest.mock import Mock

    # Mock the embedding model
    mock_get_embedding.return_value = Mock()

    # Mock HybridRetriever to return a mock instance with retrieve method
    mock_retriever = Mock()
    mock_retriever.retrieve.return_value = []
    mock_hybrid_retriever_class.return_value = mock_retriever

    files = [
        DummyUploadFile("a.pdf", b"content1"),
        DummyUploadFile("b.pdf", b"content2"),
    ]

    async def fake_fetch_text_questions(db):
        return [{"id": "AI-Q1", "question": "Title?"}]

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    # Mock block extraction
    async def fake_extract_pdf_blocks(**kwargs):
        file_name = kwargs.get("file_name")
        return [
            Block(
                span_id=1,
                file_id="file_0",
                file_name=file_name,
                text=f"Text from {file_name}",
                page_or_slide=1,
                block_index=0,
                char_start=0,
                char_end=100,
                block_type="text",
            )
        ]

    monkeypatch.setattr(
        service.document_extractor,
        "extract_pdf_blocks",
        fake_extract_pdf_blocks,
    )

    # Mock extract_answer_from_blocks
    async def fake_extract_answer_from_blocks(**kwargs):
        question = kwargs.get("question")
        return Answer(
            question_id=question["id"],
            answer_text="Answer text",
            confidence=0.85,
            span_ids=[1],
        )

    monkeypatch.setattr(
        service.doc_service,
        "extract_answer_from_blocks",
        fake_extract_answer_from_blocks,
    )

    # Mock group_answers_by_form_prefix
    def fake_group_answers(answers):
        return {"AI": [{"question_id": "AI-Q1", "answer": "Answer text"}]}

    monkeypatch.setattr(
        service.doc_service,
        "group_answers_by_form_prefix",
        fake_group_answers,
    )

    file_metadata = {
        "a.pdf": {"presigned_url": "urlA", "upload_status": "complete"},
        "b.pdf": {"presigned_url": "urlB", "upload_status": "complete"},
    }

    result = await service.extract_documents_parallel(files, file_metadata, FakeDB())

    assert result["success"] is True
    assert len(result["question_answers"]) > 0
    assert result["metadata_enriched"] is True
    assert result["validation_passed"] is True


@pytest.mark.asyncio
async def test_parallel_extraction_exception(monkeypatch):
    service = ParallelExtractionService(max_concurrent=1)

    files = [DummyUploadFile("a.txt", b"1")]

    async def fake_fetch_text_questions(db):
        raise RuntimeError("DB down")

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    from data_service.exceptions.service_errors import ParallelExtractionServiceError

    with pytest.raises(ParallelExtractionServiceError) as exc_info:
        await service.extract_documents_parallel(files, {}, FakeDB())

    assert "DB down" in str(exc_info.value)
    assert exc_info.value.status_code == 500


@pytest.mark.asyncio
@patch("data_service.service.parallel_extraction_service.HybridRetriever")
@patch("data_service.service.parallel_extraction_service.get_embedding_model")
@patch("data_service.service.parallel_extraction_service.sse_progress_tracker")
async def test_parallel_extraction_with_sse_progress(
    mock_sse, mock_get_embedding, mock_hybrid_retriever_class, monkeypatch
):
    """Test parallel extraction with SSE progress tracking (covers lines 144-153, 174-186)"""
    service = ParallelExtractionService(max_concurrent=2)

    from data_service.models.document_extract import Block, Answer
    from unittest.mock import AsyncMock

    # Mock ALL sse_progress_tracker methods as AsyncMock
    mock_sse.update_progress = AsyncMock()
    mock_sse.update_question_progress = AsyncMock()
    mock_sse.update_file_progress = AsyncMock()
    mock_sse.send_message = AsyncMock()

    # Mock the embedding model
    mock_get_embedding.return_value = Mock()

    # Mock HybridRetriever
    mock_retriever = Mock()
    mock_retriever.retrieve.return_value = []
    mock_hybrid_retriever_class.return_value = mock_retriever

    files = [DummyUploadFile("a.pdf", b"content")]

    async def fake_fetch_text_questions(db):
        return [{"id": "AI-Q1", "question": "Test question?"}]

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    async def fake_extract_pdf_blocks(**kwargs):
        return [
            Block(
                span_id=1,
                file_id="file_0",
                file_name="a.pdf",
                text="Sample text",
                page_or_slide=1,
                block_index=0,
                char_start=0,
                char_end=100,
                block_type="text",
            )
        ]

    monkeypatch.setattr(
        service.document_extractor,
        "extract_pdf_blocks",
        fake_extract_pdf_blocks,
    )

    async def fake_extract_answer_from_blocks(**kwargs):
        question = kwargs.get("question")
        return Answer(
            question_id=question["id"],
            answer_text="Answer",
            confidence=0.9,
            span_ids=[1],
        )

    monkeypatch.setattr(
        service.doc_service,
        "extract_answer_from_blocks",
        fake_extract_answer_from_blocks,
    )

    def fake_group_answers(answers):
        return {"AI": [{"question_id": "AI-Q1", "answer": "Answer"}]}

    monkeypatch.setattr(
        service.doc_service,
        "group_answers_by_form_prefix",
        fake_group_answers,
    )

    # Call with submission_id to trigger SSE updates
    submission_id = "test-submission-123"
    result = await service.extract_documents_parallel(
        files,
        {"a.pdf": {"presigned_url": "url", "upload_status": "complete"}},
        FakeDB(),
        submission_id=submission_id,
    )

    assert result["success"] is True
    # Verify SSE progress was called
    assert mock_sse.update_progress.called
    assert mock_sse.update_question_progress.called


@pytest.mark.asyncio
async def test_unexpected_exception_handling(monkeypatch):
    """Test unexpected exception handling (covers lines 232-235)"""
    service = ParallelExtractionService(max_concurrent=1)

    files = [DummyUploadFile("a.txt", b"1")]

    async def fake_fetch_text_questions(db):
        raise ValueError("Unexpected validation error")

    monkeypatch.setattr(
        service.doc_service, "fetch_text_questions_from_db", fake_fetch_text_questions
    )

    from data_service.exceptions.service_errors import ParallelExtractionServiceError

    with pytest.raises(ParallelExtractionServiceError) as exc_info:
        await service.extract_documents_parallel(files, {}, FakeDB())

    assert exc_info.value.status_code == 500


@pytest.mark.asyncio
async def test_merge_extraction_results():
    """Test _merge_extraction_results method (covers lines 478-489)"""
    service = ParallelExtractionService(max_concurrent=2)

    results = [
        {
            "question_answers": {
                "Q1": [{"answer": "Answer1 from file1", "file": "file1.pdf"}],
                "Q2": [{"answer": "Answer2 from file1", "file": "file1.pdf"}],
            }
        },
        {
            "question_answers": {
                "Q1": [{"answer": "Answer1 from file2", "file": "file2.pdf"}],
                "Q3": [{"answer": "Answer3 from file2", "file": "file2.pdf"}],
            }
        },
    ]

    merged = service._merge_extraction_results(results)

    assert "Q1" in merged
    assert "Q2" in merged
    assert "Q3" in merged
    assert len(merged["Q1"]) == 2  # Combined from both files
    assert len(merged["Q2"]) == 1
    assert len(merged["Q3"]) == 1


@pytest.mark.asyncio
async def test_enrich_with_mixed_validation():
    """Test _enrich_with_mixed_validation method (covers lines 506-540)"""
    service = ParallelExtractionService(max_concurrent=2)

    merged_answers = {
        "Q1": [
            {
                "answer": "Answer from validated file",
                "file": "validated.pdf",
                "page": 1,
            },
            {"answer": "Answer from failed file", "file": "failed.pdf", "page": 2},
        ]
    }

    file_metadata = {
        "validated.pdf": {
            "presigned_url": "https://s3.example.com/validated.pdf",
            "upload_status": "complete",
        },
        "failed.pdf": {
            "presigned_url": "https://s3.example.com/failed.pdf",
            "upload_status": "pending",
        },
    }

    validation_states = {"validated.pdf": True, "failed.pdf": False}

    enriched, metadata_enriched = service._enrich_with_mixed_validation(
        merged_answers, file_metadata, validation_states
    )

    assert "Q1" in enriched
    assert len(enriched["Q1"]) == 2

    # Check validated file has metadata
    validated_answer = enriched["Q1"][0]
    assert validated_answer["presigned_url"] == "https://s3.example.com/validated.pdf"
    assert validated_answer["upload_status"] == "complete"

    # Check failed file has no metadata
    failed_answer = enriched["Q1"][1]
    assert failed_answer["presigned_url"] is None
    assert failed_answer["upload_status"] == "validation_failed"

    # Check enriched flag
    assert metadata_enriched is True


@pytest.mark.asyncio
async def test_enrich_with_all_failed_validation():
    """Test _enrich_with_mixed_validation when all files failed (covers edge case)"""
    service = ParallelExtractionService(max_concurrent=2)

    merged_answers = {
        "Q1": [{"answer": "Answer from failed file", "file": "failed.pdf", "page": 1}]
    }

    file_metadata = {
        "failed.pdf": {
            "presigned_url": "https://s3.example.com/failed.pdf",
            "upload_status": "failed",
        }
    }

    validation_states = {"failed.pdf": False}

    enriched, metadata_enriched = service._enrich_with_mixed_validation(
        merged_answers, file_metadata, validation_states
    )

    assert "Q1" in enriched
    failed_answer = enriched["Q1"][0]
    assert failed_answer["presigned_url"] is None
    assert failed_answer["upload_status"] == "validation_failed"

    # No files were enriched
    assert metadata_enriched is False
