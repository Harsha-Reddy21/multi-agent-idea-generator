import pytest
from types import SimpleNamespace
from uuid import uuid4

from data_service.utils.validation import (
    validate_auth_header,
    validate_uuid_format,
    validate_and_get_user,
)


class DummyError(Exception):
    def __init__(self, error, message, status_code):
        self.error = error
        self.message = message
        self.status_code = status_code


def test_validate_auth_header_ok():
    validate_auth_header("user@example.com", DummyError)


@pytest.mark.parametrize("email", [None, "", "invalid"])
def test_validate_auth_header_invalid(email):
    with pytest.raises(DummyError) as exc:
        validate_auth_header(email, DummyError)
    assert exc.value.status_code == 401


def test_validate_uuid_format_ok():
    u = str(uuid4())
    assert str(validate_uuid_format(u, "submission_id", DummyError)) == u


@pytest.mark.parametrize("value", ["bad", None])
def test_validate_uuid_format_bad(value):
    with pytest.raises(DummyError) as exc:
        validate_uuid_format(value, "submission_id", DummyError)
    assert exc.value.status_code == 400


class FakeResult:
    def __init__(self, user):
        self._user = user

    def scalars(self):
        class S:
            def __init__(self, u):
                self._u = u

            def first(self):
                return self._u

        return S(self._user)


class FakeDB:
    def __init__(self, user):
        self._user = user

    async def execute(self, *args, **kwargs):
        return FakeResult(self._user)


@pytest.mark.asyncio
async def test_validate_and_get_user_ok():
    user = SimpleNamespace(email="user@example.com")
    db = FakeDB(user)
    out = await validate_and_get_user("user@example.com", db, DummyError)
    assert out.email == "user@example.com"


@pytest.mark.asyncio
async def test_validate_and_get_user_missing():
    db = FakeDB(None)
    with pytest.raises(DummyError) as exc:
        await validate_and_get_user("missing@example.com", db, DummyError)
    assert exc.value.status_code == 401
