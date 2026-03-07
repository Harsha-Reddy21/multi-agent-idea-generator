"""Hybrid Retriever Service
=======================
Combines BM25 sparse and dense vector similarity for document retrieval.
"""

import logging
from typing import List

import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
import torch

from data_service.configurations.settings import settings
from data_service.exceptions.service_errors import HybridRetrieverServiceError
from data_service.models.document_extract import Block
from data_service.utils import error_utils

logger = logging.getLogger(__name__)


class HybridRetriever:
    """A hybrid retriever combining BM25 and dense vector similarity.

    This class implements a hybrid search approach that leverages both
    keyword-based (BM25) and semantic (dense embedding) retrieval methods
    to find the most relevant blocks of text for a given query. The retrieval
    scores from both methods are normalized and combined using a weighted
    average controlled by the alpha parameter.

    Attributes:
        blocks (List[Block]): The collection of text blocks to search through.
        alpha (float): Weight parameter for combining dense and sparse scores.
            Higher alpha (closer to 1) favors dense retrieval, lower alpha
            favors BM25. Must be in range [0, 1]. Default is 0.5 for equal
            weighting.
        embedding_model (SentenceTransformer): Pre-trained sentence transformer
            model used to generate dense embeddings for blocks and queries.
        bm25 (BM25Okapi): BM25 ranking function instance for sparse retrieval.
        block_embeddings (np.ndarray): Pre-computed dense embeddings for all
            blocks.

    Example:
        >>> from sentence_transformers import SentenceTransformer
        >>> model = SentenceTransformer('all-MiniLM-L6-v2')
        >>> retriever = HybridRetriever(
        ...     blocks=my_blocks,
        ...     embedding_model=model,
        ...     alpha=0.7
        ... )
        >>> results = retriever.retrieve("What is machine learning?", top_k=5)
    """

    def __init__(
        self,
        blocks: List[Block],
        embedding_model: SentenceTransformer,
        alpha: float = 0.5,
        batch_size: int = 32,
    ) -> None:
        """Initialize hybrid retriever with blocks and embedding model.

        Args:
            blocks: Collection of text blocks to search
            embedding_model: Pre-trained sentence transformer model
            alpha: Weight for combining scores (0-1), higher favors dense retrieval
            batch_size: Batch size for encoding (default: 32)

        Raises:
            ValueError: If inputs are invalid
            RuntimeError: If embedding generation fails
        """
        # Input validation
        if not blocks:
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message="blocks list cannot be empty",
                status_code=400,
            )

        if not isinstance(alpha, (int, float)) or not 0 <= alpha <= 1:
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message=f"alpha must be between 0 and 1, got {alpha}",
                status_code=400,
            )

        if batch_size < 1:
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message=f"batch_size must be positive, got {batch_size}",
                status_code=400,
            )

        # Sort blocks by span_id for consistent ordering across runs
        self.blocks = sorted(
            blocks, key=lambda b: b.span_id if hasattr(b, "span_id") else 0
        )
        self.alpha = float(alpha)  # Ensure float type
        self.embedding_model = embedding_model
        self.batch_size = batch_size

        logger.info(
            "Initializing HybridRetriever with %d blocks (sorted by span_id), "
            "alpha=%.2f, batch_size=%d",
            len(blocks),
            alpha,
            batch_size,
        )

        try:
            # Tokenize corpus for BM25
            tokenized_corpus = [
                block.text.lower().split()
                for block in blocks
                if block.text  # Skip empty texts
            ]

            if not tokenized_corpus:
                raise HybridRetrieverServiceError(
                    error="Validation Error",
                    message="No valid text content found in blocks",
                    status_code=400,
                )

            self.bm25 = BM25Okapi(tokenized_corpus)
            logger.info("BM25 index created successfully")

            # Generate embeddings for all blocks
            block_texts = [block.text for block in blocks if block.text]

            if not block_texts:
                raise HybridRetrieverServiceError(
                    error="Validation Error",
                    message="No valid text content for embeddings",
                    status_code=400,
                )

            # Use deterministic settings for consistent embeddings
            try:
                if hasattr(torch, "manual_seed"):
                    # Seed PyTorch for deterministic embeddings
                    torch.manual_seed(settings.embedding_seed)
            except ImportError:
                logger.debug("PyTorch not available, skipping torch seed")

            self.block_embeddings = embedding_model.encode(
                block_texts,
                batch_size=self.batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Normalize for cosine similarity
                device="cpu",  # Force CPU for deterministic behavior
            )

            logger.info(
                "Generated embeddings: shape=%s, dtype=%s",
                self.block_embeddings.shape,
                self.block_embeddings.dtype,
            )

        except HybridRetrieverServiceError:
            # Re-raise HybridRetrieverServiceError as-is
            raise
        except (AttributeError, TypeError) as e:
            logger.error(
                "Invalid data type during initialization: %s", str(e), exc_info=True
            )
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message=f"Initialization failed due to invalid data: {str(e)}",
                status_code=400,
            ) from e
        except Exception as e:
            logger.error(
                "Unexpected error during HybridRetriever initialization: %s",
                str(e),
                exc_info=True,
            )
            error_utils.handle_service_exception(
                e, HybridRetrieverServiceError, "initializing hybrid retriever"
            )

    def retrieve(self, query: str, top_k: int = 10) -> List[Block]:
        """
        Retrieve the most relevant blocks for a given query using hybrid search.

        This method combines BM25 (sparse) and dense vector similarity scores to rank
        and retrieve the top-k most relevant blocks. The hybrid score is computed as
        a weighted combination of normalized BM25 scores and dense similarity scores.

        Args:
            query: The search query string to find relevant blocks for
            top_k: The number of top-ranked blocks to retrieve (default: 5)

        Returns:
            List of the top_k most relevant Block objects, ordered by
            decreasing relevance score

        Raises:
            ValueError: If query is empty or top_k is invalid
            RuntimeError: If retrieval fails

        Note:
            - BM25 scores are normalized by the maximum score to ensure they are in [0, 1]
            - Dense scores are computed using cosine similarity and normalized to [0, 1]
            - The final hybrid score is: alpha * dense_score + (1 - alpha) * bm25_score
            - self.alpha controls the balance between dense and sparse retrieval
        """
        # Input validation
        if not query or not query.strip():
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message="query cannot be empty",
                status_code=400,
            )

        if not isinstance(top_k, int) or top_k < 1:
            raise HybridRetrieverServiceError(
                error="Validation Error",
                message=f"top_k must be a positive integer, got {top_k}",
                status_code=400,
            )

        # Clamp top_k to available blocks
        top_k = min(top_k, len(self.blocks))

        if top_k == 0:
            logger.warning("No blocks available for retrieval")
            return []

        try:
            # BM25 scoring
            tokenized_query = query.lower().split()

            if not tokenized_query:
                logger.warning("Query tokenization resulted in empty list: %s", query)
                # Return empty results for queries with no tokens
                return []

            bm25_scores = self.bm25.get_scores(tokenized_query)

            # Normalize BM25 scores
            max_bm25_score = bm25_scores.max()
            if max_bm25_score > 0:
                bm25_scores_norm = bm25_scores / max_bm25_score
            else:
                # All scores are zero, use uniform distribution
                bm25_scores_norm = np.zeros_like(bm25_scores)
                logger.debug("BM25 returned all zero scores")

            # Dense vector scoring with deterministic settings
            try:

                if hasattr(torch, "manual_seed"):
                    # Consistent seed for query encoding
                    torch.manual_seed(settings.embedding_seed)
            except ImportError:
                logger.debug("PyTorch not available, skipping torch seed")

            query_embedding = self.embedding_model.encode(
                [query],
                convert_to_numpy=True,
                show_progress_bar=False,
                normalize_embeddings=True,  # Normalize for cosine similarity
                device="cpu",  # Force CPU for deterministic behavior
            )

            if query_embedding.ndim == 2:
                # Extract single embedding
                query_embedding = query_embedding[0]

            # Compute cosine similarity (already normalized)
            dense_scores = np.dot(self.block_embeddings, query_embedding)

            # Ensure scores are in [0, 1] range
            # Cosine similarity is in [-1, 1], normalize to [0, 1]
            dense_scores = (dense_scores + 1) / 2

            # Clip to handle numerical precision issues
            dense_scores = np.clip(dense_scores, 0.0, 1.0)
            bm25_scores_norm = np.clip(bm25_scores_norm, 0.0, 1.0)

            # Compute hybrid score
            hybrid_scores = (
                self.alpha * dense_scores + (1 - self.alpha) * bm25_scores_norm
            )

            # Get top-k indices with stable sorting
            # Use negative scores for descending order, then sort by index for tie-breaking
            indices_scores = [(idx, -score) for idx, score in enumerate(hybrid_scores)]
            # Sort by score (descending), then by index (ascending) for deterministic tie-breaking
            indices_scores.sort(key=lambda x: (x[1], x[0]))
            top_indices = [idx for idx, _ in indices_scores[:top_k]]

            # Return corresponding blocks
            results = [self.blocks[idx] for idx in top_indices]

            logger.debug(
                "Retrieved %d blocks for query (top_k=%d), scores: %s",
                len(results),
                top_k,
                hybrid_scores[top_indices].tolist(),
            )

            return results

        except HybridRetrieverServiceError:
            # Re-raise HybridRetrieverServiceError as-is
            raise
        except Exception as e:
            logger.exception("Retrieval failed for query: %s...", query[:50])
            error_utils.handle_service_exception(
                e, HybridRetrieverServiceError, "retrieving blocks"
            )
