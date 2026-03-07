"""merge changes to suggestions tbl and temporary stub fix

Revision ID: 3a181c3e8bb2
Revises: 091110df63cc, 2a2db548ed94
Create Date: 2025-12-17 18:31:19.198978

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a181c3e8bb2'
down_revision: Union[str, None] = ('091110df63cc', '2a2db548ed94')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
