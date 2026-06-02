import type { AdvisorBriefingItem } from '../../types/game';
import './AdvisorBriefingModal.css';

interface AdvisorBriefingModalProps {
  briefing: AdvisorBriefingItem;
  onDismiss: () => void;
}

function formatSupportDelta(change: number): string {
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) return `+${rounded.toFixed(1)}`;
  if (rounded < 0) return rounded.toFixed(1);
  return '0';
}

function formatSegmentDelta(change: number): string {
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) return `+${rounded.toFixed(1)}`;
  return rounded.toFixed(1);
}

function supportChangeTone(change: number): 'positive' | 'negative' | 'neutral' {
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
}

export function AdvisorBriefingModal({ briefing, onDismiss }: AdvisorBriefingModalProps) {
  const dismissLabel = briefing.isFinalWeek ? 'Sonuçları gör »' : 'Yeni haftaya devam »';
  const changeTone = supportChangeTone(briefing.supportChange);

  return (
    <div className="advisor-briefing-overlay" role="presentation">
      <div
        className="advisor-briefing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-briefing-title"
      >
        <header className="advisor-briefing-header">
          <div className="advisor-briefing-header-bar">
            <span className="advisor-briefing-kicker">
              {briefing.isFinalWeek
                ? `Tur ${briefing.completedWeek} · Kampanya sonu`
                : `Tur ${briefing.completedWeek} → ${briefing.displayWeek}`}
            </span>
            <button
              type="button"
              className="advisor-briefing-close"
              onClick={onDismiss}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>

          <div className="advisor-briefing-identity-row">
            <span className="advisor-briefing-avatar" aria-hidden>
              ◈
            </span>
            <div>
              <p className="advisor-briefing-name">{briefing.advisorName}</p>
              <p className="advisor-briefing-role">{briefing.advisorTitle}</p>
            </div>
            <h2 id="advisor-briefing-title" className="advisor-briefing-title">
              {briefing.headline}
            </h2>
          </div>
        </header>

        <div className="advisor-briefing-body">
          <p className="advisor-briefing-opening">{briefing.openingLine}</p>

          <section className="advisor-briefing-support" aria-label="Ulusal destek">
            <span className="advisor-briefing-stat-label">Ulusal destek</span>
            <div className="advisor-briefing-support-values">
              <span className="advisor-briefing-support-before">
                {briefing.supportBefore.toFixed(1)}%
              </span>
              <span className="advisor-briefing-support-arrow" aria-hidden>
                →
              </span>
              <span className={`advisor-briefing-support-after is-${changeTone}`}>
                {briefing.supportAfter.toFixed(1)}%
              </span>
              <span className={`advisor-briefing-support-delta is-${changeTone}`}>
                ({formatSupportDelta(briefing.supportChange)})
              </span>
            </div>
          </section>

          <div className="advisor-briefing-segments">
            <section
              className="advisor-briefing-segment-card advisor-briefing-segment-card--gain"
              aria-label="En çok kazanç"
            >
              <span className="advisor-briefing-stat-label">En çok kazanç</span>
              {briefing.topGain ? (
                <>
                  <span className="advisor-briefing-segment-name">{briefing.topGain.label}</span>
                  <span className="advisor-briefing-segment-delta positive">
                    {formatSegmentDelta(briefing.topGain.change)} puan
                  </span>
                </>
              ) : (
                <span className="advisor-briefing-segment-empty">Bu turda belirgin kazanç yok</span>
              )}
            </section>

            <section
              className="advisor-briefing-segment-card advisor-briefing-segment-card--loss"
              aria-label="En çok kayıp"
            >
              <span className="advisor-briefing-stat-label">En çok kayıp</span>
              {briefing.topLoss ? (
                <>
                  <span className="advisor-briefing-segment-name">{briefing.topLoss.label}</span>
                  <span className="advisor-briefing-segment-delta negative">
                    {formatSegmentDelta(briefing.topLoss.change)} puan
                  </span>
                </>
              ) : (
                <span className="advisor-briefing-segment-empty">Bu turda belirgin kayıp yok</span>
              )}
            </section>
          </div>

          {briefing.adviceNotes.length > 0 ? (
            <section className="advisor-briefing-advice" aria-label="Danışman notu">
              <h3 className="advisor-briefing-advice-title">Danışman notu</h3>
              <ul className="advisor-briefing-advice-list">
                {briefing.adviceNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="advisor-briefing-closing">{briefing.closingLine}</p>
        </div>

        <footer className="advisor-briefing-footer">
          <button type="button" className="ps-btn ps-btn--primary" onClick={onDismiss}>
            {dismissLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
