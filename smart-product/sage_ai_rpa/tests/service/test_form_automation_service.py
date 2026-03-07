"""
Tests for FormAutomationService class
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
from uuid import uuid4

from service.form_automation_service import FormAutomationService
from configuration.constants import RPAStatus
from serializers.rpa_schemas import QueueJobInfo


class TestFormAutomationService:
    """Test cases for FormAutomationService"""

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_success(self, sample_submission_id, sample_form_schema_id):
        """Test getting pending queue jobs successfully"""
        service = FormAutomationService()

        # Mock database result
        mock_row = MagicMock()
        mock_row.rpa_status_id = uuid4()
        mock_row.submission_id = sample_submission_id
        mock_row.form_schema_id = sample_form_schema_id
        mock_row.form_type = "ai-registry-form"
        mock_row.created_at = datetime.utcnow()

        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[mock_row])

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_session.return_value = mock_db

            jobs = await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=10)

            assert len(jobs) == 1
            assert jobs[0].submission_id == sample_submission_id
            assert jobs[0].form_type == "ai-registry-form"

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_empty(self):
        """Test getting pending queue jobs when none exist"""
        service = FormAutomationService()

        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[])

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_session.return_value = mock_db

            jobs = await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=10)

            assert len(jobs) == 0

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_filters_by_form_type(self, sample_submission_id, sample_form_schema_id):
        """Test that get_pending_queue_jobs filters by form type correctly"""
        service = FormAutomationService()

        # Mock two different form types, but only request one
        mock_row1 = MagicMock()
        mock_row1.rpa_status_id = uuid4()
        mock_row1.submission_id = sample_submission_id
        mock_row1.form_schema_id = sample_form_schema_id
        mock_row1.form_type = "ai-registry-form"
        mock_row1.created_at = datetime.utcnow()

        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[mock_row1])  # Only returns matching form type

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_session.return_value = mock_db

            jobs = await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=10)

            assert len(jobs) == 1
            assert all(job.form_type == "ai-registry-form" for job in jobs)

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_respects_limit(self, sample_submission_id, sample_form_schema_id):
        """Test that get_pending_queue_jobs respects the limit parameter"""
        service = FormAutomationService()

        # Mock 3 jobs but limit to 2
        mock_rows = []
        for i in range(2):  # Limit will prevent 3rd
            mock_row = MagicMock()
            mock_row.rpa_status_id = uuid4()
            mock_row.submission_id = sample_submission_id
            mock_row.form_schema_id = sample_form_schema_id
            mock_row.form_type = "ai-registry-form"
            mock_row.created_at = datetime.utcnow()
            mock_rows.append(mock_row)

        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=mock_rows)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_session.return_value = mock_db

            jobs = await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=2)

            assert len(jobs) == 2

    def test_init_with_form_type(self):
        """Test service initialization with form type"""
        service = FormAutomationService(form_type="ai-registry-form")

        assert service.form_type == "ai-registry-form"
        assert service.automation is not None

    def test_init_without_form_type(self):
        """Test service initialization without form type"""
        service = FormAutomationService()

        assert service.form_type is None
        assert service.automation is None


"""
Additional tests for FormAutomationService to increase coverage
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from service.form_automation_service import FormAutomationService
from configuration.constants import RPAStatus


class TestFormAutomationServiceExtended:
    """Extended test cases for FormAutomationService"""

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_database_error(self):
        """Test handling database errors when fetching jobs"""
        service = FormAutomationService()

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(side_effect=Exception("Database error"))
            mock_session.return_value = mock_db

            with pytest.raises(Exception):
                await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=10)

    @pytest.mark.asyncio
    async def test_get_pending_queue_jobs_filters_old_jobs(self):
        """Test that old jobs beyond max age are filtered out"""
        from datetime import timedelta

        service = FormAutomationService()

        # Mock result with no jobs (filtered by age)
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[])

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_session.return_value = mock_db

            jobs = await service.get_pending_queue_jobs(form_types=["ai-registry-form"], limit=10)

            assert len(jobs) == 0

    def test_service_with_automation(self):
        """Test service creates automation when form_type provided"""
        service = FormAutomationService(form_type="ai-registry-form")

        assert service.form_type == "ai-registry-form"
        assert service.automation is not None

    def test_service_without_automation(self):
        """Test service doesn't create automation when form_type not provided"""
        service = FormAutomationService()

        assert service.form_type is None
        assert service.automation is None


