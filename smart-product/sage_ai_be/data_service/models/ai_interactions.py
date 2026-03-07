"""
AI Interactions Model
=====================
Tracks AI feature interactions with questions in submissions
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    ForeignKey,
    TIMESTAMP,
    CheckConstraint,
    Boolean,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from data_service.models.base import Base
from data_service.constants.constants import TableName


class AIInteractions(Base):
    """
    Stores AI interaction context (which question, which submission, when)

    Attributes:
        id: Unique interaction identifier
        submission_id: Foreign key to sage_ai_submissions
        question_id: Foreign key to sage_ai_questions
        form_id: Foreign key to submission_forms id
        user_input: User's answer at that moment
        ai_feature_type: Which AI feature was used
        ai_generated_content: AI's response/output
        is_accepted: Whether user accepted/used the AI suggestion (None if not applicable)
        created_at: Timestamp when interaction was created
    """

    __tablename__ = TableName.AI_INTERACTIONS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id = Column(
        Text,
        ForeignKey("sage_ai_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    form_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_submission_forms.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    user_input = Column(Text, nullable=True)
    ai_feature_type = Column(Text, nullable=False, index=True)
    # form_id = Column(
    #     UUID(as_uuid=True),
    #     ForeignKey("sage_ai_submission_forms.id", ondelete="CASCADE"),
    #     nullable=True,
    #     index=True,
    # )
    # user_input = Column(Text, nullable=True)
    # ai_feature_type = Column(Text, nullable=False, index=True)
    ai_generated_content = Column(JSONB, nullable=False)
    is_accepted = Column(Boolean, nullable=True, default=None, index=True)
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    # Check Constraints
    __table_args__ = (
        CheckConstraint(
            "ai_feature_type IN "
            "('suggestions', 'enhance_answer', 'data_extracts', 'check_coverage')",
            name="check_ai_interactions_feature_type",
        ),
    )

    submission = relationship("Submissions", back_populates="ai_interactions")
    question = relationship("Questions", back_populates="ai_interactions")
    feedbacks = relationship(
        "AIFeedback", back_populates="interaction", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<AIInteractions(id={self.id}, "
            f"submission_id={self.submission_id}, "
            f"question_id={self.question_id}, "
            f"ai_feature_type={self.ai_feature_type})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "question_id": self.question_id,
            "form_id": str(self.form_id) if self.form_id else None,
            "user_input": self.user_input,
            "ai_feature_type": self.ai_feature_type,
            "ai_generated_content": self.ai_generated_content,
            "is_accepted": self.is_accepted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
