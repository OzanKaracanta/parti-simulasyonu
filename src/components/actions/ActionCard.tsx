import { categoryLabels } from '../../data/labels';
import {
  formatActionCost,
  formatActionEffects,
  formatActionGains,
} from '../../utils/actionFormat';
import type { CampaignAction } from '../../types/game';
import './actions.css';

interface ActionCardProps {
  action: CampaignAction;
  eventLabels: string[];
  selected: boolean;
  disabled: boolean;
  disabledReason: string | null;
  onToggle: () => void;
}

function eventLabelClass(label: string): string {
  if (label === 'Fırsat bonusu') return 'event-label opportunity';
  if (label === 'Kriz etkisi') return 'event-label crisis';
  if (label === 'Gündem bonusu') return 'event-label agenda';
  return 'event-label';
}

export function ActionCard({
  action,
  eventLabels,
  selected,
  disabled,
  disabledReason,
  onToggle,
}: ActionCardProps) {
  const gains = formatActionGains(action);

  return (
    <button
      type="button"
      className={selected ? 'action-card selected' : 'action-card'}
      disabled={disabled}
      onClick={onToggle}
    >
      <div className="action-card-header">
        <strong>{action.name}</strong>
        <span className="category-badge">{categoryLabels[action.category]}</span>
      </div>
      {eventLabels.length > 0 ? (
        <div className="event-labels">
          {eventLabels.map((label) => (
            <span className={eventLabelClass(label)} key={label}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
      <p className="action-description">{action.description}</p>
      <div className="action-meta cost">{formatActionCost(action)}</div>
      <div className="action-meta">{formatActionEffects(action)}</div>
      {gains ? <div className="action-meta gain">Kazanç: {gains}</div> : null}
      {disabledReason ? <p className="action-disabled-reason">{disabledReason}</p> : null}
    </button>
  );
}
