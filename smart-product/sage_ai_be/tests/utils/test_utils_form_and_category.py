from types import SimpleNamespace
import pytest
import asyncio

from data_service.utils.form_schema_utils import get_form_schemas_by_category_id
from data_service.utils.category_utils import get_category_id


# Helpers
class FakeResultAll:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return SimpleNamespace(all=lambda: self._items)


class FakeResultFirst:
    def __init__(self, item):
        self._item = item

    def scalars(self):
        return SimpleNamespace(first=lambda: self._item)


class FakeDBAll:
    def __init__(self, items):
        self._items = items

    async def execute(self, _query):
        return FakeResultAll(self._items)


class FakeDBFirst:
    def __init__(self, item):
        self._item = item

    async def execute(self, _query):
        return FakeResultFirst(self._item)


def run(coro):
    # Use asyncio.run for compatibility across platforms.
    return asyncio.run(coro)


# Form schema utils tests
async def _test_get_form_schemas_by_category_id_returns_active():
    # simulate two active schemas returned
    schemas = [
        SimpleNamespace(id=1, category_id="cat-1", is_active=True, name="s1"),
        SimpleNamespace(id=2, category_id="cat-1", is_active=True, name="s2"),
    ]
    db = FakeDBAll(schemas)
    result = await get_form_schemas_by_category_id(db, "cat-1")
    assert len(result) == 2
    assert {s.name for s in result} == {"s1", "s2"}


async def _test_get_form_schemas_by_category_id_empty():
    db = FakeDBAll([])
    result = await get_form_schemas_by_category_id(db, "cat-1")
    assert result == []


# Category utils tests
async def _test_get_category_id_found():
    category = SimpleNamespace(id="cat-123", is_active=True)
    db = FakeDBFirst(category)
    cid = await get_category_id(db)
    assert cid == "cat-123"


async def _test_get_category_id_none():
    db = FakeDBFirst(None)
    cid = await get_category_id(db)
    assert cid is None


# Pytest wrappers


def test_get_form_schemas_by_category_id_returns_active():
    run(_test_get_form_schemas_by_category_id_returns_active())


def test_get_form_schemas_by_category_id_empty():
    run(_test_get_form_schemas_by_category_id_empty())


def test_get_category_id_found():
    run(_test_get_category_id_found())


def test_get_category_id_none():
    run(_test_get_category_id_none())
