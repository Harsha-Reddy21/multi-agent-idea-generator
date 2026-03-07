"""
FAISS Service Module
====================
Service for loading precomputed FAISS index and performing similarity search
on form fields data using AIR number, title, and value proposition metadata.
Supports loading files from local filesystem or downloading from S3.
"""

import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from uuid import UUID

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from data_service.utils.embedding_model import get_embedding_model
from data_service.clients.s3_client import s3_client
from data_service.configurations.settings import settings
from data_service.exceptions.service_errors import FAISSServiceError
from data_service.utils.error_utils import handle_service_exception

logger = logging.getLogger(__name__)


class FAISSService:
    """
    Service class for managing FAISS index operations and similarity search.

    Loads precomputed FAISS index and metadata from parquet file containing
    AIR numbers, titles, and value propositions. Performs similarity search
    based on form field data.

    Supports loading files from local filesystem or downloading from S3.
    """

    def __init__(
        self,
        index_path: str,
        metadata_path: str,
        embedding_model: Optional[SentenceTransformer] = None,
        download_from_s3: bool = False,
        s3_bucket: Optional[str] = None,
        s3_index_key: Optional[str] = None,
        s3_metadata_key: Optional[str] = None,
    ):
        """
        Initialize FAISS service with index and metadata paths.

        Args:
            index_path: Path to the precomputed FAISS index file (.index)
            metadata_path: Path to the metadata parquet file (.parquet)
            embedding_model: Optional pre-loaded SentenceTransformer model.
                           If None, will use the global embedding model.
            download_from_s3: If True, download files from S3 before loading
            s3_index_key: S3 key for index file (required if download_from_s3=True)
            s3_metadata_key: S3 key for metadata file (required if download_from_s3=True)

        Raises:
            FileNotFoundError: If index or metadata file does not exist
            ValueError: If metadata is missing required columns or S3 keys not provided
        """
        self.embedding_model = embedding_model
        self.index: Optional[faiss.Index] = None
        self.metadata_df: Optional[pd.DataFrame] = None

        # Handle S3 download if requested
        if download_from_s3:
            if not s3_index_key or not s3_metadata_key:
                raise ValueError(
                    "S3 keys must be provided when download_from_s3=True. "
                    "Provide s3_index_key and s3_metadata_key."
                )

            logger.info("Downloading FAISS files from S3...")
            index_path, metadata_path = self._download_from_s3(
                s3_bucket, s3_index_key, s3_metadata_key, index_path, metadata_path
            )

        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)

        # Validate file paths
        if not self.index_path.exists():
            raise FileNotFoundError(f"FAISS index file not found: {index_path}")

        if not self.metadata_path.exists():
            raise FileNotFoundError(f"Metadata parquet file not found: {metadata_path}")

        # Load index and metadata
        self._load_index()
        self._load_metadata()

        logger.info("FAISS Service initialized successfully")
        logger.info("Index dimension: %d", self.index.d)
        logger.info("Total indexed items: %d", self.index.ntotal)
        logger.info("Metadata records: %d", len(self.metadata_df))

    def _download_from_s3(
        self,
        s3_bucket: Optional[str],
        s3_index_key: str,
        s3_metadata_key: str,
        local_index_path: str,
        local_metadata_path: str,
    ) -> tuple[str, str]:
        """
        Download FAISS index and metadata files from S3.

        Args:
            s3_index_key: S3 key for the index file
            s3_metadata_key: S3 key for the metadata file
            local_index_path: Local path where index should be saved
            local_metadata_path: Local path where metadata should be saved

        Returns:
            Tuple of (index_path, metadata_path) after download

        Raises:
            RuntimeError: If download fails
        """
        # Use bucket from parameter or fall back to settings
        bucket = s3_bucket or settings.s3_bucket

        if not bucket:
            raise ValueError(
                "S3 bucket must be provided either as parameter or in settings"
            )

        # Use cache directory if paths are not absolute
        cache_dir = Path(settings.faiss_local_cache_dir)

        # Determine local paths
        if not Path(local_index_path).is_absolute():
            local_index_path = str(cache_dir / Path(s3_index_key).name)

        if not Path(local_metadata_path).is_absolute():
            local_metadata_path = str(cache_dir / Path(s3_metadata_key).name)

        # Check if files already exist locally (cached)
        index_exists = Path(local_index_path).exists()
        metadata_exists = Path(local_metadata_path).exists()

        if index_exists and metadata_exists:
            logger.info("FAISS files found in local cache, skipping download")
            logger.info("  Index: %s", local_index_path)
            logger.info("  Metadata: %s", local_metadata_path)
            return local_index_path, local_metadata_path

        try:
            # Download index file
            if not index_exists:
                logger.info("Downloading index from S3: %s", s3_index_key)
                result = s3_client.download_file(s3_index_key, local_index_path)
                logger.info("Index downloaded successfully: %d bytes", result["size"])
            else:
                logger.info("Using cached index: %s", local_index_path)

            # Download metadata file
            if not metadata_exists:
                logger.info("Downloading metadata from S3: %s", s3_metadata_key)
                result = s3_client.download_file(s3_metadata_key, local_metadata_path)
                logger.info(
                    "Metadata downloaded successfully: %d bytes", result["size"]
                )
            else:
                logger.info("Using cached metadata: %s", local_metadata_path)

            return local_index_path, local_metadata_path

        except Exception as e:
            logger.exception("Error downloading FAISS files from S3")
            handle_service_exception(
                e, FAISSServiceError, "downloading FAISS files from S3"
            )

    def _load_index(self) -> None:
        """Load the precomputed FAISS index from disk.

        Raises:
            FileNotFoundError: If index file doesn't exist
            RuntimeError: If index loading fails
        """
        try:
            logger.info("Loading FAISS index from: %s", self.index_path)
            self.index = faiss.read_index(str(self.index_path))
            logger.info(
                "FAISS index loaded successfully. Total vectors: %d", self.index.ntotal
            )
        except FileNotFoundError as e:
            logger.error(
                "FAISS index file not found: %s", self.index_path, exc_info=True
            )
            raise RuntimeError(
                f"Failed to load FAISS index: file not found at {self.index_path}"
            ) from e
        except (OSError, IOError) as e:
            logger.error(
                "I/O error loading FAISS index from %s: %s",
                self.index_path,
                str(e),
                exc_info=True,
            )
            raise RuntimeError(
                f"I/O error loading FAISS index from {self.index_path}: {str(e)}"
            ) from e
        except Exception as e:
            logger.error(
                "Unexpected error loading FAISS index: %s", str(e), exc_info=True
            )
            handle_service_exception(e, FAISSServiceError, "loading FAISS index")

    def _load_metadata(self) -> None:
        """
        Load metadata from parquet file and validate required columns.

        Raises:
            ValueError: If required columns are missing from metadata
        """
        try:
            logger.info("Loading metadata from: %s", self.metadata_path)
            self.metadata_df = pd.read_parquet(self.metadata_path)

            # Validate required columns
            required_columns = [
                "air_number",
                "short_description",
                "description",
                "problem_statement",
                "value_proposition",
            ]
            missing_columns = [
                col for col in required_columns if col not in self.metadata_df.columns
            ]

            if missing_columns:
                raise ValueError(
                    f"Metadata missing required columns: {missing_columns}. "
                    f"Available columns: {list(self.metadata_df.columns)}"
                )

            logger.info(
                "Metadata loaded successfully. Records: %d", len(self.metadata_df)
            )
            logger.info("Columns: %s", list(self.metadata_df.columns))

        except FileNotFoundError as e:
            logger.error(
                "Metadata file not found: %s", self.metadata_path, exc_info=True
            )
            raise FAISSServiceError(
                error="Not Found",
                message=f"Metadata file not found at {self.metadata_path}",
                status_code=404,
            ) from e
        except ValueError as e:
            # Re-raise as FAISSServiceError for validation failures
            logger.error("Metadata validation failed: %s", str(e))
            raise FAISSServiceError(
                error="Validation Error",
                message=str(e),
                status_code=400,
            ) from e
        except (OSError, IOError) as e:
            logger.error(
                "I/O error loading metadata from %s: %s",
                self.metadata_path,
                str(e),
                exc_info=True,
            )
            raise FAISSServiceError(
                error="Service Unavailable",
                message=f"I/O error loading metadata from {self.metadata_path}",
                status_code=503,
            ) from e
        except Exception as e:
            logger.error("Unexpected error loading metadata: %s", str(e), exc_info=True)
            handle_service_exception(e, FAISSServiceError, "loading metadata")

    def _get_embedding_model(self) -> SentenceTransformer:
        """Get the embedding model instance."""
        if self.embedding_model is None:
            return get_embedding_model()
        return self.embedding_model

    def _create_query_embedding(self, query_text: str) -> np.ndarray:
        """
        Create embedding vector for query text.

        Args:
            query_text: Input text to embed

        Returns:
            numpy array of shape (1, embedding_dim)
        """
        model = self._get_embedding_model()
        embedding = model.encode([query_text], convert_to_numpy=True)
        return embedding.astype("float32")

    def search(
        self, query_text: str, top_k: int = 1, threshold: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Perform similarity search on the FAISS index and return the top match.

        Args:
            query_text: Text query to search for (e.g., form field data)
            top_k: Number of top results to consider (default: 1)
            threshold: Optional similarity threshold. If the top result is below this, None is returned.
                      Similarity is computed as 1 / (1 + distance)

        Returns:
            Dictionary containing the best match with:
                - air_number: AIR number from metadata
                - title: Title from metadata
                - similarity_score: Similarity score (higher is better)
            Returns None if no results found or if top result is below threshold.

        Example:
            >>> service = FAISSService("index.faiss", "metadata.parquet")
            >>> result = service.search("improve patient outcomes")
            >>> if result:
            ...     print(f"AIR: {result['air_number']}, Score: {result['similarity_score']:.4f}")
        """
        try:
            logger.info("Searching for: '%s' (top_k=%d)", query_text, top_k)

            # Create query embedding
            query_embedding = self._create_query_embedding(query_text)

            # Perform search - get top_k to find the best valid result
            distances, indices = self.index.search(query_embedding, top_k)

            # Find the best valid result
            for rank, (distance, idx) in enumerate(
                zip(distances[0], indices[0]), start=1
            ):
                # Check if valid index
                if idx == -1:  # FAISS returns -1 for not found
                    continue

                # Compute similarity score (convert distance to similarity)
                # Using inverse distance: similarity = 1 / (1 + distance)
                similarity_score = 1.0 / (1.0 + float(distance))

                # Get metadata for this result
                metadata_row = self.metadata_df.iloc[idx]

                result = {
                    "air_number": str(metadata_row["air_number"]),
                    "title": str(metadata_row["short_description"]),
                    "similarity_score": float(similarity_score),
                }

                # Log if below threshold but still return the result
                if threshold is not None and similarity_score < threshold:
                    logger.info(
                        "Top result has similarity %.4f below threshold %.4f but returning best match anyway. AIR=%s",
                        similarity_score,
                        threshold,
                        result["air_number"],
                    )
                else:
                    logger.info(
                        "Best match: AIR=%s, similarity=%.4f",
                        result["air_number"],
                        similarity_score,
                    )

                return result

            logger.info("No valid results found")
            return None

        except ValueError as e:
            logger.error("Invalid input for search: %s", str(e))
            raise FAISSServiceError(
                error="Validation Error",
                message=f"Invalid search input: {str(e)}",
                status_code=400,
            ) from e
        except (AttributeError, IndexError) as e:
            logger.error("Error accessing search results: %s", str(e), exc_info=True)
            raise FAISSServiceError(
                error="Internal Server Error",
                message=f"Failed to process search results: {str(e)}",
                status_code=500,
            ) from e
        except Exception as e:
            logger.error(
                "Unexpected error during search for query '%s...': %s",
                query_text[:50],
                str(e),
                exc_info=True,
            )
            handle_service_exception(e, FAISSServiceError, "performing FAISS search")

    def search_by_form_fields(
        self,
        form_fields: Dict[str, Any],
        field_names: Optional[List[str]] = None,
        top_k: int = 1,
        threshold: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Perform similarity search using form field data and return the best match.

        Combines specified form fields into a search query and performs
        similarity search against the FAISS index.

        Args:
            form_fields: Dictionary of form field names and values
            field_names: Optional list of specific field names to use.
                        If None, all fields are concatenated.
            top_k: Number of top results to consider (default: 1)
            threshold: Optional similarity threshold for filtering results

        Returns:
            Dictionary containing the best match with AIR number, title, and similarity score.
            Returns None if no results found or if top result is below threshold.

        Example:
            >>> form_data = {
            ...     "project_title": "Cancer Drug Development",
            ...     "value_prop": "Improve survival rates for stage 4 patients",
            ...     "therapeutic_area": "Oncology"
            ... }
            >>> result = service.search_by_form_fields(form_data)
            >>> if result:
            ...     print(f"Best AIR: {result['air_number']}")
        """
        try:
            # Select fields to use for search
            if field_names:
                selected_fields = {
                    k: v for k, v in form_fields.items() if k in field_names
                }
            else:
                selected_fields = form_fields

            # Create query text from form fields
            query_parts = []
            for field_name, field_value in selected_fields.items():
                if field_value and str(field_value).strip():
                    query_parts.append(f"{field_name}: {field_value}")

            query_text = " | ".join(query_parts)

            if not query_text:
                logger.warning("No valid form fields provided for search")
                return None

            logger.info("Searching with form fields: %s", list(selected_fields.keys()))

            # Perform search
            return self.search(query_text, top_k=top_k, threshold=threshold)

        except ValueError as e:
            logger.error("Invalid form fields data: %s", str(e))
            raise FAISSServiceError(
                error="Validation Error",
                message=f"Invalid form fields data: {str(e)}",
                status_code=400,
            ) from e
        except KeyError as e:
            logger.error("Missing required field in form_fields: %s", str(e))
            raise FAISSServiceError(
                error="Validation Error",
                message=f"Missing required field in form_fields: {str(e)}",
                status_code=400,
            ) from e
        except Exception as e:
            logger.error(
                "Unexpected error in search_by_form_fields: %s", str(e), exc_info=True
            )
            handle_service_exception(e, FAISSServiceError, "searching by form fields")

    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the loaded index and metadata.

        Returns:
            Dictionary containing:
                - total_vectors: Number of vectors in the index
                - index_dimension: Dimension of vectors
                - metadata_records: Number of metadata records
                - index_path: Path to index file
                - metadata_path: Path to metadata file
        """
        return {
            "total_vectors": int(self.index.ntotal),
            "index_dimension": int(self.index.d),
            "metadata_records": len(self.metadata_df),
            "index_path": str(self.index_path),
            "metadata_path": str(self.metadata_path),
        }

    async def persist_novelty_score(
        self, submission_id: UUID, similarity_score: float, db: AsyncSession
    ) -> bool:
        """
        Persist the similarity score as novelty_score in the submissions table.

        Args:
            submission_id: UUID of the submission to update
            similarity_score: The similarity score to persist
            db: SQLAlchemy async database session

        Returns:
            True if persistence was successful, False otherwise

        Example:
            >>> result = service.search("improve patient outcomes")
            >>> if result:
            ...     await service.persist_novelty_score(
            ...         submission_id=uuid4(),
            ...         similarity_score=result['similarity_score'],
            ...         db=db_session
            ...     )
        """
        try:
            from data_service.models.submissions import Submissions

            result = await db.execute(
                select(Submissions).filter(Submissions.id == submission_id)
            )
            submission = result.scalar_one_or_none()

            if submission:
                submission.novelty_score = similarity_score
                await db.commit()
                logger.info(
                    "Updated novelty_score=%.4f for submission_id=%s",
                    similarity_score,
                    submission_id,
                )
                return True
            else:
                logger.error("Submission not found for submission_id=%s", submission_id)
                raise FAISSServiceError(
                    error="Not Found",
                    message=f"Submission {submission_id} not found",
                    status_code=404,
                )

        except ImportError as e:
            logger.error(
                "Failed to import Submissions model: %s", str(e), exc_info=True
            )
            await db.rollback()
            raise FAISSServiceError(
                error="Internal Server Error",
                message="Failed to import required database model",
                status_code=500,
            ) from e
        except (AttributeError, TypeError) as e:
            logger.error(
                "Database operation error for submission_id=%s: %s",
                submission_id,
                str(e),
                exc_info=True,
            )
            await db.rollback()
            raise FAISSServiceError(
                error="Validation Error",
                message=f"Database operation error: {str(e)}",
                status_code=400,
            ) from e
        except FAISSServiceError:
            # Re-raise FAISSServiceError as-is
            raise
        except Exception as db_error:
            logger.error(
                "Unexpected error updating novelty_score for submission_id=%s: %s",
                submission_id,
                str(db_error),
                exc_info=True,
            )
            await db.rollback()
            handle_service_exception(
                db_error, FAISSServiceError, "persisting novelty score"
            )


# Global service instance
_faiss_service: Optional[FAISSService] = None


def initialize_faiss_service(
    index_path: str,
    metadata_path: str,
    embedding_model: Optional[SentenceTransformer] = None,
    download_from_s3: bool = False,
    s3_index_key: Optional[str] = None,
    s3_metadata_key: Optional[str] = None,
) -> FAISSService:
    """
    Initialize the global FAISS service instance.

    Args:
        index_path: Path to the precomputed FAISS index file
        metadata_path: Path to the metadata parquet file
        embedding_model: Optional pre-loaded embedding model
        download_from_s3: If True, download files from S3 before loading
        s3_index_key: S3 key for index file (required if download_from_s3=True)
        s3_metadata_key: S3 key for metadata file (required if download_from_s3=True)

    Returns:
        Initialized FAISSService instance

    Raises:
        FileNotFoundError: If index or metadata files do not exist
        ValueError: If S3 keys not provided when download_from_s3=True
    """
    global _faiss_service

    logger.info("Initializing FAISS service...")
    _faiss_service = FAISSService(
        index_path=index_path,
        metadata_path=metadata_path,
        embedding_model=embedding_model,
        download_from_s3=download_from_s3,
        s3_index_key=s3_index_key,
        s3_metadata_key=s3_metadata_key,
    )
    logger.info("FAISS service initialized successfully")

    return _faiss_service


def get_faiss_service() -> FAISSService:
    """
    Get the global FAISS service instance.

    Returns:
        FAISSService instance

    Raises:
        RuntimeError: If service hasn't been initialized
    """
    if _faiss_service is None:
        raise RuntimeError(
            "FAISS service not initialized. Call initialize_faiss_service() first."
        )
    return _faiss_service
