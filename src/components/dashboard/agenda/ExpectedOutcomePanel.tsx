import type { AgendaEffectLine, AgendaResponseDisplay } from '../../../types/agenda';
import { formatEffectLine, mergeEffectLines } from './agendaDisplayUtils';
import './weeklyAgenda.css';

interface ExpectedOutcomePanelProps {
  selectedResponse: AgendaResponseDisplay | null;
  onGoToRegional?: () => void;
}

export function ExpectedOutcomePanel({
  selectedResponse,
  onGoToRegional,
}: ExpectedOutcomePanelProps) {
  const hasSelection = Boolean(selectedResponse);

  const effectLines: AgendaEffectLine[] = hasSelection
    ? mergeEffectLines([...(selectedResponse?.effects ?? [])])
    : [];

  return (
    <section className="agenda-outcome-panel">
      <h5 className="agenda-section-title">Beklenen Sonuç</h5>

      {!hasSelection ? (
        <p className="agenda-outcome-empty">
          Bir ana tepki seçtiğinde beklenen metrik etkileri burada görünecek.
        </p>
      ) : (
        <>
          <p className="agenda-outcome-plan">
            <strong>Seçilen Plan:</strong> {selectedResponse?.title}
          </p>

          <ul className="agenda-outcome-effects">
            {effectLines.map((line) => (
              <li key={line.label} className={`type-${line.type}`}>
                {formatEffectLine(line)}
              </li>
            ))}
          </ul>

          {selectedResponse?.risk ? (
            <p className="agenda-outcome-risk">
              <strong>Risk:</strong> {selectedResponse.risk}
            </p>
          ) : null}

          {onGoToRegional ? (
            <div className="agenda-outcome-continue">
              <button
                type="button"
                className="agenda-flow-continue-btn"
                onClick={onGoToRegional}
              >
                Bölgesel Gündemlere Geç
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
