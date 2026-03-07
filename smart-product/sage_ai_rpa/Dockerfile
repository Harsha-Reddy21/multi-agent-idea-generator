# RPA Service for Form Automation
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for browser automation
RUN apt-get update && apt-get install -y \
    chromium-driver \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*
ENV PATH="/usr/lib/chromium/:${PATH}"

# Install Poetry
RUN pip install --no-cache-dir poetry==1.7.1

# Configure Poetry: Don't create virtual environment
RUN poetry config virtualenvs.create false

# Copy dependency files first (for better caching)
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

# Copy the application code
COPY . .

# Ensure start.sh has Unix line endings and is executable
RUN chmod +x /app/start.sh && \
    sed -i 's/\r$//' /app/start.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_FORMAT=json
ENV LOG_LEVEL=INFO
ENV PYTHONPATH=/app

# Run the RPA service using start.sh
CMD ["/app/start.sh"]
