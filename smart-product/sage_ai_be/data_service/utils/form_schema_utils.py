"""
Form Schema Utilities
Provides helper functions for working with form schemas in the database.
"""

from sqlalchemy.future import select
from data_service.models.form_schemas import FormSchemas


async def get_form_schemas_by_category_id(db, category_id):
    """
    Fetch all active form schemas for a given category_id.
    """
    result = await db.execute(
        select(FormSchemas).where(
            FormSchemas.category_id == category_id, FormSchemas.is_active is True
        )
    )
    return result.scalars().all()
