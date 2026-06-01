import {
  formatOrganizationLoadUsage,
  getRemainingOrganizationLoad,
  getSelectedOrganizationLoad,
} from '../../engine/organizationLoadEngine';
import type { GameState } from '../../types/game';
import './CoordinationMeter.css';

interface CoordinationMeterProps {
  state: GameState;
  /** Kompakt satır (panel başlığı yanı) */
  compact?: boolean;
  className?: string;
}

export function CoordinationMeter({ state, compact = false, className }: CoordinationMeterProps) {
  const used = getSelectedOrganizationLoad(state);
  const capacity = state.resources.organizationCapacity;
  const remaining = getRemainingOrganizationLoad(state);
  const fillPct = capacity > 0 ? Math.min(100, Math.round((used / capacity) * 100)) : 0;
  const isFull = remaining <= 0 && used > 0;
  const isWarning = !isFull && remaining > 0 && remaining <= Math.max(2, capacity * 0.15);

  return (
    <div
      className={`coordination-meter ${compact ? 'coordination-meter--compact' : ''} ${isFull ? 'is-full' : ''} ${isWarning ? 'is-warning' : ''} ${className ?? ''}`}
      title="Bu hafta planlanan operasyonların koordinasyon yükü. Kapasite tükenmez; yük hafta bitince sıfırlanır."
    >
      <div className="coordination-meter-head">
        <span className="coordination-meter-label">Koordinasyon yükü</span>
        <span className="coordination-meter-value">{formatOrganizationLoadUsage(state)}</span>
      </div>
      {!compact ? (
        <div className="coordination-meter-bar" aria-hidden>
          <div className="coordination-meter-fill" style={{ width: `${fillPct}%` }} />
        </div>
      ) : null}
      {!compact && isFull ? (
        <p className="coordination-meter-note">Kota dolu — daha hafif operasyon seç veya planı sadeleştir.</p>
      ) : null}
    </div>
  );
}
