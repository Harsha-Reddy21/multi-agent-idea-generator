#!/bin/bash

# Sage AI RPA Queue Processor - Production Startup Script
# ========================================================

echo "Starting Sage AI RPA Queue Processor..."
echo ""

# Get job type from environment variable (default to 'rpa')
JOB_TYPE=${JOB_TYPE:-rpa}

echo "========================================"
echo "Job Type: $JOB_TYPE"
echo "========================================"
echo ""

# Run the appropriate script based on job type
if [ "$JOB_TYPE" = "rpa" ]; then
    echo "Running RPA Queue Processor"
    python main.py
elif [ "$JOB_TYPE" = "form-audit" ]; then
    echo "Running Form Audit (Compare Questions)"
    python compare_questions.py
else
    echo "Error: Invalid JOB_TYPE '$JOB_TYPE'. Must be 'rpa' or 'form-audit'"
    exit 1
fi

echo ""
echo "========================================"
echo "Process Completed"
echo "========================================"


