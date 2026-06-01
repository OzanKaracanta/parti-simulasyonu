import { responseToneLabels, subAgendaEnergyCostLabels } from '../../data/labels';
import type { SubAgendaResponseOption as SubAgendaResponseOptionType } from '../../types/game';
import './SubAgendaPanel.css';

interface SubAgendaResponseOptionProps {
  option: SubAgendaResponseOptionType;
  selected: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  onSelect: () => void;
}

export function SubAgendaResponseOption({
  option,
  selected,
  disabled = false,
  disabledReason = null,
  onSelect,
}: SubAgendaResponseOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      title={disabledReason ?? undefined}
      className={`sub-agenda-response-card tone-${option.tone} ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      onClick={onSelect}
    >
      <span className="sub-agenda-response-check" aria-hidden>
        {selected ? '✓' : ''}
      </span>
      <span className="sub-agenda-response-tone">{responseToneLabels[option.tone]}</span>
      <span className="sub-agenda-response-label">{option.label}</span>
      <span className="sub-agenda-response-desc">{option.description}</span>
      <span className="sub-agenda-response-cost">
        <span className="sub-agenda-response-cost-value">−{option.energyCost} ⚡</span>
        <span className="sub-agenda-response-cost-tier">
          {subAgendaEnergyCostLabels[option.energyCostLabel]}
        </span>
        <span className="sub-agenda-response-cost-note">Seçimde düşer</span>
      </span>
    </button>
  );
}
