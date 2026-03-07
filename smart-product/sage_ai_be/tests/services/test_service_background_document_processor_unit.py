import asyncio
from uuid import uuid4

import pytest

from data_service.service.background_document_processor import (
    process_documents_in_background,
    InMemoryUploadFile,
)


class FakeSessionCM:
    def __init__(self, recorder):
        self.recorder = recorder

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


class Recorder:
    def __init__(self):
        self.status_updates = []
        self.store_calls = []
        self.sse_updates = []


@pytest.fixture
def recorder():
    return Recorder()


@pytest.mark.anyio
async def test_process_documents_success(monkeypatch, recorder):
    # Fake AsyncSessionLocal returning a session context manager
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(
        db, submission_id, status, message
    ):  # noqa: D401
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(
        db, submission_id, form_schemas, submission_forms, form_jsons
    ):  # noqa: D401
        recorder.store_calls.append((len(form_jsons)))
        return len(form_jsons), 0

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(
            self, files, file_metadata, db, max_retries=3, submission_id=None
        ):  # noqa: D401
            assert all(isinstance(f, InMemoryUploadFile) for f in files)
            return {
                "success": True,
                "stats": {
                    "successful_files": len(files),
                    "total_files": len(files),
                    "failed_files": 0,
                },
                "form_jsons": [{"schema_id": "SCHEMA1", "data": {"a": 1}}],
                "validation_passed": True,
                "validation_errors": [],
            }

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [
        {"filename": "doc.txt", "content": b"hello", "content_type": "text/plain"}
    ]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Assertions
    assert recorder.status_updates[0][1] == "PROCESSING"
    assert recorder.status_updates[-1][1] == "COMPLETED"
    assert recorder.store_calls == [1]
    # Check SSE updates
    assert len(recorder.sse_updates) >= 3  # STARTED, STORING_RESULTS, SUCCESS


@pytest.mark.anyio
async def test_process_documents_failure(monkeypatch, recorder):
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(
        db, submission_id, status, message
    ):  # noqa: D401
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(
        db, submission_id, form_schemas, submission_forms, form_jsons
    ):  # noqa: D401
        recorder.store_calls.append((len(form_jsons)))
        return 0, 1

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):  # noqa: D401
            return {
                "success": False,
                "error": "Extraction failed",
                "stats": {"successful_files": 0, "total_files": 1, "failed_files": 1},
                "form_jsons": [],
            }

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [{"filename": "doc.txt", "content": b"hello"}]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    assert recorder.status_updates[0][1] == "PROCESSING"
    assert recorder.status_updates[-1][1] == "FAILED"
    # store_form_extractions not called after failure
    assert recorder.store_calls == []


@pytest.mark.anyio
async def test_process_documents_exception(monkeypatch, recorder):
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(
        db, submission_id, status, message
    ):  # noqa: D401
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(*args, **kwargs):  # noqa: D401
        raise RuntimeError("Should not be called on failure")

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):  # noqa: D401
            raise RuntimeError("Crash inside extraction")

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    # Provide at least one file to reach the extraction phase
    files_data = [{"filename": "doc.txt", "content": b"content"}]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    assert recorder.status_updates[0][1] == "PROCESSING"
    assert recorder.status_updates[-1][1] == "FAILED"


@pytest.mark.anyio
async def test_process_documents_invalid_submission_id_none(monkeypatch, recorder):
    """Test handling of None submission_id"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    # Should exit early, no status updates
    await process_documents_in_background(None, [], {}, [], [])
    assert recorder.status_updates == []


@pytest.mark.anyio
async def test_process_documents_invalid_submission_id_format(monkeypatch, recorder):
    """Test handling of submission_id with invalid format"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    class BadUUID:
        def __str__(self):
            raise ValueError("Cannot convert to string")

    # Should exit early, no status updates
    await process_documents_in_background(BadUUID(), [], {}, [], [])
    assert recorder.status_updates == []


