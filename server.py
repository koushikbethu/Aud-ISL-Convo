from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import string
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
# We assume the server.py is in the root directory, same as main.py
# Verify directories exist before mounting to avoid errors on startup logic if desired, 
# but FastAPI handles 404s for missing files well enough.
app.mount("/static/gifs", StaticFiles(directory="ISL_Gifs"), name="gifs")
app.mount("/static/letters", StaticFiles(directory="letters"), name="letters")

# Data from main.py
isl_gif = ['any questions', 'are you angry', 'are you busy', 'are you hungry', 'are you sick', 'be careful',
           'can we meet tomorrow', 'did you book tickets', 'did you finish homework', 'do you go to office', 'do you have money',
           'do you want something to drink', 'do you want tea or coffee', 'do you watch TV', 'dont worry', 'flower is beautiful',
           'good afternoon', 'good evening', 'good morning', 'good night', 'good question', 'had your lunch', 'happy journey',
           'hello what is your name', 'how many people are there in your family', 'i am a clerk', 'i am bore doing nothing', 
           'i am fine', 'i am sorry', 'i am thinking', 'i am tired', 'i dont understand anything', 'i go to a theatre', 'i love to shop',
           'i had to say something but i forgot', 'i have headache', 'i like pink colour', 'i live in nagpur', 'lets go for lunch', 'my mother is a homemaker',
           'my name is john', 'nice to meet you', 'no smoking please', 'open the door', 'please call me later',
           'please clean the room', 'please give me your pen', 'please use dustbin dont throw garbage', 'please wait for sometime', 'shall I help you',
           'shall we go together tommorow', 'sign language interpreter', 'sit down', 'stand up', 'take care', 'there was traffic jam', 'wait I am thinking',
           'what are you doing', 'what is the problem', 'what is todays date', 'what is your father do', 'what is your job',
           'what is your mobile number', 'what is your name', 'whats up', 'when is your interview', 'when we will go', 'where do you stay',
           'where is the bathroom', 'where is the police station', 'you are wrong','address','agra','ahemdabad', 'all', 'april', 'assam', 'august', 'australia', 
           'badoda', 'banana', 'banaras', 'banglore', 'bihar','bridge','cat', 'chandigarh', 'chennai', 'christmas', 'church', 'clinic', 'coconut', 
           'crocodile','dasara','deaf', 'december', 'deer', 'delhi', 'dollar', 'duck', 'febuary', 'friday', 'fruits', 'glass', 'grapes', 'gujrat', 
           'hello', 'hindu', 'hyderabad', 'india', 'january', 'jesus', 'job', 'july', 'karnataka', 'kerala', 'krishna', 'litre', 'mango', 'may', 
           'mile', 'monday', 'mumbai', 'museum', 'muslim', 'nagpur', 'october', 'orange', 'pakistan', 'pass', 'police station', 'post office', 
           'pune', 'punjab', 'rajasthan', 'ram', 'restaurant', 'saturday', 'september', 'shop', 'sleep', 'southafrica', 'story', 'sunday', 
           'tamil nadu', 'temperature', 'temple', 'thursday', 'toilet', 'tomato', 'town', 'tuesday', 'usa', 'village', 'voice', 'wednesday', 'weight']

# The array for individual characters available in 'letters' directory
arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

class TextInput(BaseModel):
    text: str

@app.post("/process")
async def process_text(input_data: TextInput):
    text = input_data.text.lower()
    # Remove punctuation
    text = ''.join([c for c in text if c not in string.punctuation])

    if text in isl_gif:
        # It's a known phrase/word that has a GIF
        return {
            "type": "gif",
            "src": f"/static/gifs/{text}.gif",
            "alt": text
        }
    else:
        # Spell it out
        # Filter characters to only those we have images for
        images = []
        for char in text:
            if char in arr:
                images.append(f"/static/letters/{char}.jpg")
        return {
            "type": "sequence",
            "data": images,
            "original_text": text
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
