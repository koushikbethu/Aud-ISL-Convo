# Audio to ISL Backend - Docker Image
# FastAPI-based REST API for converting text to Indian Sign Language visuals

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000

# Set working directory
WORKDIR /app

# Copy Docker-specific requirements (excludes PyAudio and other desktop dependencies)
COPY requirements-docker.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-docker.txt

# Copy application code
COPY server.py .
COPY main.py .

# Copy static assets (ISL GIFs and letter images)
COPY ISL_Gifs/ ./ISL_Gifs/
COPY letters/ ./letters/

# Expose the API port
EXPOSE 8000

# Run using Python (avoids shell script line ending issues)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port $PORT"]