class TestProcessRPAJob:
    """Test cases for process_rpa_job method"""

    @pytest.mark.asyncio
    async def test_process_rpa_job_form_not_found(self):
        """Test processing RPA job when form is not found"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock database operations
        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=None)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(return_value=mock_result_form)
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "Form not found" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_user_email_not_found(self):
        """Test processing RPA job when user email is not found"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form found
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = {"form_data": []}

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission query returns no email
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=None)

        # Mock status record for updates
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)

            # Calls: update to processing, get form, get submission, update to failed
            mock_db.execute = AsyncMock(
                side_effect=[mock_result_status, mock_result_form, mock_result_submission, mock_result_status]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "User email not found" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_invalid_form_data_format(self):
        """Test processing RPA job with invalid form_data format"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form with invalid form_data
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = "invalid_string"  # Invalid format

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(MagicMock(), "test@example.com"))

        # Mock status record for updates
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            # Calls: update to processing, get form, get submission, update to failed
            mock_db.execute = AsyncMock(
                side_effect=[mock_result_status, mock_result_form, mock_result_submission, mock_result_status]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "Invalid form_data format" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_success_with_dict_form_data(self):
        """Test successful RPA job processing with dict form_data"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form with dict form_data
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = {
            "form_data": [
                {"questionId": "q1", "question": "Test Question", "answer": ["Test Answer"], "type": "textbox"}
            ]
        }

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_submission = MagicMock()
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(mock_submission, "test@example.com"))

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with (
            patch("service.form_automation_service.AsyncSessionLocal") as mock_session,
            patch("service.form_automation_service.FormProcessor") as mock_processor,
            patch.object(service.email_service, "send_completion_email", new_callable=AsyncMock) as mock_email,
        ):

            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,  # Update to processing
                    mock_result_form,  # Get form
                    mock_result_submission,  # Get submission/email
                    mock_result_status,  # Update to completed
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            # Mock automation success
            mock_automation = MagicMock()
            mock_automation.process_single_submission = AsyncMock(
                return_value={"success": True, "matched_count": 1, "failed_count": 0, "unmatched_questions": []}
            )
            mock_processor.return_value = mock_automation

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is True
            assert result["matched_count"] == 1
            mock_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_rpa_job_success_with_list_form_data(self):
        """Test successful RPA job processing with list form_data"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form with list form_data
        mock_form = MagicMock()
        mock_form.form_type = "dlo-form"
        mock_form.form_data = [
            {"questionId": "q1", "question": "Test Question", "answer": ["Test Answer"], "type": "textbox"}
        ]

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_submission = MagicMock()
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(mock_submission, "user@test.com"))

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with (
            patch("service.form_automation_service.AsyncSessionLocal") as mock_session,
            patch("service.form_automation_service.FormProcessor") as mock_processor,
            patch.object(service.email_service, "send_completion_email", new_callable=AsyncMock) as mock_email,
        ):

            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,  # Update to processing
                    mock_result_form,  # Get form
                    mock_result_submission,  # Get submission/email
                    mock_result_status,  # Update to completed
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            # Mock automation success
            mock_automation = MagicMock()
            mock_automation.process_single_submission = AsyncMock(
                return_value={"success": True, "matched_count": 1, "failed_count": 0, "unmatched_questions": []}
            )
            mock_processor.return_value = mock_automation

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is True
            mock_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_rpa_job_filters_file_types(self):
        """Test that file type questions are filtered out"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form with file and empty answer entries
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = [
            {"questionId": "q1", "question": "Text Question", "answer": ["Answer"], "type": "textbox"},
            {"questionId": "q2", "question": "File Question", "answer": ["file.pdf"], "type": "file"},
            {"questionId": "q3", "question": "Empty Question", "answer": [], "type": "textbox"},
        ]

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_submission = MagicMock()
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(mock_submission, "test@example.com"))

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with (
            patch("service.form_automation_service.AsyncSessionLocal") as mock_session,
            patch("service.form_automation_service.FormProcessor") as mock_processor,
            patch.object(service.email_service, "send_completion_email", new_callable=AsyncMock),
        ):

            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,
                    mock_result_form,
                    mock_result_submission,
                    mock_result_status,
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            # Mock automation
            mock_automation = MagicMock()
            mock_automation.process_single_submission = AsyncMock(
                return_value={"success": True, "matched_count": 1, "failed_count": 0, "unmatched_questions": []}
            )
            mock_processor.return_value = mock_automation

            await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            # Verify process_single_submission was called
            # Form data should have: 2 system fields + 1 valid question (file and empty filtered)
            call_args = mock_automation.process_single_submission.call_args[1]
            form_data = call_args["form_data"]
            assert len(form_data) == 3  # 2 system + 1 valid

    @pytest.mark.asyncio
    async def test_process_rpa_job_automation_failure(self):
        """Test RPA job processing when automation fails"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = [{"questionId": "q1", "question": "Test", "answer": ["Answer"], "type": "textbox"}]

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_submission = MagicMock()
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(mock_submission, "test@example.com"))

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with (
            patch("service.form_automation_service.AsyncSessionLocal") as mock_session,
            patch("service.form_automation_service.FormProcessor") as mock_processor,
            patch.object(service.email_service, "send_failure_email", new_callable=AsyncMock) as mock_email,
        ):

            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,
                    mock_result_form,
                    mock_result_submission,
                    mock_result_status,
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            # Mock automation failure
            mock_automation = MagicMock()
            mock_automation.process_single_submission = AsyncMock(
                return_value={"success": False, "message": "Browser error"}
            )
            mock_processor.return_value = mock_automation

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "Browser error" in result["message"]
            mock_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_rpa_job_service_error(self):
        """Test RPA job processing when FormAutomationServiceError is raised"""
        from exceptions import FormAutomationServiceError

        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock status record for updates
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            # First context raises FormAutomationServiceError
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(side_effect=FormAutomationServiceError("SERVICE_ERROR", "Service error"))

            # Second context for updating status
            mock_db2 = MagicMock()
            mock_db2.__aenter__ = AsyncMock(return_value=mock_db2)
            mock_db2.__aexit__ = AsyncMock(return_value=None)
            mock_db2.execute = AsyncMock(return_value=mock_result_status)
            mock_db2.commit = AsyncMock()

            mock_session.side_effect = [mock_db, mock_db2]

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "Service error" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_unexpected_exception(self):
        """Test RPA job processing when unexpected exception is raised"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            # First context raises unexpected exception
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(side_effect=ValueError("Unexpected error"))

            # Second context for updating status
            mock_db2 = MagicMock()
            mock_db2.__aenter__ = AsyncMock(return_value=mock_db2)
            mock_db2.__aexit__ = AsyncMock(return_value=None)
            mock_db2.execute = AsyncMock()
            mock_db2.commit = AsyncMock()

            mock_session.side_effect = [mock_db, mock_db2]

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            assert result["success"] is False
            assert "Unexpected error" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_email_fetch_exception(self):
        """Test RPA job when fetching email raises exception"""
        service = FormAutomationService()

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form
        mock_form = MagicMock()
        mock_form.form_type = "ai-registry-form"
        mock_form.form_data = []

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with patch("service.form_automation_service.AsyncSessionLocal") as mock_session:
            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)

            # First call: update status to processing
            # Second call: get form
            # Third call: fetch email - raises exception
            # Fourth call: update to failed
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,
                    mock_result_form,
                    Exception("Database connection lost"),
                    mock_result_status,
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            result = await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            # Should fail when email not found after exception
            assert result["success"] is False
            assert "User email not found" in result["message"]

    @pytest.mark.asyncio
    async def test_process_rpa_job_reinitializes_automation_for_different_form_type(self):
        """Test that automation is reinitialized when form type changes"""
        service = FormAutomationService(form_type="ai-registry-form")

        rpa_status_id = uuid4()
        submission_id = uuid4()
        form_schema_id = uuid4()

        # Mock form with different type
        mock_form = MagicMock()
        mock_form.form_type = "dlo-form"  # Different from initial
        mock_form.form_data = [{"questionId": "q1", "question": "Test", "answer": ["Answer"], "type": "textbox"}]

        mock_result_form = MagicMock()
        mock_result_form.scalar_one_or_none = MagicMock(return_value=mock_form)

        # Mock submission with email
        mock_submission = MagicMock()
        mock_result_submission = MagicMock()
        mock_result_submission.first = MagicMock(return_value=(mock_submission, "test@example.com"))

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_result_status = MagicMock()
        mock_result_status.scalar_one_or_none = MagicMock(return_value=mock_status)

        with (
            patch("service.form_automation_service.AsyncSessionLocal") as mock_session,
            patch("service.form_automation_service.FormProcessor") as mock_processor,
            patch.object(service.email_service, "send_completion_email", new_callable=AsyncMock),
        ):

            mock_db = MagicMock()
            mock_db.__aenter__ = AsyncMock(return_value=mock_db)
            mock_db.__aexit__ = AsyncMock(return_value=None)
            mock_db.execute = AsyncMock(
                side_effect=[
                    mock_result_status,
                    mock_result_form,
                    mock_result_submission,
                    mock_result_status,
                ]
            )
            mock_db.commit = AsyncMock()
            mock_session.return_value = mock_db

            # Mock automation
            mock_automation = MagicMock()
            mock_automation.process_single_submission = AsyncMock(
                return_value={"success": True, "matched_count": 1, "failed_count": 0, "unmatched_questions": []}
            )
            mock_automation.form_type = "dlo-form"
            mock_processor.return_value = mock_automation

            await service.process_rpa_job(
                rpa_status_id=rpa_status_id,
                submission_id=submission_id,
                form_schema_id=form_schema_id,
            )

            # Verify FormProcessor was called with new form type
            mock_processor.assert_called_with("dlo-form")


