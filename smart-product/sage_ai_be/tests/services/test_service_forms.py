import asyncio
import pytest
from uuid import uuid4

from data_service.service.forms import (
    get_forms_service,
    FormsService,
)
from data_service.exceptions import FormSubmissionServiceError
from data_service.serializers.forms import FormSerializer
from data_service.serializers.common_fields import CommonFieldsRequest
from data_service.exceptions import FormDetailsServiceError


class FakeUser:
    def __init__(self, email):
        self.id = uuid4()
        self.email = email


class FakeSubmission:
    def __init__(self, submitter_id, status="in_progress"):
        self.id = uuid4()
        self.submitter_id = submitter_id
        self.status = status
        self.title = None


class FakeForm:
    def __init__(self, submission_id, status="in_progress", form_type="idea-sub-form"):
        self.id = uuid4()
        self.submission_id = submission_id
        self.form_schema_id = uuid4()
        self.form_type = form_type
        self.form_data = {"form_data": []}
        self.status = status
        self.submitted_at = None


class FakeQuestionMapping:
    def __init__(
        self, source_question_id, target_question_id, target_form_type, priority=1
    ):
        self.source_question_id = source_question_id
        self.target_question_id = target_question_id
        self.target_form_type = target_form_type
        self.priority = priority


class FakeQuestion:
    def __init__(self, question_id, question_text):
        self.id = question_id
        self.question = question_text


class FakeSubmissionResult:
    def __init__(self, row):
        self._row = row

    def first(self):
        return self._row

    def all(self):
        # Return empty list if None, otherwise return row as list
        if self._row is None:
            return []
        if isinstance(self._row, list):
            return self._row
        return [self._row]

    def scalars(self):
        # Return a scalars-like object for user queries
        class _Scalars:
            def __init__(self, row):
                self._row = row

            def first(self):
                # For join queries (submission, user), return the user object (second element of tuple)
                if isinstance(self._row, tuple) and len(self._row) > 1:
                    return self._row[1]
                # For single entity queries, return the entity directly
                return self._row

            def all(self):
                # Return empty list if None, otherwise return row as list
                if self._row is None:
                    return []
                if isinstance(self._row, list):
                    return self._row
                return [self._row]

        return _Scalars(self._row)


class FakeFormScalars:
    def __init__(self, form):
        self._form = form

    def first(self):
        return self._form

    def all(self):
        return [self._form] if self._form else []


class FakeFormResult:
    def __init__(self, form_list):
        self._forms = form_list

    def first(self):
        # Return first item or tuple of (form, submission) if forms is a list of tuples
        if not self._forms:
            return None
        item = self._forms[0]
        # If it's a tuple (form, submission), return it as is
        if isinstance(item, tuple):
            return item
        # Otherwise return just the form
        return item

    def scalars(self):
        # Return first form only for .first(), .all() returns all
        class _Scalars:
            def __init__(self, forms):
                self._forms = forms

            def first(self):
                return self._forms[0] if self._forms else None

            def all(self):
                return list(self._forms)

        return _Scalars(self._forms)


