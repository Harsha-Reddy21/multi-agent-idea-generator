import pytest
from data_service.utils.error_handling import handle_error, raise_custom_error

# handle_error currently logs via app_logger.logging.error; just assert returned dict.


def test_handle_error_returns_standard_dict():
    err = ValueError("Boom")
    resp = handle_error(err)
    assert resp == {"success": False, "error": "Boom"}


def test_raise_custom_error():
    with pytest.raises(Exception) as exc:
        raise_custom_error("Custom message")
    assert str(exc.value) == "Custom message"
