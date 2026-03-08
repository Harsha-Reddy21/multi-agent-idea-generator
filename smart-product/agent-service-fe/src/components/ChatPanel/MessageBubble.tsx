import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types';
import './ChatPanel.scss';

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isAgent = message.role === 'agent';

  return (
    <div className={`message-bubble ${isAgent ? 'message-bubble--agent' : 'message-bubble--user'}`}>
      {isAgent && <div className="message-bubble__avatar">🤖</div>}
      <div className="message-bubble__content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      {!isAgent && <div className="message-bubble__avatar">👤</div>}
    </div>
  );
}
