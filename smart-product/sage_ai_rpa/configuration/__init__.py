"""Configuration module initialization.

This module exports the settings instance and provides a config object
with uppercase attribute names for backward compatibility.
"""

from .settings import settings


class Config:
    """Configuration wrapper that exposes settings as uppercase attributes."""

    def __init__(self, settings_instance):
        self._settings = settings_instance

    def __getattr__(self, name: str):
        """Allow access to settings using uppercase attribute names.

        Maps uppercase attribute names to lowercase settings attributes.
        Example: config.DB_NAME -> settings.db_name
        """
        # Convert uppercase attribute name to lowercase
        lowercase_name = name.lower()

        # Try to get the attribute from settings
        if hasattr(self._settings, lowercase_name):
            return getattr(self._settings, lowercase_name)

        # If not found, raise AttributeError
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")


# Create config instance for backward compatibility
config = Config(settings)

# Export both config and settings
__all__ = ["config", "settings"]
