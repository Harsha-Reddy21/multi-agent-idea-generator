import pytest
import asyncio

from data_service.service.service_now import ServiceNowService
from data_service.serializers.service_now import ApprovedIdeaDetail, ApprovedIdeaUser
from data_service.exceptions import ServiceNowServiceError


class FakeServiceNowClient:
    def __init__(self):
        self.count_result = 3
        self.top_result = []
        self.user_detail_result = "User Name"
        self.calls = []
        self.should_raise = None

    async def get_approved_ideas_count(self, days=30):
        self.calls.append(("count", days))
        if self.should_raise:
            raise self.should_raise
        return self.count_result

    async def get_top_approved_ideas(self, limit=2):
        self.calls.append(("top", limit))
        if self.should_raise:
            raise self.should_raise
        return self.top_result

    async def get_user_details(self, link):
        self.calls.append(("user", link))
        if self.should_raise:
            raise self.should_raise
        return self.user_detail_result


@pytest.fixture(autouse=True)
def patch_client(monkeypatch):
    fake = FakeServiceNowClient()
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    return fake


run = asyncio.run


def test_get_approved_ideas_count_service_success(patch_client):
    service = ServiceNowService()
    out = run(service.get_approved_ideas_count(days=7))
    assert out.count == 3
    assert out.days == 7


def test_get_approved_ideas_count_service_error(monkeypatch):
    fake = FakeServiceNowClient()
    fake.should_raise = RuntimeError("fail")
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    with pytest.raises(ServiceNowServiceError) as exc:
        run(service.get_approved_ideas_count(days=7))
    assert exc.value.status_code == 500


def test_get_top_approved_ideas_service_success(monkeypatch):
    # Provide ideas with user link and without link to cover branches
    ideas = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"link": "u1", "value": "id1"},
        },
        {
            "ai_system_name": "AI2",
            "problem_statement": "P2",
            "opened_by": {"value": "id2"},
        },
        {
            "ai_system_name": "AI3",
            "problem_statement": "P3",
            "opened_by": {"link": "bad", "value": "id3"},
        },
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas

    # Force user detail failure for one idea
    async def bad_user_details(link):
        if link == "bad":
            raise RuntimeError("user fail")
        return f"Name-{link}"

    fake.get_user_details = bad_user_details
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=5))
    assert out.total_count == 3
    names = [i.submitted_by.user_name for i in out.ideas]
    assert "Name-u1" in names
    assert any(
        n.startswith("User id") or n.startswith("User id2") or n.startswith("User id3")
        for n in names
    )


def test_get_top_approved_ideas_service_error(monkeypatch):
    fake = FakeServiceNowClient()
    fake.should_raise = RuntimeError("top fail")
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    with pytest.raises(ServiceNowServiceError) as exc:
        run(service.get_top_approved_ideas(limit=3))
    assert exc.value.status_code == 500


def test_get_top_approved_ideas_service_processing_exception(monkeypatch):
    # Idea processing raises exception during user details fetch
    ideas = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"link": "u1", "value": "id1"},
        },
        {
            "ai_system_name": "AI2",
            "problem_statement": "P2",
            "opened_by": {"link": "boom", "value": "id2"},
        },
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas

    async def user_details(link):
        if link == "boom":
            raise RuntimeError("bad user")
        return f"Name-{link}"

    fake.get_user_details = user_details
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=2))
    assert out.total_count == 2  # Both ideas processed, second uses fallback user name
    assert out.ideas[0].submitted_by.user_name == "Name-u1"
    assert out.ideas[1].submitted_by.user_name == "User id2"  # Fallback name used


def test_get_approved_ideas_dashboard_service_success(monkeypatch):
    fake = FakeServiceNowClient()
    fake.count_result = 9
    fake.top_result = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"value": "id1"},
        }
    ]
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_approved_ideas_dashboard(days=10, top_limit=1))
    assert out.approved_count == 9
    assert out.days == 10
    assert len(out.top_ideas) == 1


def test_get_approved_ideas_dashboard_service_error(monkeypatch):
    fake = FakeServiceNowClient()
    fake.should_raise = RuntimeError("count fail")
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    with pytest.raises(ServiceNowServiceError) as exc:
        run(service.get_approved_ideas_dashboard(days=5, top_limit=1))
    assert exc.value.status_code == 500


