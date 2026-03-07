"""
Tests for embedding model utility.
"""

import pytest
from unittest.mock import patch, MagicMock
from data_service.utils.embedding_model import (
    load_embedding_model,
    get_embedding_model,
    _embedding_model,
)


def test_load_embedding_model_success():
    """Test successful loading of embedding model."""
    with patch("data_service.utils.embedding_model.SentenceTransformer") as mock_st:
        mock_model = MagicMock()
        mock_st.return_value = mock_model

        result = load_embedding_model("test-model")

        assert result == mock_model
        mock_st.assert_called_once_with("test-model")


def test_load_embedding_model_default():
    """Test loading embedding model with default model name."""
    with patch("data_service.utils.embedding_model.SentenceTransformer") as mock_st:
        mock_model = MagicMock()
        mock_st.return_value = mock_model

        result = load_embedding_model()

        assert result == mock_model
        mock_st.assert_called_once_with("all-MiniLM-L6-v2")


def test_load_embedding_model_failure():
    """Test handling of embedding model loading failure."""
    with patch("data_service.utils.embedding_model.SentenceTransformer") as mock_st:
        mock_st.side_effect = Exception("Model not found")

        with pytest.raises(Exception, match="Model not found"):
            load_embedding_model("invalid-model")


def test_get_embedding_model_success():
    """Test getting a loaded embedding model."""
    with patch("data_service.utils.embedding_model.SentenceTransformer") as mock_st:
        mock_model = MagicMock()
        mock_st.return_value = mock_model

        # Load the model first
        load_embedding_model()

        # Get the model
        result = get_embedding_model()

        assert result == mock_model


def test_get_embedding_model_not_loaded():
    """Test getting embedding model when it hasn't been loaded."""
    # Reset the global variable
    import data_service.utils.embedding_model as em

    original_model = em._embedding_model
    em._embedding_model = None

    try:
        with pytest.raises(RuntimeError, match="Embedding model not loaded"):
            get_embedding_model()
    finally:
        # Restore original state
        em._embedding_model = original_model
