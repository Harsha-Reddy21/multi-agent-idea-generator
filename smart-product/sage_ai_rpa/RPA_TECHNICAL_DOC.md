# Sage AI RPA Service - Technical Documentation

> Last Updated: December 19, 2025  
> Status: ✅ Production Ready  
> Version: 1.0

---

## Table of Contents

1. Overview
2. Architecture
3. RPA Processing Flow
4. CLI Commands & Options
5. Data Models
6. Configuration
7. Backend Services
8. Supported Form Types
9. Database Schema & Monitoring
10. Deployment
11. Troubleshooting
12. Exit Codes & Logging

---

## 1. Overview

### Purpose

The Sage AI RPA Service automates Microsoft Forms submissions for completed ideas. It reads queued jobs from the `sage_ai_rpa_status` table, retrieves form data, and uses browser automation to fill and submit the corresponding Microsoft form.

### What It Does

- Pulls pending jobs from `sage_ai_rpa_status` (queue)
- Retrieves form data from `SubmissionForms` for the target submission
- Fills dynamic forms using Selenium via Robot Framework’s `RPA.Browser.Selenium`
- Updates job status to `processing` → `completed` or `failed`
- Sends completion/failure emails to submitters
- Logs structured metrics on matches, skips, and failures

---

## 2. Architecture

### High-Level Architecture

```
┌───────────────────────────┐
│  sage_ai_be (Producer)    │
│  - Creates pending queue  │
│    records in rpa_status  │
└───────────────┬───────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Sage AI RPA (Consumer)                       │
│  - Cron/Task Scheduler invokes `main.py`      │
│  - Reads pending jobs (filtered by form type) │
│  - Updates status → processing                │
│  - Automates Microsoft Forms submission       │
│  - Writes status → completed/failed           │
│  - Sends email notifications                  │
└───────────────────────────────────────────────┘
```

### Service Layers

```
┌───────────────────────────────────────────────┐
│ Entry (CLI)                                   │
│ - main.py                                     │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│ Handlers                                       │
│ - RPAHandler: Batch queue processing           │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│ Services                                       │
│ - FormAutomationService: DB + automation flow  │
│ - EmailService: notifications                  │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│ Utilities                                      │
│ - FormProcessor: question matching + filling   │
│ - BrowserAutomation: Selenium interactions     │
│ - Logger/Error utils                           │
└───────────────────────────────────────────────┘
```

---

## 3. RPA Processing Flow

### Flow 1: Queue Creation (Producer)

```
User completes form in UI
         ↓
BE writes to `sage_ai_rpa_status`
(status=pending, submission_id, form_schema_id)
```

### Flow 2: Batch Queue Processing

```
Cron/Task Scheduler invokes RPA
         ↓
┌──────────────────────────────────────────┐
│ RPAHandler.process_queue                 │
│ 1. Query pending jobs by form types      │
│ 2. For each job → process single job     │
└──────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ FormAutomationService.process_rpa_job    │
│ 1. Update status → PROCESSING            │
│ 2. Fetch form data from SubmissionForms  │
│ 3. Lookup submitter email via Submissions│
│    + Users                                │
│ 4. Run FormProcessor (dynamic fill)      │
│ 5. Update status → COMPLETED/FAILED      │
│ 6. Send completion/failure email         │
└──────────────────────────────────────────┘
```

### Flow 3: Dynamic Form Filling

```
FormProcessor.fill_form_with_data
         ↓
- Open form (BrowserAutomation.open_form)
- Iterate visible questions (count & read)
- Match DB questions (strict normalization)
- Fill by type: text, radio, dropdown, checkbox, date
- Handle form expansion & validation errors
- Submit form
```

### Flow 4: Notifications & Status

```
On success → email summary to submitter
On failure → failure email with error message
DB status fields (filled_questions, completed_at, error_message)
```

---

## 4. CLI Commands & Options

### Run Queue Processor

- Windows PowerShell:

```powershell
# Default run
python .\main.py

# Custom batch size
python .\main.py --limit 20

# Specific form types
python .\main.py --form-types ai-registry-form,security-arch-form

# Debug logs in text format
$env:LOG_FORMAT="text"; python .\main.py --log-level DEBUG
```

### Command-Line Options

```
--limit N           Max jobs to process (default from settings)
--form-types list   Comma-separated form types to process
--log-level LEVEL   DEBUG | INFO | WARNING | ERROR | CRITICAL
--log-format fmt    json | text
```

---

## 5. Data Models

### QueueJobInfo (Pydantic)

| Field          | Type   | Description                  |
|----------------|--------|------------------------------|
| rpa_status_id  | UUID   | Queue record ID              |
| submission_id  | UUID   | Target submission ID         |
| form_schema_id | UUID   | Form schema ID               |
| form_type      | string | Form type identifier         |
| created_at     | time   | When the job was queued      |

### RPAJobResponse (Pydantic)

| Field           | Type    | Description                          |
|-----------------|---------|--------------------------------------|
| success         | bool    | Overall job outcome                  |
| message         | string  | Status message                       |
| submission_id   | string  | Submission ID                        |
| filled_questions| int     | Questions successfully filled        |
| total_questions | int     | Total questions considered           |
| status          | string  | completed | failed                   |
| error_details   | string  | Error details if failed              |

