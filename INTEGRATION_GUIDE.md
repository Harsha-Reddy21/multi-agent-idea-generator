# Backend-Frontend Integration Guide

This guide explains how to set up and run the complete application with the FastAPI backend and React frontend.

## Architecture Overview

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │ ◄─────────────────────────────► │                 │
│  React Frontend │                                │  FastAPI Backend│
│  (Port 5173)    │                                │  (Port 8000)    │
│                 │                                │                 │
└─────────────────┘                                └─────────────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────────┐
                                                    │   OpenAI API    │
                                                    │  (or Mock)      │
                                                    └─────────────────┘
```

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **OpenAI API Key** (optional - will use mock responses if not provided)

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```
   
   **Note**: If you don't have an OpenAI API key, the backend will use mock responses for development.

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   The API will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if your backend is running on a different port:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Running Both Services

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using npm scripts (if configured)

You can create a `package.json` script in the root to run both:

```json
{
  "scripts": {
    "dev:backend": "cd backend && uvicorn main:app --reload",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

## API Endpoints

### POST `/api/chat`

Chat endpoint that provides document-aware responses.

**Request:**
```json
{
  "message": "How can I improve my product description?",
  "document_content": "<h2>Product Name</h2><p>Description...</p>",
  "chat_history": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2026-02-06T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Here are some suggestions to improve...",
  "confidence_score": 85
}
```

## How It Works

1. **User types in TextEditor** → Content is tracked in `App.tsx` state
2. **User sends message in AIAgent** → Frontend calls `/api/chat` with:
   - Current message
   - Document content from TextEditor
   - Chat history (previous messages)
3. **Backend processes request** → 
   - Builds context-aware prompt with document content
   - Includes chat history for conversation continuity
   - Calls LLM (OpenAI or mock)
   - Calculates confidence score
4. **Backend returns response** → Frontend displays in chat interface

## Features

### Document-Aware Chat
- AI responses are contextualized based on the current document content
- The AI can reference specific sections and provide relevant suggestions

### Chat History
- Conversation context is maintained across messages
- Last 5 messages are included in the prompt for continuity

### Confidence Score
- Calculated based on:
  - Document content length and structure
  - Response quality
  - User message specificity
- Affects ability to submit for review (requires 80%+)

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

**OpenAI API errors:**
- Check your API key is correct
- Verify you have API credits
- Backend will fallback to mock responses if API fails

**CORS errors:**
- Ensure frontend URL is in `allow_origins` in `main.py`
- Check that backend is running

### Frontend Issues

**API connection errors:**
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

**Chat not working:**
- Check browser console for errors
- Verify API endpoint is accessible: `http://localhost:8000/health`
- Ensure document content is being passed (check Network tab)

### Common Issues

1. **"Failed to fetch" error**
   - Backend not running
   - Wrong API URL in frontend
   - CORS configuration issue

2. **Mock responses instead of real AI**
   - `OPENAI_API_KEY` not set in backend `.env`
   - API key invalid or expired

3. **Confidence score not updating**
   - Check backend logs for errors
   - Verify `confidence_score` is returned in API response

## Development Tips

1. **Use API Docs**: Visit `http://localhost:8000/docs` to test endpoints
2. **Check Logs**: Backend logs show request/response details
3. **Browser DevTools**: Use Network tab to inspect API calls
4. **Mock Mode**: Use without API key for development/testing

## Production Deployment

### Backend
- Use production ASGI server: `gunicorn` with `uvicorn` workers
- Set proper CORS origins
- Use environment variables for secrets
- Enable HTTPS

### Frontend
- Build: `npm run build`
- Serve static files from `dist/` directory
- Set `VITE_API_URL` to production backend URL

## Next Steps

- Add authentication/authorization
- Implement rate limiting
- Add streaming responses
- Add file upload support for documents
- Implement conversation persistence
- Add analytics and monitoring
