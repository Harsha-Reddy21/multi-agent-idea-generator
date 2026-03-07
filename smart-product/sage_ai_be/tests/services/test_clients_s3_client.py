"""
S3Client tests
==============
Tests for S3 client operations.

The actual S3Client implementation raises exceptions on errors rather than
returning wrapped response dicts. Tests are written to match this behavior.
"""

import asyncio
import pytest
from botocore.exceptions import ClientError

from data_service.clients.s3_client import S3Client


class FakeBotoClient:
    """Fake boto3 S3 client for testing."""

    def __init__(self, list_response=None, put_error=None, presign_error=None):
        self._list_response = list_response or {"Contents": []}
        self._put_error = put_error
        self._presign_error = presign_error
        self.put_calls = []
        self.presign_calls = []

    def list_objects_v2(self, **kwargs):
        if isinstance(self._list_response, Exception):
            raise self._list_response
        return self._list_response

    def put_object(self, **kwargs):
        if self._put_error:
            raise self._put_error
        self.put_calls.append(kwargs)
        return {"ETag": "123"}

    def generate_presigned_url(self, *args, **kwargs):
        if self._presign_error:
            raise self._presign_error
        self.presign_calls.append((args, kwargs))
        return "https://example.com/presigned"


class FakeSettings:
    s3_bucket = "bucket"
    s3_prefix = "prefix/"
    upload_allowed_extensions = ["pdf", "txt"]
    upload_allowed_mime_types = ["application/pdf", "text/plain"]
    upload_max_file_size = 5 * 1024 * 1024
    upload_s3_prefix = "uploads/"


@pytest.fixture(autouse=True)
def patch_settings(monkeypatch):
    monkeypatch.setattr("data_service.clients.s3_client.settings", FakeSettings)


class FakeUploadFile:
    """Fake FastAPI UploadFile for testing."""

    def __init__(self, filename, content, content_type="application/pdf"):
        self.filename = filename
        self._content = content
        self.content_type = content_type

    async def read(self):
        return self._content

    async def seek(self, _pos):
        return None


def run(coro):
    """Helper to run async coroutines."""
    return asyncio.run(coro)


def test_upload_file_success(monkeypatch):
    """Test successful file upload returns expected metadata."""
    fake_boto = FakeBotoClient()
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    file = FakeUploadFile("doc.pdf", b"12345", "application/pdf")
    res = run(client.upload_file(file))
    # Actual implementation returns metadata, not success flag
    assert res["size"] == 5
    assert res["s3_key"].startswith("prefix/doc.pdf")
    assert res["bucket"] == "bucket"
    assert fake_boto.put_calls[0]["Key"].startswith("prefix/doc.pdf")


def test_upload_file_with_custom_key(monkeypatch):
    """Test file upload with custom key prefix."""
    fake_boto = FakeBotoClient()
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    file = FakeUploadFile("doc.pdf", b"12345", "application/pdf")
    res = run(client.upload_file(file, custom_key="custom"))
    assert "custom" in res["s3_key"]
    assert res["s3_key"] == "prefix/custom/doc.pdf"


def test_upload_file_client_error(monkeypatch):
    """Test that ClientError is raised on S3 access denial."""
    error = ClientError({"Error": {"Code": "AccessDenied"}}, "PutObject")
    fake_boto = FakeBotoClient(put_error=error)
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    file = FakeUploadFile("doc.pdf", b"12345")
    # Actual implementation raises exception
    with pytest.raises(ClientError) as exc_info:
        run(client.upload_file(file))
    assert exc_info.value.response["Error"]["Code"] == "AccessDenied"


def test_upload_file_generic_error(monkeypatch):
    """Test that generic errors propagate as exceptions."""
    fake_boto = FakeBotoClient()
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()

    class BadFile:
        """File-like object that will cause AttributeError."""

        pass

    bad = BadFile()
    # Actual implementation raises the underlying exception
    with pytest.raises(AttributeError):
        run(client.upload_file(bad))  # type: ignore


def test_check_access_success(monkeypatch):
    """Test successful S3 access check."""
    fake_boto = FakeBotoClient(list_response={"Contents": []})
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    res = client.check_access()
    assert res["accessible"] is True
    assert res["status"] == "success"


def test_check_access_error(monkeypatch):
    """Test that S3 access errors raise ClientError."""
    error = ClientError({"Error": {"Code": "NoSuchBucket"}}, "ListObjectsV2")
    fake_boto = FakeBotoClient(list_response=error)
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    # Actual implementation raises exception
    with pytest.raises(ClientError) as exc_info:
        client.check_access(bucket="bad")
    assert exc_info.value.response["Error"]["Code"] == "NoSuchBucket"


def test_list_objects_success(monkeypatch):
    """Test successful object listing."""
    contents = {"Contents": [{"Key": "prefix/a.txt"}, {"Key": "prefix/b.txt"}]}
    fake_boto = FakeBotoClient(list_response=contents)
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    res = client.list_objects()
    assert res["status"] == "success"
    assert res["count"] == 2
    assert "prefix/a.txt" in res["objects"]


def test_list_objects_client_error(monkeypatch):
    """Test that list objects errors raise ClientError."""
    error = ClientError({"Error": {"Code": "Throttling"}}, "ListObjectsV2")
    fake_boto = FakeBotoClient(list_response=error)
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    # Actual implementation raises exception
    with pytest.raises(ClientError) as exc_info:
        client.list_objects()
    assert exc_info.value.response["Error"]["Code"] == "Throttling"


def test_generate_presigned_url_success(monkeypatch):
    """Test successful presigned URL generation."""
    fake_boto = FakeBotoClient()
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    # Actual implementation returns URL string directly
    res = client.generate_presigned_url("prefix/doc.pdf")
    assert res == "https://example.com/presigned"


def test_generate_presigned_url_client_error(monkeypatch):
    """Test that presigned URL errors raise ClientError."""
    error = ClientError({"Error": {"Code": "ExpiredToken"}}, "GeneratePresignedUrl")
    fake_boto = FakeBotoClient(presign_error=error)
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    # Actual implementation raises exception
    with pytest.raises(ClientError) as exc_info:
        client.generate_presigned_url("prefix/doc.pdf")
    assert exc_info.value.response["Error"]["Code"] == "ExpiredToken"


def test_generate_presigned_url_generic_error(monkeypatch):
    """Test that generic errors propagate as exceptions."""
    fake_boto = FakeBotoClient(presign_error=RuntimeError("boom"))
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    with pytest.raises(RuntimeError) as exc_info:
        client.generate_presigned_url("prefix/doc.pdf")
    assert str(exc_info.value) == "boom"


def test_get_upload_config(monkeypatch):
    """Test upload config retrieval."""
    fake_boto = FakeBotoClient()
    monkeypatch.setattr(
        "data_service.clients.s3_client.boto3.client", lambda name: fake_boto
    )
    client = S3Client()
    cfg = client.get_upload_config()
    assert cfg["s3_bucket"] == "bucket"
    assert cfg["allowed_extensions"] == ["pdf", "txt"]
