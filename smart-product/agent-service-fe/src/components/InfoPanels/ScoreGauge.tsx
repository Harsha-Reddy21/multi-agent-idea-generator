import './InfoPanels.scss';

interface Props {
  label: string;
  value: number; // 0–1
  color?: string;
}

export default function ScoreGauge({ label, value, color = '#1a73e8' }: Props) {
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value * circumference);

  return (
    <div className="score-gauge">
      <svg className="score-gauge__svg" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" className="score-gauge__track" />
        <circle
          cx="40"
          cy="40"
          r="36"
          className="score-gauge__fill"
          style={{
            stroke: color,
            strokeDasharray: `${circumference}`,
            strokeDashoffset: `${offset}`,
          }}
        />
        <text x="40" y="44" className="score-gauge__text">{pct}%</text>
      </svg>
      <span className="score-gauge__label">{label}</span>
    </div>
  );
}