class FakeSession:
    def __init__(self):
        self.users = []
        self.submissions = []
        self.forms = []
        self.mappings = []
        self.questions = []
        self.commits = 0
        self.refresh_calls = 0
        self.query_email = None  # To track email for user queries

    async def execute(self, stmt):
        text = str(stmt).lower()
        stmt_str = str(stmt)

        # Handle user queries - look for email in WHERE clause
        if (
            "from users" in text
            and "from submissions" not in text
            and "join" not in text
        ):
            # SQLAlchemy uses bind parameters, so we need to check stmt.compile()
            # For testing purposes, just return the first user if present
            # In tests, we'll ensure the user list contains the right user
            if self.users:
                return FakeSubmissionResult(self.users[0])
            return FakeSubmissionResult(None)

        # Handle submission queries - return Submissions object
        if "from submissions" in text and "join" not in text:
            # Try to extract submission_id from WHERE clause
            import re

            sub_id_match = re.search(
                r"submissions\.id\s*=\s*'([^']+)'", stmt_str, re.IGNORECASE
            )
            if sub_id_match:
                from uuid import UUID

                try:
                    sub_id = UUID(sub_id_match.group(1))
                    submission = next(
                        (s for s in self.submissions if s.id == sub_id), None
                    )
                    return FakeSubmissionResult(submission)
                except:
                    pass
            if self.submissions:
                return FakeSubmissionResult(self.submissions[0])
            return FakeSubmissionResult(None)

        # Handle joined queries (submission_forms + submissions + users)
        if "from submission_forms" in text and "join" in text:
            if self.forms:
                form = self.forms[0]
                # Find matching submission and user
                sub = next(
                    (s for s in self.submissions if s.id == form.submission_id), None
                )
                user = next(
                    (u for u in self.users if sub and u.id == sub.submitter_id), None
                )
                if form and sub and user:
                    return FakeFormResult([(form, sub, user)])
            return FakeFormResult([])

        # Handle simple submission_forms queries
        if "from submission_forms" in text:
            # Try to extract form_id and submission_id from WHERE clause
            import re

            form_id_match = re.search(
                r"submission_forms\.id\s*=\s*'([^']+)'", stmt_str, re.IGNORECASE
            )
            sub_id_match = re.search(
                r"submission_forms\.submission_id\s*=\s*'([^']+)'",
                stmt_str,
                re.IGNORECASE,
            )

            if form_id_match or sub_id_match:
                from uuid import UUID

                try:
                    filtered_forms = self.forms
                    if form_id_match:
                        form_id = UUID(form_id_match.group(1))
                        filtered_forms = [f for f in filtered_forms if f.id == form_id]
                    if sub_id_match:
                        sub_id = UUID(sub_id_match.group(1))
                        filtered_forms = [
                            f for f in filtered_forms if f.submission_id == sub_id
                        ]
                    return FakeFormResult(filtered_forms)
                except:
                    pass
            return FakeFormResult(list(self.forms))

        if "from question_mapping" in text:
            return FakeFormResult(self.mappings)

        if "from questions" in text:
            return FakeFormResult(self.questions)

        # Handle COUNT queries
        if "count" in text:

            class FakeCount:
                def scalar(self):
                    return 0

            return FakeCount()

        return FakeSubmissionResult(None)

    async def commit(self):
        self.commits += 1

    async def refresh(self, obj):
        self.refresh_calls += 1

    async def rollback(self):
        # Add rollback method for error handling
        pass

    def add(self, obj):
        # Add object to session (for new form creation)
        if hasattr(obj, "__tablename__"):
            if obj.__tablename__ == "sage_ai_submission_forms":
                self.forms.append(obj)
        pass


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def first(self):
        return self._rows[0] if self._rows else None


class FakeScalarResult(FakeResult):
    def scalars(self):
        return FakeScalarList(self._rows)


class FakeScalarList:
    def __init__(self, items):
        self._items = items

    def first(self):
        return self._items[0] if self._items else None

    def all(self):
        return list(self._items)


run = asyncio.run

# Tests for _extract_and_update_submission_title (now private method)


def test_extract_and_update_submission_title_updates():
    class DummySettings:
        idea_form_title_question_id = "Q1"

    import data_service.service.forms as forms_mod

    old_settings = forms_mod.settings
    forms_mod.settings = DummySettings  # patch
    submission = FakeSubmission(submitter_id=uuid4())
    form_data = {"form_data": [{"questionId": "Q1", "answer": ["Title"]}]}
    # Test private method through service instance
    service = FormsService(db=None)
    service._extract_and_update_submission_title("idea-sub-form", form_data, submission)
    assert submission.title == "Title"
    forms_mod.settings = old_settings


