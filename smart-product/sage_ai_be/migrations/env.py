# pylint: skip-file
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config
from sqlalchemy import pool

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from data_service.configurations.settings import settings
from data_service.constants import constants
from data_service.models.base import Base
import data_service.models.categories
import data_service.models.form_schemas
import data_service.models.form_extractions
import data_service.models.service_now_tickets
import data_service.models.submission_forms
import data_service.models.submissions
import data_service.models.uploaded_documents
import data_service.models.users
import data_service.models.questions
import data_service.models.sage_ai_rpa_status
import data_service.models.suggestions
import data_service.models.question_scoring_config
import data_service.models.question_mapping
import data_service.models.submission_processing_status
import data_service.models.suggestion_coverage_score
import data_service.models.form_rules
import data_service.models.ai_interactions
import data_service.models.ai_feedback

DATABASE_URI = (
    f"postgresql+psycopg2://{settings.db_user}:{settings.db_password}@"
    f"{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

target_metadata = Base.metadata

config.set_main_option("sqlalchemy.url", DATABASE_URI)


def include_object(object, name, type_, reflected, compare_to):
    if hasattr(object, "schema") and object.schema != constants.SERVICE_SCHEMA:
        return False
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema=constants.SERVICE_SCHEMA,
        include_schemas=True,
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            version_table_schema=constants.SERVICE_SCHEMA,
            include_schemas=True,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
