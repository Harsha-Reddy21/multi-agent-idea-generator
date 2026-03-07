"""
Suggestions model for storing suggestions for questions.
"""

from typing import Dict, Any
from sqlalchemy import Column, String, JSON, TIMESTAMP, CheckConstraint, text

from data_service.constants.constants import TableName, FormType
from data_service.models.base import Base


class Suggestions(Base):
    """
    Suggestions model for storing static suggestions for questions.

    Attributes:
        question_id: Unique identifier for the question
        suggestions: JSON array of suggestion objects
        form_type: Type of form this suggestion applies to
        created_at: Timestamp when the record was created
        updated_at: Timestamp when the record was last updated
    """

    __tablename__ = TableName.SUGGESTIONS.value

    question_id = Column(String(255), primary_key=True, nullable=False)
    suggestions = Column(JSON, nullable=False)
    form_type = Column(String(100), nullable=False, index=True)

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
            f"form_type IN ("
            f"'{FormType.AI_REGISTRY.value}', "
            f"'{FormType.AI_REGISTRY_UPDATE.value}', "
            f"'{FormType.WWTP.value}', "
            f"'{FormType.DLO.value}', "
            f"'{FormType.GCO_RISK_REGISTRY.value}', "
            f"'{FormType.SECURITY_ARCH.value}', "
            f"'{FormType.IDEA_SUB.value}', "
            f"'{FormType.WWTP_NEW_VENDOR.value}')",
            name="check_suggestions_form_type",
        ),
        CheckConstraint(
            "LENGTH(question_id) <= 255",
            name="check_suggestions_question_id_length",
        ),
    )

    def __repr__(self) -> str:
        """
        String representation of the Suggestions instance.

        Returns:
            str: A formatted string showing key attributes
        """
        return (
            f"<Suggestions(question_id={self.question_id}, "
            f"form_type={self.form_type})>"
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model instance to dictionary.

        Returns:
            Dict[str, Any]: Dictionary representation of the model
        """
        return {
            "question_id": self.question_id,
            "suggestions": self.suggestions if self.suggestions else [],
            "form_type": self.form_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
