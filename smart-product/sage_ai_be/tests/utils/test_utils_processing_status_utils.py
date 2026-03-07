import pytest
from types import SimpleNamespace
from uuid import uuid4

from data_service.utils.processing_status_utils import (
    update_processing_status,
    store_form_extractions,
)
from data_service.constants.constants import ProcessingStatus


class FakeDB:
    def __init__(self, get_obj=None):
        self._get_obj = get_obj
        self._added = []
        self._committed = False
        self._rolled_back = False

    async def get(self, model, submission_id):
        return self._get_obj

    def add(self, obj):
        self._added.append(obj)

    async def commit(self):
        self._committed = True

    async def rollback(self):
        self._rolled_back = True


class DummyError(Exception):
    pass


@pytest.mark.asyncio
async def test_update_processing_status_updates_existing():
    submission_id = uuid4()
    tracking = SimpleNamespace(status=None, message=None)
    db = FakeDB(get_obj=tracking)
    await update_processing_status(
        db, submission_id, ProcessingStatus.PROCESSING, "working"
    )
    assert db._committed
    assert tracking.status == ProcessingStatus.PROCESSING
    assert tracking.message == "working"


@pytest.mark.asyncio
async def test_update_processing_status_creates_when_missing():
    submission_id = uuid4()
    db = FakeDB(get_obj=None)
    await update_processing_status(
        db, submission_id, ProcessingStatus.COMPLETED, "done"
    )
    assert db._committed
    assert len(db._added) == 1


class FakeFormSchema:
    def __init__(self, id, name):
        self.id = id
        self.name = name


class FakeSubmissionForm:
    def __init__(self, id, form_schema_id):
        self.id = id
        self.form_schema_id = form_schema_id


@pytest.mark.asyncio
async def test_store_form_extractions_stores_and_counts(monkeypatch):
    submission_id = uuid4()
    db = FakeDB()
    # Patch models.FormExtractions constructor to a simple namespace
    from data_service.utils import processing_status_utils as psu

    class FakeExtraction:
        def __init__(self, submission_id, form_id, extracted_data):
            self.submission_id = submission_id
            self.form_id = form_id
            self.extracted_data = extracted_data

    monkeypatch.setattr(psu, "FormExtractions", FakeExtraction)

    schemas = [
        FakeFormSchema("schema-1", "Form A"),
        FakeFormSchema("schema-2", "Form B"),
    ]
    forms = [
        FakeSubmissionForm("form-1", "schema-1"),
        FakeSubmissionForm("form-2", "schema-2"),
    ]
    form_jsons = {"Form A": {"q1": "a1"}, "Form B": {}}

    stored, failed = await store_form_extractions(
        db, submission_id, schemas, forms, form_jsons
    )
    assert stored == 2
    assert failed == 0
    assert len(db._added) == 2


@pytest.mark.asyncio
async def test_store_form_extractions_counts_failures(monkeypatch):
    submission_id = uuid4()
    db = FakeDB()
    # Patch FormExtractions to raise
    from data_service.utils import processing_status_utils as psu

    class Boom:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("boom")

    monkeypatch.setattr(psu, "FormExtractions", Boom)

    schemas = [FakeFormSchema("schema-1", "Form A")]
    forms = []
    form_jsons = {}

    with pytest.raises(Exception):
        await store_form_extractions(db, submission_id, schemas, forms, form_jsons)
