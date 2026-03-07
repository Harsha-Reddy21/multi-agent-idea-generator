import uuid
from datetime import datetime
from data_service.serializers.users import UserRead, UserInfoResponse, ErrorResponse


def test_user_read_from_attributes():
    # Simulate ORM object-like source
    class Obj:
        def __init__(self):
            self.id = uuid.uuid4()
            self.name = "Alice"
            self.email = "alice@example.com"
            self.role = "admin"
            self.is_active = True
            self.created_at = datetime(2025, 1, 1)

    src = Obj()
    model = UserRead.model_validate(src)
    dumped = model.model_dump()
    assert dumped["name"] == "Alice"
    assert dumped["email"] == "alice@example.com"
    assert dumped["role"] == "admin"
    assert dumped["is_active"] is True


def test_user_info_response_optional_fields():
    uid = uuid.uuid4()
    base = UserRead(
        id=uid,
        name="Bob",
        email="bob@example.com",
        role="user",
        is_active=False,
        created_at=datetime(2025, 2, 2),
    )
    info = UserInfoResponse(
        **base.model_dump(),
        anyIdeasSubmitted="yes",
        department="R&D",
        title="Engineer",
    )
    assert info.department == "R&D"
    assert info.title == "Engineer"
    assert info.anyIdeasSubmitted == "yes"


def test_error_response_serialization():
    err = ErrorResponse(error="Validation Error", message="Bad input", status_code=400)
    dumped = err.model_dump()
    assert dumped["status_code"] == 400
    assert dumped["error"] == "Validation Error"
