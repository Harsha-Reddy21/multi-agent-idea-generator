"""
Form registry: defines all questions, blocks, conditionals, suggestions, and scoring config.
This is the single source of truth for the agent.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class QuestionType(str, Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    SELECT = "select"
    MULTISELECT = "multiselect"
    RADIO = "radio"
    DATE = "date"
    FILE = "file"


class Block(str, Enum):
    SYSTEM = "system_info"
    USER = "user_info"
    TECH = "tech_info"


class FormType(str, Enum):
    IDEA_SUB = "idea-sub-form"
    AI_REGISTRY = "ai-registry-form"
    SECURITY = "security-arch-form"
    DLO = "dlo-form"
    WWTP = "wwtp-form"
    WWTP_VENDOR = "wwtp-new-vendor-form"


# ---------------------------------------------------------------------------
# Question definition
# ---------------------------------------------------------------------------
@dataclass
class ConditionalRule:
    """When `trigger_question` has an answer matching `trigger_values`, add `add_questions` and remove `remove_questions`."""
    trigger_question: str
    trigger_values: list[str]
    add_questions: list[str] = field(default_factory=list)
    remove_questions: list[str] = field(default_factory=list)


@dataclass
class Question:
    id: str
    text: str
    q_type: QuestionType
    block: Block
    form_type: FormType
    label: str  # Short label shown in the block UI
    required: bool = True
    options: list[str] | None = None
    suggestions: list[str] = field(default_factory=list)
    ai_enabled: bool = False
    weight: float = 1.0
    is_mandatory: bool = False
    conditional_parent: str | None = None  # Only visible when parent triggers


# ---------------------------------------------------------------------------
# All Questions
# ---------------------------------------------------------------------------

IDEA_SUB_QUESTIONS: list[Question] = [
    Question(
        id="D-Q01", text="Provide a short title for your solution",
        q_type=QuestionType.TEXT, block=Block.SYSTEM, form_type=FormType.IDEA_SUB,
        label="Title", ai_enabled=True, is_mandatory=True,
        suggestions=[
            "Include industry classification in title",
            "Mention specific health domain or condition",
            "Use clear, memorable naming",
        ],
    ),
    Question(
        id="D-Q02", text="Who are the primary users and what problem are you solving?",
        q_type=QuestionType.TEXTAREA, block=Block.USER, form_type=FormType.IDEA_SUB,
        label="Primary Users & Problem", ai_enabled=True, is_mandatory=True,
        suggestions=[
            "Explain the business problem being solved",
            "Describe target users and their pain points",
            "Include expected outcomes and beneficiaries",
            "Mention the scope and scale",
        ],
    ),
    Question(
        id="D-Q03", text="How does your solution address the problem?",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.IDEA_SUB,
        label="Solution Approach", ai_enabled=True, is_mandatory=True,
        suggestions=[
            "Describe the technical approach clearly",
            "Explain how AI/technology is being used",
            "Differentiate from existing solutions",
        ],
    ),
    Question(
        id="D-Q04", text="What does success look like for your solution?",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.IDEA_SUB,
        label="Success Criteria", ai_enabled=True, is_mandatory=True,
        suggestions=[
            "Quantifiable business benefits (cost savings, efficiency gains)",
            "Time-to-value estimation",
            "Strategic alignment with organizational goals",
        ],
    ),
]


AI_REGISTRY_QUESTIONS: list[Question] = [
    Question(
        id="AI-Q3", text="What is the title of the System?",
        q_type=QuestionType.TEXT, block=Block.SYSTEM, form_type=FormType.AI_REGISTRY,
        label="System Title", is_mandatory=True,
        suggestions=["Clear name indicating AI involvement", "Avoid generic terms"],
    ),
    Question(
        id="AI-Q4", text="Provide an overview of the solution",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.AI_REGISTRY,
        label="Overview", ai_enabled=True, is_mandatory=True,
        suggestions=["Explain the business problem", "Describe how AI is used", "Include expected outcomes"],
    ),
    Question(
        id="AI-Q5", text="What is the value proposition?",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.AI_REGISTRY,
        label="Value Proposition", ai_enabled=True, is_mandatory=True,
        suggestions=[
            "Quantifiable business benefits",
            "Time-to-value estimation",
            "Strategic alignment with goals",
            "Competitive advantages gained",
        ],
    ),
    Question(
        id="AI-Q6", text="Briefly describe the intended use — organization sponsoring the system",
        q_type=QuestionType.TEXTAREA, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="Intended Use / Sponsor", ai_enabled=True, is_mandatory=True, weight=1.0,
        suggestions=["Name the sponsoring organization", "Describe the intended use case"],
    ),
    Question(
        id="AI-Q7", text="Describe the scope / described use of the system",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.AI_REGISTRY,
        label="Scope", ai_enabled=True, is_mandatory=True, weight=1.0,
        suggestions=["Define boundaries of the system", "Clarify what is in and out of scope"],
    ),
    Question(
        id="AI-Q8", text="Are you planning to implement a third party product?",
        q_type=QuestionType.RADIO, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="Third Party Product", options=["Yes", "No"],
    ),
    Question(
        id="AI-Q10", text="Which third party/parties?",
        q_type=QuestionType.TEXT, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="Third Parties", required=False, conditional_parent="AI-Q8",
    ),
    Question(
        id="AI-Q11", text="What product(s)?",
        q_type=QuestionType.TEXT, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="Third Party Products", required=False, conditional_parent="AI-Q8",
    ),
    Question(
        id="AI-Q12", text="Describe the users and what problem you are solving",
        q_type=QuestionType.TEXTAREA, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="User Description", ai_enabled=True, is_mandatory=True, weight=1.0,
        suggestions=["Identify primary users", "Describe the problem clearly", "Mention scale of impact"],
    ),
    Question(
        id="AI-Q13", text="Where will you deploy? (Select regions)",
        q_type=QuestionType.MULTISELECT, block=Block.SYSTEM, form_type=FormType.AI_REGISTRY,
        label="Deployment Regions",
        options=["Asia", "China", "Europe", "Latin America", "US", "Other"],
    ),
    Question(
        id="AI-Q14", text="Who is the audience?",
        q_type=QuestionType.MULTISELECT, block=Block.USER, form_type=FormType.AI_REGISTRY,
        label="Audience",
        options=["HCPs", "Lilly Employees", "Patients-Clinical", "Patients-Commercial", "Other"],
    ),
    Question(
        id="AI-Q15", text="Do you have additional technical information to provide?",
        q_type=QuestionType.RADIO, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Has Technical Details", options=["Yes", "No"],
    ),
    # --- Conditional on AI-Q15 = Yes ---
    Question(
        id="AI-Q17", text="Does the system process any of the following types of data?",
        q_type=QuestionType.MULTISELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Data Types Processed", is_mandatory=True, conditional_parent="AI-Q15",
        options=["Certain Group Data", "Confidential Information", "GxP", "Personal Information", "None"],
    ),
    Question(
        id="AI-Q18", text="What is the highest data classification?",
        q_type=QuestionType.SELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Data Classification", is_mandatory=True, conditional_parent="AI-Q15",
        options=["Green", "Yellow", "Orange", "Red"],
    ),
    Question(
        id="AI-Q19", text="Is any data used for training the AI model?",
        q_type=QuestionType.SELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Training Data", conditional_parent="AI-Q15",
        options=["Yes", "No", "Not Sure"],
    ),
    Question(
        id="AI-Q20", text="Describe the data needed by the system",
        q_type=QuestionType.TEXTAREA, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Data Description", ai_enabled=True, is_mandatory=True, weight=1.5,
        conditional_parent="AI-Q15",
        suggestions=["Describe data sources", "Mention data volume", "Clarify sensitivity"],
    ),
    Question(
        id="AI-Q21", text="Does the AI do any of the following?",
        q_type=QuestionType.MULTISELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="AI Functions", is_mandatory=True, conditional_parent="AI-Q15",
        options=[
            "Embedded in a device", "Creating new IP", "Emotion/sentiment detection",
            "Patient interaction", "Regulated data generation", "HR decisions",
            "Patient safety", "Regulatory decisions", "R&D", "Copyright scraping", "None",
        ],
    ),
    Question(
        id="AI-Q22", text="Is the AI output reviewed by a human before action?",
        q_type=QuestionType.SELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Human Review", is_mandatory=True, conditional_parent="AI-Q15",
        options=["Yes - 100% of the output", "Yes - a sampling", "No"],
    ),
    Question(
        id="AI-Q23", text="Please explain the impact if the AI produces an incorrect output",
        q_type=QuestionType.TEXTAREA, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Impact if Wrong", ai_enabled=True, is_mandatory=True,
        conditional_parent="AI-Q22",
        suggestions=["Describe potential harm", "Explain mitigation strategy", "Quantify risk"],
    ),
    Question(
        id="AI-Q24", text="Which AI platforms / technologies are used?",
        q_type=QuestionType.MULTISELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="AI Platforms", ai_enabled=True, conditional_parent="AI-Q15",
        options=[
            "Amazon Bedrock", "Azure OpenAI", "Cortex", "LLM Gateway",
            "Google Vertex AI", "Hugging Face", "SageMaker", "Other",
        ],
    ),
    Question(
        id="AI-Q25", text="Which AI models are used?",
        q_type=QuestionType.MULTISELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="AI Models", conditional_parent="AI-Q15",
        options=["Claude", "AWS Nova", "Azure GPT", "GPT-4o", "GPT-5", "Llama", "Other"],
    ),
    Question(
        id="AI-Q26", text="Any open source models?",
        q_type=QuestionType.MULTISELECT, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Open Source Models", conditional_parent="AI-Q15",
        options=["Llama", "Torchvision", "Other", "None"],
    ),
    Question(
        id="AI-Q27", text="Does the AI/ML use continuous learning?",
        q_type=QuestionType.RADIO, block=Block.TECH, form_type=FormType.AI_REGISTRY,
        label="Continuous Learning", conditional_parent="AI-Q15",
        options=["Yes", "No"],
    ),
]


SECURITY_QUESTIONS: list[Question] = [
    Question(
        id="S-Q1", text="What is the title of this initiative?",
        q_type=QuestionType.TEXT, block=Block.SYSTEM, form_type=FormType.SECURITY,
        label="Initiative Title", is_mandatory=True,
    ),
    Question(
        id="S-Q2", text="Which business domain does this fall under?",
        q_type=QuestionType.SELECT, block=Block.SYSTEM, form_type=FormType.SECURITY,
        label="Business Domain",
        options=["Oncology", "Neuroscience", "Immunology", "Diabetes", "Corporate", "Manufacturing",
                 "IT", "R&D", "Commercial", "Medical", "Finance", "HR", "Other"],
    ),
    Question(
        id="S-Q3", text="Provide a description of the initiative and its business value",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.SECURITY,
        label="Description / Value", ai_enabled=True, is_mandatory=True,
        suggestions=["Explain business problem", "Describe solution approach", "Mention stakeholders"],
    ),
    Question(
        id="S-Q5", text="Does this initiative use AI?",
        q_type=QuestionType.RADIO, block=Block.TECH, form_type=FormType.SECURITY,
        label="Uses AI", options=["Yes", "No"],
    ),
    Question(
        id="S-Q7", text="Who must be informed of updates? (Email list)",
        q_type=QuestionType.TEXT, block=Block.USER, form_type=FormType.SECURITY,
        label="Informed Contacts",
    ),
    Question(
        id="S-Q8", text="Who is the technical lead / IT contact?",
        q_type=QuestionType.TEXT, block=Block.USER, form_type=FormType.SECURITY,
        label="Technical Lead",
    ),
    Question(
        id="S-Q9", text="What phase of development is this in?",
        q_type=QuestionType.SELECT, block=Block.SYSTEM, form_type=FormType.SECURITY,
        label="Development Phase",
        options=["1-POV/POC", "2-RFP/Planning", "3-Design", "4-Development", "5-QA", "6-Production"],
    ),
    Question(
        id="S-Q16", text="Where/how is the solution hosted?",
        q_type=QuestionType.SELECT, block=Block.TECH, form_type=FormType.SECURITY,
        label="Hosting",
        options=["Lilly Cloud", "SaaS", "External DC", "On-Prem", "Hybrid", "Something Else", "Not hosted"],
    ),
    Question(
        id="S-Q21", text="Who will access the system?",
        q_type=QuestionType.SELECT, block=Block.USER, form_type=FormType.SECURITY,
        label="Access", options=["Lilly only", "Non-Lilly", "Both"],
    ),
    Question(
        id="S-Q22", text="How do users interact and what are their roles?",
        q_type=QuestionType.TEXTAREA, block=Block.USER, form_type=FormType.SECURITY,
        label="User Roles", ai_enabled=True,
        suggestions=["Describe each user role", "Explain permissions model"],
    ),
    Question(
        id="S-Q23", text="Does the solution use Lilly SSO for all logins?",
        q_type=QuestionType.RADIO, block=Block.TECH, form_type=FormType.SECURITY,
        label="SSO Authentication", options=["Yes", "No"],
    ),
]


DLO_QUESTIONS: list[Question] = [
    Question(
        id="L-Q1", text="Are you reporting a privacy concern?",
        q_type=QuestionType.RADIO, block=Block.SYSTEM, form_type=FormType.DLO,
        label="Privacy Concern", options=["Yes", "No"],
    ),
    Question(
        id="L-Q2", text="How can we help?",
        q_type=QuestionType.SELECT, block=Block.SYSTEM, form_type=FormType.DLO,
        label="Help Type",
        options=["Contract Review", "Privacy Assessment", "Legal Advice", "IP Question",
                 "Patent", "Trademark", "Data Use", "Regulatory", "Compliance", "Other"],
    ),
    Question(
        id="L-Q4", text="Is a privacy review needed?",
        q_type=QuestionType.RADIO, block=Block.SYSTEM, form_type=FormType.DLO,
        label="Privacy Review", options=["Yes", "No"],
    ),
    Question(
        id="L-Q5", text="Provide details for the review",
        q_type=QuestionType.TEXTAREA, block=Block.SYSTEM, form_type=FormType.DLO,
        label="Review Details", ai_enabled=True, is_mandatory=True,
        suggestions=["Describe the initiative clearly", "Mention data types involved", "Explain urgency"],
    ),
    Question(
        id="L-Q6", text="Which business area is accountable?",
        q_type=QuestionType.SELECT, block=Block.USER, form_type=FormType.DLO,
        label="Business Area",
        options=["Oncology", "Neuroscience", "Immunology", "Diabetes", "IT", "R&D",
                 "Commercial", "Medical", "Finance", "HR", "Manufacturing", "Corporate",
                 "Legal", "Compliance", "Supply Chain", "Other"],
    ),
]

WWTP_QUESTIONS: list[Question] = [
    Question(
        id="W-Q1", text="What is the engagement name?",
        q_type=QuestionType.TEXT, block=Block.USER, form_type=FormType.WWTP,
        label="Engagement Name",
    ),
    Question(
        id="W-Q2", text="Who is the engagement owner?",
        q_type=QuestionType.SELECT, block=Block.USER, form_type=FormType.WWTP,
        label="Engagement Owner",
        options=["Business Owner", "IT Owner", "Procurement Owner", "Legal Owner"],
    ),
    Question(
        id="W-Q3", text="Describe the products/services being procured",
        q_type=QuestionType.TEXTAREA, block=Block.USER, form_type=FormType.WWTP,
        label="Products/Services", ai_enabled=True,
        suggestions=["Describe all services", "Mention delivery terms", "Include SLA expectations"],
    ),
    Question(
        id="W-Q4", text="Is this an external-facing website or app?",
        q_type=QuestionType.RADIO, block=Block.SYSTEM, form_type=FormType.WWTP,
        label="External Facing", options=["Yes", "No"],
    ),
]


# ---------------------------------------------------------------------------
# Conditional rules
# ---------------------------------------------------------------------------

CONDITIONAL_RULES: list[ConditionalRule] = [
    ConditionalRule(
        trigger_question="AI-Q8", trigger_values=["Yes"],
        add_questions=["AI-Q10", "AI-Q11"],
    ),
    ConditionalRule(
        trigger_question="AI-Q15", trigger_values=["Yes"],
        add_questions=["AI-Q17", "AI-Q18", "AI-Q19", "AI-Q20", "AI-Q21",
                        "AI-Q22", "AI-Q24", "AI-Q25", "AI-Q26", "AI-Q27"],
        remove_questions=["AI-Q20", "AI-Q23"],  # Removed from default mandatory if No
    ),
    ConditionalRule(
        trigger_question="AI-Q22", trigger_values=["No", "Yes - a sampling"],
        add_questions=["AI-Q23"],
    ),
]


# ---------------------------------------------------------------------------
# Registry class
# ---------------------------------------------------------------------------

class FormRegistry:
    def __init__(self):
        all_qs = (
            IDEA_SUB_QUESTIONS + AI_REGISTRY_QUESTIONS +
            SECURITY_QUESTIONS + DLO_QUESTIONS + WWTP_QUESTIONS
        )
        self._questions: dict[str, Question] = {q.id: q for q in all_qs}
        self._conditionals = CONDITIONAL_RULES
        self._form_questions: dict[str, list[str]] = {}
        for q in all_qs:
            self._form_questions.setdefault(q.form_type.value, []).append(q.id)

    def get(self, question_id: str) -> Optional[Question]:
        return self._questions.get(question_id)

    def get_questions_for_form(self, form_type: str) -> list[Question]:
        qids = self._form_questions.get(form_type, [])
        return [self._questions[qid] for qid in qids]

    def get_base_questions(self, form_type: str) -> list[str]:
        """Questions that are always visible (no conditional parent)."""
        return [
            q.id for q in self.get_questions_for_form(form_type)
            if q.conditional_parent is None
        ]

    def get_block_for_question(self, question_id: str) -> Optional[str]:
        q = self._questions.get(question_id)
        return q.block.value if q else None

    def get_conditionals_for(self, question_id: str) -> list[ConditionalRule]:
        return [r for r in self._conditionals if r.trigger_question == question_id]

    def get_mandatory_questions(self, form_type: str) -> list[str]:
        return [
            q.id for q in self.get_questions_for_form(form_type)
            if q.is_mandatory
        ]

    def get_suggestions(self, question_id: str) -> list[str]:
        q = self._questions.get(question_id)
        return q.suggestions if q else []

    def get_weight(self, question_id: str) -> float:
        q = self._questions.get(question_id)
        return q.weight if q else 1.0

    def list_form_types(self) -> list[str]:
        return list(self._form_questions.keys())

    def all_question_ids(self) -> list[str]:
        return list(self._questions.keys())


form_registry = FormRegistry()
