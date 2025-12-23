# Audio to ISL - Backend API

FastAPI-based REST API server for the Audio to Indian Sign Language converter.

## Features

- 🚀 **FastAPI** - High-performance async API framework
- 📚 **OpenAPI Docs** - Auto-generated API documentation
- 🔗 **CORS Support** - Cross-origin requests enabled
- 🖼️ **Static Files** - Serves ISL GIFs and letter images
- ❤️ **Health Check** - Monitoring endpoint

## Quick Start

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config (optional - uses defaults)
copy env.example .env

# Run the server
python server.py
```

Or using uvicorn directly:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

API will run at: **http://localhost:8000**

### API Documentation

- Swagger UI: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS allowed origins (comma-separated) |

## API Endpoints

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information |
| `GET` | `/health` | Health check for monitoring |
| `GET` | `/docs` | Swagger API documentation |

### ISL Conversion

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/process` | Convert text to ISL visual |
| `POST` | `/api/convert` | Alias for /process |
| `GET` | `/api/phrases` | Get all available ISL phrases |

### Static Files

| Path | Description |
|------|-------------|
| `/static/gifs/{phrase}.gif` | ISL phrase GIFs |
| `/static/letters/{letter}.jpg` | Letter sign images (a-z) |

## Request/Response Examples

### Convert Text

**Request:**
```bash
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{"text": "hello"}'
```

**Response (known phrase):**
```json
{
  "type": "gif",
  "src": "/static/gifs/hello.gif",
  "alt": "hello"
}
```

**Response (unknown - spelled out):**
```json
{
  "type": "sequence",
  "data": [
    "/static/letters/h.jpg",
    "/static/letters/i.jpg"
  ],
  "original_text": "hi there"
}
```

### Health Check

```bash
curl http://localhost:8000/health
```

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "phrases_count": 150,
  "letters_count": 26
}
```

## Project Structure

```
backend/
├── server.py            # FastAPI application
├── main.py              # Legacy standalone Tkinter version
├── voice to text.py     # Standalone speech recognition test
├── requirements.txt     # Python dependencies
├── env.example          # Environment variables template
├── ISL_Gifs/            # ISL phrase GIF files
│   ├── hello.gif
│   ├── good morning.gif
│   └── ...
└── letters/             # Individual letter images
    ├── a.jpg
    ├── b.jpg
    └── ...
```

## Production Deployment

For production, use gunicorn with uvicorn workers:

```bash
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

