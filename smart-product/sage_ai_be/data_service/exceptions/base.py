"""
Base exception classes for service layer errors.
"""


class ServiceError(Exception):
    """
    Base exception for all service-level errors.

    Attributes:
        error: Short error type identifier (e.g., "Unauthorized", "Validation Error")
        message: Human-readable error message for the client
        status_code: HTTP status code to return
    """

    def __init__(self, error: str, message: str, status_code: int):
        self.error = error
        self.message = message
        self.status_code = status_code
        super().__init__(message)

    def __repr__(self):
        return (
            f"{self.__class__.__name__}(error='{self.error}', "
            f"message='{self.message}', status_code={self.status_code})"
        )
