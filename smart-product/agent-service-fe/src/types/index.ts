/* ───── API Types ───── */

export interface QuestionPayload {
  id: string;
  text: string;
  q_type: string;
  required: boolean;
  target_block: string;
  target_field_label: string;
  options: string[] | null;
  suggestions: string[];
  ai_enabled: boolean;
}

export interface SuggestionsStatus {
  completed: string[];
  required: string[];
  score: number;
}

export interface ChatResponse {
  agent_message: string;
  question: QuestionPayload | null;
  suggestions_status: SuggestionsStatus | null;
  available_actions: string[];
  system_info: SystemInfo;
  user_info: UserInfo;
}

export interface SessionCreateResponse {
  session_id: string;
  form_type: string;
  first_message: string;
  question: QuestionPayload | null;
}

/* ───── Panel Types ───── */

export interface SystemInfo {
  form_type: string;
  questions_answered: number;
  total_questions: number;
  progress_pct: number;
  status: string;
}

export interface UserInfo {
  user_name: string;
  user_email: string;
  submission_id: string;
}

export interface BlockField {
  label: string;
  value: string | null;
  filled: boolean;
}

export interface BlockState {
  fields: Record<string, BlockField>;
  filled_count: number;
  total_count: number;
}

/* ───── WebSocket Types ───── */

export interface ScoreUpdate {
  type: 'score_update';
  question_scores: Record<string, { score: number; analysis: SuggestionAnalysis[] }>;
  aggregate_score: number;
  penalty_multiplier: number;
  mandatory_below_threshold: string[];
  questions_scored: number;
  questions_total: number;
}

export interface SuggestionAnalysis {
  text: string;
  status: 'completed' | 'required';
  rationale: string;
}

export interface BlockUpdate {
  type: 'block_update';
  block: string;
  fields: Record<string, BlockField>;
  filled_count: number;
  total_count: number;
}

/* ───── Chat Message ───── */

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  question?: QuestionPayload;
  suggestions_status?: SuggestionsStatus;
  available_actions?: string[];
}
