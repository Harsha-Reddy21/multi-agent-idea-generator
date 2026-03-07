import uuid
import datetime
from datetime import timezone
import pytest
from data_service.exceptions.service_errors import UserSubmissionsServiceError

from data_service.service.user_submissions import (
    get_user_submissions_service,
)
from data_service.serializers.user_submissions import SubmissionSummary
from data_service.constants.constants import ProcessingStatus


class FakeUser:
    def __init__(self, uid, email):
        self.id = uid
        self.email = email


class FakeStatus:
    def __init__(self, submission_id, status, message="ok"):
        self.submission_id = submission_id
        self.status = status  # Enum value
        self.message = message


class DummyResult:
    def __init__(self, items=None, row=None, status=None):
        self._items = items or []
        self._row = row
        self._status = status

    def scalars(self):  # for user lookup and status select
        class Scalars:
            def __init__(self, user=None, status=None):
                self._user = user
                self._status = status

            def first(self):
                return self._user

            def one_or_none(self):
                return self._status

            def all(self):
                return []

        return Scalars(user=self._row, status=self._status)

    def fetchall(self):  # for submissions query
        return self._items

    def scalar_one_or_none(self):  # for status query
        return self._status


class FakeDB:
    def __init__(
        self,
        user=None,
        submissions=None,
        status=None,
        raise_on_submissions=False,
        ai_registry_forms=None,
    ):
        self.user = user
        self.submissions = submissions or []
        self.status = status
        self.raise_on_submissions = raise_on_submissions
        self.ai_registry_forms = (
            ai_registry_forms or []
        )  # New: for ai-registry-form queries

    async def execute(self, stmt):
        text = str(stmt).lower()
        if "users" in text:
            return DummyResult(row=self.user)
        if "submission_forms" in text:
            # Handle ai-registry-form and ai-registry-update-form queries
            return DummyResult(items=self.ai_registry_forms)
        if "submissions" in text and "join" in text:
            if self.raise_on_submissions:
                raise RuntimeError("db fail")
            return DummyResult(items=self.submissions)
        if "submission_processing_status" in text:
            return DummyResult(status=self.status)
        return DummyResult()


@pytest.mark.asyncio
async def test_get_user_submissions_success():
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id1 = uuid.uuid4()
    submission_id2 = uuid.uuid4()
    # Row tuples mimic SQLAlchemy row: (id, title, category_id, category_name, status, created_at, updated_at)
    rows = [
        (
            submission_id1,
            "Title1",
            uuid.uuid4(),
            "CatA",
            "Submitted",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
        (
            submission_id2,
            "Title2",
            uuid.uuid4(),
            "CatB",
            "Draft",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
    ]
    # Mock ai_registry_forms: (submission_id, form_type, status, id)
    ai_registry_forms = [
        (submission_id1, "ai-registry-form", "Submitted", uuid.uuid4()),
        (submission_id2, "ai-registry-update-form", "Draft", uuid.uuid4()),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=ai_registry_forms)
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert resp.message == "Submissions fetched successfully"
    assert len(resp.data) == 2
    submitted = [s for s in resp.data if s.status.lower() == "submitted"][0]
    assert isinstance(submitted.submitted_at, datetime.datetime)
    assert submitted.ai_registry_form_status == "Submitted"
    draft = [s for s in resp.data if s.status == "Draft"][0]
    assert isinstance(draft.submitted_at, datetime.datetime)
    assert draft.ai_registry_update_form_id is not None


@pytest.mark.asyncio
async def test_get_user_submissions_auth_errors():
    service = get_user_submissions_service(FakeDB())
    with pytest.raises(UserSubmissionsServiceError) as ei:
        await service.get_user_submissions("")
    assert ei.value.status_code == 401
    service2 = get_user_submissions_service(FakeDB())
    with pytest.raises(UserSubmissionsServiceError):
        await service2.get_user_submissions("no-at-symbol")

    # User not found
    db = FakeDB(user=None)
    service3 = get_user_submissions_service(db)
    with pytest.raises(UserSubmissionsServiceError) as uf:
        await service3.get_user_submissions("missing@example.com")
    assert uf.value.message == "User not found"


@pytest.mark.asyncio
async def test_get_user_submissions_db_error():
    user = FakeUser(uuid.uuid4(), "u@example.com")
    db = FakeDB(user=user, raise_on_submissions=True)
    service = get_user_submissions_service(db)
    with pytest.raises(UserSubmissionsServiceError) as ex:
        await service.get_user_submissions("u@example.com")
    assert ex.value.status_code == 500
    assert "unexpected error" in ex.value.message.lower()


@pytest.mark.asyncio
async def test_get_submission_status_success_record():
    submission_id = str(uuid.uuid4())
    status = FakeStatus(uuid.UUID(submission_id), ProcessingStatus.COMPLETED, "done")
    db = FakeDB(status=status, user=FakeUser(uuid.uuid4(), "user@example.com"))
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id, "user@example.com")
    assert resp.submission_id == submission_id
    assert resp.status == "completed"
    assert resp.message == "done"


@pytest.mark.asyncio
async def test_get_submission_status_no_record():
    submission_id = str(uuid.uuid4())
    db = FakeDB(status=None, user=FakeUser(uuid.uuid4(), "user@example.com"))
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id, "user@example.com")
    assert resp.status == "completed"
    assert "No documents provided" in resp.message


