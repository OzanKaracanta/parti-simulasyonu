/** Ulusal segment desteği — sidebar listesi veya ana sayfa tablosu */

import { ALL_SEGMENT_IDS } from '../../data/segments';
import { segmentLabels } from '../../data/labels';
import { formatDelta } from '../../engine/weeklyReport';
import type { SegmentId } from '../../types/game';
import { Panel } from '../ui/Panel';
import './SidebarSegmentSupport.css';

const SEGMENT_SUPPORT_MIN = 8;
const SEGMENT_SUPPORT_MAX = 72;
const STRONG_THRESHOLD = 42;
const WEAK_THRESHOLD = 28;

interface SidebarSegmentSupportProps {
  segmentSupport: Record<SegmentId, number>;
  /** Son haftanın segment değişimleri — istatistikler sidebar'ında gösterilir */
  segmentChanges?: Partial<Record<SegmentId, number>>;
  /** sidebar: sol menü listesi; table: ana sayfa tablo paneli */
  variant?: 'sidebar' | 'table';
}

function supportBarWidth(value: number): number {
  const span = SEGMENT_SUPPORT_MAX - SEGMENT_SUPPORT_MIN;
  return Math.round(((value - SEGMENT_SUPPORT_MIN) / span) * 100);
}

function supportTier(value: number): 'strong' | 'mid' | 'weak' {
  if (value >= STRONG_THRESHOLD) return 'strong';
  if (value <= WEAK_THRESHOLD) return 'weak';
  return 'mid';
}

export function SidebarSegmentSupport({
  segmentSupport,
  segmentChanges,
  variant = 'sidebar',
}: SidebarSegmentSupportProps) {
  const sorted = [...ALL_SEGMENT_IDS]
    .map((segmentId) => ({
      segmentId,
      value: segmentSupport[segmentId],
      tier: supportTier(segmentSupport[segmentId]),
      delta: segmentChanges?.[segmentId],
    }))
    .sort((a, b) => b.value - a.value);

  const strong = sorted.filter((item) => item.tier === 'strong').slice(0, 3);
  const weak = sorted.filter((item) => item.tier === 'weak').slice(-3).reverse();

  if (variant === 'table') {
    return (
      <Panel title="Ulusal Taban" className="overview-national-base-panel">
        <p className="overview-table-note">
          Toplumsal segment desteği
          {segmentChanges ? ' · son hafta Δ' : ''}
        </p>
        <table className="fm-table overview-national-base-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Destek</th>
              {segmentChanges ? <th>Δ</th> : null}
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ segmentId, value, tier, delta }) => (
              <tr key={segmentId} className={`tier-${tier}`}>
                <td>{segmentLabels[segmentId]}</td>
                <td className="num">{Math.round(value)}</td>
                {segmentChanges ? (
                  <td className={`num ${delta && delta > 0 ? 'positive' : delta && delta < 0 ? 'negative' : ''}`}>
                    {delta !== undefined && delta !== 0 ? formatDelta(delta) : '—'}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {strong.length > 0 || weak.length > 0 ? (
          <footer className="sidebar-segment-footer">
            {strong.length > 0 ? (
              <p className="sidebar-segment-footnote strong">
                <span>Güçlü</span> {strong.map((item) => segmentLabels[item.segmentId]).join(', ')}
              </p>
            ) : null}
            {weak.length > 0 ? (
              <p className="sidebar-segment-footnote weak">
                <span>Zayıf</span> {weak.map((item) => segmentLabels[item.segmentId]).join(', ')}
              </p>
            ) : null}
          </footer>
        ) : null}
      </Panel>
    );
  }

  return (
    <section className="sidebar-segment-card" aria-label="Ulusal segment desteği">
      <header className="sidebar-segment-header">
        <span className="sidebar-segment-title">Ulusal Taban</span>
        <span className="sidebar-segment-subtitle">
          Toplumsal segment desteği
          {segmentChanges ? ' · son hafta Δ' : ''}
        </span>
      </header>

      <ul className="sidebar-segment-list">
        {sorted.map(({ segmentId, value, tier, delta }) => (
          <li key={segmentId} className={`sidebar-segment-row tier-${tier}`}>
            <div className="sidebar-segment-row-top">
              <span className="sidebar-segment-name">{segmentLabels[segmentId]}</span>
              <span className="sidebar-segment-value-group">
                <span className="sidebar-segment-value">{Math.round(value)}</span>
                {delta !== undefined && delta !== 0 ? (
                  <span
                    className={`sidebar-segment-delta ${delta > 0 ? 'positive' : 'negative'}`}
                  >
                    {formatDelta(delta)}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="sidebar-segment-bar" aria-hidden>
              <div
                className="sidebar-segment-bar-fill"
                style={{ width: `${supportBarWidth(value)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {strong.length > 0 || weak.length > 0 ? (
        <footer className="sidebar-segment-footer">
          {strong.length > 0 ? (
            <p className="sidebar-segment-footnote strong">
              <span>Güçlü</span> {strong.map((item) => segmentLabels[item.segmentId]).join(', ')}
            </p>
          ) : null}
          {weak.length > 0 ? (
            <p className="sidebar-segment-footnote weak">
              <span>Zayıf</span> {weak.map((item) => segmentLabels[item.segmentId]).join(', ')}
            </p>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
