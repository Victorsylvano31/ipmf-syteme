FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and keep stdout unbuffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for psycopg2 and other packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        python3-dev \
        libjpeg-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY ipmf/requirements.txt requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the Django project
COPY ipmf/ .

# Apply migrations and collect static files
# Note: In production, migrations are usually run during deployment, not build time,
# but can be added in an entrypoint script or handled by git actions.

EXPOSE 8000

# Start server using gunicorn
CMD ["gunicorn", "ipmf.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
