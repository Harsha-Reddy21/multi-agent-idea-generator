import asyncio
import pytest

from data_service.service.form_dashboard import (
    get_form_dashboard_service,
)
from data_service.service.form_rules_evaluator import FormRulesEvaluator
from data_service.exceptions import DashboardServiceError

# Use a valid UUID for submission ids in tests to pass new UUID validation
VALID_SUBMISSION_ID = "11111111-1111-1111-1111-111111111111"


class FakeRule:
    def __init__(self, condition_json, category="optional", form_id="SCHEMA1"):
        self.condition_json = condition_json  # ensure attribute present
        self.category = category
        self.form_id = form_id


class FakeUser:
    def __init__(self, id, email):
        self.id = id
        self.email = email


class FakeSubmission:
    def __init__(self, id, submitter_id, journey, final_score=None, novelty_score=None):
        self.id = id
        self.submitter_id = submitter_id
        self.category_id = "CAT1"
        self.submission_journey = journey
        self.final_score = final_score
        self.novelty_score = novelty_score


class FakeForm:
    def __init__(self, id, submission_id, schema_id, final_score=None):
        self.id = id
        self.submission_id = submission_id
        self.form_schema_id = schema_id
        self.status = "in_progress"
        self.final_score = final_score
        self.form_category = None  # Add form_category attribute


class FakeSchema:
    def __init__(self, id, name):
        self.id = id
        self.name = name


class FakeResult:
    def __init__(self, rows):
        self._rows = rows
        self._all_tuples = None

    def scalars(self):
        class S:
            def __init__(self, rows):
                self._rows = rows

            def first(self):
                return self._rows[0] if self._rows else None

            def all(self):
                return list(self._rows)

        return S(self._rows)

    def all(self):
        """Return all results (for join queries that return tuples)"""
        if self._all_tuples is not None:
            return self._all_tuples
        return list(self._rows)


class FakeDB:
    def __init__(self):
        self.user = None
        self.submission = None
        self.forms = []
        self.schemas = {}
        self.rules = {}
        self.added = []
        self.commits = 0

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.commits += 1

    async def execute(self, stmt):  # noqa: D401
        txt = str(stmt).lower()
        if "users" in txt:
            return FakeResult([self.user] if self.user else [])
        if "submissions" in txt:
            return FakeResult([self.submission] if self.submission else [])
        if "submission_forms" in txt and "form_schemas" in txt:
            # Join query returns tuples of (form, schema)
            result_tuples = [
                (form, self.schemas.get(form.form_schema_id)) for form in self.forms
            ]
            fake_result = FakeResult(result_tuples)
            # Add .all() method that returns the tuples directly
            fake_result._all_tuples = result_tuples
            return fake_result
        if "submission_forms" in txt:
            return FakeResult(self.forms)
        if "form_schemas" in txt:
            # Return all schemas (service filters by id using first())
            return FakeResult(list(self.schemas.values()))
        if "form_rules" in txt:
            # Return combined rules matching any form id
            all_rules = []
            for rules in self.rules.values():
                all_rules.extend(rules)
            return FakeResult(all_rules)
        return FakeResult([])


run = asyncio.run


def test_evaluate_form_rules_precedence():
    journey = {"form_data": [{"questionId": "Q1", "answer": ["Yes"]}]}
    rules = [
        FakeRule({"Q1": "Yes"}, category="optional"),
        FakeRule({"Q1": "Yes"}, category="recommended"),
    ]
    category = FormRulesEvaluator.evaluate_form_rules(rules, journey, "idea")
    assert category == "recommended"


def test_evaluate_form_rules_no_match_default_optional():
    journey = {"form_data": [{"questionId": "Q1", "answer": ["No"]}]}
    rules = [FakeRule({"Q1": "Yes"}, category="recommended")]
    category = FormRulesEvaluator.evaluate_form_rules(rules, journey, "idea")
    assert category == "optional"


@pytest.mark.anyio
async def test_get_form_dashboard_success():
    db = FakeDB()
    db.user = FakeUser("U1", "user@example.com")
    db.submission = FakeSubmission(
        VALID_SUBMISSION_ID,
        "U1",
        {"form_data": [{"questionId": "Q1", "answer": ["Yes"]}]},
    )
    form1 = FakeForm("F1", VALID_SUBMISSION_ID, "SCHEMA1")
    db.forms = [form1]
    db.schemas["SCHEMA1"] = FakeSchema("SCHEMA1", "idea")
    db.rules["SCHEMA1"] = [FakeRule({"Q1": "Yes"}, category="recommended")]
    service = get_form_dashboard_service(db)
    out = await service.get_form_dashboard_data(VALID_SUBMISSION_ID, "user@example.com")
    assert out.message == "Forms fetched successfully"
    assert out.data[0].category == "recommended"


@pytest.mark.anyio
async def test_get_form_dashboard_user_not_found():
    db = FakeDB()
    db.user = None
    with pytest.raises(DashboardServiceError) as exc:
        service = get_form_dashboard_service(db)
        await service.get_form_dashboard_data(
            VALID_SUBMISSION_ID, "missing@example.com"
        )
    assert exc.value.status_code == 401


@pytest.mark.anyio
async def test_get_form_dashboard_submission_not_found():
    db = FakeDB()
    db.user = FakeUser("U1", "user@example.com")
    db.submission = None
    with pytest.raises(DashboardServiceError) as exc:
        service = get_form_dashboard_service(db)
        await service.get_form_dashboard_data(VALID_SUBMISSION_ID, "user@example.com")
    assert exc.value.status_code == 400


@pytest.mark.anyio
async def test_get_form_dashboard_submission_wrong_user():
    db = FakeDB()
    db.user = FakeUser("U1", "user@example.com")
    db.submission = FakeSubmission(VALID_SUBMISSION_ID, "OTHER", {})
    with pytest.raises(DashboardServiceError) as exc:
        service = get_form_dashboard_service(db)
        await service.get_form_dashboard_data(VALID_SUBMISSION_ID, "user@example.com")
    assert exc.value.status_code == 400
