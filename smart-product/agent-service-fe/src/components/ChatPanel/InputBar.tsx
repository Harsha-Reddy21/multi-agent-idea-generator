import { useState, type KeyboardEvent } from 'react';
import { useSession } from '../../contexts/SessionContext';
import type { QuestionPayload } from '../../types';
import ChoiceSelector from './ChoiceSelector';
import './ChatPanel.scss';

interface Props {
  currentQuestion: QuestionPayload | null;
}

export default function InputBar({ currentQuestion }: Props) {
  const { sendMessage, isLoading, sessionId } = useSession();
  const [text, setText] = useState('');

  const isChoiceType =
    currentQuestion &&
    (currentQuestion.q_type === 'select' ||
      currentQuestion.q_type === 'radio' ||
      currentQuestion.q_type === 'multiselect');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;
    sendMessage(trimmed);
    setText('');
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChoice = (value: string) => {
    if (!sessionId) return;
    sendMessage(value);
  };

  return (
    <div className="input-bar">
      {isChoiceType && currentQuestion.options && (
        <ChoiceSelector
          options={currentQuestion.options}
          type={currentQuestion.q_type}
          onSelect={handleChoice}
        />
      )}

      <div className="input-bar__row">
        <textarea
          className="input-bar__input"
          placeholder={
            !sessionId
              ? 'Start a session first...'
              : isLoading
              ? 'Agent is thinking...'
              : 'Type your answer...'
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={!sessionId || isLoading}
          rows={1}
        />
        <button
          className="input-bar__send"
          onClick={handleSend}
          disabled={!text.trim() || !sessionId || isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
