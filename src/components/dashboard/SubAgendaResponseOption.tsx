import { responseToneLabels, subAgendaEnergyCostLabels } from '../../data/labels';
import type { SubAgendaResponseOption as SubAgendaResponseOptionType } from '../../types/game';
import './SubAgendaPanel.css';

interface SubAgendaResponseOptionProps {
  option: SubAgendaResponseOptionType;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function SubAgendaResponseOption({
  option,
  selected,
  disabled = false,
  onSelect,
}: SubAgendaResponseOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      className={`sub-agenda-response-card tone-${option.tone} ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
    >
      <span className="sub-agenda-response-check" aria-hidden>
        {selected ? '✓' : ''}
      </span>
      <span className="sub-agenda-response-tone">{responseToneLabels[option.tone]}</span>
      <span className="sub-agenda-response-label">{option.label}</span>
      <span className="sub-agenda-response-desc">{option.description}</span>
      <span className="sub-agenda-response-cost">
        {subAgendaEnergyCostLabels[option.energyCostLabel]}
      </span>
    </button>
  );
}
