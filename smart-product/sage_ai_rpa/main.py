"""
Sage AI RPA - Main Entry Point
================================
Queue-based RPA service that processes pending form submissions.
Runs as a cron job to automate form filling for completed submissions.
"""

import sys
import os
import argparse
import asyncio
import logging
import dotenv

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables first
dotenv.load_dotenv()

# pylint: disable=wrong-import-position
from utils.logger import configure_logging
from handlers.rpa_handler import RPAHandler
from configuration.settings import settings

logger = logging.getLogger(__name__)


def parse_arguments():
    """
    Parse command line arguments.

    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description="Sage AI RPA Service - Queue-Based Form Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process pending RPA jobs (default batch size from settings)
  python main.py

  # Process with specific batch size
  python main.py --limit 20

  # Process only specific form types
  python main.py --form-types ai-registry-form,security-arch-form

  # Debug mode with detailed logs
  python main.py --log-level DEBUG
        """,
    )

    # Processing parameters
    parser.add_argument(
        "--limit",
        type=int,
        default=settings.queue_batch_size,
        help=f"Maximum jobs to process in this run (default: {settings.queue_batch_size})",
    )

    parser.add_argument(
        "--form-types",
        type=str,
        default=None,
        help=f"Comma-separated form types to process (default: {settings.rpa_form_types})",
    )

    # Logging options
    parser.add_argument(
        "--log-level",
        type=str,
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        default=settings.log_level,
        help=f"Set logging level (default: {settings.log_level})",
    )
    parser.add_argument(
        "--log-format",
        type=str,
        choices=["json", "text"],
        default=settings.log_format,
        help=f"Set log output format (default: {settings.log_format})",
    )

    return parser.parse_args()


async def main_async():
    """
    Async main function to process RPA queue.

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    args = parse_arguments()

    # Configure logging with command line overrides
    if args.log_level:
        os.environ["LOG_LEVEL"] = args.log_level
    if args.log_format:
        os.environ["LOG_FORMAT"] = args.log_format

    configure_logging()

    # Determine form types to process
    if args.form_types:
        form_types = [ft.strip() for ft in args.form_types.split(",") if ft.strip()]
    else:
        form_types = settings.supported_form_types

    logger.info("=" * 80)
    logger.info("Sage AI RPA Queue Processor Starting")
    logger.info("=" * 80)
    logger.info("Configuration:")
    logger.info("  - Batch Limit: %s", args.limit)
    logger.info("  - Form Types: %s", ", ".join(form_types))
    logger.info("  - Log Level: %s", args.log_level)
    logger.info("=" * 80)

    try:
        handler = RPAHandler()

        # Process queue
        result = await handler.process_queue(
            form_types=form_types,
            limit=args.limit,
        )

        logger.info("=" * 80)
        logger.info("Queue Processing Completed")
        logger.info("  - Processed: %s", result.processed_count)
        logger.info("  - Succeeded: %s", result.success_count)
        logger.info("  - Failed: %s", result.failed_count)
        logger.info("=" * 80)

        # Return 0 if at least one succeeded, or if no jobs were found
        return 0 if result.success_count > 0 or result.processed_count == 0 else 1

    except KeyboardInterrupt:
        logger.warning("Process interrupted by user")
        return 1
    except Exception:
        logger.exception("Fatal error in RPA queue processor")
        return 1


def main():
    """
    Synchronous entry point for the application.
    Runs the async main function and handles exit codes.
    """
    try:
        exit_code = asyncio.run(main_async())
        sys.exit(exit_code)
    except Exception as e:
        # Last resort error handling
        print(f"FATAL ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
