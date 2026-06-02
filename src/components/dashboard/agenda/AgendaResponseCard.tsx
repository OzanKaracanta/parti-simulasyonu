import type { AgendaResponseDisplay } from '../../../types/agenda';
import './weeklyAgenda.css';

interface AgendaResponseCardProps {
  option: AgendaResponseDisplay;
  selected: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  onSelect: () => void;
}

function EffectLine({ line }: { line: AgendaResponseDisplay['effects'][number] }) {
  if (line.type === 'neutral' && line.value === undefined) {
    return <li className="agenda-effect-line type-neutral">{line.label}</li>;
  }

  const prefix = line.type === 'positive' ? '+' : line.type === 'negative' ? '−' : '·';

  return (
    <li className={`agenda-effect-line type-${line.type}`}>
      <span className="agenda-effect-prefix">{prefix}</span>
      <span>{line.label}</span>
    </li>
  );
}

export function AgendaResponseCard({
  option,
  selected,
  disabled = false,
  disabledReason = null,
  onSelect,
}: AgendaResponseCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      title={disabledReason ?? undefined}
      className={`agenda-response-card stance-${option.stance} ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      onClick={onSelect}
    >
      <span className="agenda-response-check" aria-hidden>
        {selected ? '✓' : ''}
      </span>
      <span className="agenda-response-stance">{option.stanceLabel}</span>
      <span className="agenda-response-title">{option.title}</span>
      <p className="agenda-response-desc">{option.description}</p>

      {(option.cost?.energy ?? 0) > 0 || (option.cost?.money ?? 0) > 0 ? (
        <div className="agenda-response-resource-costs" aria-label="Kaynak maliyeti">
          {(option.cost?.energy ?? 0) > 0 ? (
            <span className="agenda-resource-cost-chip">−{option.cost!.energy} ⚡</span>
          ) : null}
          {(option.cost?.money ?? 0) > 0 ? (
            <span className="agenda-resource-cost-chip">−{option.cost!.money} ₺</span>
          ) : null}
          <span className="agenda-resource-cost-note">Seçimde düşer</span>
        </div>
      ) : null}

      {option.effects.length > 0 ? (
        <ul className="agenda-response-effects">
          {option.effects.map((line) => (
            <EffectLine key={`${option.id}-${line.label}`} line={line} />
          ))}
        </ul>
      ) : null}

      <p className="agenda-response-risk">
        <span>Risk:</span> {option.risk}
      </p>
    </button>
  );
}
