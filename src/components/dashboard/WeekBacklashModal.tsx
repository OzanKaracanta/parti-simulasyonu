import type { WeekBacklashItem } from '../../types/game';
import './WeekBacklashModal.css';

interface WeekBacklashModalProps {
  item: WeekBacklashItem;
  week: number;
  onDismiss: () => void;
}

export function WeekBacklashModal({ item, week, onDismiss }: WeekBacklashModalProps) {
  return (
    <div className="week-backlash-overlay" role="presentation">
      <div
        className="week-backlash-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="week-backlash-title"
      >
        <header className="week-backlash-header">
          <span className="week-backlash-kicker">Hafta {week} · Gölge yankı</span>
          <h2 id="week-backlash-title">{item.headline}</h2>
        </header>
        <p className="week-backlash-body">{item.body}</p>
        <p className="week-backlash-effects">
          <strong>Etki:</strong> {item.effectSummary}
        </p>
        <footer className="week-backlash-footer">
          <button type="button" className="ps-btn ps-btn--primary" onClick={onDismiss}>
            Yeni haftaya devam
          </button>
        </footer>
      </div>
    </div>
  );
}