def test_get_approved_ideas_count_service_default_days(patch_client):
    """Test count service with default days parameter"""
    service = ServiceNowService()
    out = run(service.get_approved_ideas_count())
    assert out.count == 3
    assert out.days == 30
    assert out.message == "Successfully retrieved approved ideas count"


def test_get_top_approved_ideas_service_empty_list(monkeypatch):
    """Test top ideas service when no ideas are returned"""
    fake = FakeServiceNowClient()
    fake.top_result = []
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=5))
    assert out.total_count == 0
    assert len(out.ideas) == 0
    assert out.message == "Successfully retrieved top approved ideas"


def test_get_top_approved_ideas_service_missing_opened_by(monkeypatch):
    """Test handling of ideas with missing opened_by field"""
    ideas = [
        {"ai_system_name": "AI1", "problem_statement": "P1"},
        {
            "ai_system_name": "AI2",
            "problem_statement": "P2",
            "opened_by": {},
        },
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=2))
    assert out.total_count == 2
    # Both should have "Unknown User" since opened_by is missing/empty
    assert out.ideas[0].submitted_by.user_name == "Unknown User"
    assert out.ideas[1].submitted_by.user_name == "Unknown User"


def test_get_top_approved_ideas_service_empty_user_link(monkeypatch):
    """Test handling when user link is empty string"""
    ideas = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"link": "", "value": "id1"},
        },
        {
            "ai_system_name": "AI2",
            "problem_statement": "P2",
            "opened_by": {"link": "   ", "value": "id2"},
        },
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=2))
    assert out.total_count == 2
    assert out.ideas[0].submitted_by.user_name == "User id1"
    assert out.ideas[1].submitted_by.user_name == "User id2"


def test_get_top_approved_ideas_service_user_details_success(monkeypatch):
    """Test successful user details fetch"""
    ideas = [
        {
            "ai_system_name": "Test System",
            "problem_statement": "Test Problem",
            "opened_by": {"link": "user_link", "value": "user123"},
        }
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas
    fake.user_detail_result = "John Doe"
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=1))
    assert out.total_count == 1
    assert out.ideas[0].submitted_by.user_name == "John Doe"
    assert out.ideas[0].submitted_by.user_id == "user123"
    assert out.ideas[0].ai_system_name == "Test System"
    assert out.ideas[0].problem_statement == "Test Problem"


def test_get_approved_ideas_dashboard_service_default_params(monkeypatch):
    """Test dashboard service with default parameters"""
    fake = FakeServiceNowClient()
    fake.count_result = 15
    fake.top_result = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"value": "id1"},
        },
        {
            "ai_system_name": "AI2",
            "problem_statement": "P2",
            "opened_by": {"value": "id2"},
        },
    ]
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_approved_ideas_dashboard())
    assert out.approved_count == 15
    assert out.days == 30
    assert len(out.top_ideas) == 2
    assert out.message == "Successfully retrieved approved ideas dashboard data"


def test_get_approved_ideas_dashboard_service_custom_params(monkeypatch):
    """Test dashboard service with custom days and limit"""
    fake = FakeServiceNowClient()
    fake.count_result = 20
    fake.top_result = [
        {
            "ai_system_name": "AI1",
            "problem_statement": "P1",
            "opened_by": {"link": "u1", "value": "id1"},
        }
    ]
    fake.user_detail_result = "Test User"
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_approved_ideas_dashboard(days=15, top_limit=1))
    assert out.approved_count == 20
    assert out.days == 15
    assert len(out.top_ideas) == 1
    assert out.top_ideas[0].submitted_by.user_name == "Test User"


def test_get_top_approved_ideas_service_all_ideas_fail_processing(monkeypatch):
    """Test when ideas have missing fields but processing continues"""
    ideas = [
        {"invalid": "data1"},
        {"invalid": "data2"},
    ]
    fake = FakeServiceNowClient()
    fake.top_result = ideas
    monkeypatch.setattr("data_service.service.service_now.service_now_client", fake)
    service = ServiceNowService()
    out = run(service.get_top_approved_ideas(limit=2))
    # Service handles missing fields gracefully with defaults
    assert out.total_count == 2
    assert len(out.ideas) == 2
    # Both ideas should have empty ai_system_name and Unknown User
    assert out.ideas[0].ai_system_name == ""
    assert out.ideas[0].submitted_by.user_name == "Unknown User"
