#!/bin/bash

# Production server startup script
echo "Starting production server on local machine..."

# Activate virtual environment
source pesticide_venv/bin/activate

# Navigate to project directory
cd pesticide_project

# Run with production settings
echo "Running Django server with production settings..."
python manage.py runserver 0.0.0.0:80 --settings=config.settings.production

# Note: For production, use gunicorn instead:
# gunicorn config.wsgi:application --bind 0.0.0.0:80 --workers 4