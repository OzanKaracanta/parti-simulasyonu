import type { AgendaEffectLine, AgendaResponseDisplay } from '../../../types/agenda';
import { formatEffectLine, mergeEffectLines } from './agendaDisplayUtils';
import './weeklyAgenda.css';

interface ExpectedOutcomePanelProps {
  selectedResponse: AgendaResponseDisplay | null;
  /** Tam sayfa — devam butonu kartların altında; yan panelde gösterme */
  showContinueAction?: boolean;
  onGoToRegional?: () => void;
}

export function ExpectedOutcomePanel({
  selectedResponse,
  showContinueAction = true,
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
          Bir tepki kartı seç — seçim anında kaydedilir; beklenen etkiler burada görünür.
        </p>
      ) : (
        <>
          <p className="agenda-outcome-plan">
            <strong>Kayıtlı yanıt:</strong> {selectedResponse?.title}
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

          {showContinueAction && onGoToRegional ? (
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
