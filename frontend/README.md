# Audio to ISL - Frontend

Modern React + Vite + Tailwind CSS frontend for the Audio to Indian Sign Language converter.

## Features

- 🎙️ **Voice Input** - Speak directly using browser speech recognition
- ⌨️ **Text Input** - Type text to convert
- 🎞️ **ISL Animations** - View sign language GIFs for known phrases
- 🔤 **Letter Spelling** - See individual letter signs for unknown words
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔗 **API Health Check** - Real-time backend connection status

## Quick Start

### Prerequisites

- Node.js 18+ 
- Backend server running (see `../backend/`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment config (optional - uses defaults)
copy env.example .env

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles (Tailwind)
│   ├── services/
│   │   └── api.js           # API service layer
│   └── hooks/
│       └── useSpeechRecognition.js  # Speech recognition hook
├── public/                   # Static assets
├── vite.config.js           # Vite configuration with API proxy
├── tailwind.config.js       # Tailwind CSS configuration
└── env.example              # Environment variables template
```

## API Integration

The frontend communicates with the backend through these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check API health status |
| `POST` | `/process` | Convert text to ISL |
| `GET` | `/api/phrases` | Get available phrases |

### API Service

All API calls go through `src/services/api.js`:

```javascript
import { convertTextToISL, checkHealth, buildStaticUrl } from './services/api';

// Convert text
const result = await convertTextToISL("hello");

// Build static URL for images/GIFs
const imageUrl = buildStaticUrl(result.src);
```

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Browser Support

- Chrome/Edge (full support including speech recognition)
- Firefox (text input only - no Web Speech API)
- Safari (partial speech recognition support)
