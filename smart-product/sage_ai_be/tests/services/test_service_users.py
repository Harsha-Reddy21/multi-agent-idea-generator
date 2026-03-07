import asyncio
import pytest
from uuid import uuid4
from datetime import datetime

from data_service.service.users import get_users_service
from data_service.models.users import Users
from data_service.models.submissions import Submissions


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        class S:
            def __init__(self, rows):
                self._rows = rows

            def first(self):
                return self._rows[0] if self._rows else None

        return S(self._rows)

    def scalar(self):
        """For COUNT queries - return the scalar value"""
        return self._rows[0] if self._rows else 0


class FakeSession:
    def __init__(self):
        self.users = []
        self.submissions = []
        self.added = []
        self.commits = 0
        self.refreshes = 0
        self.rollbacks = 0
        self.raise_exc = None

    async def execute(self, stmt):
        if self.raise_exc:
            raise self.raise_exc
        txt = str(stmt).lower()
        if "from users" in txt:
            for u in self.users:
                if u.email.lower() in txt:
                    return FakeResult([u])
            return FakeResult([])
        if "count()" in txt or "func.count" in txt:
            # Return count of submissions for the user
            return FakeResult([len(self.submissions)])
        if "from submissions" in txt:
            # Always return a dummy object to simulate existing submission
            dummy = type("DummySubmission", (), {})()
            return FakeResult([dummy])
        return FakeResult([])

    def add(self, obj):
        self.added.append(obj)
        if isinstance(obj, Users):
            if not getattr(obj, "id", None):
                obj.id = uuid4()
            if not getattr(obj, "created_at", None):
                obj.created_at = datetime.utcnow()

    async def commit(self):
        self.commits += 1
        for obj in self.added:
            if isinstance(obj, Users):
                if not getattr(obj, "id", None):
                    obj.id = uuid4()
                if not getattr(obj, "created_at", None):
                    obj.created_at = datetime.utcnow()

    async def refresh(self, obj):
        self.refreshes += 1
        if isinstance(obj, Users) and not getattr(obj, "created_at", None):
            obj.created_at = datetime.utcnow()

    async def rollback(self):
        self.rollbacks += 1


run = asyncio.run


def test_get_user_info_existing_user_with_submission(monkeypatch):
    sess = FakeSession()
    user = Users(email="a@b.com", name="Alice", role="submitter", is_active=True)
    if not getattr(user, "id", None):
        user.id = uuid4()
    if not getattr(user, "created_at", None):
        user.created_at = datetime.utcnow()
    sess.users.append(user)
    sess.submissions.append(Submissions(submitter_id=user.id))
    seq = {"n": 0}

    async def exec_override(stmt):
        seq["n"] += 1
        txt = str(stmt).lower()
        if seq["n"] == 1:  # user query
            return FakeResult([user])
        if seq["n"] == 2:  # submissions count query
            # Return integer count, not submission object
            return FakeResult([1])
        return FakeResult([])

    monkeypatch.setattr(sess, "execute", exec_override)
    out = run(
        get_users_service(sess).get_user_info("a@b.com", "Alice", "Dept", "Title")
    )
    assert out.email == "a@b.com"
    assert out.anyIdeasSubmitted == "Yes"


def test_get_user_info_creates_new_user_no_submission():
    sess = FakeSession()
    out = run(
        get_users_service(sess).get_user_info("new@b.com", "New User", "Dept", "Title")
    )
    assert out.email == "new@b.com"
    assert out.anyIdeasSubmitted == "No"
    assert sess.commits >= 1
    assert len(sess.added) == 1


def test_get_user_info_db_error():
    from sqlalchemy.exc import SQLAlchemyError
    from data_service.exceptions.service_errors import UserInfoServiceError

    sess = FakeSession()
    sess.raise_exc = SQLAlchemyError("boom")
    with pytest.raises(UserInfoServiceError) as exc:
        run(get_users_service(sess).get_user_info("err@b.com", None, None, None))
    assert exc.value.status_code == 500
    assert "Unable to retrieve user information" in exc.value.message