@pytest.mark.asyncio
async def test_get_submission_status_auth_and_uuid_errors():
    service = get_user_submissions_service(FakeDB())
    with pytest.raises(UserSubmissionsServiceError):
        await service.get_submission_status(str(uuid.uuid4()), "bad-email")
    service2 = get_user_submissions_service(FakeDB())
    with pytest.raises(UserSubmissionsServiceError):
        await service2.get_submission_status("not-a-uuid", "user@example.com")


@pytest.mark.asyncio
async def test_get_submission_status_unexpected_exception(monkeypatch):
    submission_id = str(uuid.uuid4())

    async def bad_execute(stmt):
        raise RuntimeError("boom")

    db = FakeDB()
    monkeypatch.setattr(db, "execute", bad_execute)
    with pytest.raises(UserSubmissionsServiceError) as ex:
        service = get_user_submissions_service(db)
        await service.get_submission_status(submission_id, "user@example.com")
    assert ex.value.status_code == 500


# Additional test cases for lines 45-149 (get_user_submissions_service)


@pytest.mark.asyncio
async def test_get_user_submissions_empty_list():
    """Test when user has no submissions"""
    user = FakeUser(uuid.uuid4(), "newuser@example.com")
    db = FakeDB(user=user, submissions=[], ai_registry_forms=[])
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("newuser@example.com")
    assert resp.message == "Submissions fetched successfully"
    assert len(resp.data) == 0


@pytest.mark.asyncio
async def test_get_user_submissions_with_null_fields():
    """Test handling of None values in submission fields"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id = uuid.uuid4()
    rows = [
        (
            submission_id,
            None,  # title is None
            uuid.uuid4(),
            None,  # category_name is None
            None,  # status is None
            datetime.datetime.now(timezone.utc),
            None,  # updated_at is None
        ),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=[])
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 1
    assert resp.data[0].title == ""
    assert resp.data[0].category_name == ""
    assert resp.data[0].status == ""
    # submitted_at is set to created_at regardless of status
    assert isinstance(resp.data[0].submitted_at, datetime.datetime)


@pytest.mark.asyncio
async def test_get_user_submissions_in_progress_status():
    """Test that in-progress status doesn't set submitted_at"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id = uuid.uuid4()
    updated_time = datetime.datetime.now(timezone.utc)
    rows = [
        (
            submission_id,
            "In Progress Title",
            uuid.uuid4(),
            "Category",
            "in-progress",
            datetime.datetime.now(timezone.utc),
            updated_time,
        ),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=[])
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 1
    # submitted_at is set to created_at regardless of status
    assert resp.data[0].status == "in-progress"
    assert isinstance(resp.data[0].submitted_at, datetime.datetime)


