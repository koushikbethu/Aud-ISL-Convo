# 🎧 Audio to Indian Sign Language (ISL) Converter 🤟

Audio-to-ISL Converter is an accessibility-focused application that converts **spoken audio into Indian Sign Language (ISL)** visual representations such as GIFs or animations.  
The project aims to reduce the communication gap between hearing and hearing-impaired individuals by translating speech into understandable ISL visuals.

---

## 📌 Project Objective

- Convert **audio (speech)** into **text**
- Process text using **NLP techniques**
- Translate processed text into **Indian Sign Language gestures**
- Display ISL gestures as **visual animations (GIFs/images)**

This project is useful for:
- Accessibility tools
- Education platforms
- Public information systems
- Assistive AI applications

---

## 🧠 Audio → ISL Conversion Pipeline
Audio Input (Microphone / Audio File)
↓
Speech-to-Text Engine
↓
Raw Text
↓
NLP Text Processing
(cleaning, tokenization, simplification)
↓
ISL Mapping Engine
↓
ISL Gesture Selection
↓
GIF / Visual Animation Output


---

## 🔍 Pipeline Explanation

### 1️⃣ Audio Input
- Accepts live microphone input or uploaded audio files.

### 2️⃣ Speech-to-Text
- Converts audio into text using a speech recognition model  
  (e.g., Google Speech API, Whisper, Web Speech API).

### 3️⃣ Text Processing (NLP)
- Removes unnecessary stopwords
- Simplifies grammar
- Tokenizes words
- Adapts sentence structure closer to ISL format

### 4️⃣ ISL Mapping
- Each processed word is mapped to its corresponding ISL gesture
- Uses a dataset of ISL images or GIFs

### 5️⃣ Visual Output
- ISL gestures are displayed sequentially
- Acts as a visual translation of spoken speech

---

## 🚀 Features

- 🎙️ Audio input (live or file-based)
- 🧠 NLP-based text processing
- 🤟 Indian Sign Language gesture mapping
- 🎞️ GIF / visual-based sign rendering
- 🌐 Web-based frontend
- ♿ Accessibility-oriented design

---

## 📁 Project Structure

Audio-To-ISL-Convo/
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ ├── public/
│ └── package.json
│
├── server.py # Backend (speech, NLP, ISL mapping)
├── isl_assets/ # ISL GIFs / images
├── .gitignore
├── README.md
└── requirements.txt