def test_get_user_info_generic_error(monkeypatch):
    from data_service.exceptions.service_errors import UserInfoServiceError

    sess = FakeSession()

    # Patch session.execute to raise generic exception after user query
    async def bad_execute(stmt):
        raise RuntimeError("unexpected")

    monkeypatch.setattr(sess, "execute", bad_execute)
    with pytest.raises(UserInfoServiceError) as exc:
        run(get_users_service(sess).get_user_info("x@b.com", None, None, None))
    assert exc.value.status_code == 500
    assert "unexpected" in exc.value.message


# Additional test cases for lines 39-104 (rollback logic, user creation, submission counting)


def test_get_user_info_rollback_on_commit_error(monkeypatch):
    """Test that rollback is called when commit fails during user creation"""
    from data_service.exceptions.service_errors import UserInfoServiceError

    sess = FakeSession()
    rollback_called = {"value": False}

    async def mock_commit():
        raise Exception("Commit failed")

    async def mock_rollback():
        rollback_called["value"] = True

    monkeypatch.setattr(sess, "commit", mock_commit)
    monkeypatch.setattr(sess, "rollback", mock_rollback)

    with pytest.raises(UserInfoServiceError) as exc:
        run(
            get_users_service(sess).get_user_info(
                "new@test.com", "New User", None, None
            )
        )
    assert rollback_called["value"] is True
    assert exc.value.status_code == 500


def test_get_user_info_rollback_on_refresh_error(monkeypatch):
    """Test that rollback is called when refresh fails"""
    from data_service.exceptions.service_errors import UserInfoServiceError

    sess = FakeSession()
    rollback_called = {"value": False}

    async def mock_refresh(obj):
        raise Exception("Refresh failed")

    async def mock_rollback():
        rollback_called["value"] = True

    monkeypatch.setattr(sess, "refresh", mock_refresh)
    monkeypatch.setattr(sess, "rollback", mock_rollback)

    with pytest.raises(UserInfoServiceError) as exc:
        run(
            get_users_service(sess).get_user_info(
                "new@test.com", "New User", None, None
            )
        )
    assert rollback_called["value"] is True


