import { metricLabels } from '../../data/labels';
import { Panel } from '../ui/Panel';
import { StatBar } from '../ui/StatBar';
import type { GameState, MetricKey } from '../../types/game';
import './dashboard.css';

interface MetricGridProps {
  metrics: GameState['metrics'];
  metricChanges?: Partial<Record<MetricKey, number>>;
  compact?: boolean;
}

const COMPACT_METRIC_KEYS: MetricKey[] = [
  'leaderTrust',
  'policyCredibility',
  'mediaPower',
  'youthReach',
  'localOrganization',
  'crisisManagement',
];

export function MetricGrid({ metrics, metricChanges, compact = false }: MetricGridProps) {
  const entries = (Object.entries(metrics) as [MetricKey, number][]).filter(([key]) =>
    compact ? COMPACT_METRIC_KEYS.includes(key) : true,
  );

  return (
    <Panel title={compact ? 'Temel Metrikler' : 'Kampanya Metrikleri'} compact={compact}>
      {entries.map(([key, value]) => (
        <StatBar
          key={key}
          label={metricLabels[key]}
          value={value}
          delta={metricChanges?.[key]}
        />
      ))}
    </Panel>
  );
}

interface MetricTableProps {
  metrics: GameState['metrics'];
  metricChanges?: Partial<Record<MetricKey, number>>;
}

export function MetricTable({ metrics, metricChanges }: MetricTableProps) {
  return (
    <Panel title="Detaylı Metrik Tablosu">
      <table className="fm-table">
        <thead>
          <tr>
            <th>Metrik</th>
            <th>Değer</th>
            <th>Değişim</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(metrics) as [MetricKey, number][]).map(([key, value]) => {
            const delta = metricChanges?.[key];
            const status = value >= 65 ? 'Güçlü' : value >= 40 ? 'Orta' : 'Zayıf';
            const statusClass = value >= 65 ? 'positive' : value >= 40 ? '' : 'negative';

            return (
              <tr key={key}>
                <td>{metricLabels[key]}</td>
                <td className="num">{value}</td>
                <td className={`num ${delta && delta > 0 ? 'positive' : delta && delta < 0 ? 'negative' : ''}`}>
                  {delta !== undefined && delta !== 0
                    ? `${delta > 0 ? '+' : ''}${delta}`
                    : '—'}
                </td>
                <td className={statusClass}>{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
