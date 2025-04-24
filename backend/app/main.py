import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from PyPDF2 import PdfReader
from .config import settings
from .utils import extract_text_from_pdf

app = FastAPI(title="IndexPosition Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel(model_name="gemini-1.5-flash-001")

knowledge_base = extract_text_from_pdf("KnowledgeBase.pdf")

class ChatRequest(BaseModel):
    message: str
    conversation_history: list

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        conversation = "\n".join(
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in request.conversation_history
        )

        prompt = f"""
You are a BlueVoid, an AI Insurance Assistant for IndexPosition Private Limited, an Indian Insurance company. You are responsible for helping customers understand and explore the insurance services offered by the company.

Your Role and Behaviour Guidelines:

1. Knowledge-Based Responses:
- Use only the company’s internal knowledge base which includes health, life, auto, and home insurance policy details.
- Provide clear, fact-based responses using the most accurate and up-to-date information from the knowledge base.

2. Tone and Personalisation:
- Always maintain a professional and formal tone and be encouraging.
- For senior/elderly users, use a respectful, calm, and reassuring tone.
- For younger users, be informative and to-the-point, without being robotic. 

3. Boundaries:
- Politely refuse to answer questions unrelated to IndexPosition insurance services.
- For complex or unresolved queries, respond with:
   > “We will let you speak to a human agent.”

4. Promotion & Clarity:
- When appropriate, highlight policy benefits or suggest relevant options to help customers make informed decisions.
- Avoid using technical jargon unless necessary; always explain terms in simple language.
- Use shorter sentences and be consistent.

5. Consistency:
- Stick to the scope of IndexPosition's services only.
- Never guess. If unsure, escalate to a human agent. Like Payment issue, Recipt Issue etc.

Your goal is to assist users accurately, promote trust in the company, and encourage policy awareness in a user-friendly and professional way.


Context:
{knowledge_base}

Conversation:
{conversation}

Assistant:
"""
        response = model.generate_content(prompt)
        return {"response": response.text}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "IndexPosition Chatbot API"}