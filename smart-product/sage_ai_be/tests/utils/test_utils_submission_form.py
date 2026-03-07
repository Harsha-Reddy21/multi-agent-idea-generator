import pytest
from types import SimpleNamespace
from uuid import uuid4
from fastapi import HTTPException

from data_service.utils.submission_form_utils import create_submission_with_forms


class FakeDB:

    def __init__(self):
        self.added_objects = []
        self.committed = False
        self.flushed = False

    def add(self, obj):
        if not hasattr(obj, "id") or obj.id is None:
            obj.id = str(uuid4())
        self.added_objects.append(obj)

    async def flush(self):
        self.flushed = True

    async def commit(self):
        self.committed = True


@pytest.mark.asyncio
async def test_create_submission_with_forms_success():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [
        SimpleNamespace(id=str(uuid4()), name="form1"),
        SimpleNamespace(id=str(uuid4()), name="form2"),
    ]

    result = await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
        description="Test submission",
        status="draft",
    )

    assert result["submission_id"] is not None
    assert len(result["submission_form_ids"]) == 2
    assert result["category_id"] == category_id
    assert "Submission created" in result["message"]
    assert db.committed
    assert db.flushed


@pytest.mark.asyncio
async def test_create_submission_with_forms_custom_form_data():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    custom_data = {"step": 1, "completed": False}

    result = await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
        form_data=custom_data,
    )

    assert result["submission_id"] is not None
    assert len(db.added_objects) == 2

    submission = db.added_objects[0]
    assert submission.submission_journey == custom_data


@pytest.mark.asyncio
async def test_create_submission_with_forms_no_category_id():
    db = FakeDB()
    user_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    with pytest.raises(HTTPException) as exc_info:
        await create_submission_with_forms(
            db=db,
            user_id=user_id,
            category_id="",
            form_schemas=schemas,
        )

    assert exc_info.value.status_code == 400
    assert "No category_id provided" in exc_info.value.detail


@pytest.mark.asyncio
async def test_create_submission_with_forms_empty_schemas():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    result = await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=[],
    )

    assert result["submission_id"] is not None
    assert len(result["submission_form_ids"]) == 0
    assert len(db.added_objects) == 1


@pytest.mark.asyncio
async def test_create_submission_with_forms_multiple_schemas():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [
        SimpleNamespace(id=str(uuid4()), name="ai-registry-form"),
        SimpleNamespace(id=str(uuid4()), name="security-arch-form"),
        SimpleNamespace(id=str(uuid4()), name="legal-form"),
    ]

    result = await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    assert len(result["submission_form_ids"]) == 3
    assert len(db.added_objects) == 4


@pytest.mark.asyncio
async def test_create_submission_initializes_correct_fields():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
        description="Test description",
        status="in_progress",
    )

    submission = db.added_objects[0]
    assert submission.title == ""
    assert submission.description == "Test description"
    assert submission.status == "in_progress"
    assert submission.submitter_id == user_id
    assert submission.category_id == category_id


@pytest.mark.asyncio
async def test_create_submission_forms_have_correct_status():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [
        SimpleNamespace(id=str(uuid4()), name="form1"),
        SimpleNamespace(id=str(uuid4()), name="form2"),
    ]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    submission_forms = db.added_objects[1:]
    for form in submission_forms:
        assert form.status == "not_started"
        assert form.form_data == {}


@pytest.mark.asyncio
async def test_create_submission_forms_linked_to_submission():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())
    schema_id1 = str(uuid4())
    schema_id2 = str(uuid4())

    schemas = [
        SimpleNamespace(id=schema_id1, name="form1"),
        SimpleNamespace(id=schema_id2, name="form2"),
    ]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    submission = db.added_objects[0]
    form1 = db.added_objects[1]
    form2 = db.added_objects[2]

    assert form1.submission_id == submission.id
    assert form2.submission_id == submission.id
    assert form1.form_schema_id == schema_id1
    assert form2.form_schema_id == schema_id2
    assert form1.form_type == "form1"
    assert form2.form_type == "form2"


@pytest.mark.asyncio
async def test_create_submission_default_values():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    submission = db.added_objects[0]
    assert submission.description == ""
    assert submission.status == "draft"
    assert submission.submission_journey == {}


@pytest.mark.asyncio
async def test_create_submission_none_category_id():
    db = FakeDB()
    user_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    with pytest.raises(HTTPException) as exc_info:
        await create_submission_with_forms(
            db=db,
            user_id=user_id,
            category_id=None,
            form_schemas=schemas,
        )

    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_create_submission_db_flush_called():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    assert db.flushed


@pytest.mark.asyncio
async def test_create_submission_db_commit_called():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    assert db.committed


@pytest.mark.asyncio
async def test_create_submission_returns_all_form_ids():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [
        SimpleNamespace(id=str(uuid4()), name="form1"),
        SimpleNamespace(id=str(uuid4()), name="form2"),
        SimpleNamespace(id=str(uuid4()), name="form3"),
    ]

    result = await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    assert len(result["submission_form_ids"]) == 3
    for form_id in result["submission_form_ids"]:
        assert form_id is not None


@pytest.mark.asyncio
async def test_create_submission_with_special_characters():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    special_desc = "Test with émojis 🎉 and spëcial çhars & symbols <>"

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
        description=special_desc,
    )

    submission = db.added_objects[0]
    assert submission.description == special_desc


@pytest.mark.asyncio
async def test_create_submission_complex_form_data():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schemas = [SimpleNamespace(id=str(uuid4()), name="form1")]

    complex_data = {
        "step": 1,
        "answers": {"q1": "answer1", "q2": "answer2"},
        "metadata": {"timestamp": "2024-01-01", "user_agent": "test"},
        "nested": {"deep": {"value": 123}},
    }

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
        form_data=complex_data,
    )

    submission = db.added_objects[0]
    assert submission.submission_journey == complex_data


@pytest.mark.asyncio
async def test_create_submission_preserves_form_order():
    db = FakeDB()
    user_id = str(uuid4())
    category_id = str(uuid4())

    schema_names = ["form1", "form2", "form3", "form4"]
    schemas = [SimpleNamespace(id=str(uuid4()), name=name) for name in schema_names]

    await create_submission_with_forms(
        db=db,
        user_id=user_id,
        category_id=category_id,
        form_schemas=schemas,
    )

    created_forms = db.added_objects[1:]
    created_form_types = [form.form_type for form in created_forms]

    assert created_form_types == schema_names
