import uuid
from data_service.models.sage_ai_rpa_status import SageAIRPAStatus


def test_rpa_status_defaults_and_fields():
    obj = SageAIRPAStatus(
        submission_id=uuid.uuid4(),
        form_schema_id=uuid.uuid4(),
        status="pending",
        filled_questions=2,
        total_questions=5,
        error_message=None,
    )
    assert obj.status == "pending"
    assert obj.filled_questions == 2
    assert obj.total_questions == 5
    # Primary key default assigned on flush; should be None pre-flush
    assert obj.id is None
    # Simulate assignment (what SQLAlchemy would do)
    new_id = uuid.uuid4()
    obj.id = new_id
    assert obj.id == new_id
    assert hasattr(obj, "created_at")
    assert hasattr(obj, "updated_at")
