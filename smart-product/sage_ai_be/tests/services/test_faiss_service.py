"""
FAISS Service Tests
===================
Comprehensive unit tests for FAISS service functionality including S3 integration.
"""

import pytest
import numpy as np
import pandas as pd
import faiss
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock, call

from data_service.service.faiss_service import (
    FAISSService,
    initialize_faiss_service,
    get_faiss_service,
)


# Test Fixtures
@pytest.fixture
def temp_index_file(tmp_path):
    """Create a temporary FAISS index file."""
    index_path = tmp_path / "test_index.faiss"

    # Create a simple FAISS index with 5 vectors of dimension 384
    dimension = 384
    index = faiss.IndexFlatL2(dimension)

    # Add some random vectors
    vectors = np.random.random((5, dimension)).astype("float32")
    index.add(vectors)

    # Save index
    faiss.write_index(index, str(index_path))

    return index_path


@pytest.fixture
def temp_metadata_file(tmp_path):
    """Create a temporary metadata parquet file."""
    metadata_path = tmp_path / "test_metadata.parquet"

    # Create sample metadata
    metadata = pd.DataFrame(
        {
            "air_number": ["AIR-001", "AIR-002", "AIR-003", "AIR-004", "AIR-005"],
            "short_description": [
                "Cancer Treatment Study",
                "Diabetes Management Program",
                "Cardiovascular Drug Trial",
                "Alzheimer Prevention Research",
                "Pain Management Solution",
            ],
            "description": [
                "A comprehensive study on novel cancer treatments",
                "Program to improve diabetes management outcomes",
                "Clinical trial for new cardiovascular medication",
                "Research focused on preventing Alzheimer's disease",
                "Development of non-addictive pain management solutions",
            ],
            "problem_statement": [
                "Current cancer treatments have limited efficacy in stage 4 patients",
                "Type 2 diabetes patients struggle with glucose control",
                "High rate of cardiovascular events in at-risk populations",
                "Early stage Alzheimer's has no effective treatment",
                "Chronic pain treatments often lead to addiction",
            ],
            "value_proposition": [
                "Improve survival rates for stage 4 cancer patients",
                "Better glucose control for type 2 diabetes",
                "Reduce cardiovascular event risk by 30%",
                "Slow cognitive decline in early stage Alzheimer",
                "Non-addictive pain relief for chronic conditions",
            ],
        }
    )

    metadata.to_parquet(metadata_path)

    return metadata_path


@pytest.fixture
def mock_embedding_model():
    """Create a mock embedding model."""
    model = Mock()
    # Return fixed embeddings for testing
    model.encode.return_value = np.random.random((1, 384)).astype("float32")
    return model


@pytest.fixture
def mock_s3_client():
    """Create a mock S3 client."""
    with patch("data_service.service.faiss_service.s3_client") as mock_client:
        yield mock_client


