import { formatDelta } from '../../engine/weeklyReport';
import type { WeeklyHistoryItem } from '../../types/game';
import { ReportAccordion } from './ReportAccordion';
import { countEnvironmentSections, hasEnvironmentSections } from './weeklyReportSections';

interface WeeklyReportEnvironmentSectionProps {
  report: WeeklyHistoryItem;
}

export function WeeklyReportEnvironmentSection({ report }: WeeklyReportEnvironmentSectionProps) {
  if (!hasEnvironmentSections(report)) return null;

  const environmentHint =
    countEnvironmentSections(report) > 0
      ? `${countEnvironmentSections(report)} bölüm`
      : undefined;

  return (
    <ReportAccordion title="Çevre etkileri" hint={environmentHint}>
      {report.radarEffectLines.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Radar Gündem Etkileri</span>
          {report.radarAgendaTitles.length > 0 ? (
            <p className="report-response-label">
              İzlenen: {report.radarAgendaTitles.join(' · ')}
            </p>
          ) : null}
          <ul className="report-list">
            {report.radarEffectLines.map((line) => (
              <li
                key={line}
                className={
                  line.includes('slotu') || line.includes('yumuşadı')
                    ? 'positive'
                    : line.includes('rakip') || line.includes('sessiz')
                      ? 'negative'
                      : ''
                }
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.rivalMoves.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Rakip Hamleleri</span>
          <ul className="report-list">
            {report.rivalMoves.map((move) => (
              <li key={`${move.rivalId}-${move.headline}`}>
                <strong>{move.rivalName}:</strong> {move.impactSummary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.weekBacklash ? (
        <div className="report-block">
          <span className="report-block-header">Gölge Yankı</span>
          <p className="report-response-label negative">
            <strong>{report.weekBacklash.headline}</strong>
          </p>
          <p className="report-alignment-summary">{report.weekBacklash.body}</p>
          <p className="report-alignment-summary">
            <em>{report.weekBacklash.effectSummary}</em>
          </p>
        </div>
      ) : null}

      {report.opinionEchoes.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Medya Yankısı</span>
          <ul className="report-list">
            {report.opinionEchoes.map((echo) => (
              <li
                key={echo.id}
                className={
                  echo.tone === 'critical'
                    ? 'negative'
                    : echo.tone === 'positive'
                      ? 'positive'
                      : ''
                }
              >
                <strong>{echo.headline}:</strong> {echo.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.upcomingStoryHint ? (
        <div className="report-block">
          <span className="report-block-header">Yaklaşan Gündem</span>
          <p className="report-alignment-summary">{report.upcomingStoryHint}</p>
        </div>
      ) : null}

      {report.actionSynergyLines.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Aksiyon Sinerjisi</span>
          <ul className="report-list">
            {report.actionSynergyLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.organizationSegmentLines.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Örgüt Segment Erişimi</span>
          <ul className="report-list">
            {report.organizationSegmentLines.map((line) => (
              <li key={line} className="positive">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.organizationProductionLines.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Haftalık Üretim</span>
          <ul className="report-list">
            {report.organizationProductionLines.map((line) => (
              <li key={line}>{line.replace(/^H\d+: /, '')}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.sympathizerDonation > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Pasif Gelir</span>
          <ul className="report-list">
            <li className="positive">
              Sempatizan Bağışı: {formatDelta(report.sympathizerDonation)} para (Lider Güveni{' '}
              {Math.round(report.sympathizerLeaderTrust)})
            </li>
          </ul>
        </div>
      ) : null}
    </ReportAccordion>
  );
}
