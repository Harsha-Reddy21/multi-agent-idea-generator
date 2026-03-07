import { useSession } from '../../contexts/SessionContext';
import ContentBlock from './ContentBlock';
import ScoreGauge from './ScoreGauge';
import './InfoPanels.scss';

export default function InfoPanels() {
  const { systemInfo, blocks, scores } = useSession();

  return (
    <div className="info-panels">
      {/* Score Overview */}
      <div className="info-panels__scores">
        <h3 className="info-panels__section-title">Confidence Scores</h3>
        <div className="info-panels__gauges">
          <ScoreGauge
            label="Overall"
            value={scores?.aggregate_score ?? 0}
            color={getColor(scores?.aggregate_score ?? 0)}
          />
          <ScoreGauge
            label="Penalty"
            value={scores?.penalty_multiplier ?? 1}
            color="#6c757d"
          />
        </div>

        {scores && scores.mandatory_below_threshold.length > 0 && (
          <div className="info-panels__warnings">
            <span className="info-panels__warning-icon">⚠</span>
            <span>
              {scores.mandatory_below_threshold.length} mandatory question(s) below threshold
            </span>
          </div>
        )}

        {systemInfo && (
          <div className="info-panels__meta">
            <div className="info-panels__meta-row">
              <span>Progress</span>
              <strong>{systemInfo.questions_answered}/{systemInfo.total_questions}</strong>
            </div>
            <div className="info-panels__meta-row">
              <span>Status</span>
              <strong className={`info-panels__status info-panels__status--${systemInfo.status}`}>
                {systemInfo.status}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Content Blocks */}
      <ContentBlock
        title="System Information"
        icon="⚙️"
        blockState={blocks['SYSTEM'] ?? null}
      />
      <ContentBlock
        title="User Information"
        icon="👤"
        blockState={blocks['USER'] ?? null}
      />
      <ContentBlock
        title="Technical Information"
        icon="🔧"
        blockState={blocks['TECH'] ?? null}
      />
    </div>
  );
}

function getColor(score: number): string {
  if (score >= 0.7) return '#2b8a3e';
  if (score >= 0.4) return '#e67700';
  return '#c92a2a';
}
