import pytest
from types import SimpleNamespace

from data_service.utils.error_utils import handle_service_exception
from sqlalchemy.exc import OperationalError, SQLAlchemyError
import httpx
import requests


class DummyError(Exception):
    def __init__(self, error, message, status_code):
        self.error = error
        self.message = message
        self.status_code = status_code


def test_handle_operational_error_maps_to_503():
    with pytest.raises(DummyError) as exc:
        handle_service_exception(
            OperationalError("op", None, None), DummyError, "saving data"
        )
    assert exc.value.status_code == 503
    assert "Database is temporarily unavailable" in exc.value.message


def test_handle_sqlalchemy_error_maps_to_500():
    with pytest.raises(DummyError) as exc:
        handle_service_exception(SQLAlchemyError("db"), DummyError, "querying data")
    assert exc.value.status_code == 500


def test_handle_value_error_maps_to_400():
    with pytest.raises(DummyError) as exc:
        handle_service_exception(ValueError("bad"), DummyError, "parsing payload")
    assert exc.value.status_code == 400


class DummyResponse:
    def __init__(self, status_code, text="msg"):
        self.status_code = status_code
        self.text = text


class DummyHTTPStatusError(httpx.HTTPStatusError):
    def __init__(self, response):
        self.response = response
        super().__init__("status", request=None, response=response)


@pytest.mark.parametrize(
    "code,expected_status", [(401, 401), (403, 403), (404, 404), (400, 400), (500, 503)]
)
def test_handle_http_status_error_maps_codes(code, expected_status):
    err = DummyHTTPStatusError(DummyResponse(code))
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "calling external")
    assert exc.value.status_code == expected_status


def test_handle_timeout_maps_to_504():
    with pytest.raises(DummyError) as exc:
        handle_service_exception(
            httpx.TimeoutException("timeout"), DummyError, "calling external"
        )
    assert exc.value.status_code == 504


def test_handle_request_error_maps_to_503():
    with pytest.raises(DummyError) as exc:
        handle_service_exception(
            httpx.RequestError("net"), DummyError, "calling external"
        )
    assert exc.value.status_code == 503
    with pytest.raises(DummyError) as exc2:
        handle_service_exception(
            requests.RequestException("net"), DummyError, "calling external"
        )
    assert exc2.value.status_code == 503


def test_handle_unexpected_error_maps_to_500():
    class Custom(Exception):
        pass

    with pytest.raises(DummyError) as exc:
        handle_service_exception(Custom("boom"), DummyError, "doing work")
    assert exc.value.status_code == 500


# --- AWS Exception Tests ---
from botocore.exceptions import (
    ClientError,
    NoCredentialsError,
    PartialCredentialsError,
    EndpointConnectionError,
)


def test_handle_no_credentials_error_maps_to_401():
    """Test NoCredentialsError maps to 401."""
    with pytest.raises(DummyError) as exc:
        handle_service_exception(NoCredentialsError(), DummyError, "S3 access")
    assert exc.value.status_code == 401
    assert exc.value.error == "Authentication Error"


def test_handle_partial_credentials_error_maps_to_401():
    """Test PartialCredentialsError maps to 401."""
    err = PartialCredentialsError(provider="test", cred_var="AWS_SECRET")
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "S3 access")
    assert exc.value.status_code == 401


def test_handle_endpoint_connection_error_maps_to_503():
    """Test EndpointConnectionError maps to 503."""
    err = EndpointConnectionError(endpoint_url="http://s3.example.com")
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "S3 connect")
    assert exc.value.status_code == 503
    assert exc.value.error == "Connection Error"


def test_handle_client_error_access_denied_maps_to_403():
    """Test ClientError with AccessDenied maps to 403."""
    err = ClientError(
        error_response={"Error": {"Code": "AccessDenied", "Message": "Denied"}},
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "downloading file")
    assert exc.value.status_code == 403
    assert exc.value.error == "Access Denied"


def test_handle_client_error_403_maps_to_403():
    """Test ClientError with 403 code maps to 403."""
    err = ClientError(
        error_response={"Error": {"Code": "403", "Message": "Forbidden"}},
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "downloading file")
    assert exc.value.status_code == 403


def test_handle_client_error_no_such_key_maps_to_404():
    """Test ClientError with NoSuchKey maps to 404."""
    err = ClientError(
        error_response={"Error": {"Code": "NoSuchKey", "Message": "Not found"}},
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "fetching file")
    assert exc.value.status_code == 404
    assert exc.value.error == "Not Found"


def test_handle_client_error_404_maps_to_404():
    """Test ClientError with 404 code maps to 404."""
    err = ClientError(
        error_response={"Error": {"Code": "404", "Message": "Not found"}},
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "fetching file")
    assert exc.value.status_code == 404


def test_handle_client_error_no_such_bucket_maps_to_404():
    """Test ClientError with NoSuchBucket maps to 404."""
    err = ClientError(
        error_response={
            "Error": {"Code": "NoSuchBucket", "Message": "Bucket not found"}
        },
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "accessing bucket")
    assert exc.value.status_code == 404


def test_handle_client_error_other_maps_to_503():
    """Test ClientError with other codes maps to 503."""
    err = ClientError(
        error_response={"Error": {"Code": "InternalError", "Message": "Error"}},
        operation_name="GetObject",
    )
    with pytest.raises(DummyError) as exc:
        handle_service_exception(err, DummyError, "S3 operation")
    assert exc.value.status_code == 503
    assert exc.value.error == "S3 Error"
