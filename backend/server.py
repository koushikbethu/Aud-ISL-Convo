# Audio to ISL Backend API Server
# FastAPI-based REST API for converting text to Indian Sign Language visuals

import os
import string
from typing import Literal, Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="Audio to ISL API",
    description="REST API for converting text/speech to Indian Sign Language visuals",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Static file directories
GIFS_DIR = os.path.join(os.path.dirname(__file__), "ISL_Gifs")
LETTERS_DIR = os.path.join(os.path.dirname(__file__), "letters")

# Mount static files for serving GIFs and letter images
if os.path.exists(GIFS_DIR):
    app.mount("/static/gifs", StaticFiles(directory=GIFS_DIR), name="gifs")
if os.path.exists(LETTERS_DIR):
    app.mount("/static/letters", StaticFiles(directory=LETTERS_DIR), name="letters")

# ISL phrases that have corresponding GIF files
ISL_PHRASES = [
    'any questions', 'are you angry', 'are you busy', 'are you hungry', 'are you sick', 'be careful',
    'can we meet tomorrow', 'did you book tickets', 'did you finish homework', 'do you go to office', 
    'do you have money', 'do you want something to drink', 'do you want tea or coffee', 'do you watch TV', 
    'dont worry', 'flower is beautiful', 'good afternoon', 'good evening', 'good morning', 'good night', 
    'good question', 'had your lunch', 'happy journey', 'hello what is your name', 
    'how many people are there in your family', 'i am a clerk', 'i am bore doing nothing', 
    'i am fine', 'i am sorry', 'i am thinking', 'i am tired', 'i dont understand anything', 
    'i go to a theatre', 'i love to shop', 'i had to say something but i forgot', 'i have headache', 
    'i like pink colour', 'i live in nagpur', 'lets go for lunch', 'my mother is a homemaker',
    'my name is john', 'nice to meet you', 'no smoking please', 'open the door', 'please call me later',
    'please clean the room', 'please give me your pen', 'please use dustbin dont throw garbage', 
    'please wait for sometime', 'shall I help you', 'shall we go together tommorow', 
    'sign language interpreter', 'sit down', 'stand up', 'take care', 'there was traffic jam', 
    'wait I am thinking', 'what are you doing', 'what is the problem', 'what is todays date', 
    'what is your father do', 'what is your job', 'what is your mobile number', 'what is your name', 
    'whats up', 'when is your interview', 'when we will go', 'where do you stay',
    'where is the bathroom', 'where is the police station', 'you are wrong',
    # Single words with GIFs
    'address', 'agra', 'ahemdabad', 'all', 'april', 'assam', 'august', 'australia', 
    'badoda', 'banana', 'banaras', 'banglore', 'bihar', 'bridge', 'cat', 'chandigarh', 
    'chennai', 'christmas', 'church', 'clinic', 'coconut', 'crocodile', 'dasara', 'deaf', 
    'december', 'deer', 'delhi', 'dollar', 'duck', 'febuary', 'friday', 'fruits', 'glass', 
    'grapes', 'gujrat', 'hello', 'hindu', 'hyderabad', 'india', 'january', 'jesus', 'job', 
    'july', 'june', 'karnataka', 'kerala', 'krishna', 'litre', 'mango', 'may', 'mile', 'monday', 
    'mumbai', 'museum', 'muslim', 'nagpur', 'october', 'orange', 'pakistan', 'pass', 
    'police station', 'post office', 'pune', 'punjab', 'rajasthan', 'ram', 'restaurant', 
    'saturday', 'september', 'shop', 'sleep', 'southafrica', 'story', 'sunday', 
    'tamil nadu', 'temperature', 'temple', 'thank', 'thursday', 'toilet', 'tomato', 'town', 
    'tuesday', 'usa', 'village', 'voice', 'wednesday', 'weight', 'welcome', 'hi', 'yourself'
]

# Available letter images (a-z)
AVAILABLE_LETTERS = list('abcdefghijklmnopqrstuvwxyz')

# ============ Request/Response Models ============

class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=500, description="Text to convert to ISL")

class GifResponse(BaseModel):
    type: Literal["gif"] = "gif"
    src: str = Field(..., description="URL path to the GIF file")
    alt: str = Field(..., description="Alternative text for the GIF")

class SequenceResponse(BaseModel):
    type: Literal["sequence"] = "sequence"
    data: list[str] = Field(..., description="List of image URLs for each letter")
    original_text: str = Field(..., description="The original processed text")

class HealthResponse(BaseModel):
    status: str
    version: str
    phrases_count: int
    letters_count: int

class PhrasesResponse(BaseModel):
    phrases: list[str]
    count: int

# ============ API Endpoints ============

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Audio to ISL API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        phrases_count=len(ISL_PHRASES),
        letters_count=len(AVAILABLE_LETTERS)
    )

@app.get("/api/phrases", response_model=PhrasesResponse, tags=["ISL Data"])
async def get_available_phrases():
    """Get list of all available ISL phrases that have GIF mappings"""
    return PhrasesResponse(
        phrases=sorted(ISL_PHRASES),
        count=len(ISL_PHRASES)
    )

@app.post("/process", response_model=Union[GifResponse, SequenceResponse], tags=["ISL Conversion"])
async def process_text(input_data: TextInput):
    """
    Convert text to ISL visual representation.
    
    - If text matches a known phrase/word, returns a GIF path
    - Otherwise, returns a sequence of letter images to spell it out
    """
    # Normalize text: lowercase and remove punctuation
    text = input_data.text.lower().strip()
    text = ''.join([c for c in text if c not in string.punctuation])
    
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty after processing")
    
    # Check if it's a known phrase with a GIF
    if text in ISL_PHRASES:
        return GifResponse(
            type="gif",
            src=f"/static/gifs/{text}.gif",
            alt=text
        )
    
    # Spell it out using letter images
    images = []
    for char in text:
        if char in AVAILABLE_LETTERS:
            images.append(f"/static/letters/{char}.jpg")
        # Skip spaces and unknown characters
    
    if not images:
        raise HTTPException(
            status_code=400, 
            detail="No valid characters found to convert"
        )
    
    return SequenceResponse(
        type="sequence",
        data=images,
        original_text=text
    )

@app.post("/api/convert", response_model=Union[GifResponse, SequenceResponse], tags=["ISL Conversion"])
async def convert_text(input_data: TextInput):
    """
    Alias for /process endpoint.
    Convert text to ISL visual representation.
    """
    return await process_text(input_data)

# ============ Run Server ============

if __name__ == "__main__":
    import uvicorn
    print(f"Starting Audio to ISL API server on {HOST}:{PORT}")
    print(f"API Documentation available at http://{HOST}:{PORT}/docs")
    uvicorn.run(app, host=HOST, port=PORT)
