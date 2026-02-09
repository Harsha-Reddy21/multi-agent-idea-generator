# Smart Product Profile - Backend API

FastAPI backend for document-aware chat functionality.

## Features

- Document-aware chat responses
- Chat history management
- Confidence score calculation
- OpenAI integration (with fallback to mock responses)
- CORS enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Note**: If you don't have an OpenAI API key, the service will use mock responses for development.

### 3. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use Python directly
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "message": "API is operational"
}
```

### Chat Endpoint

```bash
POST /api/chat
```

Request Body:
```json
{
  "message": "How can I improve my product description?",
  "document_content": "<h2>Product Name</h2><p>Product description...</p>",
  "chat_history": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2026-02-06T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Previous response",
      "timestamp": "2026-02-06T10:00:01Z"
    }
  ]
}
```

Response:
```json
{
  "response": "Here are some suggestions...",
  "confidence_score": 85
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Project Structure

```
backend/
├── main.py                 # FastAPI application
├── services/
│   ├── chat_service.py    # Chat logic with document context
│   └── llm_service.py     # LLM integration
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

### Adding New Features

1. Add new endpoints in `main.py`
2. Extend services in `services/` directory
3. Update request/response models as needed

## Testing

Test the API with curl:

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "document_content": "Sample document content"
  }'
```

## Troubleshooting

### CORS Errors
- Ensure frontend URL is in `CORS_ORIGINS` in `main.py`
- Check that backend is running on correct port

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Service will fallback to mock responses if API fails

### Port Already in Use
- Change port in `main.py` or use: `uvicorn main:app --port 8001`
