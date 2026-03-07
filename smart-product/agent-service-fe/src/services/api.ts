import axios from 'axios';
import type { ChatResponse, SessionCreateResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function createSession(
  formType: string,
  userName: string = 'User',
  userEmail: string = '',
): Promise<SessionCreateResponse> {
  const res = await api.post('/session', {
    form_type: formType,
    user_name: userName,
    user_email: userEmail,
  });
  return res.data;
}

export async function sendMessage(
  sessionId: string,
  message: string,
  messageType: string = 'answer',
): Promise<ChatResponse> {
  const res = await api.post('/chat', {
    session_id: sessionId,
    message,
    message_type: messageType,
  });
  return res.data;
}

export async function getSession(sessionId: string) {
  const res = await api.get(`/session/${sessionId}`);
  return res.data;
}

export async function getBlock(sessionId: string, blockName: string) {
  const res = await api.get(`/session/${sessionId}/blocks/${blockName}`);
  return res.data;
}

export async function listForms(): Promise<{ form_types: string[] }> {
  const res = await api.get('/forms');
  return res.data;
}
