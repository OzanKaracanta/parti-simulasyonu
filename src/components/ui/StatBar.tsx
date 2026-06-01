import './ui.css';

type BarVariant = 'good' | 'mid' | 'low' | 'neutral' | 'party';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  delta?: number;
  variant?: BarVariant;
}

function barVariant(value: number, max: number): BarVariant {
  const pct = (value / max) * 100;
  if (pct >= 65) return 'good';
  if (pct >= 35) return 'mid';
  return 'low';
}

export function StatBar({ label, value, max = 100, delta, variant }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillClass = variant ?? barVariant(value, max);

  return (
    <div className="fm-stat-bar">
      <span className="fm-stat-bar-label">{label}</span>
      <div className="fm-stat-bar-track">
        <div className={`fm-stat-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="fm-stat-bar-value">
        {value}
        {delta !== undefined && delta !== 0 ? (
          <span className={`fm-stat-bar-delta ${delta > 0 ? 'positive' : 'negative'}`}>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        ) : null}
      </span>
    </div>
  );
}
