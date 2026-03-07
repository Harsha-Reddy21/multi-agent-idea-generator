import pytest
from types import SimpleNamespace
import types
from data_service.utils import query_optimizer as qo

from data_service.utils.query_optimizer import (
    QueryOptimizer,
    fetch_submissions_with_interactions,
    fetch_ai_interactions_with_feedbacks,
)


class DummyQuery:
    def __init__(self):
        self._opts = []

    def where(self, cond):
        return self

    def options(self, opt):
        self._opts.append(opt)
        return self


qo.select = lambda model: DummyQuery()


class FakeScalars:
    def __init__(self, items):
        self._items = items

    def all(self):
        return self._items

    def first(self):
        return self._items[0] if self._items else None


class FakeResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return FakeScalars(self._items)


class FakeDB:
    def __init__(self, items):
        self._items = items

    async def execute(self, *args, **kwargs):
        return FakeResult(self._items)


@pytest.mark.asyncio
async def test_fetch_with_relationships_returns_items():
    db = FakeDB([SimpleNamespace(id=1), SimpleNamespace(id=2)])
    out = await QueryOptimizer.fetch_with_relationships(db, SimpleNamespace, True)
    assert len(out) == 2


@pytest.mark.asyncio
async def test_fetch_single_with_relationships_returns_first():
    db = FakeDB([SimpleNamespace(id=3), SimpleNamespace(id=4)])
    out = await QueryOptimizer.fetch_single_with_relationships(
        db, SimpleNamespace, True
    )
    assert out.id == 3


@pytest.mark.asyncio
async def test_convenience_fetchers_delegate_calls():
    # Using FakeDB to ensure path executes; contents don't matter here
    db = FakeDB([SimpleNamespace(id="x")])
    res1 = await fetch_submissions_with_interactions(db, "user-1")
    assert isinstance(res1, list)
    res2 = await fetch_ai_interactions_with_feedbacks(db, "sub-1")
    assert isinstance(res2, list)
