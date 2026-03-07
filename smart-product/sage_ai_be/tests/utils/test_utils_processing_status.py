import asyncio
from uuid import uuid4
import pytest

from data_service.utils.processing_status_utils import (
    update_processing_status,
    store_form_extractions,
)
from data_service.constants.constants import ProcessingStatus


# Fakes
class FakeTracking:
    def __init__(self, submission_id, status, message):
        self.submission_id = submission_id
        self.status = status
        self.message = message


class FakeDB:
    def __init__(self, tracking=None):
        self._tracking = tracking
        self.add_calls = []
        self.commits = 0
        self.rollbacks = 0
        self.added_extractions = []

    async def get(self, model, pk):  # noqa: D401
        return self._tracking

    def add(self, obj):
        self.add_calls.append(obj)
        # capture FormExtractions without importing model (duck typing)
        if hasattr(obj, "extracted_data"):
            self.added_extractions.append(obj)

    async def commit(self):
        self.commits += 1

    async def rollback(self):
        self.rollbacks += 1


# Simple namespace helpers for schemas/forms
class Schema:
    def __init__(self, id_, name):
        self.id = id_
        self.name = name


class SubmissionForm:
    def __init__(self, form_schema_id, id_):
        self.form_schema_id = form_schema_id
        self.id = id_


class ExtractionRecord:
    def __init__(self, submission_id, form_id, extracted_data):
        self.submission_id = submission_id
        self.form_id = form_id
        self.extracted_data = extracted_data


# Monkeypatch FormExtractions to use simple stub
@pytest.fixture(autouse=True)
def patch_form_extractions(monkeypatch):
    monkeypatch.setattr(
        "data_service.utils.processing_status_utils.FormExtractions", ExtractionRecord
    )


def run(coro):
    # Use asyncio.run for consistent loop creation
    return asyncio.run(coro)


# Tests for update_processing_status


def test_update_processing_status_updates_existing():
    sid = uuid4()
    tracking = FakeTracking(sid, ProcessingStatus.PENDING, "pending")
    db = FakeDB(tracking=tracking)
    run(update_processing_status(db, sid, ProcessingStatus.PROCESSING, "working"))
    assert tracking.status == ProcessingStatus.PROCESSING
    assert tracking.message == "working"
    assert db.commits == 1


def test_update_processing_status_creates_new():
    sid = uuid4()
    db = FakeDB(tracking=None)
    run(update_processing_status(db, sid, ProcessingStatus.PENDING, "start"))
    assert len(db.add_calls) == 1  # new tracking added
    assert db.commits == 1


def test_update_processing_status_error_rollbacks(monkeypatch):
    sid = uuid4()
    db = FakeDB(tracking=None)

    # force error after add before commit
    async def bad_get(model, pk):
        raise RuntimeError("db boom")

    monkeypatch.setattr(db, "get", bad_get)
    with pytest.raises(RuntimeError):
        run(update_processing_status(db, sid, ProcessingStatus.PENDING, "start"))
    assert db.rollbacks == 1


# Tests for store_form_extractions


def test_store_form_extractions_happy_path():
    sid = uuid4()
    schemas = [Schema("1", "formA"), Schema("2", "formB")]
    forms = [SubmissionForm("1", "f1"), SubmissionForm("2", "f2")]
    data = {"formA": {"q": "a"}, "formB": {"x": "b"}}
    db = FakeDB()
    stored, failed = run(store_form_extractions(db, sid, schemas, forms, data))
    assert stored == 2
    assert failed == 0
    assert len(db.added_extractions) == 2
    assert db.commits == 1


def test_store_form_extractions_missing_submission_form():
    sid = uuid4()
    schemas = [
        Schema("1", "formA"),
        Schema("99", "formMissing"),
    ]  # second schema has no submission form
    forms = [SubmissionForm("1", "f1")]  # only one form
    data = {"formA": {"q": "a"}, "formMissing": {"z": "m"}}
    db = FakeDB()
    stored, failed = run(store_form_extractions(db, sid, schemas, forms, data))
    assert stored == 1
    assert failed == 1
    assert db.commits == 1


def test_store_form_extractions_no_data_raises():
    sid = uuid4()
    schemas = [Schema("1", "formA")]  # one schema
    forms = []  # no submission forms => stored_count stays 0 triggers raise
    data = {}
    db = FakeDB()
    with pytest.raises(Exception) as exc:
        run(store_form_extractions(db, sid, schemas, forms, data))
    assert "Failed to store any extractions" in str(exc.value)
    assert db.rollbacks == 1


def test_store_form_extractions_internal_loop_error(monkeypatch):
    sid = uuid4()
    schemas = [Schema("1", "formA")]
    forms = [SubmissionForm("1", "f1")]
    data = {"formA": {"q": "a"}}
    db = FakeDB()

    # Force error constructing ExtractionRecord to hit inner except
    class BadExtractionRecord(ExtractionRecord):
        def __init__(self, submission_id, form_id, extracted_data):
            raise ValueError("cant create")

    monkeypatch.setattr(
        "data_service.utils.processing_status_utils.FormExtractions",
        BadExtractionRecord,
    )
    with pytest.raises(Exception) as exc:
        run(store_form_extractions(db, sid, schemas, forms, data))
    assert "Failed to store any extractions" in str(exc.value)
    assert db.rollbacks == 1
    assert db.commits == 1
