"""add priority column to question mapping

Revision ID: f8a9b2c3d4e5
Revises: 194f7c1509b0
Create Date: 2025-12-01 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f8a9b2c3d4e5"
down_revision: Union[str, None] = "194f7c1509b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add priority column with default value of 1
    op.add_column(
        "sage_ai_question_mapping",
        sa.Column("priority", sa.Integer(), nullable=False, server_default="1"),
        schema="public",
    )


def downgrade() -> None:
    # Remove priority column
    op.drop_column("sage_ai_question_mapping", "priority", schema="public")
