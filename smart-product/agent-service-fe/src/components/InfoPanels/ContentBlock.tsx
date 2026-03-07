import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import type { BlockState } from '../../types';
import './InfoPanels.scss';

interface Props {
  title: string;
  icon: string;
  blockState: BlockState | null;
}

export default function ContentBlock({ title, icon, blockState }: Props) {
  const { sendMessage, sessionId } = useSession();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!blockState) {
    return (
      <div className="content-block content-block--empty">
        <div className="content-block__header">
          <span className="content-block__icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <p className="content-block__placeholder">No data yet — answer questions in the chat.</p>
      </div>
    );
  }

  const filledFields = Object.entries(blockState.fields).filter(([, f]) => f.filled);

  const startEdit = (key: string, currentValue: string | null) => {
    setEditingKey(key);
    setEditValue(currentValue ?? '');
  };

  const submitEdit = (key: string, label: string) => {
    if (!sessionId || !editValue.trim()) return;
    // Send as an edit command through the chat so the agent processes it
    sendMessage(`I want to update ${label} to: ${editValue.trim()}`);
    setEditingKey(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  return (
    <div className="content-block">
      <div className="content-block__header">
        <span className="content-block__icon">{icon}</span>
        <h3>{title}</h3>
        <span className="content-block__count">
          {blockState.filled_count}/{blockState.total_count}
        </span>
      </div>

      <div className="content-block__progress">
        <div
          className="content-block__progress-bar"
          style={{
            width: `${blockState.total_count > 0 ? (blockState.filled_count / blockState.total_count) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="content-block__fields">
        {filledFields.length === 0 ? (
          <p className="content-block__placeholder">Waiting for responses...</p>
        ) : (
          filledFields.map(([key, field]) => (
            <div key={key} className="content-block__field">
              <span className="content-block__label">{field.label}</span>
              {editingKey === key ? (
                <div className="content-block__edit">
                  <textarea
                    className="content-block__edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitEdit(key, field.label);
                      }
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    rows={2}
                  />
                  <div className="content-block__edit-actions">
                    <button className="content-block__edit-save" onClick={() => submitEdit(key, field.label)}>Save</button>
                    <button className="content-block__edit-cancel" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <span
                  className="content-block__value content-block__value--editable"
                  onClick={() => startEdit(key, field.value)}
                  title="Click to edit"
                >
                  {field.value}
                  <span className="content-block__edit-icon">✏️</span>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
