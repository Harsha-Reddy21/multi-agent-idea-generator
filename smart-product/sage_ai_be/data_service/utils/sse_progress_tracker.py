"""
SSE Progress Tracker
====================
Real-time progress tracking with Server-Sent Events support

Uses Redis for cross-worker progress sharing and pub/sub for real-time updates.
Falls back to in-memory storage if Redis is not available.

Environment Variables:
    REDIS_HOST: Redis connection string (e.g., "localhost:6379" or "redis://localhost:6379")
"""

import asyncio
import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, AsyncGenerator, DefaultDict, Dict, List, Optional

try:
    import redis.asyncio as redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None  # type: ignore

from data_service.constants.constants import (
    REDIS_TTL_SECONDS,
    REDIS_SOCKET_TIMEOUT_SECONDS,
    REDIS_MAX_CONNECTIONS,
    QUEUE_MAX_SIZE,
    QUEUE_PUT_TIMEOUT_SECONDS,
    SUBSCRIBER_TIMEOUT_SECONDS,
)

logger = logging.getLogger(__name__)


class ProgressStatus(str, Enum):
    """Progress status enumeration"""

    PENDING = "pending"
    STARTED = "started"
    EXTRACTING_BLOCKS = "extracting_blocks"
    BLOCKS_EXTRACTED = "blocks_extracted"
    FETCHING_QUESTIONS = "fetching_questions"
    QUESTIONS_FETCHED = "questions_fetched"
    PROCESSING_QUESTIONS = "processing_questions"
    QUESTION_PROCESSED = "question_processed"
    STORING_RESULTS = "storing_results"
    SUCCESS = "success"
    FAILED = "failed"
    WARNING = "warning"


