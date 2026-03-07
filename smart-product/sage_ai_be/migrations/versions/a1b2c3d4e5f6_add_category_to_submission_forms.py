"""add category column to submission forms

Revision ID: a1b2c3d4e5f6
Revises: 61f864674f5f
Create Date: 2025-12-03 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "61f864674f5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add form_category column to store recommended or optional value
    op.add_column(
        "sage_ai_submission_forms",
        sa.Column("form_category", sa.Text(), nullable=True),
        schema="public",
    )


def downgrade() -> None:
    # Remove form_category column
    op.drop_column("sage_ai_submission_forms", "form_category", schema="public")
