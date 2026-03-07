"""add novelty_score to submissions

Revision ID: 194f7c1509b0
Revises: 88c4555881f6
Create Date: 2025-11-29 20:25:57.927820

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "194f7c1509b0"
down_revision: Union[str, None] = "88c4555881f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add novelty_score column to sage_ai_submissions table"""
    op.add_column(
        "sage_ai_submissions",
        sa.Column("novelty_score", sa.Float(), nullable=True),
        schema="public",
    )


def downgrade() -> None:
    """Remove novelty_score column from sage_ai_submissions table"""
    op.drop_column("sage_ai_submissions", "novelty_score", schema="public")