def test_extract_and_update_submission_title_non_idea():
    submission = FakeSubmission(submitter_id=uuid4())
    # Test private method through service instance
    service = FormsService(db=None)
    service._extract_and_update_submission_title(
        "other-form", {"form_data": []}, submission
    )
    assert submission.title is None


# get_form_details_service success and error paths


def setup_env(valid_email="user@example.com"):
    sess = FakeSession()
    user = FakeUser(valid_email)
    sub = FakeSubmission(submitter_id=user.id)
    form = FakeForm(submission_id=sub.id)
    sess.users.append(user)
    sess.submissions.append(sub)
    sess.forms.append(form)
    return sess, user, sub, form


def test_get_form_details_service_success(monkeypatch):
    sess, user, sub, form = setup_env()
    sess.forms = [form]

    # Mock execute to return proper objects for each query
    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt and "from submissions" not in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)
        if "submission_forms" in txt:
            return FakeFormResult([form])
        if "uploaded_documents" in txt:
            # Return empty list of tuples for (file_name, form_id) pairs
            return FakeSubmissionResult([])
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)

    # Use default FakeSession.execute() which handles all query types now
    service = get_forms_service(sess)
    out = asyncio.run(service.get_form_details(str(form.id), str(sub.id), user.email))
    assert out.data.id == form.id
    assert out.data.submission_id == form.submission_id


def test_get_form_details_service_invalid_email():
    sess, user, sub, form = setup_env()

    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError):
        run(service.get_form_details(str(form.id), str(sub.id), "bad"))


def test_get_form_details_service_bad_form_uuid(monkeypatch):
    sess, user, sub, form = setup_env()

    async def exec_override(stmt):
        return FakeSubmissionResult(user)

    monkeypatch.setattr(sess, "execute", exec_override)
    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError) as exc:
        run(service.get_form_details("not-uuid", str(sub.id), user.email))
    assert exc.value.status_code == 400


def test_get_form_details_service_bad_submission_uuid(monkeypatch):
    sess, user, sub, form = setup_env()

    async def exec_override(stmt):
        return FakeSubmissionResult(user)

    monkeypatch.setattr(sess, "execute", exec_override)
    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError):
        run(service.get_form_details(str(form.id), "not-uuid", user.email))


def test_get_form_details_service_no_submission(monkeypatch):
    sess = FakeSession()  # empty
    user = FakeUser("user@example.com")

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt:
            return FakeSubmissionResult(user)
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)
    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError) as exc:
        run(service.get_form_details(str(uuid4()), str(uuid4()), "user@example.com"))
    assert exc.value.status_code == 400  # Submission not found


def test_get_form_details_service_wrong_user():
    sess, user, sub, form = setup_env()

    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError) as exc:
        run(service.get_form_details(str(form.id), str(sub.id), "other@example.com"))
    assert exc.value.status_code == 401  # User not found returns 401


def test_get_form_details_service_no_form_for_submission(monkeypatch):
    sess, user, sub, form = setup_env()
    sess.forms = []  # remove form

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)  # Return submission object, not tuple
        if "submission_forms" in txt:
            return FakeFormResult([])
        if "uploaded_documents" in txt:
            # Return empty list of tuples for (file_name, form_id) pairs
            return FakeSubmissionResult([])
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)
    service = get_forms_service(sess)
    with pytest.raises(FormDetailsServiceError) as exc:
        run(service.get_form_details(str(form.id), str(sub.id), user.email))
    assert exc.value.status_code == 400  # No forms found for submission


# submit_form_service tests


