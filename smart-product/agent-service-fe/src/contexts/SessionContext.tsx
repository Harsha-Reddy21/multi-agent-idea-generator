import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type {
  ChatMessage,
  QuestionPayload,
  SystemInfo,
  UserInfo,
  ScoreUpdate,
  BlockUpdate,
  BlockState,
} from '../types';
import * as api from '../services/api';

interface SessionContextType {
  // Session
  sessionId: string | null;
  formType: string | null;
  isLoading: boolean;
  startSession: (formType: string, userName?: string) => Promise<void>;

  // Chat
  messages: ChatMessage[];
  currentQuestion: QuestionPayload | null;
  sendMessage: (text: string) => Promise<void>;

  // Panels
  systemInfo: SystemInfo | null;
  userInfo: UserInfo | null;

  // Blocks (updated via WebSocket)
  blocks: Record<string, BlockState>;

  // Scores (updated via WebSocket)
  scores: ScoreUpdate | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formType, setFormType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [blocks, setBlocks] = useState<Record<string, BlockState>>({});
  const [scores, setScores] = useState<ScoreUpdate | null>(null);

  const scoreWs = useRef<WebSocket | null>(null);
  const blockWs = useRef<WebSocket | null>(null);

  // Clean up WebSockets on unmount
  useEffect(() => {
    return () => {
      scoreWs.current?.close();
      blockWs.current?.close();
    };
  }, []);

  const connectWebSockets = useCallback((sid: string) => {
    const wsBase = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

    // Score WebSocket
    const sWs = new WebSocket(`${wsBase}/ws/scores/${sid}`);
    sWs.onmessage = (event) => {
      const data: ScoreUpdate = JSON.parse(event.data);
      if (data.type === 'score_update') {
        setScores((prev) => {
          const merged = prev
            ? { ...prev, ...data, question_scores: { ...prev.question_scores, ...data.question_scores } }
            : data;
          return merged;
        });
      }
    };
    scoreWs.current = sWs;

    // Block WebSocket
    const bWs = new WebSocket(`${wsBase}/ws/blocks/${sid}`);
    bWs.onmessage = (event) => {
      const data: BlockUpdate = JSON.parse(event.data);
      if (data.type === 'block_update') {
        setBlocks((prev) => ({
          ...prev,
          [data.block]: {
            fields: data.fields,
            filled_count: data.filled_count,
            total_count: data.total_count,
          },
        }));
      }
    };
    blockWs.current = bWs;
  }, []);

  const startSession = useCallback(async (ft: string, userName: string = 'User') => {
    setIsLoading(true);
    try {
      const res = await api.createSession(ft, userName);
      setSessionId(res.session_id);
      setFormType(res.form_type);
      setCurrentQuestion(res.question);
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: res.first_message,
          timestamp: Date.now(),
          question: res.question ?? undefined,
        },
      ]);

      // Fetch initial blocks
      const sessionData = await api.getSession(res.session_id);
      setSystemInfo(sessionData.system_info);
      setUserInfo(sessionData.user_info);
      setBlocks(sessionData.blocks);

      connectWebSockets(res.session_id);
    } finally {
      setIsLoading(false);
    }
  }, [connectWebSockets]);

  const sendMessageFn = useCallback(async (text: string) => {
    if (!sessionId) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(sessionId, text);
      setCurrentQuestion(res.question);
      if (res.system_info) setSystemInfo(res.system_info);
      if (res.user_info) setUserInfo(res.user_info);

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'agent',
        content: res.agent_message,
        timestamp: Date.now(),
        question: res.question ?? undefined,
        suggestions_status: res.suggestions_status ?? undefined,
        available_actions: res.available_actions,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        formType,
        isLoading,
        startSession,
        messages,
        currentQuestion,
        sendMessage: sendMessageFn,
        systemInfo,
        userInfo,
        blocks,
        scores,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
