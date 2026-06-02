/** Ulusal segment desteği — sidebar listesi veya ana sayfa tablosu */

import { ALL_SEGMENT_IDS } from '../../data/segments';
import { segmentLabels } from '../../data/labels';
import { politicalSegmentLabels } from '../../data/politicalSegments';
import { formatDelta } from '../../engine/weeklyReport';
import type { SegmentId } from '../../types/game';
import { ALL_POLITICAL_SEGMENT_IDS } from '../../types/politicalSegments';
import type { PoliticalSegmentId } from '../../types/politicalSegments';
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
  politicalSegmentSupport?: Record<PoliticalSegmentId, number>;
  politicalSegmentChanges?: Partial<Record<PoliticalSegmentId, number>>;
  /** sidebar: sol menü listesi; table: ana sayfa tablo paneli */
  variant?: 'sidebar' | 'table';
}

interface SegmentTableRow {
  id: string;
  label: string;
  value: number;
  tier: 'strong' | 'mid' | 'weak';
  delta?: number;
}

function supportValueClass(delta?: number): string {
  if (delta === undefined || delta === 0) return 'num';
  return `num ${delta > 0 ? 'positive' : 'negative'}`;
}

function SegmentSupportFootnotes({ rows }: { rows: SegmentTableRow[] }) {
  const strong = rows.filter((item) => item.tier === 'strong').slice(0, 3);
  const weak = rows.filter((item) => item.tier === 'weak').slice(-3).reverse();

  if (strong.length === 0 && weak.length === 0) return null;

  return (
    <footer className="sidebar-segment-footer overview-national-base-column-footer">
      {strong.length > 0 ? (
        <p className="sidebar-segment-footnote strong">
          <span>Güçlü</span> {strong.map((item) => item.label).join(', ')}
        </p>
      ) : null}
      {weak.length > 0 ? (
        <p className="sidebar-segment-footnote weak">
          <span>Zayıf</span> {weak.map((item) => item.label).join(', ')}
        </p>
      ) : null}
    </footer>
  );
}

function NationalBaseSegmentTable({
  title,
  rows,
}: {
  title: string;
  rows: SegmentTableRow[];
}) {
  return (
    <div className="overview-national-base-column">
      <h4 className="overview-national-base-column-title">{title}</h4>
      <table className="fm-table overview-national-base-table">
        <thead>
          <tr>
            <th>Segment</th>
            <th>Destek</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, label, value, delta }) => (
            <tr key={id}>
              <td>{label}</td>
              <td className={supportValueClass(delta)}>{Math.round(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SegmentSupportFootnotes rows={rows} />
    </div>
  );
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
  politicalSegmentSupport,
  politicalSegmentChanges,
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
    const socioRows: SegmentTableRow[] = sorted.map(
      ({ segmentId, value, tier, delta }) => ({
        id: segmentId,
        label: segmentLabels[segmentId],
        value,
        tier,
        delta,
      }),
    );

    const politicalRows: SegmentTableRow[] | null = politicalSegmentSupport
      ? [...ALL_POLITICAL_SEGMENT_IDS]
          .map((segmentId) => ({
            id: segmentId,
            label: politicalSegmentLabels[segmentId],
            value: politicalSegmentSupport[segmentId],
            tier: supportTier(politicalSegmentSupport[segmentId]),
            delta: politicalSegmentChanges?.[segmentId],
          }))
          .sort((a, b) => b.value - a.value)
      : null;

    return (
      <Panel title="Ulusal Taban" className="overview-national-base-panel">
        <p className="overview-table-note">Toplumsal ve ideolojik segment desteği</p>
        <div className="overview-national-base-columns">
          <NationalBaseSegmentTable title="Sosyo-Ekonomik Segmentler" rows={socioRows} />
          {politicalRows ? (
            <NationalBaseSegmentTable title="İdeolojik Segmentler" rows={politicalRows} />
          ) : null}
        </div>
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
