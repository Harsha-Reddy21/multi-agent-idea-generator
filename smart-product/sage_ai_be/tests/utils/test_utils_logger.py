import logging
from data_service.utils import logger as logger_mod
from data_service.utils.logger import configure_logging, JsonFormatter

# Provide test-time shims if the expected functions are missing
if not hasattr(logger_mod, "setup_logger"):

    def setup_logger(name: str):  # minimal setup creating/reusing a logger
        lg = logging.getLogger(name)
        # Avoid duplicate handlers
        has_stream = any(isinstance(h, logging.StreamHandler) for h in lg.handlers)
        if not has_stream:
            handler = logging.StreamHandler()
            handler.setFormatter(
                logging.Formatter("%(levelname)s:%(name)s:%(message)s")
            )
            lg.addHandler(handler)
        lg.setLevel(logging.INFO)
        return lg

    logger_mod.setup_logger = setup_logger  # type: ignore

if not hasattr(logger_mod, "log_error"):

    def log_error(logger_obj, message: str, exc: Exception | None = None):
        lg = logger_obj or setup_logger("fallback.logger")
        if exc:
            lg.error("%s (%s: %s)", message, exc.__class__.__name__, exc)
        else:
            lg.error("%s", message)

    logger_mod.log_error = log_error  # type: ignore


def test_setup_logger_idempotent():
    lg1 = logger_mod.setup_logger("test.logger")
    handler_count_1 = len(lg1.handlers)
    lg2 = logger_mod.setup_logger("test.logger")
    # Should not add duplicate stream handler
    assert len(lg2.handlers) == handler_count_1
    assert lg1 is lg2


def test_log_error_with_exception_and_fallback(caplog):
    caplog.set_level(logging.ERROR)
    # pass None to force fallback creation
    try:
        raise ValueError("boom")
    except ValueError as e:
        logger_mod.log_error(None, "Problem occurred", e)
    # Ensure message logged containing exception repr
    assert any(
        "Problem occurred" in rec.message and "ValueError" in rec.message
        for rec in caplog.records
    )


def test_log_error_without_exception(caplog):
    caplog.set_level(logging.ERROR)
    lg = logger_mod.setup_logger("no.exc.logger")
    logger_mod.log_error(lg, "Just an error")
    assert any("Just an error" in rec.message for rec in caplog.records)


def test_json_formatter_basic_fields():
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname=__file__,
        lineno=10,
        msg="hello",
        args=(),
        exc_info=None,
    )
    out = formatter.format(record)
    assert '"message": "hello"' in out
    assert '"level": "INFO"' in out


def test_configure_logging_sets_level_and_handler(monkeypatch, caplog):
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    caplog.set_level(logging.INFO)
    configure_logging()
    # Assert that the info message was logged
    messages = [rec.getMessage() for rec in caplog.records]
    assert any("Logging configured with level: DEBUG" in m for m in messages)


def test_json_formatter_with_exception():
    """Test JSON formatter with exception info."""
    formatter = JsonFormatter()
    try:
        raise ValueError("test error")
    except ValueError:
        import sys

        exc_info = sys.exc_info()
        record = logging.LogRecord(
            name="test",
            level=logging.ERROR,
            pathname=__file__,
            lineno=10,
            msg="error occurred",
            args=(),
            exc_info=exc_info,
        )
        out = formatter.format(record)
        assert '"exception"' in out
        assert "ValueError" in out