def test_get_user_info_submission_count_zero():
    """Test that anyIdeasSubmitted is 'No' when count is 0"""
    sess = FakeSession()
    user = Users(
        email="test@test.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        if seq["n"] == 1:  # user query
            return FakeResult([user])
        if seq["n"] == 2:  # submissions count query
            # Return 0 for count
            return FakeResult([0])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    out = run(
        get_users_service(sess).get_user_info("test@test.com", "Test User", None, None)
    )
    assert out.anyIdeasSubmitted == "No"


def test_get_user_info_submission_count_multiple(monkeypatch):
    """Test that anyIdeasSubmitted is 'Yes' when count is > 0"""
    sess = FakeSession()
    user = Users(
        email="test@test.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(stmt):
        seq["n"] += 1
        if seq["n"] == 1:  # user query
            return FakeResult([user])
        if seq["n"] == 2:  # submissions count query
            # Return 5 for count
            return FakeResult([5])
        return FakeResult([])

    monkeypatch.setattr(sess, "execute", exec_override)
    out = run(
        get_users_service(sess).get_user_info("test@test.com", "Test User", None, None)
    )
    assert out.anyIdeasSubmitted == "Yes"


def test_get_user_info_case_insensitive_email():
    """Test that email lookup is case-insensitive"""
    sess = FakeSession()
    user = Users(
        email="test@example.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        txt = str(stmt).lower()
        if seq["n"] == 1 and "users" in txt:
            # Check if the query contains the lowercase email
            if "test@example.com" in txt:
                return FakeResult([user])
            return FakeResult([])
        if seq["n"] == 2:  # submissions count query
            return FakeResult([0])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    # Request with uppercase email
    out = run(
        get_users_service(sess).get_user_info(
            "TEST@EXAMPLE.COM", "Test User", None, None
        )
    )
    assert out.email == "test@example.com"


def test_get_user_info_new_user_with_defaults():
    """Test that new user is created with correct default values"""
    sess = FakeSession()
    out = run(
        get_users_service(sess).get_user_info(
            "newuser@test.com", "New User", None, None
        )
    )
    assert out.email == "newuser@test.com"
    assert out.name == "New User"
    assert out.role == "submitter"
    assert out.is_active is True
    assert sess.commits == 1
    assert sess.refreshes == 1
    assert len(sess.added) == 1
    # Verify the added user has correct attributes
    added_user = sess.added[0]
    assert added_user.email == "newuser@test.com"
    assert added_user.role == "submitter"
    assert added_user.is_active is True


def test_get_user_info_response_includes_optional_fields():
    """Test that response includes optional department and title fields"""
    sess = FakeSession()
    user = Users(
        email="test@test.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        if seq["n"] == 1:
            return FakeResult([user])
        if seq["n"] == 2:
            return FakeResult([0])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    out = run(
        get_users_service(sess).get_user_info(
            "test@test.com", "Test User", "Engineering", "Senior Dev"
        )
    )
    assert out.department == "Engineering"
    assert out.title == "Senior Dev"


def test_get_user_info_response_with_none_optional_fields():
    """Test that response handles None values for optional fields"""
    sess = FakeSession()
    user = Users(
        email="test@test.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        if seq["n"] == 1:
            return FakeResult([user])
        if seq["n"] == 2:
            return FakeResult([0])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    out = run(
        get_users_service(sess).get_user_info("test@test.com", "Test User", None, None)
    )
    assert out.department is None
    assert out.title is None


def test_get_user_info_error_during_count_query(monkeypatch):
    """Test error handling when submission count query fails"""
    from data_service.exceptions.service_errors import UserInfoServiceError

    sess = FakeSession()
    user = Users(
        email="test@test.com", name="Test User", role="submitter", is_active=True
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}
    rollback_called = {"value": False}

    async def exec_override(stmt):
        seq["n"] += 1
        if seq["n"] == 1:
            return FakeResult([user])
        if seq["n"] == 2:
            raise Exception("Count query failed")
        return FakeResult([])

    async def mock_rollback():
        rollback_called["value"] = True

    monkeypatch.setattr(sess, "execute", exec_override)
    monkeypatch.setattr(sess, "rollback", mock_rollback)

    with pytest.raises(UserInfoServiceError) as exc:
        run(
            get_users_service(sess).get_user_info(
                "test@test.com", "Test User", None, None
            )
        )
    assert rollback_called["value"] is True
    assert exc.value.status_code == 500


def test_get_user_info_user_creation_adds_to_session():
    """Test that new user is properly added to session"""
    sess = FakeSession()
    out = run(
        get_users_service(sess).get_user_info(
            "new@test.com", "New User", "IT", "Developer"
        )
    )
    assert len(sess.added) == 1
    assert sess.added[0].email == "new@test.com"
    assert sess.commits == 1


def test_get_user_info_existing_user_no_commit():
    """Test that existing user retrieval doesn't trigger commit"""
    sess = FakeSession()
    user = Users(
        email="existing@test.com",
        name="Existing User",
        role="submitter",
        is_active=True,
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        if seq["n"] == 1:
            return FakeResult([user])
        if seq["n"] == 2:
            return FakeResult([1])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    out = run(
        get_users_service(sess).get_user_info(
            "existing@test.com", "Existing User", None, None
        )
    )
    # No new commits for existing user
    assert len(sess.added) == 0


def test_get_user_info_preserves_user_attributes():
    """Test that all user attributes are preserved in response"""
    sess = FakeSession()
    user = Users(
        email="complete@test.com", name="Complete User", role="admin", is_active=False
    )
    user.id = uuid4()
    user.created_at = datetime.utcnow()
    sess.users.append(user)
    seq = {"n": 0}

    async def exec_override(self, stmt):
        seq["n"] += 1
        if seq["n"] == 1:
            return FakeResult([user])
        if seq["n"] == 2:
            return FakeResult([2])
        return FakeResult([])

    import types

    sess.execute = types.MethodType(exec_override, sess)
    out = run(
        get_users_service(sess).get_user_info(
            "complete@test.com", "Complete User", "Sales", "Manager"
        )
    )
    assert out.email == "complete@test.com"
    assert out.name == "Complete User"
    assert out.role == "admin"
    assert out.is_active is False
    assert out.id == user.id
    assert out.created_at == user.created_at
    assert out.anyIdeasSubmitted == "Yes"
