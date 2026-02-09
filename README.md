# Smart Product Profile - Full Stack Application

A modern React + FastAPI application for creating and managing product profiles with an integrated AI assistant that provides document-aware chat functionality.

## 🚀 Features

- **Rich Text Editor**: Full-featured TipTap editor with formatting, lists, links, and images
- **AI Chat Assistant**: Document-aware chat that understands your product content
- **Chat History**: Maintains conversation context across messages
- **Confidence Scoring**: Dynamic confidence score based on document quality
- **Responsive Layout**: Expandable/collapsible panels for optimal workspace
- **Real-time Updates**: Document changes are immediately available to the AI

## 📁 Project Structure

```
Docs-Agent/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── services/           # Business logic
│   │   ├── chat_service.py    # Chat handling
│   │   └── llm_service.py      # LLM integration
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── ...
│   ├── package.json       # Node dependencies
│   └── README.md          # Frontend documentation
│
└── INTEGRATION_GUIDE.md   # Setup and integration guide
```

## 🏃 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **OpenAI API Key** (optional - uses mock responses if not provided)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (optional)

# Start server
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env
# Edit .env if backend is on different port

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📖 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete setup and integration instructions
- **[Backend README](./backend/README.md)** - Backend API documentation
- **[Frontend README](./frontend/README.md)** - Frontend features and usage

## 🔧 How It Works

1. **User edits document** in the TextEditor component
2. **Document content** is tracked in App state
3. **User sends message** in AIAgent chat interface
4. **Frontend calls backend** `/api/chat` endpoint with:
   - Current message
   - Document content (HTML)
   - Chat history (previous messages)
5. **Backend processes** request:
   - Builds context-aware prompt with document content
   - Includes chat history for conversation continuity
   - Calls LLM (OpenAI or mock)
   - Calculates confidence score
6. **Response displayed** in chat interface

## 🎯 Key Components

### Backend (`backend/`)

- **FastAPI** - Modern Python web framework
- **OpenAI Integration** - LLM API integration with fallback
- **Document-Aware Chat** - Context-aware responses
- **Confidence Scoring** - Dynamic score calculation

### Frontend (`frontend/`)

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TipTap** - Rich text editor
- **Vite** - Build tool

## 🔌 API Endpoints

### `POST /api/chat`

Chat endpoint for document-aware responses.

**Request:**
```json
{
  "message": "How can I improve my product description?",
  "document_content": "<h2>Product</h2><p>Description...</p>",
  "chat_history": [...]
}
```

**Response:**
```json
{
  "response": "Here are some suggestions...",
  "confidence_score": 85
}
```

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Testing

**Backend:**
- Visit `http://localhost:8000/docs` for interactive API testing
- Use Swagger UI to test endpoints

**Frontend:**
- Check browser console for errors
- Use Network tab to inspect API calls

## 🐛 Troubleshooting

### Backend Issues

- **Port in use**: Change port in `uvicorn` command
- **OpenAI errors**: Check API key in `.env`
- **CORS errors**: Verify frontend URL in `main.py`

### Frontend Issues

- **API connection**: Check `VITE_API_URL` in `.env`
- **CORS errors**: Ensure backend CORS allows frontend origin
- **Chat not working**: Check browser console and Network tab

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed troubleshooting.

## 📝 Environment Variables

### Backend (`.env`)

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8000
```

## 🚢 Production Deployment

### Backend

- Use production ASGI server (gunicorn + uvicorn)
- Set proper CORS origins
- Use environment variables for secrets
- Enable HTTPS

### Frontend

```bash
npm run build
# Serve dist/ directory
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- Review backend/frontend README files
- Check API documentation at `/docs` endpoint

---

**Built with ❤️ using React, FastAPI, and OpenAI**
