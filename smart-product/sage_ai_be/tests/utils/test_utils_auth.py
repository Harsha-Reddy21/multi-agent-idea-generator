import pytest
from fastapi import HTTPException
from types import SimpleNamespace
import asyncio

from data_service.utils.auth import get_current_user


class FakeResult:
    def __init__(self, user):
        self._user = user

    def scalars(self):
        return SimpleNamespace(first=lambda: self._user)


class FakeDB:
    def __init__(self, user):
        self._user = user

    async def execute(self, _query):
        return FakeResult(self._user)


def run(coro):
    # Use asyncio.run to ensure a fresh event loop is created on Windows.
    return asyncio.run(coro)


def test_get_current_user_success():
    fake_user = SimpleNamespace(email="user@example.com")
    db = FakeDB(fake_user)
    user = run(get_current_user(x_user_email=fake_user.email, db=db))
    assert user.email == fake_user.email


def test_get_current_user_not_found():
    db = FakeDB(user=None)
    with pytest.raises(HTTPException) as exc:
        run(get_current_user(x_user_email="missing@example.com", db=db))
    assert exc.value.status_code == 401
    assert exc.value.detail == "User not found"
