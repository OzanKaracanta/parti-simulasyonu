/** Rapor sidebar — seçili haftanın segment Δ özeti */

import { Panel } from '../ui/Panel';
import { buildSegmentChangeChips } from './segmentChangeSummary';
import type { SegmentId, WeeklyHistoryItem } from '../../types/game';
import type { PoliticalSegmentId } from '../../types/politicalSegments';
import './ReportSegmentChangesPanel.css';

interface ReportSegmentChangesPanelProps {
  segmentChanges?: Partial<Record<SegmentId, number>>;
  politicalSegmentChanges?: Partial<Record<PoliticalSegmentId, number>>;
  week?: WeeklyHistoryItem['week'];
}

export function ReportSegmentChangesPanel({
  segmentChanges,
  politicalSegmentChanges,
  week,
}: ReportSegmentChangesPanelProps) {
  const chips = buildSegmentChangeChips(segmentChanges, politicalSegmentChanges);

  return (
    <Panel
      title="Segment Değişimleri"
      compact
      className="report-segment-changes-panel"
      headerExtra={week ? <span className="report-segment-week">H{week}</span> : undefined}
    >
      {chips.length === 0 ? (
        <p className="report-segment-changes-empty">
          Bu hafta segment desteğinde kayda değer değişim yok.
        </p>
      ) : (
        <ul className="report-segment-changes-list">
          {chips.map((chip) => (
            <li
              key={`${chip.kind}-${chip.id}`}
              className={`report-segment-change-row kind-${chip.kind} ${chip.delta > 0 ? 'positive' : 'negative'}`}
            >
              <span className="report-segment-change-label">{chip.label}</span>
              <span className="report-segment-change-delta">
                {chip.delta > 0 ? '+' : ''}
                {chip.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