@pytest.mark.anyio
async def test_process_documents_no_files(monkeypatch, recorder):
    """Test handling when no files are provided"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    await process_documents_in_background(submission_id, None, {}, [], [])

    # Should update status to FAILED
    assert any(status == "FAILED" for _, status, _ in recorder.status_updates)
    # Should also update SSE
    assert len(recorder.sse_updates) > 0


@pytest.mark.anyio
async def test_process_documents_with_validation_warnings(monkeypatch, recorder):
    """Test successful extraction with validation warnings"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(
        db, submission_id, form_schemas, submission_forms, form_jsons
    ):
        recorder.store_calls.append(len(form_jsons))
        return len(form_jsons), 0

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message, metadata))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):
            return {
                "success": True,
                "stats": {
                    "successful_files": 2,
                    "total_files": 2,
                    "failed_files": 0,
                },
                "form_jsons": [
                    {"schema_id": "SCHEMA1", "data": {"a": 1}},
                    {"schema_id": "SCHEMA2", "data": {"b": 2}},
                ],
                "validation_passed": False,
                "validation_errors": [
                    "Field 'x' is missing",
                    "Field 'y' is invalid",
                ],
            }

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [
        {"filename": "doc1.txt", "content": b"content1"},
        {"filename": "doc2.txt", "content": b"content2"},
    ]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should complete successfully
    assert recorder.status_updates[-1][1] == "COMPLETED"
    # Should store forms
    assert recorder.store_calls == [2]
    # Should send WARNING status via SSE
    warning_updates = [u for u in recorder.sse_updates if u[1] == "warning"]
    assert len(warning_updates) > 0


@pytest.mark.anyio
async def test_process_documents_file_cleanup_on_error(monkeypatch, recorder):
    """Test that in-memory files are cleaned up even when errors occur"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    cleanup_called = []

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, files, *args, **kwargs):
            # Track that files were created
            for f in files:
                assert isinstance(f, InMemoryUploadFile)
            # Raise error during processing
            raise RuntimeError("Extraction error")

    # Create a custom BytesIO class that tracks close calls
    from io import BytesIO

    class TrackingBytesIO(BytesIO):
        def close(self):
            cleanup_called.append(True)
            super().close()

    # Monkey patch InMemoryUploadFile to use TrackingBytesIO
    original_init = InMemoryUploadFile.__init__

    def tracked_init(self, filename, content, content_type="application/octet-stream"):
        self.filename = filename
        self.content_type = content_type
        self.file = TrackingBytesIO(content)
        self.size = len(content)

    monkeypatch.setattr(InMemoryUploadFile, "__init__", tracked_init)
    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [
        {"filename": "doc.txt", "content": b"content"},
    ]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should have attempted cleanup despite error
    assert len(cleanup_called) > 0
    # Should mark as failed
    assert recorder.status_updates[-1][1] == "FAILED"


@pytest.mark.anyio
async def test_process_documents_value_error_handling(monkeypatch, recorder):
    """Test handling of ValueError during processing"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message, metadata))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):
            raise ValueError("Invalid data format")

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [{"filename": "doc.txt", "content": b"content"}]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should handle ValueError gracefully
    assert recorder.status_updates[-1][1] == "FAILED"
    # Should include error_type in SSE metadata
    error_updates = [u for u in recorder.sse_updates if len(u) > 3 and u[3]]
    assert any("error_type" in u[3] for u in error_updates if isinstance(u[3], dict))


@pytest.mark.anyio
async def test_process_documents_type_error_handling(monkeypatch, recorder):
    """Test handling of TypeError during processing"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):
            raise TypeError("Type mismatch error")

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [{"filename": "doc.txt", "content": b"content"}]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should handle TypeError gracefully
    assert recorder.status_updates[-1][1] == "FAILED"


@pytest.mark.anyio
async def test_process_documents_key_error_handling(monkeypatch, recorder):
    """Test handling of KeyError during processing"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):
            raise KeyError("Missing required key")

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [{"filename": "doc.txt", "content": b"content"}]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should handle KeyError gracefully
    assert recorder.status_updates[-1][1] == "FAILED"


