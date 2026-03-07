"""
Tests for RPA serializers/schemas
"""

import pytest
from uuid import uuid4
from datetime import datetime
from pydantic import ValidationError

from serializers.rpa_schemas import QueueJobInfo, RPAJobResponse, BatchProcessResponse, RPAJobRequest, AutomationResult


class TestQueueJobInfo:
    """Test cases for QueueJobInfo schema"""

    def test_queue_job_info_valid(self):
        """Test creating valid QueueJobInfo"""
        submission_id = uuid4()
        form_schema_id = uuid4()
        rpa_status_id = uuid4()

        job = QueueJobInfo(
            rpa_status_id=rpa_status_id,
            submission_id=submission_id,
            form_schema_id=form_schema_id,
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        assert job.rpa_status_id == rpa_status_id
        assert job.submission_id == submission_id
        assert job.form_schema_id == form_schema_id
        assert job.form_type == "ai-registry-form"
        assert isinstance(job.created_at, datetime)

    def test_queue_job_info_missing_fields(self):
        """Test QueueJobInfo with missing required fields"""
        with pytest.raises(ValidationError):
            QueueJobInfo(rpa_status_id=1)


class TestRPAJobResponse:
    """Test cases for RPAJobResponse schema"""

    def test_rpa_job_response_success(self):
        """Test creating successful RPAJobResponse"""
        submission_id = str(uuid4())

        response = RPAJobResponse(
            success=True,
            message="Form submitted successfully",
            submission_id=submission_id,
            status="completed",
            filled_questions=10,
            total_questions=10,
        )

        assert response.success is True
        assert response.message == "Form submitted successfully"
        assert response.submission_id == submission_id
        assert response.status == "completed"

    def test_rpa_job_response_failure(self):
        """Test creating failed RPAJobResponse"""
        submission_id = str(uuid4())

        response = RPAJobResponse(
            success=False,
            message="Form submission failed",
            submission_id=submission_id,
            status="failed",
            error_details="Browser automation error",
        )

        assert response.success is False
        assert response.error_details == "Browser automation error"

    def test_rpa_job_response_optional_fields(self):
        """Test RPAJobResponse with optional fields"""
        submission_id = str(uuid4())

        response = RPAJobResponse(
            success=True,
            message="Success",
            submission_id=submission_id,
            filled_questions=5,
            total_questions=10,
            status="completed",
        )

        assert response.filled_questions == 5
        assert response.total_questions == 10


class TestBatchProcessResponse:
    """Test cases for BatchProcessResponse schema"""

    def test_batch_process_response_valid(self):
        """Test creating valid BatchProcessResponse"""
        response = BatchProcessResponse(
            success=True, message="Processed 5 jobs", processed_count=5, success_count=4, failed_count=1
        )

        assert response.success is True
        assert response.processed_count == 5
        assert response.success_count == 4
        assert response.failed_count == 1

    def test_batch_process_response_no_jobs(self):
        """Test BatchProcessResponse with no jobs processed"""
        response = BatchProcessResponse(
            success=True, message="No jobs to process", processed_count=0, success_count=0, failed_count=0
        )

        assert response.processed_count == 0
        assert response.success_count == 0

    def test_batch_process_response_with_results(self):
        """Test BatchProcessResponse with job results"""
        job_results = [
            RPAJobResponse(success=True, message="Success", submission_id=str(uuid4()), status="completed"),
            RPAJobResponse(success=False, message="Failed", submission_id=str(uuid4()), status="failed"),
        ]

        response = BatchProcessResponse(
            success=True,
            message="Batch complete",
            processed_count=2,
            success_count=1,
            failed_count=1,
            results=job_results,
        )

        assert len(response.results) == 2
        assert response.results[0].success is True
        assert response.results[1].success is False


class TestAutomationResult:
    """Test cases for AutomationResult schema"""

    def test_automation_result_success(self):
        """Test creating successful AutomationResult"""
        result = AutomationResult(
            success=True, message="Automation completed", matched_count=10, skipped_count=2, failed_count=0
        )

        assert result.success is True
        assert result.matched_count == 10
        assert result.skipped_count == 2
        assert result.failed_count == 0

    def test_automation_result_with_failures(self):
        """Test AutomationResult with failures"""
        result = AutomationResult(
            success=False, message="Partial failure", matched_count=8, skipped_count=1, failed_count=3
        )

        assert result.success is False
        assert result.failed_count == 3


class TestRPAJobRequest:
    """Test cases for RPAJobRequest schema"""

    def test_rpa_job_request_valid(self):
        """Test creating valid RPAJobRequest"""
        submission_id = str(uuid4())

        request = RPAJobRequest(submission_id=submission_id, email="test@example.com", form_type="ai-registry-form")

        assert request.submission_id == submission_id
        assert request.email == "test@example.com"
        assert request.form_type == "ai-registry-form"

    def test_rpa_job_request_with_form_id(self):
        """Test RPAJobRequest with optional form_id"""
        submission_id = str(uuid4())

        request = RPAJobRequest(
            submission_id=submission_id, email="test@example.com", form_type="ai-registry-form", form_id="form-123"
        )

        assert request.form_id == "form-123"
        assert request.submission_id == submission_id
        assert request.form_type == "ai-registry-form"
