"""drop_form_id_fk_from_ai_interactions

Revision ID: 585d12100eef
Revises: 608765602ba0
Create Date: 2025-12-01 20:01:42.787689

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '585d12100eef'
down_revision: Union[str, None] = '608765602ba0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
 
    # Drop foreign key constraint for form_id
 
    op.drop_constraint('sage_ai_ai_interactions_form_id_fkey', 'sage_ai_ai_interactions', type_='foreignkey')


def downgrade() -> None:
 
 
 
    op.create_foreign_key(
 
        'sage_ai_ai_interactions_form_id_fkey',
 
        'sage_ai_ai_interactions', 'sage_ai_submission_forms',
 
        ['form_id'], ['id'],
 
        ondelete='CASCADE'
 
    )