class SSEProgressTracker:
    """Progress tracking with SSE support using Redis for multi-worker deployments.

    Uses Redis pub/sub for cross-worker communication and Redis for progress storage.
    Falls back to in-memory storage if Redis is unavailable.

    Design Principles Applied:
    - Single Responsibility: Manages only progress tracking and notification
    - Open/Closed: Extensible via Redis or in-memory storage without modification
    - Dependency Inversion: Depends on abstractions (Redis interface)
    - Interface Segregation: Provides specific methods for different update types

    Thread Safety:
    - Uses asyncio.Lock for in-memory operations
    - Redis operations are atomic by nature
    - Queues are thread-safe for subscriber notifications

    Attributes:
        _progress_store: In-memory progress cache (fallback)
        _subscribers: Per-submission subscriber queues
        _lock: Asyncio lock for thread-safe operations
        _redis_client: Redis async client instance
        _redis_initialized: Redis connection state flag
        _use_redis: Whether Redis is enabled
    """

    def __init__(self):
        """Initialize progress tracker with Redis support"""
        # In-memory fallback storage
        self._progress_store: Dict[str, Dict[str, Any]] = {}

        # Local subscriber queues (always in-memory, per worker)
        self._subscribers: DefaultDict[str, List[asyncio.Queue]] = defaultdict(list)

        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

        # Redis configuration
        redis_host = os.getenv("REDIS_HOST")
        if redis_host and not redis_host.startswith("redis://"):
            redis_host = f"redis://{redis_host}"

        self._redis_url = redis_host
        # Type: Optional[redis.Redis] when available
        self._redis_client: Any = None
        self._redis_initialized = False
        self._use_redis = REDIS_AVAILABLE and redis_host is not None

        if self._use_redis:
            logger.info(
                "✓ SSEProgressTracker initialized with Redis backend: %s", redis_host
            )
        else:
            if not REDIS_AVAILABLE:
                logger.warning(
                    "Redis library not installed. Run: pip install redis\n"
                    "   Multi-worker deployments will NOT work correctly!"
                )
            else:
                logger.warning(
                    "REDIS_HOST environment variable not set.\n"
                    "   Using in-memory storage. Multi-worker deployments will NOT work!"
                )

    async def _ensure_redis(self) -> bool:
        """Ensure Redis connection is established.

        Returns:
            bool: True if Redis is available and connected, False otherwise
        """
        if not self._use_redis:
            return False

        if self._redis_initialized:
            return True

        try:
            self._redis_client = redis.from_url(
                self._redis_url,
                decode_responses=True,
                socket_connect_timeout=REDIS_SOCKET_TIMEOUT_SECONDS,
                socket_keepalive=True,
                max_connections=REDIS_MAX_CONNECTIONS,
            )
            await self._redis_client.ping()
            self._redis_initialized = True
            logger.info("✓ Redis connection established successfully")
            return True
        except (ConnectionError, TimeoutError, OSError) as e:
            logger.error(
                "Failed to connect to Redis: %s\n"
                "  Falling back to in-memory (multi-worker will NOT work!)",
                str(e),
            )
            self._use_redis = False
            self._redis_client = None
            return False
        except Exception as e:  # pylint: disable=broad-except
            # Catch-all for unexpected errors during Redis initialization
            logger.error(
                "Unexpected error connecting to Redis: %s\n"
                "Falling back to in-memory (multi-worker will NOT work!)",
                str(e),
            )
            self._use_redis = False
            self._redis_client = None
            return False

    @staticmethod
    def _get_progress_key(submission_id: str) -> str:
        """Get Redis key for progress data.

        Args:
            submission_id: Submission UUID

        Returns:
            Redis key string
        """
        return f"progress:{submission_id}"

    @staticmethod
    def _get_channel_key(submission_id: str) -> str:
        """Get Redis pub/sub channel key.

        Args:
            submission_id: Submission UUID

        Returns:
            Channel key string
        """
        return f"progress_channel:{submission_id}"

    async def update_progress(
        self,
        submission_id: str,
        status: ProgressStatus,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
        step_number: Optional[int] = None,
        total_steps: Optional[int] = None,
    ) -> None:
        """Update progress and notify all subscribers.

        Args:
            submission_id: UUID of the submission
            status: Current progress status
            message: Human-readable progress message
            metadata: Additional metadata (default: None)
            step_number: Current step number (default: None)
            total_steps: Total number of steps (default: None)
        """
        progress_data = {
            "submission_id": submission_id,
            "status": status.value,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {},
        }

        if step_number is not None and total_steps is not None:
            progress_data["progress"] = {
                "step": step_number,
                "total": total_steps,
                "percentage": round((step_number / total_steps) * 100, 2),
            }

        # Store in Redis first (for cross-worker access) - BEFORE acquiring lock
        # This ensures other workers see the update even if local notification fails
        if await self._ensure_redis():
            try:
                # Store in Redis with TTL
                await self._redis_client.setex(
                    self._get_progress_key(submission_id),
                    REDIS_TTL_SECONDS,
                    json.dumps(progress_data),
                )
                # Publish to Redis pub/sub for real-time cross-worker updates
                await self._redis_client.publish(
                    self._get_channel_key(submission_id), json.dumps(progress_data)
                )
                logger.info(
                    "Progress published to Redis for %s: %s - %s",
                    submission_id,
                    status.value,
                    message[:80] if len(message) > 80 else message,
                )
            except (ConnectionError, TimeoutError, OSError) as e:
                logger.error(
                    "Redis operation failed: %s. Using in-memory fallback.", str(e)
                )
            except Exception as e:  # pylint: disable=broad-except
                # Catch-all for unexpected Redis errors (serialization, etc.)
                logger.error(
                    "Unexpected Redis error: %s. Using in-memory fallback.", str(e)
                )

        # ATOMICALLY store in-memory and notify LOCAL subscribers (on this worker)
        # This is critical for same-worker multi-threaded operations
        # Keep the entire operation under one lock to prevent race conditions
        async with self._lock:
            # Store progress in-memory
            self._progress_store[submission_id] = progress_data

            subscriber_count = len(self._subscribers.get(submission_id, []))

            logger.info(
                "Progress stored locally for %s: %s (local subscribers: %d)",
                submission_id,
                status.value,
                subscriber_count,
            )

            if subscriber_count > 0:
                # Notify all local subscribers
                # IMPORTANT: This must happen even if Redis is working
                # to support multi-threaded operations within the same worker
                dead_queues = []
                for i, queue in enumerate(self._subscribers[submission_id]):
                    try:
                        # Try immediate put first
                        queue.put_nowait(progress_data)
                        logger.debug(
                            "Notified local subscriber %d/%d for %s",
                            i + 1,
                            subscriber_count,
                            submission_id,
                        )
                    except asyncio.QueueFull:
                        logger.warning(
                            "Queue full for subscriber %d/%d, attempting async put",
                            i + 1,
                            subscriber_count,
                        )
                        try:
                            # Try async put with short timeout
                            await asyncio.wait_for(
                                queue.put(progress_data),
                                timeout=QUEUE_PUT_TIMEOUT_SECONDS,
                            )
                            logger.debug(
                                "Notified slow subscriber %d/%d after retry",
                                i + 1,
                                subscriber_count,
                            )
                        except asyncio.TimeoutError:
                            logger.warning(
                                "Subscriber %d/%d too slow, marking for removal",
                                i + 1,
                                subscriber_count,
                            )
                            dead_queues.append(queue)
                        except (RuntimeError, AttributeError) as e:
                            logger.warning(
                                "Subscriber %d/%d queue corrupted: %s",
                                i + 1,
                                subscriber_count,
                                str(e),
                            )
                            dead_queues.append(queue)
                    except (RuntimeError, AttributeError) as e:
                        logger.warning(
                            "Failed to notify subscriber %d/%d: %s",
                            i + 1,
                            subscriber_count,
                            str(e),
                        )
                        dead_queues.append(queue)

                # Remove dead queues
                if dead_queues:
                    for dead_queue in dead_queues:
                        try:
                            self._subscribers[submission_id].remove(dead_queue)
                            logger.info(
                                "Removed dead subscriber for %s, remaining: %d",
                                submission_id,
                                len(self._subscribers[submission_id]),
                            )
                        except (ValueError, KeyError):
                            pass  # Already removed

                logger.info(
                    "Notified %d local subscriber(s) for %s: %s",
                    subscriber_count - len(dead_queues),
                    submission_id,
                    status.value,
                )
            else:
                # No local subscribers - they will get updates from Redis or cached progress
                logger.debug(
                    "No local subscribers for %s (will use Redis or cached progress)",
                    submission_id,
                )

    async def update_file_progress(
        self,
        submission_id: str,
        file_name: str,
        file_index: int,
        total_files: int,
        status: str,
        message: str,
    ) -> None:
        """Update progress for individual file processing.

        Args:
            submission_id: UUID of the submission
            file_name: Name of the file being processed
            file_index: Index of current file (0-based)
            total_files: Total number of files
            status: Status of file processing
            message: Progress message
        """
        metadata = {
            "current_file": file_name,
            "file_index": file_index + 1,  # 1-based for display
            "total_files": total_files,
            "file_status": status,
            "file_progress_percentage": round(
                ((file_index + 1) / total_files) * 100, 2
            ),
        }

        await self.update_progress(
            submission_id=submission_id,
            status=ProgressStatus.EXTRACTING_BLOCKS,
            message=message,
            metadata=metadata,
            step_number=file_index + 1,
            total_steps=total_files,
        )

    async def update_question_progress(
        self,
        submission_id: str,
        question_id: str,
        question_index: Optional[int],
        total_questions: Optional[int],
        status: str,
        message: str,
    ) -> None:
        """Update progress for individual question processing.

        Args:
            submission_id: UUID of the submission
            question_id: ID of the question being processed
            question_index: Index of current question (0-based, None if unknown)
            total_questions: Total number of questions (None if unknown)
            status: Status of question processing
            message: Progress message
        """
        metadata = {
            "current_question": question_id,
            "question_index": (
                question_index + 1 if question_index is not None else 0
            ),  # 1-based for display
            "total_questions": (
                total_questions
                if total_questions is not None and total_questions > 0
                else 0
            ),
            "question_status": status,
        }

        # Only calculate percentage if we have valid values
        if question_index is not None and total_questions and total_questions > 0:
            metadata["question_progress_percentage"] = round(
                ((question_index + 1) / total_questions) * 100, 2
            )

        await self.update_progress(
            submission_id=submission_id,
            status=ProgressStatus.PROCESSING_QUESTIONS,
            message=message,
            metadata=metadata,
            step_number=question_index + 1,
            total_steps=total_questions,
        )

    async def get_progress(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get current progress for a submission (checks Redis first, then in-memory).

        Args:
            submission_id: UUID of the submission

        Returns:
            Optional[Dict[str, Any]]: Progress data dict or None if not found
        """
        # Try Redis first (cross-worker)
        if await self._ensure_redis():
            try:
                data = await self._redis_client.get(
                    self._get_progress_key(submission_id)
                )
                if data:
                    return json.loads(data)
            except (ConnectionError, TimeoutError, json.JSONDecodeError) as e:
                logger.error("Failed to get progress from Redis: %s", str(e))
            except Exception as e:  # pylint: disable=broad-except
                # Catch-all for unexpected Redis errors
                logger.error("Unexpected error getting progress from Redis: %s", str(e))

        # Fallback to in-memory (same worker only)
        async with self._lock:
            return self._progress_store.get(submission_id)

    async def subscribe(self, submission_id: str) -> AsyncGenerator[str, None]:
        """Subscribe to progress updates for a submission.

        Args:
            submission_id: UUID of the submission

        Yields:
            str: SSE-formatted progress update messages
        """
        # Create bounded queue to prevent memory issues with slow consumers
        queue = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)

        logger.info("New subscriber connecting for submission %s", submission_id)

        # Add subscriber and get current progress atomically
        redis_listener_task = None
        current_progress = None

        async with self._lock:
            # Add subscriber FIRST to avoid race condition
            # This ensures any progress updates after this point will notify the queue
            self._subscribers[submission_id].append(queue)
            subscriber_count = len(self._subscribers[submission_id])

            # Get current progress from in-memory while holding lock
            current_progress = self._progress_store.get(submission_id)

        # If not in memory, try Redis (without holding lock)
        if not current_progress:
            if await self._ensure_redis():
                try:
                    data = await self._redis_client.get(
                        self._get_progress_key(submission_id)
                    )
                    if data:
                        current_progress = json.loads(data)
                except (ConnectionError, TimeoutError, json.JSONDecodeError) as e:
                    logger.error("Failed to get progress from Redis: %s", str(e))
                except Exception as e:  # pylint: disable=broad-except
                    # Catch-all for unexpected Redis errors
                    logger.error(
                        "Unexpected error getting progress from Redis: %s", str(e)
                    )

        # Start Redis pub/sub listener for cross-worker updates
        using_redis = await self._ensure_redis()
        if using_redis:
            redis_listener_task = asyncio.create_task(
                self._listen_redis_updates(submission_id, queue)
            )

        logger.info(
            "Subscriber added for %s. Total: %d, Cached progress: %s, Redis: %s",
            submission_id,
            subscriber_count,
            "YES" if current_progress else "NO",
            "ENABLED" if using_redis else "DISABLED",
        )

        try:
            # Always send initial message to confirm connection
            if current_progress:
                logger.info(
                    "Sending cached progress to subscriber for %s: %s",
                    submission_id,
                    current_progress.get("status"),
                )
                yield f"data: {json.dumps(current_progress)}\n\n"
            else:
                # No cached progress yet - normal for early connections
                logger.info(
                    "No cached progress for %s yet. Waiting for updates...",
                    submission_id,
                )
                # Send connection established message
                connection_msg = {
                    "submission_id": submission_id,
                    "status": "connected",
                    "message": "Connected to progress stream",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                yield f"data: {json.dumps(connection_msg)}\n\n"

            # Send immediate keepalive to ensure stream stays open
            yield ": keepalive\n\n"

            logger.info(
                "Subscriber for %s entering main loop, waiting for updates",
                submission_id,
            )

            # Stream updates
            while True:
                try:
                    # Wait for update with timeout to handle slow LLM operations
                    progress = await asyncio.wait_for(
                        queue.get(),
                        timeout=SUBSCRIBER_TIMEOUT_SECONDS,
                    )

                    # Validate progress data
                    if not isinstance(progress, dict):
                        logger.error(
                            "Invalid progress data type for %s: %s",
                            submission_id,
                            type(progress).__name__,
                        )
                        continue

                    # Get status and message for logging
                    status = progress.get("status")
                    message = progress.get("message", "")
                    metadata = progress.get("metadata", {})

                    # Log with additional context for multi-file scenarios
                    if "current_file" in metadata:
                        logger.info(
                            "Streaming to %s: %s - File %d/%d: %s",
                            submission_id,
                            status,
                            metadata.get("file_index", 0),
                            metadata.get("total_files", 0),
                            metadata.get("current_file", "")[:50],
                        )
                    elif "current_question" in metadata:
                        logger.info(
                            "Streaming to %s: %s - Q %d/%d",
                            submission_id,
                            status,
                            metadata.get("question_index", 0),
                            metadata.get("total_questions", 0),
                        )
                    else:
                        logger.info(
                            "Streaming to %s: %s - %s",
                            submission_id,
                            status,
                            message[:80] if len(message) > 80 else message,
                        )

                    yield f"data: {json.dumps(progress)}\n\n"

                    # Check if complete
                    if status in [
                        ProgressStatus.SUCCESS.value,
                        ProgressStatus.FAILED.value,
                        "cleared",
                    ]:
                        logger.info(
                            "Stream completed for %s with status: %s",
                            submission_id,
                            status,
                        )
                        break

                except asyncio.TimeoutError:
                    # Send keepalive (debug level - this is normal behavior)
                    logger.debug("Sending keepalive for %s", submission_id)
                    yield ": keepalive\n\n"
                except asyncio.CancelledError:
                    logger.info(
                        "Subscription cancelled for %s (client likely disconnected)",
                        submission_id,
                    )
                    break

        except (ConnectionError, BrokenPipeError) as e:
            logger.warning(
                "Connection error in subscription for %s: %s",
                submission_id,
                str(e),
            )
            # Don't yield error - connection is already broken
        except asyncio.CancelledError:
            logger.info(
                "Subscription task cancelled for %s",
                submission_id,
            )
            # Don't yield error - task was cancelled
        except (RuntimeError, AttributeError, KeyError, ValueError) as e:
            logger.error(
                "Data error in subscription for %s: %s",
                submission_id,
                str(e),
                exc_info=True,
            )
            try:
                error_data = {
                    "submission_id": submission_id,
                    "status": "error",
                    "message": f"Stream error: {str(e)}",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                yield f"data: {json.dumps(error_data)}\n\n"
            except (ConnectionError, BrokenPipeError):
                pass  # Can't send error if connection is broken

        finally:
            # Cancel Redis listener if running
            if redis_listener_task and not redis_listener_task.done():
                redis_listener_task.cancel()
                try:
                    await redis_listener_task
                except asyncio.CancelledError:
                    pass

            # Cleanup subscriber
            logger.info(
                "Subscriber cleanup triggered for %s (generator exiting)",
                submission_id,
            )
            try:
                async with self._lock:
                    if submission_id in self._subscribers:
                        try:
                            self._subscribers[submission_id].remove(queue)
                            remaining = len(self._subscribers[submission_id])
                            logger.info(
                                "Subscriber removed. Remaining subscribers for %s: %d",
                                submission_id,
                                remaining,
                            )
                            if not self._subscribers[submission_id]:
                                del self._subscribers[submission_id]
                                logger.info(
                                    "All subscribers disconnected for %s", submission_id
                                )
                        except (ValueError, KeyError) as e:
                            logger.warning(
                                "Queue not found in subscribers list for %s: %s",
                                submission_id,
                                str(e),
                            )
                    else:
                        logger.warning(
                            "Submission %s not found in subscribers during cleanup",
                            submission_id,
                        )
            except (RuntimeError, AttributeError) as e:
                logger.error(
                    "Error during subscriber cleanup for %s: %s",
                    submission_id,
                    str(e),
                    exc_info=True,
                )

    async def _listen_redis_updates(
        self, submission_id: str, queue: asyncio.Queue
    ) -> None:
        """
        Listen to Redis pub/sub for progress updates from other workers

        Note: This receives updates from ALL workers (including this one).
        Local subscribers get notified twice: once directly and once via Redis.
        This is intentional for reliability - the queue will deduplicate naturally
        since updates have timestamps and status.

        Args:
            submission_id: UUID of the submission
            queue: Local queue to push updates to
        """
        pubsub = None
        try:
            pubsub = self._redis_client.pubsub()
            await pubsub.subscribe(self._get_channel_key(submission_id))

            logger.info("✓ Redis pub/sub listener started for %s", submission_id)

            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        progress_data = json.loads(message["data"])
                        # Push to local queue for SSE streaming
                        # Note: If this is from the same worker, the subscriber
                        # may have already received it via local notification.
                        # The client will handle deduplication based on timestamp/status.
                        try:
                            queue.put_nowait(progress_data)
                            logger.debug(
                                "Received Redis pub/sub update for %s: %s",
                                submission_id,
                                progress_data.get("status"),
                            )
                        except asyncio.QueueFull:
                            logger.warning(
                                "Queue full, dropping Redis update for %s",
                                submission_id,
                            )
                    except json.JSONDecodeError as e:
                        logger.error("Failed to decode Redis message: %s", str(e))

        except asyncio.CancelledError:
            logger.info("Redis listener cancelled for %s", submission_id)
        except (ConnectionError, TimeoutError, json.JSONDecodeError) as e:
            logger.error("Redis listener error for %s: %s", submission_id, str(e))
        except Exception as e:  # pylint: disable=broad-except
            # Catch-all for unexpected errors in Redis listener
            logger.error(
                "Unexpected Redis listener error for %s: %s", submission_id, str(e)
            )
        finally:
            if pubsub:
                try:
                    await pubsub.unsubscribe(self._get_channel_key(submission_id))
                    await pubsub.close()
                    logger.info("Redis pub/sub closed for %s", submission_id)
                except Exception as e:
                    logger.debug("Error closing Redis pubsub: %s", str(e))

    async def mark_complete(
        self,
        submission_id: str,
        success: bool,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Mark extraction process as complete.

        Args:
            submission_id: UUID of the submission
            success: Whether extraction succeeded
            message: Final status message
            metadata: Final metadata (stats, errors, etc.) (default: None)
        """
        status = ProgressStatus.SUCCESS if success else ProgressStatus.FAILED
        await self.update_progress(
            submission_id=submission_id,
            status=status,
            message=message,
            metadata=metadata,
        )

    async def clear_progress(self, submission_id: str) -> None:
        """Clear progress data for a submission (from Redis and in-memory).

        Args:
            submission_id: UUID of the submission
        """
        # Clear from Redis
        if await self._ensure_redis():
            try:
                await self._redis_client.delete(self._get_progress_key(submission_id))
                # Publish clear message to all workers
                completion_data = {
                    "submission_id": submission_id,
                    "status": "cleared",
                    "message": "Progress data cleared",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                await self._redis_client.publish(
                    self._get_channel_key(submission_id), json.dumps(completion_data)
                )
            except (ConnectionError, TimeoutError) as e:
                logger.error("Failed to clear progress from Redis: %s", str(e))
            except Exception as e:  # pylint: disable=broad-except
                # Catch-all for unexpected Redis errors
                logger.error(
                    "Unexpected error clearing progress from Redis: %s", str(e)
                )

        # Clear from in-memory
        async with self._lock:
            self._progress_store.pop(submission_id, None)

            # Notify local subscribers
            if submission_id in self._subscribers:
                completion_data = {
                    "submission_id": submission_id,
                    "status": "cleared",
                    "message": "Progress data cleared",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

                for queue in self._subscribers[submission_id]:
                    try:
                        # Use put with timeout to avoid blocking
                        await asyncio.wait_for(queue.put(completion_data), timeout=0.5)
                    except (asyncio.TimeoutError, asyncio.QueueFull):
                        logger.debug(
                            "Could not send clear message to slow subscriber for %s",
                            submission_id,
                        )
                    except (RuntimeError, AttributeError):
                        pass  # Queue already closed or corrupted

                try:
                    del self._subscribers[submission_id]
                except KeyError:
                    pass  # Already removed

            logger.info("Progress cleared for %s", submission_id)

    async def get_active_submissions(self) -> list:
        """Get list of submissions with active progress tracking.

        Checks Redis first, then falls back to in-memory storage.

        Returns:
            list: List of submission IDs with active progress
        """
        # Try Redis first
        if await self._ensure_redis():
            try:
                keys = await self._redis_client.keys("progress:*")
                return [key.replace("progress:", "") for key in keys]
            except (ConnectionError, TimeoutError) as e:
                logger.error("Failed to get active submissions from Redis: %s", str(e))
            except Exception as e:  # pylint: disable=broad-except
                # Catch-all for unexpected Redis errors
                logger.error(
                    "Unexpected error getting active submissions from Redis: %s", str(e)
                )

        # Fallback to in-memory
        return list(self._progress_store.keys())

    def get_subscriber_count(self, submission_id: str) -> int:
        """Get number of active subscribers on this worker.

        Args:
            submission_id: UUID of the submission

        Returns:
            int: Number of active local subscribers
        """
        return len(self._subscribers.get(submission_id, []))


# Singleton instance
sse_progress_tracker = SSEProgressTracker()
