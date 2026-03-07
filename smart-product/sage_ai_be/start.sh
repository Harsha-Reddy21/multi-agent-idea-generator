#!/bin/bash

# Ensure Poetry is available
export PATH="$HOME/.local/bin:$PATH"

# Use specific Python version if needed (uncomment and adjust if required)
# poetry env use "/usr/bin/python3.11"

poetry lock
poetry install

export PYTHONPATH=src
export ENV_FILE=.env.production

# Upgrade database schema
poetry run alembic upgrade head

poetry run uvicorn main:app \
  --host 0.0.0.0 \
  --port 8080 \
  --timeout-keep-alive 300 \
  --workers 2