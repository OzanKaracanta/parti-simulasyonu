import { resourceLabels } from '../../data/labels';
import type { CampaignAction, ResourceKey } from '../../types/game';

const resourceIcons: Record<ResourceKey, string> = {
  money: '₺',
  energy: '⚡',
  volunteers: '👥',
  reputation: '★',
  organizationCapacity: '⬡',
};

interface ActionCostChipsProps {
  action: CampaignAction;
  className?: string;
}

export function ActionCostChips({ action, className }: ActionCostChipsProps) {
  const chips = (Object.entries(action.cost) as [ResourceKey, number][])
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => ({
      key,
      icon: resourceIcons[key],
      label: resourceLabels[key],
      value: Math.abs(value),
      negative: value < 0 || value > 0,
    }));

  const load = action.organizationLoad ?? 0;

  if (chips.length === 0 && load === 0) {
    return <span className="cost-chip-empty">Ücretsiz</span>;
  }

  return (
    <div className={`cost-chips ${className ?? ''}`}>
      {chips.map((chip) => (
        <span className="cost-chip cost" key={chip.key} title={chip.label}>
          <span className="cost-chip-icon">{chip.icon}</span>
          <span className="cost-chip-value">-{chip.value}</span>
        </span>
      ))}
      {load > 0 ? (
        <span className="cost-chip load" title="Örgüt yükü">
          <span className="cost-chip-icon">⬡</span>
          <span className="cost-chip-value">{load}</span>
        </span>
      ) : null}
    </div>
  );
}
