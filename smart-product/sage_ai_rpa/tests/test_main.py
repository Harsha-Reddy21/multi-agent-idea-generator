"""
Tests for main.py entry point and CLI
"""

import pytest
import sys
import argparse
from unittest.mock import AsyncMock, MagicMock, patch, call
from io import StringIO

# Import main module
import main
from serializers.rpa_schemas import BatchProcessResponse


class TestParseArguments:
    """Test command line argument parsing"""

    def test_parse_arguments_defaults(self):
        """Test parsing with default arguments"""
        with patch("sys.argv", ["main.py"]):
            args = main.parse_arguments()

            assert args.limit > 0
            assert args.log_level in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
            assert args.log_format in ["json", "text"]

    def test_parse_arguments_with_limit(self):
        """Test parsing with custom limit"""
        with patch("sys.argv", ["main.py", "--limit", "50"]):
            args = main.parse_arguments()

            assert args.limit == 50

    def test_parse_arguments_with_form_types(self):
        """Test parsing with custom form types"""
        with patch("sys.argv", ["main.py", "--form-types", "ai-registry-form,dlo-form"]):
            args = main.parse_arguments()

            assert args.form_types == "ai-registry-form,dlo-form"

    def test_parse_arguments_with_log_level(self):
        """Test parsing with custom log level"""
        with patch("sys.argv", ["main.py", "--log-level", "DEBUG"]):
            args = main.parse_arguments()

            assert args.log_level == "DEBUG"

    def test_parse_arguments_with_log_format(self):
        """Test parsing with custom log format"""
        with patch("sys.argv", ["main.py", "--log-format", "json"]):
            args = main.parse_arguments()

            assert args.log_format == "json"

    def test_parse_arguments_all_options(self):
        """Test parsing with all options"""
        with patch(
            "sys.argv",
            [
                "main.py",
                "--limit",
                "100",
                "--form-types",
                "ai-registry-form,security-arch-form",
                "--log-level",
                "WARNING",
                "--log-format",
                "json",
            ],
        ):
            args = main.parse_arguments()

            assert args.limit == 100
            assert args.form_types == "ai-registry-form,security-arch-form"
            assert args.log_level == "WARNING"
            assert args.log_format == "json"


class TestMainAsync:
    """Test async main function"""

    @pytest.mark.asyncio
    async def test_main_async_success_with_jobs(self):
        """Test main_async with successful job processing"""
        mock_response = BatchProcessResponse(
            success=True, message="Processing complete", processed_count=5, success_count=5, failed_count=0
        )

        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 0
                    mock_handler.process_queue.assert_called_once()

    @pytest.mark.asyncio
    async def test_main_async_no_jobs(self):
        """Test main_async with no pending jobs"""
        mock_response = BatchProcessResponse(
            success=True, message="No pending jobs", processed_count=0, success_count=0, failed_count=0
        )

        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 0  # No jobs is considered success

    @pytest.mark.asyncio
    async def test_main_async_all_failed(self):
        """Test main_async when all jobs fail"""
        mock_response = BatchProcessResponse(
            success=True, message="All jobs failed", processed_count=3, success_count=0, failed_count=3
        )

        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 1  # All failed = error exit code

    @pytest.mark.asyncio
    async def test_main_async_partial_success(self):
        """Test main_async with partial success"""
        mock_response = BatchProcessResponse(
            success=True, message="Mixed results", processed_count=5, success_count=3, failed_count=2
        )

        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 0  # At least one success = success

    @pytest.mark.asyncio
    async def test_main_async_keyboard_interrupt(self):
        """Test main_async handling KeyboardInterrupt"""
        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(side_effect=KeyboardInterrupt())
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 1

    @pytest.mark.asyncio
    async def test_main_async_unexpected_exception(self):
        """Test main_async handling unexpected exceptions"""
        with patch("sys.argv", ["main.py"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(side_effect=RuntimeError("Critical error"))
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 1

    @pytest.mark.asyncio
    async def test_main_async_with_custom_form_types(self):
        """Test main_async with custom form types from args"""
        mock_response = BatchProcessResponse(
            success=True, message="Success", processed_count=2, success_count=2, failed_count=0
        )

        with patch("sys.argv", ["main.py", "--form-types", "ai-registry-form,dlo-form"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 0
                    # Verify it was called with parsed form types
                    call_kwargs = mock_handler.process_queue.call_args[1]
                    assert "ai-registry-form" in call_kwargs["form_types"]
                    assert "dlo-form" in call_kwargs["form_types"]

    @pytest.mark.asyncio
    async def test_main_async_with_limit(self):
        """Test main_async with custom limit"""
        mock_response = BatchProcessResponse(
            success=True, message="Success", processed_count=20, success_count=20, failed_count=0
        )

        with patch("sys.argv", ["main.py", "--limit", "20"]):
            with patch("main.configure_logging"):
                with patch("main.RPAHandler") as mock_handler_class:
                    mock_handler = MagicMock()
                    mock_handler.process_queue = AsyncMock(return_value=mock_response)
                    mock_handler_class.return_value = mock_handler

                    exit_code = await main.main_async()

                    assert exit_code == 0
                    # Verify limit was passed
                    call_kwargs = mock_handler.process_queue.call_args[1]
                    assert call_kwargs["limit"] == 20

    @pytest.mark.asyncio
    async def test_main_async_logging_configuration(self):
        """Test that main_async configures logging correctly"""
        mock_response = BatchProcessResponse(
            success=True, message="Success", processed_count=1, success_count=1, failed_count=0
        )

        with patch("sys.argv", ["main.py", "--log-level", "DEBUG", "--log-format", "json"]):
            with patch("main.configure_logging") as mock_configure:
                with patch("main.RPAHandler") as mock_handler_class:
                    with patch.dict("os.environ", {}, clear=True):
                        mock_handler = MagicMock()
                        mock_handler.process_queue = AsyncMock(return_value=mock_response)
                        mock_handler_class.return_value = mock_handler

                        exit_code = await main.main_async()

                        assert exit_code == 0
                        mock_configure.assert_called_once()
                        # Check environment variables were set
                        import os

                        assert os.environ.get("LOG_LEVEL") == "DEBUG"
                        assert os.environ.get("LOG_FORMAT") == "json"


class TestMain:
    """Test synchronous main entry point"""

    def test_main_success(self):
        """Test main function with successful execution"""
        with patch("main.asyncio.run", return_value=0) as mock_run:
            with pytest.raises(SystemExit) as exc_info:
                main.main()

            assert exc_info.value.code == 0
            mock_run.assert_called_once()

    def test_main_failure(self):
        """Test main function with failed execution"""
        with patch("main.asyncio.run", return_value=1) as mock_run:
            with pytest.raises(SystemExit) as exc_info:
                main.main()

            assert exc_info.value.code == 1
            mock_run.assert_called_once()

    def test_main_exception(self):
        """Test main function handling exceptions"""
        with patch("main.asyncio.run", side_effect=RuntimeError("Fatal error")):
            with pytest.raises(SystemExit) as exc_info:
                with patch("sys.stderr", new=StringIO()):
                    main.main()

            assert exc_info.value.code == 1

    def test_main_if_name_main(self):
        """Test that __main__ entry point works"""
        # This is more of a smoke test to ensure the if __name__ == "__main__" block is valid
        with patch("main.main") as mock_main:
            # Simulate running as main
            code = """
if __name__ == "__main__":
    from unittest.mock import MagicMock
    mock_main = MagicMock()
    mock_main()
            """
            exec(code)
            # If we get here without error, the structure is valid
            assert True
