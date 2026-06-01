/** Toplumsal segment desteği paneli */

import { ALL_SEGMENT_IDS } from '../../data/segments';
import { segmentLabels } from '../../data/labels';
import type { SegmentId } from '../../types/game';
import { Panel } from '../ui/Panel';
import './SegmentPanel.css';

interface SegmentPanelProps {
  segmentSupport: Record<SegmentId, number>;
  segmentChanges?: Partial<Record<SegmentId, number>>;
  compact?: boolean;
  /** Yalnızca bu haftanın segment Δ değerlerini göster (rapor yan paneli) */
  changesOnly?: boolean;
}

export function SegmentPanel({
  segmentSupport,
  segmentChanges,
  compact = false,
  changesOnly = false,
}: SegmentPanelProps) {
  if (changesOnly) {
    const changed = ALL_SEGMENT_IDS.map((segmentId) => ({
      segmentId,
      delta: segmentChanges?.[segmentId] ?? 0,
    }))
      .filter((entry) => entry.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return (
      <Panel title="Segment Değişimleri" compact className="segment-panel segment-panel--changes">
        {changed.length === 0 ? (
          <p className="segment-changes-empty">Bu hafta segment desteğinde kayda değer değişim yok.</p>
        ) : (
          <ul className="segment-changes-list">
            {changed.map(({ segmentId, delta }) => {
              const deltaClass = delta > 0 ? 'positive' : 'negative';
              return (
                <li key={segmentId} className={`segment-change-row ${deltaClass}`}>
                  <span className="segment-name">{segmentLabels[segmentId]}</span>
                  <span className={`segment-delta ${deltaClass}`}>
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    );
  }

  const sorted = [...ALL_SEGMENT_IDS].sort(
    (a, b) => segmentSupport[b] - segmentSupport[a],
  );

  const visibleSegments = compact ? sorted.slice(0, 5) : sorted;

  return (
    <Panel title="Toplumsal Destek" compact={compact} className="segment-panel">
      <ul className="segment-list">
        {visibleSegments.map((segmentId) => {
          const value = segmentSupport[segmentId];
          const delta = segmentChanges?.[segmentId];
          const deltaClass =
            delta === undefined ? '' : delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';

          return (
            <li key={segmentId} className="segment-row">
              <div className="segment-row-header">
                <span className="segment-name">{segmentLabels[segmentId]}</span>
                <span className="segment-value">
                  {value.toFixed(0)}
                  {delta !== undefined && delta !== 0 ? (
                    <span className={`segment-delta ${deltaClass}`}>
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="segment-bar">
                <div className="segment-bar-fill" style={{ width: `${value}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      {compact ? (
        <p className="segment-compact-note">En yüksek 5 segment gösteriliyor.</p>
      ) : null}
    </Panel>
  );
}