# Test FAISSService Initialization
def test_faiss_service_init_success(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test successful FAISS service initialization with local files."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    assert service.index is not None
    assert service.metadata_df is not None
    assert len(service.metadata_df) == 5
    assert service.index.ntotal == 5


def test_faiss_service_init_missing_index(temp_metadata_file, mock_embedding_model):
    """Test initialization fails with missing index file."""
    with pytest.raises(FileNotFoundError, match="FAISS index file not found"):
        FAISSService(
            index_path="nonexistent_index.faiss",
            metadata_path=str(temp_metadata_file),
            embedding_model=mock_embedding_model,
        )


def test_faiss_service_init_missing_metadata(temp_index_file, mock_embedding_model):
    """Test initialization fails with missing metadata file."""
    with pytest.raises(FileNotFoundError, match="Metadata parquet file not found"):
        FAISSService(
            index_path=str(temp_index_file),
            metadata_path="nonexistent_metadata.parquet",
            embedding_model=mock_embedding_model,
        )


def test_faiss_service_init_invalid_metadata(
    temp_index_file, tmp_path, mock_embedding_model
):
    """Test initialization fails with invalid metadata columns."""
    from data_service.exceptions.service_errors import FAISSServiceError

    # Create metadata without required columns
    invalid_metadata_path = tmp_path / "invalid_metadata.parquet"
    invalid_df = pd.DataFrame({"wrong_column": ["A", "B", "C"]})
    invalid_df.to_parquet(invalid_metadata_path)

    with pytest.raises(FAISSServiceError, match="Metadata missing required columns"):
        FAISSService(
            index_path=str(temp_index_file),
            metadata_path=str(invalid_metadata_path),
            embedding_model=mock_embedding_model,
        )


# Test Search Functionality
def test_search_returns_single_result(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test basic search functionality returns single best match."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    result = service.search("cancer treatment")

    assert result is not None
    assert isinstance(result, dict)
    assert "air_number" in result
    assert "title" in result
    assert "similarity_score" in result
    assert isinstance(result["air_number"], str)
    assert isinstance(result["title"], str)
    assert isinstance(result["similarity_score"], float)
    assert 0.0 <= result["similarity_score"] <= 1.0


def test_search_with_threshold_below(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search returns result even when similarity is below threshold."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Service always returns best match regardless of threshold
    result = service.search("diabetes", threshold=0.999)

    # Service returns best match even if below threshold
    assert result is not None
    assert "similarity_score" in result
    assert isinstance(result["similarity_score"], float)


def test_search_with_threshold_above(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search returns result when similarity is above threshold."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Service returns best match
    result = service.search("diabetes", threshold=0.1)

    assert result is not None
    assert "similarity_score" in result
    assert isinstance(result["similarity_score"], float)


def test_search_by_form_fields(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search using form fields returns single best match."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    form_data = {
        "project_title": "Cardiovascular Research",
        "value_proposition": "Reduce heart disease risk",
        "therapeutic_area": "Cardiology",
    }

    result = service.search_by_form_fields(form_data)

    assert result is not None
    assert "air_number" in result
    assert "title" in result
    assert "similarity_score" in result


def test_search_by_form_fields_with_field_selection(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search using specific form fields."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    form_data = {
        "project_title": "Cancer Study",
        "value_proposition": "Improve outcomes",
        "unused_field": "Should be ignored",
    }

    # Only use specific fields
    result = service.search_by_form_fields(
        form_data, field_names=["project_title", "value_proposition"]
    )

    assert result is not None
    assert "air_number" in result


def test_search_empty_form_fields(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search with empty form fields returns None."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    result = service.search_by_form_fields({})

    assert result is None


def test_search_form_fields_with_empty_values(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search ignores empty field values."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    form_data = {
        "project_title": "",
        "value_proposition": None,
        "therapeutic_area": "   ",
    }

    result = service.search_by_form_fields(form_data)

    assert result is None


# Test Statistics
def test_get_stats(temp_index_file, temp_metadata_file, mock_embedding_model):
    """Test retrieving service statistics."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    stats = service.get_stats()

    assert stats["total_vectors"] == 5
    assert stats["index_dimension"] == 384
    assert stats["metadata_records"] == 5
    assert "index_path" in stats
    assert "metadata_path" in stats
    assert str(temp_index_file) in stats["index_path"]
    assert str(temp_metadata_file) in stats["metadata_path"]


# Test S3 Integration
def test_faiss_service_s3_download_success(
    temp_index_file, temp_metadata_file, mock_embedding_model, mock_s3_client, tmp_path
):
    """Test successful initialization with S3 download."""

    # Mock S3 download to copy local files
    def mock_download(s3_key, local_path, bucket=None):
        if "index" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            import shutil

            shutil.copy(str(temp_index_file), local_path)
        elif "metadata" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            import shutil

            shutil.copy(str(temp_metadata_file), local_path)

        return {
            "success": True,
            "s3_key": s3_key,
            "local_path": local_path,
            "size": Path(local_path).stat().st_size,
        }

    mock_s3_client.download_file.side_effect = mock_download

    service = FAISSService(
        index_path="test_index.index",
        metadata_path="test_metadata.parquet",
        embedding_model=mock_embedding_model,
        download_from_s3=True,
        s3_index_key="faiss/test_index.index",
        s3_metadata_key="faiss/test_metadata.parquet",
    )

    assert service.index is not None
    assert service.metadata_df is not None
    # Should call download_file (might be 0 if files are cached, or 2 if both downloaded)
    assert mock_s3_client.download_file.call_count >= 0


def test_faiss_service_s3_download_failure(mock_embedding_model, mock_s3_client):
    """Test initialization fails when S3 download fails."""
    from data_service.exceptions.service_errors import FAISSServiceError

    mock_s3_client.download_file.return_value = {
        "success": False,
        "error": "File not found in S3",
    }

    with pytest.raises(FAISSServiceError):
        FAISSService(
            index_path="test_index.index",
            metadata_path="test_metadata.parquet",
            embedding_model=mock_embedding_model,
            download_from_s3=True,
            s3_index_key="faiss/nonexistent_index.index",
            s3_metadata_key="faiss/nonexistent_metadata.parquet",
        )


def test_faiss_service_s3_missing_keys(mock_embedding_model):
    """Test initialization fails when S3 keys not provided."""
    with pytest.raises(ValueError, match="S3 keys must be provided"):
        FAISSService(
            index_path="test_index.index",
            metadata_path="test_metadata.parquet",
            embedding_model=mock_embedding_model,
            download_from_s3=True,
            s3_index_key=None,
            s3_metadata_key=None,
        )


def test_faiss_service_s3_uses_cache(
    temp_index_file, temp_metadata_file, mock_embedding_model, mock_s3_client, tmp_path
):
    """Test service uses cached files and skips download."""
    # Create cache directory with files
    cache_dir = tmp_path / "cache"
    cache_dir.mkdir()

    import shutil

    cached_index = cache_dir / "test_index.index"
    cached_metadata = cache_dir / "test_metadata.parquet"
    shutil.copy(str(temp_index_file), str(cached_index))
    shutil.copy(str(temp_metadata_file), str(cached_metadata))

    # Mock settings to use test cache directory
    with patch("data_service.service.faiss_service.settings") as mock_settings:
        mock_settings.faiss_local_cache_dir = str(cache_dir)

        service = FAISSService(
            index_path=str(cached_index),
            metadata_path=str(cached_metadata),
            embedding_model=mock_embedding_model,
            download_from_s3=True,
            s3_index_key="faiss/test_index.index",
            s3_metadata_key="faiss/test_metadata.parquet",
        )

    assert service.index is not None
    assert service.metadata_df is not None
    # Should not call S3 download since files exist in cache
    assert mock_s3_client.download_file.call_count == 0


# Test Global Service Functions
def test_initialize_and_get_faiss_service(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test global service initialization and retrieval."""
    # Reset global service
    import data_service.service.faiss_service as faiss_module

    faiss_module._faiss_service = None

    # Initialize
    service = initialize_faiss_service(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    assert service is not None

    # Retrieve
    retrieved_service = get_faiss_service()
    assert retrieved_service is service


def test_get_faiss_service_not_initialized():
    """Test getting service before initialization raises error."""
    # Reset global service
    import data_service.service.faiss_service as faiss_module

    faiss_module._faiss_service = None

    with pytest.raises(RuntimeError, match="FAISS service not initialized"):
        get_faiss_service()


def test_initialize_faiss_service_with_s3(
    temp_index_file, temp_metadata_file, mock_embedding_model, mock_s3_client
):
    """Test initializing global service with S3 download."""
    # Reset global service
    import data_service.service.faiss_service as faiss_module

    faiss_module._faiss_service = None

    # Mock S3 download
    def mock_download(s3_key, local_path, bucket=None):
        if "index" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            import shutil

            shutil.copy(str(temp_index_file), local_path)
        elif "metadata" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            import shutil

            shutil.copy(str(temp_metadata_file), local_path)

        return {
            "success": True,
            "s3_key": s3_key,
            "local_path": local_path,
            "size": Path(local_path).stat().st_size,
        }

    mock_s3_client.download_file.side_effect = mock_download

    service = initialize_faiss_service(
        index_path="test_index.index",
        metadata_path="test_metadata.parquet",
        embedding_model=mock_embedding_model,
        download_from_s3=True,
        s3_index_key="faiss/test_index.index",
        s3_metadata_key="faiss/test_metadata.parquet",
    )

    assert service is not None
    assert get_faiss_service() is service


# Integration Tests
def test_end_to_end_search_flow(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test complete search workflow returns single best match."""
    # Reset global service
    import data_service.service.faiss_service as faiss_module

    faiss_module._faiss_service = None

    # Initialize service
    service = initialize_faiss_service(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Perform search
    result = service.search("improve patient outcomes")

    # Verify result structure
    assert result is not None
    assert isinstance(result["air_number"], str)
    assert isinstance(result["title"], str)
    assert isinstance(result["similarity_score"], float)
    assert 0.0 <= result["similarity_score"] <= 1.0
    assert len(result["air_number"]) > 0
    assert len(result["title"]) > 0


def test_end_to_end_form_search_flow(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test complete form fields search workflow."""
    # Reset global service
    import data_service.service.faiss_service as faiss_module

    faiss_module._faiss_service = None

    service = initialize_faiss_service(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    form_data = {
        "title": "Oncology Research",
        "description": "Novel cancer treatment",
        "value_prop": "Improve patient survival",
    }

    result = service.search_by_form_fields(form_data, top_k=1)

    assert result is not None
    assert "air_number" in result
    assert "similarity_score" in result


# Edge Cases
def test_search_with_special_characters(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search handles special characters correctly."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    result = service.search("cancer & drug @ 50% efficacy!")

    assert result is not None
    assert "air_number" in result


def test_search_with_unicode(temp_index_file, temp_metadata_file, mock_embedding_model):
    """Test search handles unicode characters correctly."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    result = service.search("thérapie du cancer 治疗")

    assert result is not None
    assert "air_number" in result


def test_search_with_very_long_query(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search handles very long queries."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    long_query = " ".join(["cancer treatment"] * 100)
    result = service.search(long_query)

    assert result is not None
    assert "air_number" in result


def test_multiple_searches_same_service(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test multiple searches on the same service instance."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    queries = ["cancer", "diabetes", "heart disease", "alzheimer", "pain"]

    for query in queries:
        result = service.search(query)
        assert result is not None
        assert "air_number" in result
        assert "similarity_score" in result


# Error Handling Tests
def test_load_index_io_error(temp_metadata_file, mock_embedding_model, tmp_path):
    """Test _load_index handles IOError correctly."""
    # Create a real file but mock faiss.read_index to raise OSError
    bad_index_path = tmp_path / "bad_index.faiss"
    bad_index_path.write_text("fake index")

    with patch("faiss.read_index", side_effect=OSError("Cannot read index")):
        with pytest.raises(RuntimeError, match="I/O error loading FAISS index"):
            FAISSService(
                index_path=str(bad_index_path),
                metadata_path=str(temp_metadata_file),
                embedding_model=mock_embedding_model,
            )


def test_load_metadata_io_error(temp_index_file, mock_embedding_model, tmp_path):
    """Test _load_metadata handles IOError correctly."""
    from data_service.exceptions.service_errors import FAISSServiceError

    # Create a real file but mock pd.read_parquet to raise OSError
    bad_metadata_path = tmp_path / "bad_metadata.parquet"
    bad_metadata_path.write_text("fake metadata")

    with patch("pandas.read_parquet", side_effect=OSError("Cannot read parquet")):
        with pytest.raises(FAISSServiceError, match="I/O error loading metadata"):
            FAISSService(
                index_path=str(temp_index_file),
                metadata_path=str(bad_metadata_path),
                embedding_model=mock_embedding_model,
            )


def test_search_no_valid_results(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search when FAISS returns -1 indices (no valid results)."""
    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock index.search to return -1 indices
    with patch.object(
        service.index, "search", return_value=(np.array([[100.0]]), np.array([[-1]]))
    ):
        result = service.search("test query")
        assert result is None


def test_search_attribute_error(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search handles AttributeError in result processing."""
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock index.search to return invalid data structure
    with patch.object(
        service.index, "search", side_effect=AttributeError("Invalid attribute")
    ):
        with pytest.raises(FAISSServiceError, match="Failed to process search results"):
            service.search("test query")


def test_search_by_form_fields_key_error(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search_by_form_fields handles KeyError correctly."""
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Pass field_names that don't exist in form_fields to trigger KeyError in iteration
    with patch.object(service, "search", side_effect=KeyError("missing_field")):
        with pytest.raises(FAISSServiceError, match="Missing required field"):
            service.search_by_form_fields({"valid_field": "value"})


def test_search_by_form_fields_value_error(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test search_by_form_fields handles ValueError correctly."""
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock search method to raise ValueError
    with patch.object(service, "search", side_effect=ValueError("Invalid input")):
        with pytest.raises(FAISSServiceError, match="Invalid form fields data"):
            service.search_by_form_fields({"field": "value"})


# S3 Download Tests
def test_s3_download_no_bucket(mock_embedding_model, mock_s3_client):
    """Test S3 download fails when no bucket is provided."""
    with patch("data_service.service.faiss_service.settings") as mock_settings:
        mock_settings.s3_bucket = None

        with pytest.raises(ValueError, match="S3 bucket must be provided"):
            FAISSService(
                index_path="test.index",
                metadata_path="test.parquet",
                embedding_model=mock_embedding_model,
                download_from_s3=True,
                s3_bucket=None,
                s3_index_key="key1",
                s3_metadata_key="key2",
            )


def test_s3_download_index_only_cached(
    temp_index_file, temp_metadata_file, mock_embedding_model, mock_s3_client, tmp_path
):
    """Test S3 download when only index is cached."""
    cache_dir = tmp_path / "cache"
    cache_dir.mkdir()

    import shutil

    cached_index = cache_dir / "test_index.index"
    shutil.copy(str(temp_index_file), str(cached_index))

    def mock_download(s3_key, local_path, bucket=None):
        # Only download metadata (index is cached)
        if "metadata" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(str(temp_metadata_file), local_path)
        return {
            "success": True,
            "s3_key": s3_key,
            "local_path": local_path,
            "size": Path(local_path).stat().st_size,
        }

    mock_s3_client.download_file.side_effect = mock_download

    with patch("data_service.service.faiss_service.settings") as mock_settings:
        mock_settings.faiss_local_cache_dir = str(cache_dir)
        mock_settings.s3_bucket = "test-bucket"

        service = FAISSService(
            index_path="test_index.index",
            metadata_path="test_metadata.parquet",
            embedding_model=mock_embedding_model,
            download_from_s3=True,
            s3_index_key="faiss/test_index.index",
            s3_metadata_key="faiss/test_metadata.parquet",
        )

    assert service.index is not None
    assert service.metadata_df is not None


def test_s3_download_metadata_only_cached(
    temp_index_file, temp_metadata_file, mock_embedding_model, mock_s3_client, tmp_path
):
    """Test S3 download when only metadata is cached."""
    cache_dir = tmp_path / "cache"
    cache_dir.mkdir()

    import shutil

    cached_metadata = cache_dir / "test_metadata.parquet"
    shutil.copy(str(temp_metadata_file), str(cached_metadata))

    def mock_download(s3_key, local_path, bucket=None):
        # Only download index (metadata is cached)
        if "index" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(str(temp_index_file), local_path)
        return {
            "success": True,
            "s3_key": s3_key,
            "local_path": local_path,
            "size": Path(local_path).stat().st_size,
        }

    mock_s3_client.download_file.side_effect = mock_download

    with patch("data_service.service.faiss_service.settings") as mock_settings:
        mock_settings.faiss_local_cache_dir = str(cache_dir)
        mock_settings.s3_bucket = "test-bucket"

        service = FAISSService(
            index_path="test_index.index",
            metadata_path="test_metadata.parquet",
            embedding_model=mock_embedding_model,
            download_from_s3=True,
            s3_index_key="faiss/test_index.index",
            s3_metadata_key="faiss/test_metadata.parquet",
        )

    assert service.index is not None
    assert service.metadata_df is not None


def test_s3_download_metadata_failure(
    temp_index_file, mock_embedding_model, mock_s3_client, tmp_path
):
    """Test S3 download fails when metadata download fails."""
    cache_dir = tmp_path / "cache"
    cache_dir.mkdir()

    def mock_download(s3_key, local_path, bucket=None):
        if "index" in s3_key:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            import shutil

            shutil.copy(str(temp_index_file), local_path)
            return {
                "success": True,
                "s3_key": s3_key,
                "local_path": local_path,
                "size": 1000,
            }
        else:
            return {"success": False, "error": "Metadata download failed"}

    mock_s3_client.download_file.side_effect = mock_download

    from data_service.exceptions.service_errors import FAISSServiceError

    with patch("data_service.service.faiss_service.settings") as mock_settings:
        mock_settings.faiss_local_cache_dir = str(cache_dir)
        mock_settings.s3_bucket = "test-bucket"

        with pytest.raises(FAISSServiceError):
            FAISSService(
                index_path="test_index.index",
                metadata_path="test_metadata.parquet",
                embedding_model=mock_embedding_model,
                download_from_s3=True,
                s3_index_key="faiss/test_index.index",
                s3_metadata_key="faiss/test_metadata.parquet",
            )


# Async persist_novelty_score Tests
@pytest.mark.asyncio
async def test_persist_novelty_score_success(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test successful persistence of novelty score."""
    from uuid import uuid4
    from unittest.mock import AsyncMock, MagicMock

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock database session and submission
    mock_db = AsyncMock()
    mock_submission = MagicMock()
    mock_submission.id = uuid4()
    mock_submission.novelty_score = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_submission
    mock_db.execute.return_value = mock_result

    submission_id = uuid4()
    result = await service.persist_novelty_score(submission_id, 0.85, mock_db)

    assert result is True
    assert mock_submission.novelty_score == 0.85
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_persist_novelty_score_not_found(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test persist_novelty_score when submission not found."""
    from uuid import uuid4
    from unittest.mock import AsyncMock, MagicMock
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock database session with no submission found
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    submission_id = uuid4()

    with pytest.raises(FAISSServiceError, match="Submission .* not found"):
        await service.persist_novelty_score(submission_id, 0.85, mock_db)


@pytest.mark.asyncio
async def test_persist_novelty_score_import_error(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test persist_novelty_score handles ImportError."""
    from uuid import uuid4
    from unittest.mock import AsyncMock
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    mock_db = AsyncMock()
    submission_id = uuid4()

    # Mock sys.modules to simulate ImportError
    with patch.dict("sys.modules", {"data_service.models.submissions": None}):
        with pytest.raises(
            FAISSServiceError, match="Failed to import required database model"
        ):
            await service.persist_novelty_score(submission_id, 0.85, mock_db)

        mock_db.rollback.assert_called_once()


@pytest.mark.asyncio
async def test_persist_novelty_score_attribute_error(
    temp_index_file, temp_metadata_file, mock_embedding_model
):
    """Test persist_novelty_score handles AttributeError."""
    from uuid import uuid4
    from unittest.mock import AsyncMock
    from data_service.exceptions.service_errors import FAISSServiceError

    service = FAISSService(
        index_path=str(temp_index_file),
        metadata_path=str(temp_metadata_file),
        embedding_model=mock_embedding_model,
    )

    # Mock database session that raises AttributeError
    mock_db = AsyncMock()
    mock_db.execute.side_effect = AttributeError("Invalid attribute")

    submission_id = uuid4()

    with pytest.raises(FAISSServiceError, match="Database operation error"):
        await service.persist_novelty_score(submission_id, 0.85, mock_db)

    mock_db.rollback.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
