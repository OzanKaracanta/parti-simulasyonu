import { formatDelta } from '../../engine/weeklyReport';
import type { WeeklyHistoryItem } from '../../types/game';

interface WeeklyReportHeroProps {
  report: WeeklyHistoryItem;
}

export function WeeklyReportHero({ report }: WeeklyReportHeroProps) {
  const supportClass =
    report.supportChange > 0 ? 'positive' : report.supportChange < 0 ? 'negative' : 'neutral';

  return (
    <div className="weekly-report-hero">
      <p className="weekly-report-summary">{report.summary}</p>

      <div className="report-support-box">
        <div className="report-support-main">
          <span className="report-support-label">Oy Oranı</span>
          <span className={`report-support-value ${supportClass}`}>
            {report.supportAfter.toFixed(1)}%
          </span>
        </div>
        <div className="report-support-detail">
          <span>
            {report.supportBefore.toFixed(1)}% → {report.supportAfter.toFixed(1)}%
          </span>
          <span className={`report-delta ${supportClass}`}>
            {formatDelta(report.supportChange)} puan
          </span>
        </div>
        <div className="report-support-bar">
          <div
            className={`report-support-fill ${supportClass}`}
            style={{ width: `${Math.min(100, report.supportAfter * 2)}%` }}
          />
        </div>
      </div>

      {report.insight ? (
        <p className="report-insight report-insight--hero">{report.insight}</p>
      ) : null}
    </div>
  );
}
