# AI Integration Guide

This guide explains how to replace the dummy AI responses with real API calls.

## Current Setup

The AI Agent currently uses **dummy responses** that are triggered by keywords in user input. These dummy responses make the app fully functional without requiring an API.

### Location of Dummy Responses
- **File**: `src/components/AIAgent.tsx`
- **Function**: `generateDummyResponse(userMessage: string)`

### How Dummy Responses Work

```typescript
const generateDummyResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  const dummyResponses = {
    'improve': '...',      // Triggered if message contains "improve"
    'feature': '...',      // Triggered if message contains "feature"
    'tone': '...',         // Triggered if message contains "tone"
    'grammar': '...',      // Triggered if message contains "grammar"
    'default': '...'       // Default response for unknown queries
  };

  // Matches keyword in user input
  for (const [keyword, response] of Object.entries(dummyResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  return dummyResponses.default;
};
```

## Keywords That Trigger Responses

| Keyword | Example Message | Response Type |
|---------|-----------------|---------------|
| `improve` | "How can I improve this?" | Improvement suggestions |
| `feature` | "What features should I add?" | Feature guidelines |
| `tone` | "Should I change the tone?" | Tone recommendations |
| `grammar` | "Is my grammar correct?" | Grammar tips |
| `default` | Anything else | General feedback |

## How to Replace with Real API

### Step 1: Create an API Service Function

Create a new file `src/services/aiService.ts`:

```typescript
// src/services/aiService.ts

interface AIRequest {
  message: string;
  documentContent?: string;
}

interface AIResponse {
  response: string;
  confidenceScore: number;
}

/**
 * Call the AI backend API
 * Replace this with your actual API endpoint
 */
export const callAIAPI = async (request: AIRequest): Promise<AIResponse> => {
  try {
    const apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001/api/ai';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: request.message,
        documentContent: request.documentContent,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};
```

### Step 2: Update AIAgent Component

Replace the `handleSendMessage` function:

```typescript
const handleSendMessage = async () => {
  if (inputValue.trim()) {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    const userInput = inputValue;
    setInputValue('');

    try {
      // Call the real API instead of dummy function
      const aiResponse = await callAIAPI({
        message: userInput,
        // documentContent: content // Optional: pass editor content for context
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update confidence score if provided by API
      if (aiResponse.confidenceScore) {
        setConfidenceScore(aiResponse.confidenceScore);
      }
    } catch (error) {
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error:', error);
    }
  }
};
```

### Step 3: Add Confidence Score State

Update the AIAgent component to manage confidence score:

```typescript
const [confidenceScore, setConfidenceScore] = useState(80);

// Use it in the JSX:
<div className="score-number">{confidenceScore}%</div>
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_AI_API_URL=https://your-api.com/api/ai
VITE_API_KEY=your-api-key-here
```

Or for development:

```
VITE_AI_API_URL=http://localhost:3001/api/ai
```

### Step 5: Import the Service

Add to `src/components/AIAgent.tsx`:

```typescript
import { callAIAPI } from '../services/aiService';
```

## Expected API Response Format

Your backend API should return responses in this format:

```json
{
  "response": "Here are my suggestions for improving your product description...",
  "confidenceScore": 85
}
```

## Backend API Example (Node.js/Express)

Here's a simple example of what your backend might look like:

```typescript
// backend/routes/ai.ts
import express from 'express';

interface AIRequest {
  message: string;
  documentContent?: string;
  timestamp?: string;
}

router.post('/api/ai', async (req: express.Request, res: express.Response) => {
  try {
    const { message, documentContent } = req.body as AIRequest;

    // Call your actual AI service (OpenAI, Anthropic, etc.)
    const aiResponse = await callActualAIService(message, documentContent);

    res.json({
      response: aiResponse.text,
      confidenceScore: aiResponse.confidence || 80
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});
```

## Migration Steps

### Phase 1: Keep Dummy Responses (Current)
- ✅ Use `generateDummyResponse()` for testing
- ✅ No API required
- ✅ Great for demo and development

### Phase 2: Add API Service
- [ ] Create `src/services/aiService.ts`
- [ ] Define API request/response types
- [ ] Add environment variables

### Phase 3: Update Component
- [ ] Import AI service
- [ ] Replace dummy function with API call
- [ ] Add error handling
- [ ] Add loading state (optional)

### Phase 4: Test Integration
- [ ] Start your backend API
- [ ] Test real responses
- [ ] Monitor confidence scores
- [ ] Handle edge cases

## Adding Loading State (Optional)

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSendMessage = async () => {
  if (inputValue.trim()) {
    // ... add message to chat
    setIsLoading(true);

    try {
      const aiResponse = await callAIAPI({ message: userInput });
      // ... add response to chat
    } finally {
      setIsLoading(false);
    }
  }
};

// In JSX:
<button 
  className="send-btn" 
  onClick={handleSendMessage}
  disabled={!inputValue.trim() || isLoading}
>
  {isLoading ? '⏳' : '↑'}
</button>
```

## Adding Streaming Responses (Optional)

For streaming responses from your API:

```typescript
const handleSendMessage = async () => {
  // ... add user message
  setIsLoading(true);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ message: userInput })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    // Create empty assistant message
    const messageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    // Stream response chunks
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullResponse += chunk;

      // Update message content as it streams
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: fullResponse }
            : msg
        )
      );
    }
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Without Real API

While developing, keep the dummy responses:

```typescript
// Temporarily use dummy if API is unavailable
const handleSendMessage = async () => {
  try {
    const response = await callAIAPI({ message: userInput });
    // ... use real response
  } catch (error) {
    // Fallback to dummy response
    const dummyResponse = generateDummyResponse(userInput);
    // ... use dummy response
  }
};
```

## Troubleshooting API Integration

### CORS Errors
```typescript
// Add to your backend headers:
res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type');
```

### Timeout Issues
```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Request timeout')), 30000)
);

const response = await Promise.race([
  callAIAPI(request),
  timeoutPromise
]);
```

### Rate Limiting
```typescript
const [lastRequestTime, setLastRequestTime] = useState(0);

const handleSendMessage = async () => {
  const now = Date.now();
  if (now - lastRequestTime < 1000) {
    // Prevent rapid fire requests
    return;
  }
  setLastRequestTime(now);
  // ... continue
};
```

## Summary

1. **Currently**: Using dummy responses (fully functional)
2. **To Integrate**: Create `src/services/aiService.ts` with API call
3. **Update**: Replace `generateDummyResponse()` with `callAIAPI()`
4. **Deploy**: Add API endpoint to environment variables
5. **Test**: Verify responses work with your actual AI service

The dummy responses will work great for demos and testing until you're ready to integrate a real API!