### BatchProcessResponse (Pydantic)

Aggregates per-job results for a batch run.

```json
{
  "success": true,
  "message": "Queue processing completed",
  "processed_count": 10,
  "success_count": 9,
  "failed_count": 1,
  "results": []
}
```

### AutomationResult (Pydantic)

Returned by form processing with detailed metrics:

- `matched_count`, `filled_count`, `skipped_count`, `failed_count`
- `matched_question_ids`, `unmatched_questions`, `failed_questions`

---

## 6. Configuration

### Environment Variables

Create `.env` in `sage_ai_rpa/`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/sage
# Or individual settings (used by configuration/config.py)
DB_NAME=sage
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=60

# Queue Processing
RPA_FORM_TYPES=ai-registry-form,security-arch-form,dlo-form
QUEUE_BATCH_SIZE=10
QUEUE_MAX_AGE_HOURS=24
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY_SECONDS=5

# Browser
RPA_HEADLESS=true
RPA_PAGE_LOAD_TIMEOUT=15
RPA_ELEMENT_TIMEOUT=10

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Settings Location

- `configuration/settings.py` (Pydantic Settings)
- `configuration/config.py` (env-based DB settings)
- `db_connection/db.py` (async engine + session)

---

## 7. Backend Services

| Component               | Purpose                                 | Location                                   |
|-------------------------|------------------------------------------|--------------------------------------------|
| `RPAHandler`            | Orchestrates batch queue processing      | `handlers/rpa_handler.py`                  |
| `FormAutomationService` | DB ops, status mgmt, automation flow     | `service/form_automation_service.py`       |
| `EmailService`          | Completion/failure notifications         | `service/email_service.py`                 |
| `FormProcessor`         | Question matching & form filling         | `utils/form_processor.py`                  |
| `BrowserAutomation`     | Selenium interactions & selectors        | `utils/browser_automation.py`              |

---

## 8. Supported Form Types

Configured via `RPA_FORM_TYPES` and defaults in `settings`:

- `ai-registry-form`
- `security-arch-form`
- `dlo-form`
- `wwtp-form`
- `ai-registry-update-form`
- `wwtp-new-vendor-form`

Add/modify in `.env`:

```env
RPA_FORM_TYPES=ai-registry-form,security-arch-form,dlo-form,new-form-type
```

---

## 9. Database Schema & Monitoring

### `sage_ai_rpa_status` (Queue Table)

| Column           | Type      | Description                         |
|------------------|-----------|-------------------------------------|
| id               | UUID      | Primary key                         |
| submission_id    | UUID      | FK to `submissions`                 |
| form_schema_id   | UUID      | FK to `form_schemas`                |
| status           | String    | pending/processing/completed/failed |
| filled_questions | Integer   | Number of questions filled          |
| total_questions  | Integer   | Total questions in form             |
| error_message    | Text      | Error details if failed             |
| started_at       | Timestamp | When processing started             |
| completed_at     | Timestamp | When processing finished            |
| created_at       | Timestamp | When job was queued                 |
| updated_at       | Timestamp | Last update                         |

### Monitoring Queries

```sql
-- Pending jobs
SELECT * FROM sage_ai_rpa_status
WHERE status = 'pending'
ORDER BY created_at;

-- Failed jobs summary
SELECT submission_id, error_message, created_at
FROM sage_ai_rpa_status
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## 10. Deployment

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: sage-ai-rpa-processor
spec:
  schedule: "*/10 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: rpa-processor
              image: sage-ai-rpa:latest
              command: ["python", "main.py"]
              env:
                - name: DATABASE_URL
                  valueFrom:
                    secretKeyRef:
                      name: sage-db-secrets
                      key: database_url
                - name: QUEUE_BATCH_SIZE
                  value: "50"
          restartPolicy: OnFailure
```

### Linux Cron

```bash
# Every 10 minutes
*/10 * * * * cd /path/to/sage_ai_rpa && ./start.sh >> /var/log/sage-rpa.log 2>&1
```

### Docker

```bash
# Build
docker build -t sage-ai-rpa:latest .

# Run
docker run --env-file .env sage-ai-rpa:latest python main.py
```

### Windows Task Scheduler

```powershell
schtasks /Create /SC MINUTE /MO 10 /TN "SageAI-RPA-Processor" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"cd C:\path\to\sage_ai_rpa; .\\start.bat\"" /F
```

---

## 11. Troubleshooting

- No jobs processed:
  - Ensure pending jobs exist in `sage_ai_rpa_status`
  - Verify `RPA_FORM_TYPES` matches job form type
  - Check `QUEUE_MAX_AGE_HOURS` (old jobs are skipped)
- Browser automation fails:
  - Validate `RPA_HEADLESS` and browser driver compatibility
  - Confirm form URL accessibility in `rpa_config.json`
  - Review logs for selector and validation errors
- Database connection errors:
  - Check `.env` credentials or `DATABASE_URL`
  - Verify network/secret mounts in container environments

---

## 12. Exit Codes & Logging

### Exit Codes

- `0`: Success
- `1`: Failure (errors occurred)
- `130`: Interrupted (Ctrl+C)

### Logging

Structured JSON by default, text optional (`LOG_FORMAT=text`).

Example completion metrics:

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