@pytest.mark.anyio
async def test_inmemory_uploadfile():
    """Test InMemoryUploadFile functionality"""
    content = b"test content"
    filename = "test.txt"
    content_type = "text/plain"

    file = InMemoryUploadFile(filename, content, content_type)

    # Test attributes
    assert file.filename == filename
    assert file.content_type == content_type
    assert file.size == len(content)

    # Test read
    data = await file.read()
    assert data == content

    # Test seek and read again
    await file.seek(0)
    data = await file.read(4)
    assert data == b"test"

    # Test repr
    repr_str = repr(file)
    assert filename in repr_str
    assert str(len(content)) in repr_str


@pytest.mark.anyio
async def test_process_documents_multiple_files_success(monkeypatch, recorder):
    """Test processing multiple files successfully"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(
        db, submission_id, form_schemas, submission_forms, form_jsons
    ):
        recorder.store_calls.append(len(form_jsons))
        return len(form_jsons), 0

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message, metadata))

    class FakeParallel:
        async def extract_documents_parallel(self, files, *args, **kwargs):
            return {
                "success": True,
                "stats": {
                    "successful_files": len(files),
                    "total_files": len(files),
                    "failed_files": 0,
                },
                "form_jsons": [
                    {"schema_id": f"SCHEMA{i}", "data": {"field": i}}
                    for i in range(len(files))
                ],
                "validation_passed": True,
                "validation_errors": [],
            }

    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [
        {"filename": f"doc{i}.txt", "content": f"content{i}".encode()} for i in range(5)
    ]
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should complete successfully
    assert recorder.status_updates[-1][1] == "COMPLETED"
    # Should store all forms
    assert recorder.store_calls == [5]
    # Check SSE started message includes file count
    started_updates = [u for u in recorder.sse_updates if u[1] == "started"]
    assert len(started_updates) > 0


@pytest.mark.anyio
async def test_process_documents_cleanup_failure(monkeypatch, recorder):
    """Test handling when file cleanup itself fails"""
    monkeypatch.setattr(
        "data_service.service.background_document_processor.AsyncSessionLocal",
        lambda: FakeSessionCM(recorder),
    )

    async def fake_update_processing_status(db, submission_id, status, message):
        recorder.status_updates.append((str(submission_id), status.name, message))

    async def fake_store_form_extractions(
        db, submission_id, form_schemas, submission_forms, form_jsons
    ):
        return len(form_jsons), 0

    class FakeSSETracker:
        async def update_progress(self, submission_id, status, message, metadata=None):
            recorder.sse_updates.append((submission_id, status, message))

    class FakeParallel:
        async def extract_documents_parallel(self, *args, **kwargs):
            return {
                "success": True,
                "stats": {
                    "successful_files": 1,
                    "total_files": 1,
                    "failed_files": 0,
                },
                "form_jsons": [{"schema_id": "SCHEMA1", "data": {"a": 1}}],
                "validation_passed": True,
                "validation_errors": [],
            }

    # Create a custom InMemoryUploadFile that fails on close
    class FailingBytesIO:
        def __init__(self, content):
            self.content = content

        def read(self, size=-1):
            return self.content

        def close(self):
            raise IOError("Cleanup failed")

    original_init = InMemoryUploadFile.__init__

    def failing_init(self, filename, content, content_type="application/octet-stream"):
        self.filename = filename
        self.content_type = content_type
        self.file = FailingBytesIO(content)
        self.size = len(content)

    monkeypatch.setattr(InMemoryUploadFile, "__init__", failing_init)
    monkeypatch.setattr(
        "data_service.service.background_document_processor.update_processing_status",
        fake_update_processing_status,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.store_form_extractions",
        fake_store_form_extractions,
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.parallel_extraction_service",
        FakeParallel(),
    )
    monkeypatch.setattr(
        "data_service.service.background_document_processor.sse_progress_tracker",
        FakeSSETracker(),
    )

    submission_id = uuid4()
    files_data = [{"filename": "doc.txt", "content": b"content"}]

    # Should not crash even if cleanup fails
    await process_documents_in_background(submission_id, files_data, {}, [], [])

    # Should still complete successfully
    assert recorder.status_updates[-1][1] == "COMPLETED"
