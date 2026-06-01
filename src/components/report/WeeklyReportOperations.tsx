import { metricLabels, resourceLabels } from '../../data/labels';
import type { WeeklyHistoryItem } from '../../types/game';
import { ReportChangeList } from './ReportChangeList';

interface WeeklyReportOperationsProps {
  report: WeeklyHistoryItem;
}

export function WeeklyReportOperations({ report }: WeeklyReportOperationsProps) {
  return (
    <div className="report-columns report-columns--operations">
      <div className="report-block">
        <span className="report-block-header">Aksiyonlar</span>
        {report.selectedActions.length === 0 ? (
          <p className="report-empty">Aksiyon seçilmedi.</p>
        ) : (
          <ul className="report-list">
            {report.selectedActions.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="report-block">
        <span className="report-block-header">Kaynak Δ</span>
        <ReportChangeList changes={report.resourceChanges} labels={resourceLabels} />
      </div>

      <div className="report-block">
        <span className="report-block-header">Metrik Δ</span>
        <ReportChangeList changes={report.metricChanges} labels={metricLabels} />
      </div>
    </div>
  );
}
