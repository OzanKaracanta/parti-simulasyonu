import type { EarlyWeekMissingActivity } from '../../engine/earlyWeekEndWarning';
import './EarlyWeekEndWarningModal.css';

interface EarlyWeekEndWarningModalProps {
  week: number;
  missingActivities: EarlyWeekMissingActivity[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function EarlyWeekEndWarningModal({
  week,
  missingActivities,
  onConfirm,
  onCancel,
}: EarlyWeekEndWarningModalProps) {
  return (
    <div className="early-week-end-overlay" role="presentation">
      <div
        className="early-week-end-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="early-week-end-title"
      >
        <header className="early-week-end-header">
          <span className="early-week-end-kicker">Tur {week}</span>
          <h2 id="early-week-end-title">Haftayı bitirmek üzeresiniz</h2>
        </header>

        <div className="early-week-end-body">
          <ul className="early-week-end-list">
            {missingActivities.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
          <p className="early-week-end-question">
            Bunları yapmadan bir sonraki haftaya geçmek istediğinizden emin misiniz?
          </p>
        </div>

        <footer className="early-week-end-footer">
          <button type="button" className="ps-btn ps-btn--ghost" onClick={onCancel}>
            Haftayı Bitirme
          </button>
          <button type="button" className="ps-btn ps-btn--success" onClick={onConfirm}>
            Evet Yeni Haftaya Başla
          </button>
        </footer>
      </div>
    </div>
  );
}
