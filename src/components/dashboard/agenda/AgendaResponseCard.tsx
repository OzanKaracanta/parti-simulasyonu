import type { AgendaResponseDisplay } from '../../../types/agenda';
import './weeklyAgenda.css';

interface AgendaResponseCardProps {
  option: AgendaResponseDisplay;
  selected: boolean;
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

export function AgendaResponseCard({ option, selected, onSelect }: AgendaResponseCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`agenda-response-card stance-${option.stance} ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
    >
      <span className="agenda-response-stance">{option.stanceLabel}</span>
      <span className="agenda-response-title">{option.title}</span>
      <p className="agenda-response-desc">{option.description}</p>

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
