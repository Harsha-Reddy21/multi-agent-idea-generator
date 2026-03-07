"""
Compare extracted questions with existing form questions JSON

Entry point for question comparison workflow.
Uses Handler -> Service -> Utils architecture.
"""

import json
import logging
from pathlib import Path

from handlers.question_comparison_handler import QuestionComparisonHandler
from utils.question_comparator import QuestionComparator

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def main():
    """Main entry point for question comparison."""

    # Create args object with hardcoded values
    class Args:
        def __init__(self):
            self.form_type = "all-forms"
            self.all_forms = True
            self.json_file = "all-forms-questions.json"
            self.no_conditional = False
            self.max_depth = 3
            self.max_options = 5
            self.no_email = False
            self.config = "rpa_config.json"

    args = Args()

    # Load RPA config for email settings
    rpa_config = None
    try:
        with open(args.config, "r", encoding="utf-8") as f:
            rpa_config = json.load(f)
    except FileNotFoundError:
        logger.warning(f"RPA config file not found: {args.config}")
    except json.JSONDecodeError as e:
        logger.warning(f"Invalid JSON in RPA config: {e}")
    except Exception as e:
        logger.warning(f"Could not load RPA config: {e}")

    # Initialize handler
    handler = QuestionComparisonHandler()
    comparator = QuestionComparator()

    try:
        if args.all_forms:
            # Compare all forms
            logger.info("Starting comparison for all forms...")

            all_results = handler.compare_all_forms(
                json_file=args.json_file,
                use_conditional=not args.no_conditional,
                max_depth=args.max_depth,
                max_options=args.max_options,
                rpa_config=rpa_config,
                send_email=not args.no_email,
            )

            # Check for fatal error in loading form types
            if "_error" in all_results:
                logger.error(f"Failed to load form types: {all_results['_error']}")
                return 1

            # Print summary of all forms
            logger.info("\n" + "=" * 80)
            logger.info("OVERALL SUMMARY - ALL FORMS")
            logger.info("=" * 80)

            for form_type, results in all_results.items():
                if "error" in results:
                    logger.info(f"\n{form_type}: ERROR - {results['error']}")
                else:
                    total_unique = max(results["total_extracted"], results["total_existing"])
                    match_rate = (results["match_count"] / total_unique * 100) if total_unique > 0 else 0
                    logger.info(f"\n{form_type}:")
                    logger.info(f"  Extracted: {results['total_extracted']}, " f"Existing: {results['total_existing']}")
                    logger.info(
                        f"  Matching: {results['match_count']}, "
                        f"New: {results['new_count']}, "
                        f"Missing: {results['missing_count']}"
                    )
                    logger.info(f"  Match Rate: {match_rate:.1f}%")

            logger.info("=" * 80 + "\n")

        else:
            # Single form type mode
            comparison = handler.compare_form_questions(
                form_type=args.form_type,
                json_file=args.json_file,
                use_conditional=not args.no_conditional,
                max_depth=args.max_depth,
                max_options=args.max_options,
                rpa_config=rpa_config,
                send_email=not args.no_email,
            )

            # Check for errors in comparison result
            if "error" in comparison:
                logger.error(f"{args.form_type}: {comparison['message']}")
                return 1

            # Print detailed report
            comparator.print_comparison_report(comparison, args.form_type)

    except Exception as e:
        # Entry point only catches unexpected exceptions
        # Handler already caught and logged service exceptions
        logger.exception("Unexpected error during question comparison")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())


if __name__ == "__main__":
    exit(main())
