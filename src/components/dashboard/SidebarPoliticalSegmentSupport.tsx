/** İstatistikler sidebar — ideolojik blok desteği özeti */

import { politicalSegmentLabels } from '../../data/politicalSegments';
import { formatDelta } from '../../engine/weeklyReport';
import { ALL_POLITICAL_SEGMENT_IDS } from '../../types/politicalSegments';
import type { PoliticalSegmentId } from '../../types/politicalSegments';
import './SidebarSegmentSupport.css';

const POLITICAL_SUPPORT_MIN = 8;
const POLITICAL_SUPPORT_MAX = 72;
const STRONG_THRESHOLD = 42;
const WEAK_THRESHOLD = 28;

interface SidebarPoliticalSegmentSupportProps {
  politicalSegmentSupport: Record<PoliticalSegmentId, number>;
  politicalSegmentChanges?: Partial<Record<PoliticalSegmentId, number>>;
}

function supportBarWidth(value: number): number {
  const span = POLITICAL_SUPPORT_MAX - POLITICAL_SUPPORT_MIN;
  return Math.round(((value - POLITICAL_SUPPORT_MIN) / span) * 100);
}

function supportTier(value: number): 'strong' | 'mid' | 'weak' {
  if (value >= STRONG_THRESHOLD) return 'strong';
  if (value <= WEAK_THRESHOLD) return 'weak';
  return 'mid';
}

export function SidebarPoliticalSegmentSupport({
  politicalSegmentSupport,
  politicalSegmentChanges,
}: SidebarPoliticalSegmentSupportProps) {
  const sorted = [...ALL_POLITICAL_SEGMENT_IDS]
    .map((segmentId) => ({
      segmentId,
      value: politicalSegmentSupport[segmentId],
      tier: supportTier(politicalSegmentSupport[segmentId]),
      delta: politicalSegmentChanges?.[segmentId],
    }))
    .sort((a, b) => b.value - a.value);

  const strong = sorted.filter((item) => item.tier === 'strong').slice(0, 2);
  const weak = sorted.filter((item) => item.tier === 'weak').slice(-2).reverse();

  return (
    <section
      className="sidebar-segment-card sidebar-segment-card--political"
      aria-label="Politik segment desteği"
    >
      <header className="sidebar-segment-header">
        <span className="sidebar-segment-title">Politik Yankı</span>
        <span className="sidebar-segment-subtitle">
          Ideolojik blok desteği
          {politicalSegmentChanges ? ' · son hafta Δ' : ''}
        </span>
      </header>

      <ul className="sidebar-segment-list sidebar-segment-list--political">
        {sorted.map(({ segmentId, value, tier, delta }) => (
          <li key={segmentId} className={`sidebar-segment-row tier-${tier}`}>
            <div className="sidebar-segment-row-top">
              <span className="sidebar-segment-name">{politicalSegmentLabels[segmentId]}</span>
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
                className="sidebar-segment-bar-fill sidebar-segment-bar-fill--political"
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
              <span>Güçlü</span>{' '}
              {strong.map((item) => politicalSegmentLabels[item.segmentId]).join(', ')}
            </p>
          ) : null}
          {weak.length > 0 ? (
            <p className="sidebar-segment-footnote weak">
              <span>Zayıf</span>{' '}
              {weak.map((item) => politicalSegmentLabels[item.segmentId]).join(', ')}
            </p>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
