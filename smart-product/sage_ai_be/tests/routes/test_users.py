import pytest
from datetime import datetime
from data_service.serializers.users import UserInfoResponse


@pytest.mark.anyio
async def test_get_user_info_route_success(client, monkeypatch):
    from data_service.service.users import UsersService

    async def mock_get_user_info(
        self, x_user_email, x_user_name, x_user_department, x_user_title
    ):
        return UserInfoResponse(
            id="12345678-1234-1234-1234-123456789012",
            name=x_user_name or "Test User",
            email=x_user_email,
            role="submitter",
            is_active=True,
            created_at=datetime.utcnow(),
            anyIdeasSubmitted="No",
            department=x_user_department,
            title=x_user_title,
        )

    monkeypatch.setattr(UsersService, "get_user_info", mock_get_user_info)

    headers = {
        "X-WEBAUTH-EMAIL": "test@example.com",
        "X-USER-NAME": "Tester",
        "X-USER-DEPARTMENT": "Engineering",
        "X-USER-TITLE": "Dev",
    }
    resp = await client.get("/api/users/user_info", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert data["anyIdeasSubmitted"] == "No"
    assert data["department"] == "Engineering"
    assert data["title"] == "Dev"


@pytest.mark.anyio
async def test_get_user_info_route_error(client, monkeypatch):
    from fastapi import HTTPException
    from data_service.service.users import UsersService

    async def mock_get_user_info(*args, **kwargs):  # noqa: D401
        raise HTTPException(
            status_code=500, detail="Database error while fetching user"
        )

    monkeypatch.setattr(UsersService, "get_user_info", mock_get_user_info)

    headers = {"X-WEBAUTH-EMAIL": "err@example.com"}
    resp = await client.get("/api/users/user_info", headers=headers)
    assert resp.status_code == 500
    data = resp.json()
    # FastAPI uses 'detail' for HTTPException
    assert data.get("detail") == "Database error while fetching user"
