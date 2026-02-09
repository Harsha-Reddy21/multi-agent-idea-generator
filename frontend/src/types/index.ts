// Type definitions for the Smart Product Profile application

/**
 * Represents a single chat message in the AI agent conversation
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
    attachment?: File | null;
}

/**
 * Represents a document section with title and content
 */
export interface DocumentSection {
  title: string;
  content: string;
}

/**
 * AI response data including confidence score and feedback
 */
export interface AIResponse {
  confidenceScore: number;
  feedback: string;
}

/**
 * Layout modes for the application
 * - 'full': Both editor and AI panel visible (default)
 * - 'editor-expanded': Full-width editor, AI panel hidden
 * - 'ai-expanded': Full-width AI panel, editor hidden
 */
export type LayoutMode = 'full' | 'editor-expanded' | 'ai-expanded';

/**
 * Product profile data structure
 */
export interface ProductProfile {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  confidenceScore?: number;
}
