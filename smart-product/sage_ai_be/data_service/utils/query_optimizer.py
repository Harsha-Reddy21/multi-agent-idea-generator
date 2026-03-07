"""
Query Optimization Utilities
============================
Provides utilities for optimizing SQLAlchemy queries to avoid N+1 query problems.
"""

from typing import List, Type, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from data_service.models.base import Base
from data_service.models.submissions import Submissions
from data_service.models.ai_interactions import AIInteractions


class QueryOptimizer:
    """
    Utility class for optimizing SQLAlchemy queries to prevent N+1 issues.
    """

    @staticmethod
    def with_relationships(query, *relationships):
        """
        Add selectinload for multiple relationships to avoid N+1 queries.

        Args:
            query: SQLAlchemy query
            *relationships: Relationship attributes to eager load

        Returns:
            Query with selectinload options

        Example:
            query = select(Submissions)
            optimized = QueryOptimizer.with_relationships(
                query,
                Submissions.ai_interactions,
                Submissions.ai_interactions.and_(AIInteractions.feedbacks)
            )
        """
        for rel in relationships:
            query = query.options(selectinload(rel))
        return query

    @staticmethod
    def with_joins(query, *relationships):
        """
        Add joinedload for multiple relationships for single object queries.

        Args:
            query: SQLAlchemy query
            *relationships: Relationship attributes to join load

        Returns:
            Query with joinedload options

        Note:
            Use this for single object queries, not for collections
        """
        for rel in relationships:
            query = query.options(joinedload(rel))
        return query

    @staticmethod
    async def fetch_with_relationships(
        db: AsyncSession, model: Type[Base], filter_condition, *relationships
    ) -> List[Any]:
        """
        Fetch objects with eager-loaded relationships to avoid N+1 queries.

        Args:
            db: Database session
            model: SQLAlchemy model class
            filter_condition: WHERE clause condition
            *relationships: Relationship attributes to eager load

        Returns:
            List of objects with eager-loaded relationships

        Example:
            submissions = await QueryOptimizer.fetch_with_relationships(
                db,
                Submissions,
                Submissions.submitter_id == user.id,
                Submissions.ai_interactions,
                Submissions.ai_interactions.and_(AIInteractions.feedbacks)
            )
        """
        query = select(model).where(filter_condition)
        for rel in relationships:
            query = query.options(selectinload(rel))

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def fetch_single_with_relationships(
        db: AsyncSession, model: Type[Base], filter_condition, *relationships
    ) -> Any:
        """
        Fetch single object with eager-loaded relationships.

        Args:
            db: Database session
            model: SQLAlchemy model class
            filter_condition: WHERE clause condition
            *relationships: Relationship attributes to eager load

        Returns:
            Single object with eager-loaded relationships or None

        Example:
            submission = await QueryOptimizer.fetch_single_with_relationships(
                db,
                Submissions,
                Submissions.id == submission_id,
                Submissions.ai_interactions
            )
        """
        query = select(model).where(filter_condition)
        for rel in relationships:
            query = query.options(joinedload(rel))

        result = await db.execute(query)
        return result.scalars().first()


# Convenience functions for common patterns
async def fetch_submissions_with_interactions(
    db: AsyncSession, submitter_id: str
) -> List[Any]:
    """
    Fetch submissions with AI interactions eagerly loaded.
    Prevents N+1 queries when accessing submission.ai_interactions.
    """
    return await QueryOptimizer.fetch_with_relationships(
        db,
        Submissions,
        Submissions.submitter_id == submitter_id,
        Submissions.ai_interactions,
    )


async def fetch_ai_interactions_with_feedbacks(
    db: AsyncSession, submission_id: str
) -> List[Any]:
    """
    Fetch AI interactions with feedbacks eagerly loaded.
    Prevents N+1 queries when accessing interaction.feedbacks.
    """
    return await QueryOptimizer.fetch_with_relationships(
        db,
        AIInteractions,
        AIInteractions.submission_id == submission_id,
        AIInteractions.feedbacks,
    )
