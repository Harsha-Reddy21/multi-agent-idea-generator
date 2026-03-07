# Deprecated code

# """
# Database Client Module
# =======================
# Handles PostgreSQL database connections and operations.
# """
#
# import os
# import logging
# from contextlib import contextmanager
# from typing import Dict, Any
#
# import psycopg2
# from psycopg2 import Error
#
# logger = logging.getLogger(__name__)
#
#
# class DatabaseClient:
#     """Client for PostgreSQL database operations"""
#
#     def __init__(self):
#         self.config = {
#             "host": os.getenv("DB_HOST", ""),
#             "port": os.getenv("DB_PORT", ""),
#             "database": os.getenv("DB_NAME", ""),
#             "user": os.getenv("DB_USER", ""),
#             "password": os.getenv("DB_PASSWORD", ""),
#         }
#
#     @contextmanager
#     def get_connection(self):
#         """
#         Context manager for database connections
#
#         Yields:
#             psycopg2 connection object
#
#         Raises:
#             psycopg2.Error: If connection fails
#         """
#         connection = None
#         try:
#             connection = psycopg2.connect(**self.config)
#             yield connection
#         except Error as e:
#             logger.error("Database connection error: %s", e)
#             raise
#         except Exception as e:
#             logger.error("Unexpected error connecting to database: %s", e)
#             raise
#         finally:
#             if connection:
#                 connection.close()
#
#     def test_connection(self) -> Dict[str, Any]:
#         """
#         Test database connection and retrieve version info
#
#         Returns:
#             Dictionary with connection status and details
#         """
#         try:
#             with self.get_connection() as conn:
#                 cursor = conn.cursor()
#                 cursor.execute("SELECT version();")
#                 db_version = cursor.fetchone()[0]
#                 cursor.close()
#
#                 return {
#                     "status": "success",
#                     "message": "Database connection successful",
#                     "database_version": db_version,
#                     "connection_info": {
#                         "host": self.config["host"],
#                         "port": self.config["port"],
#                         "database": self.config["database"],
#                         "user": self.config["user"],
#                     },
#                 }
#         except (Error, ValueError) as e:
#             return {
#                 "status": "error",
#                 "message": f"Database connection failed: {str(e)}",
#                 "connection_info": {
#                     "host": self.config["host"],
#                     "port": self.config["port"],
#                     "database": self.config["database"],
#                     "user": self.config["user"],
#                 },
#             }
#
#     def get_config_info(self) -> Dict[str, Any]:
#         """
#         Get current database configuration (excluding password)
#
#         Returns:
#             Dictionary with configuration details
#         """
#         return {
#             "host": self.config["host"],
#             "port": self.config["port"],
#             "database": self.config["database"],
#             "user": self.config["user"],
#             "password_set": bool(self.config["password"]),
#         }
#
#
# # Singleton instance
# db_client = DatabaseClient()
