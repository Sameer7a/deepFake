from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv
import time

load_dotenv()

app = FastAPI(
    title="RAKSHA MVP API",
    description="Backend API for deepfake and extortion detection MVP.",
    version="1.0.0"
)

# Configure CORS for local development with Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "RAKSHA Backend is running."}

class ExtortionAnalysis(BaseModel):
    extortion_score: int
    reasoning: str

@app.post("/api/analyze")
async def analyze_content(
    image: UploadFile = File(None),
    text_message: str = Form("")
):
    """
    Endpoint that uses Gemini API to analyze the threat level of a message.
    """
    deepfake_score = 0
    extortion_score = 0
    reasoning = "No threat detected."
    
    # 1. Image processing (Mocked for now, to be implemented later)
    if image and image.filename:
        # Simulate a high deepfake probability for demo purposes if image is present
        deepfake_score = 92
        
    # 2. Text processing using Gemini API
    if text_message:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_api_key_here":
            # Fallback to mock logic if API key isn't provided
            lower_text = text_message.lower()
            if "pay" in lower_text or "leak" in lower_text or "bitcoin" in lower_text:
                extortion_score = 98
                reasoning = "Message contains obvious extortion keywords (Mock Logic)."
            elif "please" in lower_text:
                extortion_score = 10
            else:
                extortion_score = 50
        else:
            try:
                # Use Gemini 2.5 to analyze the text for extortion tactics
                client = genai.Client(api_key=api_key)
                
                prompt = f"""
                You are a cybercrime forensic analyst. Your job is to analyze incoming messages for deepfake sextortion or blackmail attempts.
                Analyze this message and determine the probability (0 to 100) that it is an extortion attempt.
                Provide a 1-sentence reasoning for your score. 
                
                Message: "{text_message}"
                """
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': ExtortionAnalysis,
                    },
                )
                
                # Parse the JSON response
                # Since we used response_schema, we can parse the text directly into our pydantic model
                analysis = ExtortionAnalysis.model_validate_json(response.text)
                extortion_score = analysis.extortion_score
                reasoning = analysis.reasoning
                
            except Exception as e:
                print(f"Gemini API Error: {e}")
                extortion_score = 85 # Fallback high score on error if there's text
                reasoning = "Failed to reach AI provider, flagged for caution."
            
    # Calculate composite risk score
    base_score = (deepfake_score * 0.6) + (extortion_score * 0.4)
    if extortion_score > 80 and deepfake_score > 50:
        risk_score = min(100, base_score * 1.2)
    else:
        risk_score = base_score
        
    return {
        "deepfake_score": deepfake_score,
        "extortion_score": extortion_score,
        "risk_score": round(risk_score, 1),
        "reasoning": reasoning,
        "message": "Analysis complete."
    }
