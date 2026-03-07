"""
Tests for RPAHandler class
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from handlers.rpa_handler import RPAHandler
from serializers.rpa_schemas import BatchProcessResponse, RPAJobResponse, QueueJobInfo


class TestRPAHandler:
    """Test cases for RPAHandler"""

    @pytest.mark.asyncio
    async def test_process_queue_no_jobs(self):
        """Test processing queue with no pending jobs"""
        handler = RPAHandler()

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[])
            mock_service.return_value = mock_instance

            result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

            assert result.success is True
            assert result.processed_count == 0
            assert result.success_count == 0
            assert result.failed_count == 0
            assert "No pending jobs" in result.message

    @pytest.mark.asyncio
    async def test_process_queue_successful_job(self, sample_queue_job):
        """Test processing queue with successful job"""
        handler = RPAHandler()

        mock_job_response = RPAJobResponse(
            success=True,
            message="Form submitted successfully",
            submission_id=str(sample_queue_job.submission_id),
            status="completed",
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[sample_queue_job])
            mock_service.return_value = mock_instance

            with patch.object(handler, "_process_queue_job", new=AsyncMock(return_value=mock_job_response)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True
                assert result.processed_count == 1
                assert result.success_count == 1
                assert result.failed_count == 0

    @pytest.mark.asyncio
    async def test_process_queue_failed_job(self, sample_queue_job):
        """Test processing queue with failed job"""
        handler = RPAHandler()

        mock_job_response = RPAJobResponse(
            success=False,
            message="Form submission failed",
            submission_id=str(sample_queue_job.submission_id),
            status="failed",
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[sample_queue_job])
            mock_service.return_value = mock_instance

            with patch.object(handler, "_process_queue_job", new=AsyncMock(return_value=mock_job_response)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True  # Batch processing succeeded even if individual job failed
                assert result.processed_count == 1
                assert result.success_count == 0
                assert result.failed_count == 1

    @pytest.mark.asyncio
    async def test_process_queue_multiple_jobs(self, sample_queue_job, sample_submission_id, sample_form_schema_id):
        """Test processing queue with multiple jobs"""
        from datetime import datetime

        handler = RPAHandler()

        # Create multiple jobs
        job1 = sample_queue_job
        job2 = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=sample_submission_id,
            form_schema_id=sample_form_schema_id,
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        mock_responses = [
            RPAJobResponse(
                success=True, message="Success 1", submission_id=str(job1.submission_id), status="completed"
            ),
            RPAJobResponse(success=False, message="Failed 2", submission_id=str(job2.submission_id), status="failed"),
        ]

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[job1, job2])
            mock_service.return_value = mock_instance

            with patch.object(handler, "_process_queue_job", new=AsyncMock(side_effect=mock_responses)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True
                assert result.processed_count == 2
                assert result.success_count == 1
                assert result.failed_count == 1

    @pytest.mark.asyncio
    async def test_process_queue_service_error(self, sample_queue_job):
        """Test processing queue handles service errors"""
        from exceptions import FormAutomationServiceError

        handler = RPAHandler()

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[sample_queue_job])
            mock_service.return_value = mock_instance

            error = FormAutomationServiceError(error="Test Error", message="Test error", status_code=500)
            with patch.object(handler, "_process_queue_job", new=AsyncMock(side_effect=error)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True  # Batch process continues despite errors
                assert result.processed_count == 1
                assert result.failed_count == 1


"""
Additional tests for RPAHandler to increase coverage
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime

from handlers.rpa_handler import RPAHandler
from serializers.rpa_schemas import QueueJobInfo, RPAJobResponse
from exceptions import FormAutomationServiceError


