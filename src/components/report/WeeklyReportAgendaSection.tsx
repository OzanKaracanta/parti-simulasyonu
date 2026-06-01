import { weeklyEventTypeLabels } from '../../data/labels';
import { formatOutcomeEffects } from '../../engine/weeklyReport';
import type { WeeklyHistoryItem } from '../../types/game';
import { Badge } from '../ui/Badge';
import { SubAgendaOutcomeCard } from './SubAgendaOutcomeCard';
import { ReportWeekSegmentSummary } from './ReportWeekSegmentSummary';

interface WeeklyReportAgendaSectionProps {
  report: WeeklyHistoryItem;
}

export function WeeklyReportAgendaSection({ report }: WeeklyReportAgendaSectionProps) {
  const outcomeEffectLines = formatOutcomeEffects(report.eventOutcomeEffects);

  const hasSubAgenda =
    report.subAgendaOutcomes.length > 0 || report.subAgendaCrossRuleLines.length > 0;

  const orphanCrossRules = report.subAgendaCrossRuleLines.filter(
    (line) => !report.subAgendaOutcomes.some((o) => o.crossRuleNote === line),
  );

  return (
    <>
      <ReportWeekSegmentSummary report={report} />

      {report.eventOutcomeTitle ? (
        <div className="report-block report-block--highlight">
          <div className="report-block-header">
            <span>Gündem Sonucu</span>
            {report.eventType ? (
              <Badge tone={report.eventType}>{weeklyEventTypeLabels[report.eventType]}</Badge>
            ) : null}
          </div>
          {report.eventTitle ? <p className="report-event-title">{report.eventTitle}</p> : null}
          <p className={`report-outcome ${report.eventResponseLevel ?? 'ignored'}`}>
            <strong>{report.eventOutcomeTitle}</strong> — {report.eventOutcomeDescription}
          </p>
          {outcomeEffectLines.length > 0 ? (
            <ul className="report-effect-list">
              {outcomeEffectLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {report.alignmentFeedback ? (
        <div className="report-block">
          <span className="report-block-header">Kimlik Uyumu</span>
          <p className="report-alignment-summary">{report.alignmentFeedback.summary}</p>
          <div className="report-consistency-row">
            <span>Tutarlılık</span>
            <span>
              {report.consistencyBefore} → {report.consistencyAfter}
              {report.consistencyAfter !== report.consistencyBefore ? (
                <span
                  className={
                    report.consistencyAfter > report.consistencyBefore ? 'positive' : 'negative'
                  }
                >
                  {' '}
                  ({report.consistencyAfter > report.consistencyBefore ? '+' : ''}
                  {report.consistencyAfter - report.consistencyBefore})
                </span>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      {report.segmentReactions.length > 0 ||
      report.mainEventPoliticalReactions?.length ||
      report.mainEventPoliticalReactionText ? (
        <div className="report-block">
          <span className="report-block-header">Ana Gündem — Tepki Özeti</span>
          {report.selectedResponseLabel ? (
            <p className="report-response-label">Tepki: {report.selectedResponseLabel}</p>
          ) : null}
          {report.segmentReactions.length > 0 ? (
            <>
              <p className="report-reaction-subheader">Toplumsal</p>
              <ul className="report-list segment-reactions">
                {report.segmentReactions.map((reaction) => (
                  <li
                    key={reaction.segmentId}
                    className={reaction.delta > 0 ? 'positive' : reaction.delta < 0 ? 'negative' : ''}
                  >
                    <span className="report-reaction-arrow" aria-hidden>
                      {reaction.delta > 0 ? '▲' : reaction.delta < 0 ? '▼' : '·'}
                    </span>
                    {reaction.message}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {report.mainEventPoliticalReactions && report.mainEventPoliticalReactions.length > 0 ? (
            <>
              <p className="report-reaction-subheader">Politik</p>
              <ul className="report-list segment-reactions political-reactions">
                {report.mainEventPoliticalReactions.map((reaction) => (
                  <li
                    key={reaction.segmentId}
                    className={reaction.delta > 0 ? 'positive' : reaction.delta < 0 ? 'negative' : ''}
                  >
                    <span className="report-reaction-arrow" aria-hidden>
                      {reaction.delta > 0 ? '▲' : reaction.delta < 0 ? '▼' : '·'}
                    </span>
                    {reaction.message}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {report.mainEventPoliticalReactionText ? (
            <p className="report-political-reaction">{report.mainEventPoliticalReactionText}</p>
          ) : null}
        </div>
      ) : null}

      {report.politicalSegmentReactions &&
      report.politicalSegmentReactions.length > 0 &&
      (report.subAgendaOutcomes.length > 0 || report.regionalAgendaOutcomes.length > 0) ? (
        <div className="report-block">
          <span className="report-block-header">Haftalık — Politik Yankı</span>
          <ul className="report-list segment-reactions political-reactions">
            {report.politicalSegmentReactions.map((reaction) => (
              <li
                key={reaction.segmentId}
                className={reaction.delta > 0 ? 'positive' : reaction.delta < 0 ? 'negative' : ''}
              >
                <span className="report-reaction-arrow" aria-hidden>
                  {reaction.delta > 0 ? '▲' : reaction.delta < 0 ? '▼' : '·'}
                </span>
                {reaction.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasSubAgenda ? (
        <div className="report-block">
          <div className="report-block-header">
            <span>Alt Gündem Yankıları</span>
            <span className="sub-agenda-slot-report">
              Slot: {report.subAgendaSlotsUsed}/{report.subAgendaSlotsMax}
            </span>
          </div>

          {report.subAgendaOutcomes.length > 0 ? (
            <div className="report-sub-outcome-grid">
              {report.subAgendaOutcomes.map((outcome) => (
                <SubAgendaOutcomeCard key={outcome.agendaId} outcome={outcome} />
              ))}
            </div>
          ) : null}

          {orphanCrossRules.length > 0 ? (
            <ul className="report-list report-cross-rules">
              {orphanCrossRules.map((line) => (
                <li key={line} className={line.includes('soğuma') ? '' : 'negative'}>
                  {line}
                </li>
              ))}
            </ul>
          ) : null}

          {report.subAgendaOutcomes.length === 0 && report.subAgendaCrossRuleLines.length > 0 ? (
            <p className="report-empty">Bu hafta alt gündeme doğrudan mesaj verilmedi.</p>
          ) : null}
        </div>
      ) : null}

      {report.regionalAgendaOutcomes.length > 0 ? (
        <div className="report-block">
          <span className="report-block-header">Bölgesel Gündem</span>
          <ul className="report-list">
            {report.regionalAgendaOutcomes.map((outcome) => (
              <li key={outcome.agendaId}>
                <strong>{outcome.regionName}</strong> — {outcome.title}: {outcome.responseLabel}
                {outcome.supportDelta !== 0 ? (
                  <span className={outcome.supportDelta > 0 ? ' positive' : ' negative'}>
                    {' '}
                    (bölge desteği {outcome.supportDelta > 0 ? '+' : ''}
                    {outcome.supportDelta.toFixed(2)})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
