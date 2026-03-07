"""add final_score to submissions

Revision ID: 88c4555881f6
Revises: 1f1920b511d0
Create Date: 2025-11-24 14:40:15.805915

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "88c4555881f6"
down_revision: Union[str, None] = "1f1920b511d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "sage_ai_submissions",
        sa.Column("final_score", sa.Float(), nullable=True),
        schema="public",
    )


def downgrade() -> None:
    op.drop_column("sage_ai_submissions", "final_score", schema="public")
