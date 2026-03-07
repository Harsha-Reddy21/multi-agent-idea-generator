import type { BlockState } from '../../types';
import './InfoPanels.scss';

interface Props {
  title: string;
  icon: string;
  blockState: BlockState | null;
}

export default function ContentBlock({ title, icon, blockState }: Props) {
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
              <span className="content-block__value">{field.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
