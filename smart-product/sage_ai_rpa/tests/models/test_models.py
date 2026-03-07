"""
Tests for database models
"""

import pytest
from datetime import datetime
from uuid import uuid4
from models.sage_ai_rpa_status import SageAIRPAStatus
from models.submission_forms import SubmissionForms
from models.submissions import Submissions
from models.users import Users
from models.categories import Categories
from models.form_schemas import FormSchemas


class TestSageAIRPAStatus:
    """Test cases for SageAIRPAStatus model"""

    def test_model_creation(self):
        """Test creating SageAIRPAStatus instance"""
        status = SageAIRPAStatus(
            submission_id=uuid4(), form_schema_id=uuid4(), status="pending", total_questions=10, filled_questions=0
        )

        assert status.status == "pending"
        assert status.total_questions == 10
        assert status.filled_questions == 0

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(SageAIRPAStatus, "submission_id")
        assert hasattr(SageAIRPAStatus, "form_schema_id")
        assert hasattr(SageAIRPAStatus, "status")
        assert hasattr(SageAIRPAStatus, "total_questions")
        assert hasattr(SageAIRPAStatus, "filled_questions")


class TestSubmissionForms:
    """Test cases for SubmissionForms model"""

    def test_model_creation(self):
        """Test creating SubmissionForms instance"""
        form = SubmissionForms(submission_id=uuid4(), form_schema_id=uuid4(), form_type="ai-registry-form")

        assert form.form_type == "ai-registry-form"

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(SubmissionForms, "submission_id")
        assert hasattr(SubmissionForms, "form_schema_id")
        assert hasattr(SubmissionForms, "form_type")


class TestSubmissions:
    """Test cases for Submissions model"""

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(Submissions, "id")
        assert hasattr(Submissions, "__tablename__")


class TestUsers:
    """Test cases for Users model"""

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(Users, "id")
        assert hasattr(Users, "__tablename__")


class TestCategories:
    """Test cases for Categories model"""

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(Categories, "id")
        assert hasattr(Categories, "__tablename__")


class TestFormSchemas:
    """Test cases for FormSchemas model"""

    def test_model_attributes(self):
        """Test model has required attributes"""
        assert hasattr(FormSchemas, "id")
        assert hasattr(FormSchemas, "__tablename__")
