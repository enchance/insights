# Single-stage build
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    make \
    libc6-dev \
    linux-libc-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

COPY . /app/
RUN chmod +x manage.py

EXPOSE 8000

# Default command (can be overridden in docker-compose)
# For production, use: gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 4
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