class TestRPAHandlerExtended:
    """Extended test cases for RPAHandler"""

    @pytest.mark.asyncio
    async def test_process_queue_empty_form_types(self):
        """Test processing queue with empty form types list"""
        handler = RPAHandler()

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[])
            mock_service.return_value = mock_instance

            result = await handler.process_queue(form_types=[], limit=10)

            assert result.success is True
            assert result.processed_count == 0

    @pytest.mark.asyncio
    async def test_process_queue_large_limit(self):
        """Test processing queue with large limit"""
        handler = RPAHandler()

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[])
            mock_service.return_value = mock_instance

            result = await handler.process_queue(form_types=["ai-registry-form"], limit=1000)

            assert result.success is True

    @pytest.mark.asyncio
    async def test_process_queue_mixed_success_and_failures(self):
        """Test processing queue with mix of successes and failures"""
        handler = RPAHandler()

        # Create multiple jobs
        jobs = [
            QueueJobInfo(
                rpa_status_id=uuid4(),
                submission_id=uuid4(),
                form_schema_id=uuid4(),
                form_type="ai-registry-form",
                created_at=datetime.utcnow(),
            )
            for _ in range(5)
        ]

        # Mix of success and failure responses
        responses = [
            RPAJobResponse(
                success=True, message="Success", submission_id=str(jobs[0].submission_id), status="completed"
            ),
            RPAJobResponse(success=False, message="Failed", submission_id=str(jobs[1].submission_id), status="failed"),
            RPAJobResponse(
                success=True, message="Success", submission_id=str(jobs[2].submission_id), status="completed"
            ),
            RPAJobResponse(success=False, message="Failed", submission_id=str(jobs[3].submission_id), status="failed"),
            RPAJobResponse(
                success=True, message="Success", submission_id=str(jobs[4].submission_id), status="completed"
            ),
        ]

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=jobs)
            mock_service.return_value = mock_instance

            with patch.object(handler, "_process_queue_job", new=AsyncMock(side_effect=responses)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True
                assert result.processed_count == 5
                assert result.success_count == 3
                assert result.failed_count == 2

    @pytest.mark.asyncio
    async def test_process_queue_all_failures(self):
        """Test processing queue where all jobs fail"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        mock_response = RPAJobResponse(
            success=False, message="All failed", submission_id=str(job.submission_id), status="failed"
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[job])
            mock_service.return_value = mock_instance

            with patch.object(handler, "_process_queue_job", new=AsyncMock(return_value=mock_response)):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True  # Batch succeeded even though all jobs failed
                assert result.processed_count == 1
                assert result.success_count == 0
                assert result.failed_count == 1

    def test_handler_initialization(self):
        """Test RPAHandler initialization"""
        handler = RPAHandler()

        assert handler.logger is not None

    @pytest.mark.asyncio
    async def test_process_queue_job_success(self):
        """Test _process_queue_job with successful processing"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        mock_result = {
            "success": True,
            "message": "Form submitted successfully",
            "matched_count": 10,
            "total_questions": 15,
        }

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.process_rpa_job = AsyncMock(return_value=mock_result)
            mock_service.return_value = mock_instance

            result = await handler._process_queue_job(job)

            assert result.success is True
            assert result.filled_questions == 10
            assert result.total_questions == 15
            assert result.status == "completed"

    @pytest.mark.asyncio
    async def test_process_queue_job_failure(self):
        """Test _process_queue_job with failed processing"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        mock_result = {
            "success": False,
            "message": "Form submission failed",
            "matched_count": 5,
            "total_questions": 15,
            "error_details": "Timeout error",
        }

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.process_rpa_job = AsyncMock(return_value=mock_result)
            mock_service.return_value = mock_instance

            result = await handler._process_queue_job(job)

            assert result.success is False
            assert result.status == "failed"
            assert result.error_details == "Timeout error"

    @pytest.mark.asyncio
    async def test_process_queue_job_service_error(self):
        """Test _process_queue_job handling FormAutomationServiceError"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        error = FormAutomationServiceError(error="Database error", message="Failed to process job", status_code=500)

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.process_rpa_job = AsyncMock(side_effect=error)
            mock_service.return_value = mock_instance

            result = await handler._process_queue_job(job)

            assert result.success is False
            assert result.status == "failed"
            assert "Failed to process job" in result.message

    @pytest.mark.asyncio
    async def test_process_queue_job_unexpected_exception(self):
        """Test _process_queue_job handling unexpected exceptions"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.process_rpa_job = AsyncMock(side_effect=ValueError("Unexpected error"))
            mock_service.return_value = mock_instance

            result = await handler._process_queue_job(job)

            assert result.success is False
            assert result.status == "failed"
            assert "Unexpected error" in result.message

    @pytest.mark.asyncio
    async def test_process_queue_unexpected_exception(self):
        """Test process_queue handling unexpected exceptions"""
        handler = RPAHandler()

        job = QueueJobInfo(
            rpa_status_id=uuid4(),
            submission_id=uuid4(),
            form_schema_id=uuid4(),
            form_type="ai-registry-form",
            created_at=datetime.utcnow(),
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(return_value=[job])
            mock_service.return_value = mock_instance

            # Simulate unexpected exception during job processing
            with patch.object(handler, "_process_queue_job", new=AsyncMock(side_effect=Exception("Critical error"))):
                result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

                assert result.success is True  # Batch continues
                assert result.processed_count == 1
                assert result.failed_count == 1

    @pytest.mark.asyncio
    async def test_process_queue_get_jobs_service_error(self):
        """Test process_queue handling service error when getting jobs"""
        handler = RPAHandler()

        error = FormAutomationServiceError(
            error="Database connection failed", message="Could not fetch pending jobs", status_code=500
        )

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(side_effect=error)
            mock_service.return_value = mock_instance

            result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

            assert result.success is False
            assert "Could not fetch pending jobs" in result.message
            assert result.processed_count == 0

    @pytest.mark.asyncio
    async def test_process_queue_get_jobs_unexpected_error(self):
        """Test process_queue handling unexpected error when getting jobs"""
        handler = RPAHandler()

        with patch("handlers.rpa_handler.FormAutomationService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_pending_queue_jobs = AsyncMock(side_effect=RuntimeError("Critical failure"))
            mock_service.return_value = mock_instance

            result = await handler.process_queue(form_types=["ai-registry-form"], limit=10)

            assert result.success is False
            assert "Unexpected error" in result.message
            assert result.processed_count == 0
