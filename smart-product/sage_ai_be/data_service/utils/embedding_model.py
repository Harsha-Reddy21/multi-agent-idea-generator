"""
Embedding Model Utility
========================
Manages loading and access to sentence transformer embedding models.
"""

import logging
from typing import Optional
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Global variable to store the embedding model
_embedding_model: Optional[SentenceTransformer] = None


def load_embedding_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    """
    Load the sentence transformer embedding model at startup.

    Args:
        model_name: Name of the sentence transformer model to load.
                   Default is 'all-MiniLM-L6-v2' (lightweight, fast, good performance)

    Returns:
        SentenceTransformer: Loaded embedding model

    Raises:
        Exception: If the model fails to load
    """
    global _embedding_model

    try:
        logger.info("Starting to load embedding model: %s", model_name)
        logger.info("If model is not cached, it will be downloaded from HuggingFace...")

        _embedding_model = SentenceTransformer(model_name)

        logger.info("Embedding model loaded successfully: %s", model_name)
        logger.info("Model is ready for inference")
        return _embedding_model
    except Exception as e:
        logger.error("Failed to load embedding model %s: %s", model_name, e)
        raise


def get_embedding_model() -> SentenceTransformer:
    """
    Get the loaded embedding model instance.

    Returns:
        SentenceTransformer: The loaded embedding model

    Raises:
        RuntimeError: If the model hasn't been loaded yet
    """
    if _embedding_model is None:
        raise RuntimeError(
            "Embedding model not loaded. Call load_embedding_model() first."
        )
    return _embedding_model
