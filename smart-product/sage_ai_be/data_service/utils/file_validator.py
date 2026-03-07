"""
File Validation Utilities
Provides validation functions for uploaded files including type, size, and content validation.
"""

import os
from typing import Dict, Any

from fastapi import UploadFile
from data_service.configurations.settings import settings


class FileValidator:
    """Validator class for file upload validation"""

    def __init__(self):
        self.max_file_size = settings.upload_max_file_size
        self.allowed_extensions = settings.upload_allowed_extensions
        self.allowed_mime_types = settings.upload_allowed_mime_types

    def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """
        Validate an uploaded file

        Args:
            file: The uploaded file to validate

        Returns:
            Dict with validation result and error details if any
        """
        try:
            # Check if file exists and has a filename
            if not file.filename:
                return {"valid": False, "error": "File must have a filename"}

            # Check file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in self.allowed_extensions:
                return {
                    "valid": False,
                    "error": f"File extension '{file_extension}' not allowed. "
                    f"Allowed: {', '.join(self.allowed_extensions)}",
                }

            # Check MIME type
            if file.content_type not in self.allowed_mime_types:
                return {
                    "valid": False,
                    "error": f"MIME type '{file.content_type}' not allowed. "
                    f"Allowed: {', '.join(self.allowed_mime_types)}",
                }

            # Check file size
            if hasattr(file, "size") and file.size:
                if file.size > self.max_file_size:
                    max_size_mb = self.max_file_size / (1024 * 1024)
                    actual_size_mb = file.size / (1024 * 1024)
                    return {
                        "valid": False,
                        "error": f"File size ({actual_size_mb:.1f}MB) "
                        f"exceeds maximum allowed size ({max_size_mb:.1f}MB)",
                    }

            return {
                "valid": True,
                "message": "File validation passed",
                "file_info": {
                    "filename": file.filename,
                    "extension": file_extension,
                    "content_type": file.content_type,
                    "size": getattr(file, "size", None),
                },
            }

        except Exception as e:
            return {"valid": False, "error": f"Validation error: {str(e)}"}

    @staticmethod
    def get_file_info(file: UploadFile) -> Dict[str, Any]:
        """
        Get detailed information about a file

        Args:
            file: The uploaded file

        Returns:
            Dict with file information
        """
        file_extension = (
            os.path.splitext(file.filename)[1].lower() if file.filename else ""
        )

        return {
            "filename": file.filename,
            "extension": file_extension,
            "content_type": file.content_type,
            "size": getattr(file, "size", None),
            "headers": dict(file.headers) if hasattr(file, "headers") else {},
        }
