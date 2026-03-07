"""
AI Feedback Model
=================
Stores user feedback on AI-generated content
"""

import uuid

from sqlalchemy import Column, Text, ForeignKey, TIMESTAMP, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from data_service.models.base import Base
from data_service.constants.constants import TableName


class AIFeedback(Base):
    """
    Stores user feedback on AI-generated content
    One-to-one relationship with AIInteractions

    Attributes:
        id: Unique feedback identifier
        interaction_id: Foreign key to sage_ai_ai_interactions
        feedback_type: User's like/dislike
        feedback_tags: Tags like ["relevant", "accurate", "clear", "others"]
        user_comment: User's optional comment
        created_at: When feedback was created
        updated_at: When feedback was last updated
    """

    __tablename__ = TableName.AI_FEEDBACK.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    interaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_ai_interactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    feedback_type = Column(Text, nullable=False, index=True)
    feedback_tags = Column(ARRAY(Text), nullable=True)
    user_comment = Column(Text, nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    # Check Constraints
    __table_args__ = (
        CheckConstraint(
            "feedback_type IN ('like', 'dislike')", name="check_feedback_type"
        ),
    )

    # Relationships
    interaction = relationship("AIInteractions", back_populates="feedbacks")

    def __repr__(self):
        return (
            f"<AIFeedback(id={self.id}, "
            f"interaction_id={self.interaction_id}, "
            f"feedback_type={self.feedback_type})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "interaction_id": str(self.interaction_id),
            "feedback_type": self.feedback_type,
            "feedback_tags": self.feedback_tags,
            "user_comment": self.user_comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