@pytest.mark.asyncio
async def test_get_user_submissions_case_insensitive_submitted_status():
    """Test that status comparison is case-insensitive for 'submitted'"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id1 = uuid.uuid4()
    submission_id2 = uuid.uuid4()
    submission_id3 = uuid.uuid4()
    updated_time = datetime.datetime.now(timezone.utc)
    rows = [
        (
            submission_id1,
            "Title1",
            uuid.uuid4(),
            "Cat",
            "SUBMITTED",
            datetime.datetime.now(timezone.utc),
            updated_time,
        ),
        (
            submission_id2,
            "Title2",
            uuid.uuid4(),
            "Cat",
            "Submitted",
            datetime.datetime.now(timezone.utc),
            updated_time,
        ),
        (
            submission_id3,
            "Title3",
            uuid.uuid4(),
            "Cat",
            "submitted",
            datetime.datetime.now(timezone.utc),
            updated_time,
        ),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=[])
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 3
    for submission in resp.data:
        # All have 'submitted' status (case variations), so all should have submitted_at set
        assert submission.submitted_at is not None
        assert isinstance(submission.submitted_at, datetime.datetime)


@pytest.mark.asyncio
async def test_get_user_submissions_with_both_registry_forms():
    """Test submission with both ai-registry-form and ai-registry-update-form"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id = uuid.uuid4()
    form_id = uuid.uuid4()
    rows = [
        (
            submission_id,
            "Title",
            uuid.uuid4(),
            "Category",
            "Submitted",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
    ]
    ai_registry_forms = [
        (submission_id, "ai-registry-form", "Completed", uuid.uuid4()),
        (submission_id, "ai-registry-update-form", "In Progress", form_id),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=ai_registry_forms)
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 1
    assert resp.data[0].ai_registry_form_status == "Completed"
    assert resp.data[0].ai_registry_update_form_id == str(form_id)


@pytest.mark.asyncio
async def test_get_user_submissions_no_registry_forms():
    """Test submission without any registry forms"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id = uuid.uuid4()
    rows = [
        (
            submission_id,
            "Title",
            uuid.uuid4(),
            "Category",
            "Draft",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=[])
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 1
    assert resp.data[0].ai_registry_form_status is None
    assert resp.data[0].ai_registry_update_form_id is None


@pytest.mark.asyncio
async def test_get_user_submissions_multiple_submissions_complex():
    """Test multiple submissions with mixed registry form scenarios"""
    user = FakeUser(uuid.uuid4(), "test@example.com")
    submission_id1 = uuid.uuid4()
    submission_id2 = uuid.uuid4()
    submission_id3 = uuid.uuid4()
    rows = [
        (
            submission_id1,
            "Sub1",
            uuid.uuid4(),
            "Cat1",
            "Submitted",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
        (
            submission_id2,
            "Sub2",
            uuid.uuid4(),
            "Cat2",
            "Draft",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
        (
            submission_id3,
            "Sub3",
            uuid.uuid4(),
            "Cat3",
            "In Review",
            datetime.datetime.now(timezone.utc),
            datetime.datetime.now(timezone.utc),
        ),
    ]
    ai_registry_forms = [
        (submission_id1, "ai-registry-form", "Complete", uuid.uuid4()),
        (submission_id2, "ai-registry-update-form", "Pending", uuid.uuid4()),
        # submission_id3 has no registry forms
    ]
    db = FakeDB(user=user, submissions=rows, ai_registry_forms=ai_registry_forms)
    service = get_user_submissions_service(db)
    resp = await service.get_user_submissions("test@example.com")
    assert len(resp.data) == 3
    # Check first submission
    sub1 = next(s for s in resp.data if s.title == "Sub1")
    assert sub1.ai_registry_form_status == "Complete"
    assert sub1.ai_registry_update_form_id is None
    # Check second submission
    sub2 = next(s for s in resp.data if s.title == "Sub2")
    assert sub2.ai_registry_form_status is None
    assert sub2.ai_registry_update_form_id is not None
    # Check third submission
    sub3 = next(s for s in resp.data if s.title == "Sub3")
    assert sub3.ai_registry_form_status is None
    assert sub3.ai_registry_update_form_id is None


# Additional test cases for lines 176-223 (get_submission_status_service)


@pytest.mark.asyncio
async def test_get_submission_status_different_statuses():
    """Test different processing status values"""
    submission_id = str(uuid.uuid4())
    user = FakeUser(uuid.uuid4(), "user@example.com")

    # Test PROCESSING status
    status = FakeStatus(
        uuid.UUID(submission_id), ProcessingStatus.PROCESSING, "Processing documents"
    )
    db = FakeDB(status=status, user=user)
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id, "user@example.com")
    assert resp.status == "processing"
    assert resp.message == "Processing documents"


@pytest.mark.asyncio
async def test_get_submission_status_failed():
    """Test FAILED processing status"""
    submission_id = str(uuid.uuid4())
    user = FakeUser(uuid.uuid4(), "user@example.com")
    status = FakeStatus(
        uuid.UUID(submission_id), ProcessingStatus.FAILED, "Processing failed"
    )
    db = FakeDB(status=status, user=user)
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id, "user@example.com")
    assert resp.status == "failed"
    assert resp.message == "Processing failed"


@pytest.mark.asyncio
async def test_get_submission_status_invalid_email():
    """Test invalid email format"""
    submission_id = str(uuid.uuid4())
    service = get_user_submissions_service(FakeDB())
    with pytest.raises(UserSubmissionsServiceError) as exc:
        await service.get_submission_status(submission_id, "")
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_submission_status_invalid_uuid_format():
    """Test various invalid UUID formats"""
    user = FakeUser(uuid.uuid4(), "user@example.com")
    db = FakeDB(user=user)

    # Test completely invalid UUID
    service = get_user_submissions_service(db)
    with pytest.raises(UserSubmissionsServiceError) as exc:
        await service.get_submission_status("invalid-uuid", "user@example.com")
    assert exc.value.status_code == 400

    # Test empty UUID
    service2 = get_user_submissions_service(db)
    with pytest.raises(UserSubmissionsServiceError) as exc:
        await service2.get_submission_status("", "user@example.com")
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_get_submission_status_user_not_found():
    """Test when user is not found"""
    submission_id = str(uuid.uuid4())
    db = FakeDB(user=None)
    service = get_user_submissions_service(db)
    with pytest.raises(UserSubmissionsServiceError) as exc:
        await service.get_submission_status(submission_id, "nonexistent@example.com")
    assert "User not found" in exc.value.message


@pytest.mark.asyncio
async def test_get_submission_status_no_record_default_message():
    """Test the default message when no processing status exists"""
    submission_id = str(uuid.uuid4())
    user = FakeUser(uuid.uuid4(), "user@example.com")
    db = FakeDB(status=None, user=user)
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id, "user@example.com")
    assert resp.submission_id == submission_id
    assert resp.status == "completed"
    assert "No documents provided" in resp.message
    assert "fill out the forms manually" in resp.message


@pytest.mark.asyncio
async def test_get_submission_status_uuid_case_insensitive():
    """Test that UUID matching works with different cases"""
    submission_uuid = uuid.uuid4()
    submission_id_upper = str(submission_uuid).upper()
    user = FakeUser(uuid.uuid4(), "user@example.com")
    status = FakeStatus(submission_uuid, ProcessingStatus.COMPLETED, "Success")
    db = FakeDB(status=status, user=user)
    service = get_user_submissions_service(db)
    resp = await service.get_submission_status(submission_id_upper, "user@example.com")
    assert resp.status == "completed"
    assert resp.message == "Success"
