#!/bin/bash
echo "Starting ISL Backend Server..."
echo "PORT: ${PORT:-8000}"
exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}