def test_submit_form_service_success_save(monkeypatch):
    sess, user, sub, form = setup_env()
    form_data = {"form_data": [{"questionId": "Q1", "answer": ["T"]}]}

    # Mock execute to return proper objects for each query
    async def exec_override(stmt):
        txt = str(stmt).lower()
        # Check for join queries FIRST before checking individual tables
        if "join" in txt and "submissions" in txt and "submission_forms" in txt:
            return FakeFormResult([(form, sub, user)])
        if "from users" in txt or (
            "users" in txt and "where" in txt and "email" in txt
        ):
            return FakeSubmissionResult(user)
        if "count" in txt:

            class FakeCount:
                def scalar(self):
                    return 0

            return FakeCount()
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)

    service = get_forms_service(sess)
    out = run(
        service.submit_form(str(form.id), str(sub.id), form_data, "save", user.email)
    )
    assert out.data.status == "in_progress"
    assert sess.commits >= 1


def test_submit_form_service_success_submit_all_completed(monkeypatch):
    sess, user, sub, form = setup_env()
    form_data = {"form_data": [{"questionId": "Q1", "answer": ["T"]}]}
    form.status = "in_progress"  # Start as in_progress so it can be submitted

    # Mock execute to return proper objects for each query
    async def exec_override(stmt):
        txt = str(stmt).lower()
        # Check for join queries FIRST before checking individual tables
        if "join" in txt and "submissions" in txt and "submission_forms" in txt:
            return FakeFormResult([(form, sub, user)])
        if "from users" in txt or (
            "users" in txt and "where" in txt and "email" in txt
        ):
            return FakeSubmissionResult(user)
        if "from submission_forms" in txt:
            return FakeFormResult([form])
        if "count" in txt:

            class FakeCount:
                def scalar(self):
                    return 0

            return FakeCount()
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)

    service = get_forms_service(sess)
    out = run(
        service.submit_form(str(form.id), str(sub.id), form_data, "submit", user.email)
    )
    assert out.data.status == "completed"


def test_submit_form_service_invalid_email():
    sess, user, sub, form = setup_env()
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), str(sub.id), {}, "save", "bad"))


def test_submit_form_service_bad_form_uuid():
    sess, user, sub, form = setup_env()
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form("not-uuid", str(sub.id), {}, "save", user.email))


def test_submit_form_service_bad_submission_uuid():
    sess, user, sub, form = setup_env()
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), "not-uuid", {}, "save", user.email))


def test_submit_form_service_form_not_found():
    sess, user, sub, form = setup_env()
    sess.forms = []
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), str(sub.id), {}, "save", user.email))


def test_submit_form_service_form_submission_mismatch():
    sess, user, sub, form = setup_env()
    other_sub = FakeSubmission(submitter_id=user.id)
    form.submission_id = other_sub.id
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), str(sub.id), {}, "save", user.email))


def test_submit_form_service_submission_not_found():
    sess, user, sub, form = setup_env()
    sess.submissions = []
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), str(sub.id), {}, "save", user.email))


def test_submit_form_service_wrong_user():
    sess, user, sub, form = setup_env()
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(
            service.submit_form(
                str(form.id), str(sub.id), {}, "save", "other@example.com"
            )
        )


def test_submit_form_service_completed_form_edit_attempt():
    sess, user, sub, form = setup_env()
    form.status = "completed"
    service = get_forms_service(sess)
    with pytest.raises(FormSubmissionServiceError):
        run(service.submit_form(str(form.id), str(sub.id), {}, "save", user.email))


# auto_populate_common_fields_service tests


