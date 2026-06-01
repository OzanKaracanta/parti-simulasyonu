/** Parti kimliği — duruş eksenleri ve mesaj tutarlılığı */

import { ALL_POLICY_TOPICS } from '../../data/politicalIdentity';
import { policyTopicLabels } from '../../data/labels';
import type { GameState, PolicyTopicId } from '../../types/game';
import { Panel } from '../ui/Panel';
import './PartyIdentityPanel.css';

interface PartyIdentityPanelProps {
  state: GameState;
  compact?: boolean;
}

function stanceBarClass(value: number): string {
  if (value > 10) return 'right';
  if (value < -10) return 'left';
  return 'center';
}

function formatStance(value: number): string {
  if (value > 15) return 'Sağ';
  if (value > 5) return 'Merkez-sağ';
  if (value > -5) return 'Merkez';
  if (value > -15) return 'Merkez-sol';
  return 'Sol';
}

export function PartyIdentityPanel({ state, compact = false }: PartyIdentityPanelProps) {
  const topics = compact
    ? ALL_POLICY_TOPICS.filter(
        (topic) => Math.abs(state.partyStances[topic]) >= 5,
      ).slice(0, 4)
    : ALL_POLICY_TOPICS;

  const consistencyClass =
    state.messageConsistency >= 65
      ? 'positive'
      : state.messageConsistency <= 40
        ? 'negative'
        : 'neutral';

  return (
    <Panel title="Parti Kimliği" compact={compact} className="party-identity-panel">
      <div className="consistency-box">
        <div className="consistency-header">
          <span className="consistency-label">Mesaj Tutarlılığı</span>
          <span className={`consistency-value ${consistencyClass}`}>
            {state.messageConsistency}
          </span>
        </div>
        <div className="consistency-bar">
          <div
            className={`consistency-fill ${consistencyClass}`}
            style={{ width: `${state.messageConsistency}%` }}
          />
        </div>
      </div>

      <ul className="stance-list">
        {topics.map((topic) => (
          <StanceRow
            key={topic}
            topic={topic}
            value={state.partyStances[topic]}
          />
        ))}
      </ul>

      {compact && topics.length < ALL_POLICY_TOPICS.length ? (
        <p className="stance-compact-note">Belirgin duruşlar gösteriliyor.</p>
      ) : null}
    </Panel>
  );
}

function StanceRow({ topic, value }: { topic: PolicyTopicId; value: number }) {
  const barClass = stanceBarClass(value);
  const normalized = ((value + 50) / 100) * 100;

  return (
    <li className="stance-row">
      <div className="stance-row-header">
        <span className="stance-topic">{policyTopicLabels[topic]}</span>
        <span className={`stance-tag ${barClass}`}>{formatStance(value)}</span>
      </div>
      <div className="stance-track">
        <div className="stance-center-mark" />
        <div
          className={`stance-marker ${barClass}`}
          style={{ left: `${Math.max(4, Math.min(96, normalized))}%` }}
        />
      </div>
    </li>
  );
}
