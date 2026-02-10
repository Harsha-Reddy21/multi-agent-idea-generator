/**
 * API Service for communicating with the backend
 */

import { ChatMessage } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatRequest {
  message: string;
  document_content?: string;
  chat_history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  confidence_score?: number;
  /** When the update agent ran, HTML to apply to the document (proposed changes). */
  document_content?: string;
}

export interface AutocompleteRequest {
  document_content: string;
}

export interface AutocompleteResponse {
  response: string;
  confidence_score?: number;
  document_content?: string;
}

/**
 * Call the chat API endpoint
 */
export const chatAPI = async (request: ChatRequest): Promise<ChatResponse> => {
  const apiUrl = `${API_BASE_URL}/api/chat`;
  
  console.log("🚀 [API] Calling chat endpoint:", apiUrl);
  console.log("📤 [API] Request payload:", {
    message: request.message,
    document_content_length: request.document_content?.length || 0,
    chat_history_count: request.chat_history?.length || 0,
  });

  try {
    const requestBody = {
      message: request.message,
      document_content: request.document_content || "",
      chat_history: request.chat_history?.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
      })) || [],
    };

    console.log("📦 [API] Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 [API] Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Error response:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || response.statusText };
      }
      
      throw new Error(
        errorData.detail || `API request failed: ${response.statusText}`
      );
    }

    const data: ChatResponse = await response.json();
    console.log("✅ [API] Success response:", {
      response_length: data.response?.length || 0,
      confidence_score: data.confidence_score,
    });
    
    return data;
  } catch (error) {
    console.error("❌ [API] Chat API Error:", error);
    if (error instanceof Error) {
      console.error("❌ [API] Error message:", error.message);
      console.error("❌ [API] Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * Call the autocomplete endpoint (used after document edits)
 */
export const autocompleteAPI = async (
  request: AutocompleteRequest,
): Promise<AutocompleteResponse> => {
  const apiUrl = `${API_BASE_URL}/api/autocomplete`;

  console.log("🚀 [API] Calling autocomplete endpoint:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_content: request.document_content || "",
      }),
    });

    console.log("📥 [API] Autocomplete response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Autocomplete error response:", errorText);
      throw new Error(errorText || response.statusText);
    }

    const data: AutocompleteResponse = await response.json();
    console.log("✅ [API] Autocomplete success:", {
      response_length: data.response?.length || 0,
      confidence_score: data.confidence_score,
    });
    return data;
  } catch (error) {
    console.error("❌ [API] Autocomplete API Error:", error);
    throw error;
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};
