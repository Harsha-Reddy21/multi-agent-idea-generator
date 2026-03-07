"""
Category Utilities
Provides helper functions for working with categories in the database.
"""

from sqlalchemy.future import select
from data_service.models.categories import Categories


async def get_category_id(db):
    """
    Fetch the first active category_id from the Categories table.
    """
    result = await db.execute(
        select(Categories)
        .where(Categories.is_active is True)
        .order_by(Categories.created_at)
    )
    category = result.scalars().first()
    if category:
        return category.id
    return None
