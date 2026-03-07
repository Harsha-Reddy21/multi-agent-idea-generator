# Sage AI RPA Service

Queue-based RPA service for automating form submissions in the Sage AI platform.

## Overview

This service processes pending RPA jobs from the `sage_ai_rpa_status` table, automating form filling for completed submissions. It runs as a cron job and supports multiple form types.

### How It Works

1. **Queue Creation**: When a user completes a form in `sage_ai_be`, a record is created in `sage_ai_rpa_status` with `status='pending'`
2. **Queue Processing**: This RPA service runs periodically (via cron) to process pending jobs
3. **Automation**: For each pending job, the service:
   - Updates status to `processing`
   - Retrieves form data from `sage_ai_submission_forms`
   - Launches browser automation to fill and submit the form
   - Updates status to `completed` or `failed`
4. **Tracking**: All automation results are recorded in `sage_ai_rpa_status` table

## Architecture

This service follows a modular layout similar to `sage_ai_be` and reflects the actual repository structure:

```
sage_ai_rpa/
├── main.py                          # Entry point - queue processor
├── pyproject.toml                   # Poetry dependency management
├── configuration/                   # Configuration and settings
│   ├── settings.py                  # Pydantic Settings (form types, logging)
│   ├── config.py                    # Env-based DB settings (legacy-compatible)
│   └── constants.py                 # Constants and enums
├── handlers/                        # Orchestration layer
│   └── rpa_handler.py               # Queue processing orchestration
├── service/                         # Business logic layer
│   ├── form_automation_service.py   # Queue queries & automation logic
│   └── email_service.py             # Email notifications
├── serializers/                     # Pydantic data models
│   └── rpa_schemas.py               # Queue job schemas
├── exceptions/                      # Custom exceptions
│   ├── base.py                      # Base ServiceError class
│   └── service_errors.py            # Service-level errors
├── utils/                           # Utilities
│   ├── browser_automation.py        # Browser automation helpers
│   ├── form_processor.py            # Form field matching & processing
│   ├── email_utils.py               # Email helper functions
│   ├── error_utils.py               # Error helpers
│   └── logger.py                    # Structured JSON logging
├── models/                          # SQLAlchemy ORM models
│   ├── base.py
│   └── sage_ai_rpa_status.py        # Queue status table mapping
├── db_connection/                   # Database connection
│   └── db.py                        # Async engine + session
├── start.bat                        # Windows start script
├── start.sh                         # Linux/Mac start script
└── tests/                           # Unit tests
  └── ...
```

## Features

- **Queue-Based Processing**: Decoupled job creation and execution
- **Configurable Form Types**: Support multiple form types via settings
- **Structured Logging**: JSON-formatted logs with trace context
- **Pydantic Configuration**: Type-safe settings management
- **Custom Exception Handling**: Consistent error handling framework
- **Data Validation**: Pydantic schemas for requests/responses
- **Modular Architecture**: Clear separation of concerns (handlers/service/clients)
- **Cron Job Ready**: Command-line interface for automated execution

## Installation

### Using Poetry (Recommended)

```bash
cd sage_ai_rpa
poetry install
```

### Using pip (Windows PowerShell)

```powershell
cd sage_ai_rpa
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

## Configuration

Create a `.env` file in the project root:

```env
# Database Configuration
# Option A: Single URL (preferred in production)
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/sage

# Option B: Individual settings (used by configuration/config.py)
DB_NAME=sage
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=60

# RPA Form Types - Comma-separated list of supported form types
RPA_FORM_TYPES=ai-registry-form,security-arch-form,dlo-form

# Queue Processing
QUEUE_BATCH_SIZE=10           # Number of jobs to process per run
QUEUE_MAX_AGE_HOURS=24        # Ignore jobs older than this
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY_SECONDS=5

# Browser Settings
RPA_HEADLESS=true
RPA_PAGE_LOAD_TIMEOUT=15
RPA_ELEMENT_TIMEOUT=10

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Supported Form Types

Form types are configured in `.env` via `RPA_FORM_TYPES`. To add new form types:

1. Update `RPA_FORM_TYPES` in `.env`:

   ```env
   RPA_FORM_TYPES=ai-registry-form,security-arch-form,dlo-form,new-form-type
   ```

2. Implement form-specific automation logic in `rpa_service/rpa_utils.py` if needed

## Usage

### Run Queue Processor

**Windows:**

```powershell
.\start.bat
```

**Linux/Mac:**

```bash
./start.sh
```

**Direct Python:**

```powershell
# Process queue with default settings
python .\main.py

# Process with custom batch size
python .\main.py --limit 20

# Process only specific form types
python .\main.py --form-types ai-registry-form,security-arch-form

# Debug mode
python .\main.py --log-level DEBUG
```

### Command Line Options

```
Options:
  --limit N              Maximum jobs to process (default: from settings)
  --form-types LIST      Comma-separated form types to process
  --log-level LEVEL      Logging level (DEBUG, INFO, WARNING, ERROR)
  --log-format FORMAT    Log format (json, text)
```

