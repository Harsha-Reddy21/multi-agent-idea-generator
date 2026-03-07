import ReactMarkdown from 'react-markdown';
import { useSession } from '../../contexts/SessionContext';
import type { ChatMessage } from '../../types';
import SuggestionsDisplay from './SuggestionsDisplay';
import './ChatPanel.scss';

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isAgent = message.role === 'agent';
  const { sendMessage } = useSession();

  return (
    <div className={`message-bubble ${isAgent ? 'message-bubble--agent' : 'message-bubble--user'}`}>
      {isAgent && <div className="message-bubble__avatar">🤖</div>}
      <div className="message-bubble__content">
        <ReactMarkdown>{message.content}</ReactMarkdown>

        {message.suggestions_status && (
          <SuggestionsDisplay status={message.suggestions_status} />
        )}

        {message.available_actions && message.available_actions.length > 0 && (
          <div className="message-bubble__actions">
            {message.available_actions.map((action) => (
              <button
                key={action}
                className="action-btn"
                onClick={() => sendMessage(action)}
              >
                {action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
      {!isAgent && <div className="message-bubble__avatar">👤</div>}
    </div>
  );
}
