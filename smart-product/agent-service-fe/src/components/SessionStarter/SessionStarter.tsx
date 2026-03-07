import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import './SessionStarter.scss';

const FORM_OPTIONS = [
  { value: 'IDEA_SUBMISSION', label: 'Idea Submission' },
  { value: 'AI_REGISTRY', label: 'AI Registry' },
  { value: 'SECURITY', label: 'Security Assessment' },
  { value: 'DLO', label: 'Digital Lab Operations' },
  { value: 'WWTP', label: 'WWTP' },
];

export default function SessionStarter() {
  const { startSession, isLoading } = useSession();
  const [form, setForm] = useState('IDEA_SUBMISSION');
  const [name, setName] = useState('');

  const handleStart = () => {
    if (!name.trim()) return;
    startSession(form, name.trim());
  };

  return (
    <div className="session-starter">
      <div className="session-starter__card">
        <div className="session-starter__icon">🚀</div>
        <h1>Sage AI Agent</h1>
        <p>Start a guided session — the AI agent will walk you through each question.</p>

        <div className="session-starter__field">
          <label htmlFor="user-name">Your Name</label>
          <input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="session-starter__field">
          <label htmlFor="form-type">Form Type</label>
          <select id="form-type" value={form} onChange={(e) => setForm(e.target.value)}>
            {FORM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="session-starter__btn"
          onClick={handleStart}
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? 'Starting...' : 'Start Session'}
        </button>
      </div>
    </div>
  );
}
