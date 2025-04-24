# PolicyBot - AI-Powered Insurance Policy Information Chatbot

## Project Overview

**PolicyBot** is an AI-powered chatbot designed to assist customers with queries related to insurance policies. This project was developed for the **TCS BFSI Garaje Unit Hackathon** (Problem Statement #3: AI-Powered Insurance Policy Information Chatbot).

The chatbot helps customers understand different types of insurance policies (health, life, auto, and home insurance), coverage options, premiums, and claim processes through natural language interactions.

## Key Features

- **Natural Language Understanding**: Powered by Google's Gemini 1.5 Flash LLM, as Google provides free api.
- **Comprehensive Knowledge Base**: Integrated with detailed insurance policy information
- **User-Friendly Interface**: Clean, responsive web interface with quick-action buttons. This can be easily implemented in a website through an iframe or just a simple div.
- **Human Agent Escalation**: The LLM model can understand when a human is required and also gives a notification when a Human joins.
- **Contextual Conversations**: Maintains conversation history for coherent interactions, so that customers don't have to mention everything from the beginning.

## Technology Stack

### Frontend
- **HTML5**, **CSS3**, **JavaScript**

### Backend
- **FastAPI** (Python) web framework
- **Google Gemini 1.5 Flash** LLM for natural language processing
- **PyPDF2** for knowledge base extraction
- RESTful API architecture

### Deployment
- Backend hosted on Render
- Frontend can be deployed on any GitHub Pages.

## Methodology

1. **Knowledge Base Integration**:
   - Created a custom knowledge base with dummy insurance policy data
   - Extracted and processed PDF content using PyPDF2
   - Structured the data for optimal LLM comprehension

2. **Conversation Management**:
   - Implemented context-aware prompts for Gemini
   - Maintained conversation history for coherent dialogues
   - Added fallback mechanism to human agents

3. **User Experience**:
   - Designed intuitive UI with quick-action buttons
   - Implemented typing indicators and smooth animations
   - Added help system with example questions

## How to Use

1. **Access the Chatbot**:
   - Open the web interface in any browser

2. **Ask Questions**:
   - Type your insurance-related question in the input field
   - Or use quick-action buttons for common queries

3. **Get Help**:
   - Click the help button (?) for guidance and example questions

## Setup Instructions

### Prerequisites
- Python 3.10+
- Google Gemini API key

### Backend Setup
```bash
# Clone the repository
git clone [repository-url]

# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_api_key_here

# Run the server
uvicorn main:app --reload
