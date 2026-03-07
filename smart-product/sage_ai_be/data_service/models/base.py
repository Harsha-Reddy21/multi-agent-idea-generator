"""
Base module
This module contains the base class for all SQLAlchemy models.
"""

from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base
from data_service.constants import constants

metadata = MetaData(schema=constants.SERVICE_SCHEMA)
Base = declarative_base(metadata=metadata)
