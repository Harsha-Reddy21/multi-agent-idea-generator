@echo off

REM Sage AI RPA Queue Processor - Windows Startup Script
REM =====================================================

echo Starting Sage AI RPA Queue Processor...
echo.

REM Ensure Poetry is available in PATH
set PATH=%APPDATA%\Python\Scripts;%PATH%

REM Install dependencies
echo Checking for dependencies...
poetry lock
poetry install --no-interaction 2>nul
if %ERRORLEVEL% neq 0 (
    echo No dependencies to install or update
)

echo.
echo ========================================
echo Running RPA Queue Processor
echo ========================================
echo.

REM Process RPA queue (default batch size from .env)
set PYTHONPATH=%CD%
poetry run python main.py

echo.
echo ========================================
echo RPA Queue Processor Completed
echo ========================================

pause
