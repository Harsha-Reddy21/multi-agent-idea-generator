import { useRef, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import './ChatPanel.scss';

export default function ChatPanel() {
  const { messages, isLoading, currentQuestion } = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__header-icon">🤖</div>
        <div>
          <h2>AI Agent</h2>
          <span className="chat-panel__status">
            {isLoading ? 'Thinking...' : 'Online'}
          </span>
        </div>
      </div>

      <div className="chat-panel__messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="chat-panel__typing">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <InputBar currentQuestion={currentQuestion} />
    </div>
  );
}
