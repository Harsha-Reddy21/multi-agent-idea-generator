"""add_form_id_to_uploaded_documents

Revision ID: 0ece33ca2739
Revises: a1b2c3d4e5f6
Create Date: 2025-12-09 21:32:05.350933

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0ece33ca2739'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add form_id column to sage_ai_uploaded_documents table
    op.add_column(
        "sage_ai_uploaded_documents",
        sa.Column("form_id", sa.UUID(), nullable=True),
        schema="public",
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        "sage_ai_uploaded_documents_form_id_fkey",
        "sage_ai_uploaded_documents",
        "sage_ai_submission_forms",
        ["form_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
    )


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint(
        "sage_ai_uploaded_documents_form_id_fkey",
        "sage_ai_uploaded_documents",
        schema="public",
        type_="foreignkey",
    )
    
    # Drop form_id column
    op.drop_column(
        "sage_ai_uploaded_documents",
        "form_id",
        schema="public",
    )
