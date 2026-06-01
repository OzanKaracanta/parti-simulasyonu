import { buildSegmentChangeChips } from './segmentChangeSummary';
import type { WeeklyHistoryItem } from '../../types/game';
import './ReportWeekSegmentSummary.css';

interface ReportWeekSegmentSummaryProps {
  report: WeeklyHistoryItem;
}

export function ReportWeekSegmentSummary({ report }: ReportWeekSegmentSummaryProps) {
  const chips = buildSegmentChangeChips(
    report.segmentChanges,
    report.politicalSegmentChanges,
    4,
  );

  if (chips.length === 0) return null;

  return (
    <div className="report-week-segment-summary" aria-label="Haftalık segment özeti">
      <span className="report-week-segment-summary-label">Bu hafta</span>
      <div className="report-week-segment-summary-chips">
        {chips.map((chip) => (
          <span
            key={`${chip.kind}-${chip.id}`}
            className={`report-week-segment-chip kind-${chip.kind} ${chip.delta > 0 ? 'positive' : 'negative'}`}
          >
            {chip.delta > 0 ? '+' : ''}
            {chip.delta} {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