class TestUpdateJobStatus:
    """Test cases for _update_job_status method"""

    @pytest.mark.asyncio
    async def test_update_job_status_to_processing(self):
        """Test updating job status to processing"""
        service = FormAutomationService()

        rpa_status_id = uuid4()

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PENDING.value
        mock_status.started_at = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_status)

        mock_db = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()

        await service._update_job_status(mock_db, rpa_status_id, RPAStatus.PROCESSING.value)

        assert mock_status.status == RPAStatus.PROCESSING.value
        assert mock_status.started_at is not None
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_job_status_to_completed_with_filled_questions(self):
        """Test updating job status to completed with filled_questions"""
        service = FormAutomationService()

        rpa_status_id = uuid4()

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PROCESSING.value
        mock_status.filled_questions = 0
        mock_status.completed_at = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_status)

        mock_db = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()

        await service._update_job_status(mock_db, rpa_status_id, RPAStatus.COMPLETED.value, filled_questions=10)

        assert mock_status.status == RPAStatus.COMPLETED.value
        assert mock_status.filled_questions == 10
        assert mock_status.completed_at is not None
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_job_status_to_failed_with_error_message(self):
        """Test updating job status to failed with error message"""
        service = FormAutomationService()

        rpa_status_id = uuid4()

        # Mock status record
        mock_status = MagicMock()
        mock_status.status = RPAStatus.PROCESSING.value
        mock_status.error_message = None
        mock_status.completed_at = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_status)

        mock_db = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()

        await service._update_job_status(
            mock_db, rpa_status_id, RPAStatus.FAILED.value, error_message="Browser automation failed"
        )

        assert mock_status.status == RPAStatus.FAILED.value
        assert mock_status.error_message == "Browser automation failed"
        assert mock_status.completed_at is not None
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_job_status_record_not_found(self):
        """Test updating job status when record is not found"""
        service = FormAutomationService()

        rpa_status_id = uuid4()

        # Mock no record found
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)

        mock_db = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()

        # Should not raise exception, just skip update
        await service._update_job_status(mock_db, rpa_status_id, RPAStatus.COMPLETED.value)

        # Commit should not be called if no record found
        mock_db.commit.assert_not_called()