def test_auto_populate_common_fields_service_mapping(monkeypatch):
    sess, user, sub, form = setup_env()
    form.form_data = {
        "form_data": [
            {"questionId": "S1", "answer": ["A1", "A2"]},
            {"questionId": "S2", "answer": ["B"]},
        ]
    }
    sess.mappings.append(FakeQuestionMapping("S1", "T1", form.form_type))
    sess.mappings.append(FakeQuestionMapping("S1", "T2", form.form_type))
    sess.mappings.append(FakeQuestionMapping("S2", "T3", form.form_type))
    # Add questions for the question lookup
    sess.questions.append(FakeQuestion("T1", "Target Question 1"))
    sess.questions.append(FakeQuestion("T2", "Target Question 2"))
    sess.questions.append(FakeQuestion("T3", "Target Question 3"))
    seq = {"n": 0}

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt and "from submissions" not in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)
        if "question_mapping" in txt:
            return FakeFormResult(sess.mappings)
        if "submission_forms" in txt:
            return FakeFormResult(sess.forms)
        if "questions" in txt:
            return FakeFormResult(sess.questions)
        return FakeSubmissionResult(None)

    # Mock the cortex_client.invoke_ask to avoid actual LLM calls
    async def mock_invoke_ask(*args, **kwargs):
        return '{"summarized_answer": "mocked summary"}'

    import data_service.service.forms as forms_mod

    monkeypatch.setattr(forms_mod.cortex_client, "invoke_ask", mock_invoke_ask)
    monkeypatch.setattr(sess, "execute", exec_override)
    req = CommonFieldsRequest(
        submission_id=sub.id, form_type=form.form_type, form_id=form.id
    )
    service = get_forms_service(sess)
    out = run(service.auto_populate_common_fields(req, user.email))
    answers = {item.question_id: item.answer for item in out.common_fields}
    assert answers["T1"] == "A1, A2"
    assert answers["T2"] == "A1, A2"
    assert answers["T3"] == "B"
    # Verify multi_source is False for one-to-one mappings
    multi_source_flags = {
        item.question_id: item.multi_source for item in out.common_fields
    }
    assert multi_source_flags["T1"] is False  # One source (S1) to one target (T1)
    assert multi_source_flags["T2"] is False  # One source (S1) to one target (T2)
    assert multi_source_flags["T3"] is False  # One source (S2) to one target (T3)


def test_auto_populate_common_fields_service_no_matches(monkeypatch):
    sess, user, sub, form = setup_env()
    form.form_data = {"form_data": [{"questionId": "S99", "answer": ["X"]}]}
    seq = {"n": 0}

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt and "from submissions" not in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)
        if "question_mapping" in txt:
            return FakeFormResult(sess.mappings)  # empty mappings
        if "submission_forms" in txt:
            return FakeFormResult(sess.forms)
        if "questions" in txt:
            return FakeFormResult(sess.questions)
        return FakeSubmissionResult(None)

    monkeypatch.setattr(sess, "execute", exec_override)
    req = CommonFieldsRequest(
        submission_id=sub.id, form_type=form.form_type, form_id=form.id
    )
    service = get_forms_service(sess)
    out = run(service.auto_populate_common_fields(req, user.email))
    assert out.common_fields == []


def test_auto_populate_common_fields_many_to_one_with_priority(monkeypatch):
    """Test many-to-one mapping with priority: multiple sources map to one target and merge"""
    sess, user, sub, form = setup_env()
    form.form_data = {
        "form_data": [
            {"questionId": "S1", "answer": [""]},  # Empty - should be skipped
            {"questionId": "S2", "answer": ["Second Priority Value"]},  # Priority 2
            {"questionId": "S3", "answer": ["Third Priority Value"]},  # Priority 3
        ]
    }
    # Multiple sources mapping to same target T1, with different priorities
    sess.mappings.append(FakeQuestionMapping("S1", "T1", form.form_type, priority=1))
    sess.mappings.append(FakeQuestionMapping("S2", "T1", form.form_type, priority=2))
    sess.mappings.append(FakeQuestionMapping("S3", "T1", form.form_type, priority=3))
    # Add questions for the question lookup
    sess.questions.append(FakeQuestion("T1", "Target Question 1"))
    sess.questions.append(FakeQuestion("S2", "Source Question 2"))
    sess.questions.append(FakeQuestion("S3", "Source Question 3"))

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt and "from submissions" not in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)
        if "question_mapping" in txt:
            return FakeFormResult(sess.mappings)
        if "submission_forms" in txt:
            return FakeFormResult(sess.forms)
        if "questions" in txt:
            return FakeFormResult(sess.questions)
        return FakeSubmissionResult(None)

    # Mock the cortex_client.invoke_ask to avoid actual LLM calls
    async def mock_invoke_ask(*args, **kwargs):
        return '{"summarized_answer": "Second Priority Value | Third Priority Value"}'

    import data_service.service.forms as forms_mod

    monkeypatch.setattr(forms_mod.cortex_client, "invoke_ask", mock_invoke_ask)
    monkeypatch.setattr(sess, "execute", exec_override)
    req = CommonFieldsRequest(
        submission_id=sub.id, form_type=form.form_type, form_id=form.id
    )
    service = get_forms_service(sess)
    out = run(service.auto_populate_common_fields(req, user.email))
    answers = {item.question_id: item.answer for item in out.common_fields}
    # Should merge S2 and S3 (S1 is empty), separated by " | " in priority order
    assert answers["T1"] == "Second Priority Value | Third Priority Value"
    # Should be marked as multi_source since multiple sources map to T1
    multi_source_flags = {
        item.question_id: item.multi_source for item in out.common_fields
    }
    assert multi_source_flags["T1"] is True


