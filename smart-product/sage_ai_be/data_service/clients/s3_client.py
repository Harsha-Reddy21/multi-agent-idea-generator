"""
S3 Client Module
================
Handles all AWS S3 operations and connectivity checks.
"""

from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import logging

import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
from data_service.configurations.settings import settings

logger = logging.getLogger(__name__)


class S3Client:
    """Client for AWS S3 operations"""

    def __init__(self):
        self.s3_client = boto3.client("s3")
        self.bucket = settings.s3_bucket
        self.prefix = settings.s3_prefix

    def check_access(self, bucket: str = None, prefix: str = None) -> Dict[str, Any]:
        """
        Test S3 access and connectivity

        Args:
            bucket: S3 bucket name (optional, uses default if not provided)
            prefix: S3 prefix/path (optional, uses default if not provided)

        Returns:
            Dictionary with access status and details

        Raises:
            Boto3 exceptions (NoCredentialsError, ClientError, etc.)
        """
        bucket = bucket or self.bucket
        prefix = prefix or self.prefix

        self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=1)
        return {
            "status": "success",
            "bucket": bucket,
            "prefix": prefix,
            "accessible": True,
        }

    def list_objects(self, max_keys: int = 10) -> Dict[str, Any]:
        """
        List objects in the S3 bucket

        Args:
            max_keys: Maximum number of objects to return

        Returns:
            Dictionary with list of objects and count

        Raises:
            Boto3 exceptions (ClientError, etc.)
        """
        response = self.s3_client.list_objects_v2(
            Bucket=self.bucket, Prefix=self.prefix, MaxKeys=max_keys
        )
        objects = [obj["Key"] for obj in response.get("Contents", [])]
        return {"status": "success", "objects": objects, "count": len(objects)}

    async def upload_file(
        self, file: UploadFile, custom_key: str = None
    ) -> Dict[str, Any]:
        """
        Upload a file to S3

        Args:
            file: The file to upload
            custom_key: Optional custom S3 key, if not provided will use filename

        Returns:
            Dict with upload details (s3_key, bucket, size, content_type, upload_timestamp)

        Raises:
            Boto3 exceptions (ClientError, etc.)
        """
        if custom_key:
            s3_key = f"{self.prefix}{custom_key}/{file.filename}"
        else:
            s3_key = f"{self.prefix}{file.filename}"

        # Read file content
        content = await file.read()

        # Reset file pointer for potential future reads
        await file.seek(0)

        # Upload to S3
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=s3_key,
            Body=content,
            ContentType=file.content_type,
            Metadata={
                "original_filename": file.filename or "unknown",
                "uploaded_by": "sage-ai-backend",
                "file_size": str(len(content)),
                "upload_timestamp": datetime.now().isoformat(),
            },
        )

        logger.info(
            "Successfully uploaded file to S3: %s (size: %d bytes)",
            s3_key,
            len(content),
        )

        return {
            "s3_key": s3_key,
            "bucket": self.bucket,
            "size": len(content),
            "content_type": file.content_type,
            "upload_timestamp": datetime.now().isoformat(),
        }

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        """
        Generate a pre-signed URL for accessing a file in S3

        Args:
            s3_key: The S3 object key (path)
            expiration: URL expiration time in seconds (default: 3600 = 1 hour)

        Returns:
            Pre-signed URL string

        Raises:
            Boto3 exceptions (ClientError, etc.)
        """
        presigned_url = self.s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": s3_key,
                "ResponseContentDisposition": "inline",  # For preview in browser
            },
            ExpiresIn=expiration,
        )

        logger.info("Generated presigned URL for S3 key: %s", s3_key)
        return presigned_url

    def get_upload_config(self) -> Dict[str, Any]:
        """
        Get current file upload configuration

        Returns:
            Dict with upload configuration details
        """
        return {
            "allowed_extensions": settings.upload_allowed_extensions,
            "allowed_mime_types": settings.upload_allowed_mime_types,
            "max_file_size_mb": settings.upload_max_file_size / (1024 * 1024),
            "upload_s3_prefix": settings.upload_s3_prefix,
            "s3_bucket": self.bucket,
        }

    def download_file(
        self, s3_key: str, local_path: str, s3_bucket: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Download a file from S3 to local filesystem.

        Args:
            s3_key: The S3 object key (path) to download
            local_path: Local file path where the file should be saved
            s3_bucket: Optional bucket name (uses default if not provided)

        Returns:
            Dict with download details (s3_key, bucket, local_path, size, download_timestamp)

        Raises:
            Boto3 exceptions (ClientError, OSError, etc.)
        """
        bucket = s3_bucket or self.bucket
        local_file = Path(local_path)

        # Create parent directories if they don't exist
        local_file.parent.mkdir(parents=True, exist_ok=True)

        # Download the file
        self.s3_client.download_file(bucket, s3_key, str(local_file))

        # Get file size
        file_size = local_file.stat().st_size

        logger.info(
            "Successfully downloaded file from S3: %s to %s (size: %d bytes)",
            s3_key,
            local_path,
            file_size,
        )

        return {
            "s3_key": s3_key,
            "bucket": bucket,
            "local_path": str(local_file),
            "size": file_size,
            "download_timestamp": datetime.now().isoformat(),
        }

    def file_exists(self, s3_key: str, bucket: Optional[str] = None) -> bool:
        """
        Check if a file exists in S3.

        Args:
            s3_key: The S3 object key (path) to check
            bucket: Optional bucket name (uses default if not provided)

        Returns:
            True if file exists, False otherwise

        Raises:
            Boto3 exceptions (ClientError for non-404 errors)
        """
        bucket = bucket or self.bucket

        try:
            self.s3_client.head_object(Bucket=bucket, Key=s3_key)
            return True
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code in ["404", "NoSuchKey"]:
                return False
            # Other errors should be raised
            raise

    def get_file_metadata(
        self, s3_key: str, bucket: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get metadata for a file in S3.

        Args:
            s3_key: The S3 object key (path)
            bucket: Optional bucket name (uses default if not provided)

        Returns:
            Dict with file metadata (s3_key, bucket, size, content_type, last_modified, metadata)

        Raises:
            Boto3 exceptions (ClientError, etc.)
        """
        bucket = bucket or self.bucket

        response = self.s3_client.head_object(Bucket=bucket, Key=s3_key)

        return {
            "s3_key": s3_key,
            "bucket": bucket,
            "size": response.get("ContentLength", 0),
            "content_type": response.get("ContentType", "unknown"),
            "last_modified": (
                response.get("LastModified").isoformat()
                if response.get("LastModified")
                else None
            ),
            "metadata": response.get("Metadata", {}),
        }


# Singleton instance
s3_client = S3Client()
