import pytest
from io import BytesIO

from data_service.utils.file_validator import FileValidator


class DummyUpload:
    def __init__(self, filename, content_type, size=None):
        self.filename = filename
        self.content_type = content_type
        self.size = size
        self.file = BytesIO(b"test")
        self.headers = {}


@pytest.fixture
def validator():
    return FileValidator()


def test_validate_file_success(validator):
    f = DummyUpload("doc.pdf", "application/pdf", size=1024)
    result = validator.validate_file(f)
    assert result["valid"] is True
    assert result["file_info"]["extension"] == ".pdf"


def test_validate_file_missing_filename(validator):
    f = DummyUpload("", "application/pdf", size=10)
    result = validator.validate_file(f)
    assert result == {"valid": False, "error": "File must have a filename"}


def test_validate_file_bad_extension(validator):
    f = DummyUpload("doc.exe", "application/pdf", size=10)
    result = validator.validate_file(f)
    assert result["valid"] is False
    assert "not allowed" in result["error"]


def test_validate_file_bad_mime(validator):
    f = DummyUpload("doc.pdf", "application/zip", size=10)
    result = validator.validate_file(f)
    assert result["valid"] is False
    assert "MIME type" in result["error"]


def test_validate_file_too_large(monkeypatch):
    monkeypatch.setattr(
        "data_service.configurations.settings.settings.upload_max_file_size", 5
    )
    validator = FileValidator()  # re-init to pick up patched size
    f = DummyUpload("doc.pdf", "application/pdf", size=10)
    result = validator.validate_file(f)
    assert result["valid"] is False
    assert "exceeds" in result["error"]


def test_get_file_info(validator):
    f = DummyUpload("doc.pdf", "application/pdf", size=10)
    info = validator.get_file_info(f)
    assert info["filename"] == "doc.pdf"
    assert info["extension"] == ".pdf"
    assert info["content_type"] == "application/pdf"


def test_validate_file_with_exception(validator, monkeypatch):
    """Test handling of exceptions during validation."""
    f = DummyUpload("doc.pdf", "application/pdf", size=10)

    # Make os.path.splitext raise an exception
    import os

    original_splitext = os.path.splitext

    def failing_splitext(path):
        raise ValueError("Splitext error")

    monkeypatch.setattr(os.path, "splitext", failing_splitext)

    result = validator.validate_file(f)
    assert result["valid"] is False
    assert "Validation error" in result["error"]


def test_get_file_info_no_filename(validator):
    """Test get_file_info with no filename."""
    f = DummyUpload("", "application/pdf", size=10)
    f.filename = None

    info = validator.get_file_info(f)
    assert info["filename"] is None
    assert info["extension"] == ""