def test_auto_populate_common_fields_many_to_one_first_priority_wins(monkeypatch):
    """Test many-to-one mapping: all non-empty sources should be merged in priority order"""
    sess, user, sub, form = setup_env()
    form.form_data = {
        "form_data": [
            {"questionId": "S1", "answer": ["Highest Priority"]},  # Priority 1
            {"questionId": "S2", "answer": ["Lower Priority"]},  # Priority 2
            {"questionId": "S3", "answer": ["Lowest Priority"]},  # Priority 3
        ]
    }
    sess.mappings.append(FakeQuestionMapping("S1", "T1", form.form_type, priority=1))
    sess.mappings.append(FakeQuestionMapping("S2", "T1", form.form_type, priority=2))
    sess.mappings.append(FakeQuestionMapping("S3", "T1", form.form_type, priority=3))
    # Add questions for the question lookup
    sess.questions.append(FakeQuestion("T1", "Target Question 1"))
    sess.questions.append(FakeQuestion("S1", "Source Question 1"))
    sess.questions.append(FakeQuestion("S2", "Source Question 2"))
    sess.questions.append(FakeQuestion("S3", "Source Question 3"))

    async def exec_override(stmt):
        txt = str(stmt).lower()
        if "users" in txt and "select" in txt and "from submissions" not in txt:
            return FakeSubmissionResult(user)
        if "submissions" in txt and "select" in txt:
            return FakeSubmissionResult(sub)
        if "question_mapping" in txt:
            return FakeFormResult(sess.mappings)
        if "submission_forms" in txt:
            return FakeFormResult(sess.forms)
        if "questions" in txt:
            return FakeFormResult(sess.questions)
        return FakeSubmissionResult(None)

    # Mock the cortex_client.invoke_ask to avoid actual LLM calls
    async def mock_invoke_ask(*args, **kwargs):
        return '{"summarized_answer": "Highest Priority | Lower Priority | Lowest Priority"}'

    import data_service.service.forms as forms_mod

    monkeypatch.setattr(forms_mod.cortex_client, "invoke_ask", mock_invoke_ask)
    monkeypatch.setattr(sess, "execute", exec_override)
    req = CommonFieldsRequest(
        submission_id=sub.id, form_type=form.form_type, form_id=form.id
    )
    service = get_forms_service(sess)
    out = run(service.auto_populate_common_fields(req, user.email))
    answers = {item.question_id: item.answer for item in out.common_fields}
    # Should merge all three in priority order
    assert answers["T1"] == "Highest Priority | Lower Priority | Lowest Priority"
    # Should be marked as multi_source
    multi_source_flags = {
        item.question_id: item.multi_source for item in out.common_fields
    }
    assert multi_source_flags["T1"] is True