## Deployment

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: sage-ai-rpa-processor
spec:
  schedule: "*/10 * * * *" # Every 10 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: rpa-processor
              image: sage-ai-rpa:latest
              command: ["python", "main.py"]
              env:
                - name: DB_NAME
                  valueFrom:
                    secretKeyRef:
                      name: sage-db-secrets
                      key: database
                - name: QUEUE_BATCH_SIZE
                  value: "50"
          restartPolicy: OnFailure
```

### Linux Cron

```bash
# Run every 10 minutes
*/10 * * * * cd /path/to/sage_ai_rpa && ./start.sh >> /var/log/sage-rpa.log 2>&1
```

### Docker

#### Build Image

```bash
docker build -t sage-ai-rpa:latest .
```

#### Run Queue Processor

```bash
docker run --env-file .env sage-ai-rpa:latest python main.py
```

### Windows Task Scheduler

Schedule the queue processor to run every 10 minutes using Task Scheduler:

```powershell
# Run start script via Task Scheduler every 10 minutes
schtasks /Create /SC MINUTE /MO 10 /TN "SageAI-RPA-Processor" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"cd C:\path\to\sage_ai_rpa; .\\start.bat\"" /F
```

## Database Schema

### sage_ai_rpa_status (Queue Table)

| Column           | Type      | Description                         |
| ---------------- | --------- | ----------------------------------- |
| id               | UUID      | Primary key                         |
| submission_id    | UUID      | Foreign key to submissions          |
| form_schema_id   | UUID      | Foreign key to form_schemas         |
| status           | String    | pending/processing/completed/failed |
| filled_questions | Integer   | Number of questions filled          |
| total_questions  | Integer   | Total questions in form             |
| error_message    | Text      | Error details if failed             |
| started_at       | Timestamp | When processing started             |
| completed_at     | Timestamp | When processing finished            |
| created_at       | Timestamp | When job was queued                 |

## Monitoring

### Success Metrics

The service logs structured JSON with key metrics:

```json
{
  "timestamp": "2025-11-30 12:00:00",
  "level": "INFO",
  "message": "Queue Processing Completed",
  "processed_count": 10,
  "success_count": 9,
  "failed_count": 1
}
```

### Query Pending Jobs

```sql
SELECT * FROM sage_ai_rpa_status
WHERE status = 'pending'
ORDER BY created_at;
```

### Query Failed Jobs

```sql
SELECT submission_id, error_message, created_at
FROM sage_ai_rpa_status
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## Development

### Setup

```bash
# Install dependencies
poetry install

# Run tests
poetry run pytest

# Run with debug logging
python main.py --log-level DEBUG
```

### Adding New Form Types

1. Add form type to `.env`:

   ```env
   RPA_FORM_TYPES=existing-types,new-form-type
   ```

2. Update form automation logic in `rpa_service/rpa_utils.py` if needed

3. Test with sample data:

   ```bash
   # Insert test job in sage_ai_rpa_status
   INSERT INTO sage_ai_rpa_status (id, submission_id, form_schema_id, status, created_at)
   VALUES (gen_random_uuid(), '<submission_id>', '<form_schema_id>', 'pending', NOW());

   # Run processor
   python main.py --form-types new-form-type --limit 1
   ```

## Troubleshooting

### No jobs processed

Check:

1. Are there pending jobs in `sage_ai_rpa_status`?
2. Are form types matching `RPA_FORM_TYPES` config?
3. Check `QUEUE_MAX_AGE_HOURS` - old jobs are skipped

### Browser automation fails

Check:

1. `RPA_HEADLESS` setting
2. Browser driver compatibility
3. Form URL accessibility
4. Check logs for detailed error traces

### Database connection errors

Check:

1. `.env` database credentials
2. Database accessibility from RPA service
3. Connection pool settings

## Running Tests

```bash
poetry run pytest
```

### Code Formatting

```bash
poetry run black .
```

### Linting

```bash
poetry run pylint sage_ai_rpa
```

## Exit Codes

- `0`: Success
- `1`: Failure (errors occurred)
- `130`: Interrupted (SIGINT/Ctrl+C)

## Logging

The service uses structured JSON logging by default. Example log output:

```json
{
  "timestamp": "2025-11-29 10:30:45",
  "level": "INFO",
  "logger": "sage_ai_rpa.handlers.rpa_handler",
  "message": "Processing single submission: abc123",
  "module": "rpa_handler",
  "function": "process_single_submission",
  "line": 42
}
```

For local development, use text format:

```bash
export LOG_FORMAT=text
python -m sage_ai_rpa.main --batch
```

## Migration from Legacy Code

The service maintains backward compatibility with the legacy `rpa_service/rpa_form_submission.py` module while providing a new, cleaner architecture:

- **Legacy Entry Point**: `sage_ai_rpa.rpa_service.rpa_form_submission`
- **New Entry Point**: `sage_ai_rpa.main` (recommended)

## License

Internal use only - Eli Lilly and Company
