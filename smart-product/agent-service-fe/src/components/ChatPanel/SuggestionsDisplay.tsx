import type { SuggestionsStatus } from '../../types';
import './ChatPanel.scss';

interface Props {
  status: SuggestionsStatus;
}

export default function SuggestionsDisplay({ status }: Props) {
  return (
    <div className="suggestions-display">
      <div className="suggestions-display__score">
        Coverage: <strong>{Math.round(status.score * 100)}%</strong>
      </div>

      {status.completed.length > 0 && (
        <div className="suggestions-display__group">
          <span className="suggestions-display__heading suggestions-display__heading--ok">
            ✓ Addressed
          </span>
          {status.completed.map((s, i) => (
            <div key={i} className="suggestions-display__item suggestions-display__item--ok">
              {s}
            </div>
          ))}
        </div>
      )}

      {status.required.length > 0 && (
        <div className="suggestions-display__group">
          <span className="suggestions-display__heading suggestions-display__heading--warn">
            ⚠ Still needed
          </span>
          {status.required.map((s, i) => (
            <div key={i} className="suggestions-display__item suggestions-display__item--warn">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
