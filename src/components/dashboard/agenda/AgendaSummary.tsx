import { policyTopicLabels } from '../../../data/labels';
import { resolveEventTargetRival } from '../../../data/rivals';
import { getIdeologyById } from '../../../data/setupOptions';
import { enrichResolvedForPlayerContext } from '../../../engine/reactionAxisEngine';
import { resolveEventSegmentsForWeek } from '../../../engine/resolveEventSegments';
import type { AgendaPressure, AgendaStatus } from '../../../types/agenda';
import type { GameState, IdeologyId, WeeklyEvent } from '../../../types/game';
import { AgendaSegmentImpact } from './AgendaSegmentImpact';
import { ReactionAxisBadge } from './ReactionAxisBadge';
import {
  AGENDA_STATUS_LABELS,
  getEventTopicLine,
  getPressureLabel,
} from './agendaDisplayUtils';
import './weeklyAgenda.css';

interface AgendaSummaryProps {
  week: number;
  event: WeeklyEvent;
  pressure: AgendaPressure;
  status: AgendaStatus;
  storyHint?: string | null;
  rivalParties: GameState['rivalParties'];
  playerIdeologyId: IdeologyId;
  /** Tam sayfa Ulusal Gündem — tekrarlayan başlıkları gizler, içeriği sıkıştırır */
  layout?: 'default' | 'page';
  /** Seçili ana tepki — üst rozet (Yanıt Kaydedildi) için */
  selectedResponseTitle?: string | null;
}

export function AgendaSummary({
  week,
  event,
  pressure,
  status,
  storyHint,
  rivalParties,
  playerIdeologyId,
  layout = 'default',
  selectedResponseTitle = null,
}: AgendaSummaryProps) {
  const topics = getEventTopicLine(event);
  const resolved = enrichResolvedForPlayerContext(
    event,
    { playerIdeologyId, rivalParties },
    resolveEventSegmentsForWeek(event, rivalParties),
  );
  const targetRival = event.attacksRival ? resolveEventTargetRival(event, rivalParties) : null;

  const isPage = layout === 'page';
  const hasSavedResponse = Boolean(selectedResponseTitle);
  const topicsLabel = topics || policyTopicLabels[event.policyTopic];

  const segmentImpact = (
    <AgendaSegmentImpact
      reactionAxis={resolved.reactionAxis}
      primarySegments={resolved.primarySegments}
      tensionSegments={resolved.tensionSegments}
      primaryPoliticalSegments={resolved.primaryPoliticalSegments}
      tensionPoliticalSegments={resolved.tensionPoliticalSegments}
      tensionRationale={resolved.tensionRationale}
      politicalRationale={resolved.politicalRationale}
      variant="main"
    />
  );

  return (
    <header className={`agenda-summary${isPage ? ' agenda-summary--page' : ''}`}>
      {isPage ? (
        <div className="agenda-summary-headline-row">
          <h4 className="agenda-summary-title">{event.title}</h4>
          <div className="agenda-summary-badges">
            <ReactionAxisBadge axis={resolved.reactionAxis} />
            {hasSavedResponse ? (
              <span className="agenda-status-badge status-saved">Yanıt Kaydedildi</span>
            ) : (
              <span className={`agenda-status-badge status-${status}`}>
                {AGENDA_STATUS_LABELS[status]}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="agenda-summary-top">
            <h3 className="agenda-summary-week">HAFTA {week} GÜNDEMİ</h3>
            <div className="agenda-summary-badges">
              <ReactionAxisBadge axis={resolved.reactionAxis} />
              {hasSavedResponse ? (
                <span className="agenda-status-badge status-saved">Yanıt Kaydedildi</span>
              ) : (
                <span className={`agenda-status-badge status-${status}`}>
                  {AGENDA_STATUS_LABELS[status]}
                </span>
              )}
            </div>
          </div>
          <h4 className="agenda-summary-title">{event.title}</h4>
        </>
      )}
      <p className="agenda-summary-desc">{event.description}</p>

      {targetRival ? (
        <p className="agenda-summary-rival-target">
          <strong>Rakip hedef:</strong> {targetRival.name}
          {targetRival.isRulingParty ? ' (İktidar)' : ''} ·{' '}
          {getIdeologyById(targetRival.ideologyId).name}
        </p>
      ) : null}

      {isPage ? (
        <details className="agenda-summary-impact-details">
          <summary className="agenda-summary-impact-toggle">Kimleri etkiler?</summary>
          {segmentImpact}
        </details>
      ) : (
        segmentImpact
      )}

      <div className="agenda-summary-meta">
        <span>
          <strong>Baskı:</strong> {getPressureLabel(pressure)}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <strong>Konu:</strong> {topicsLabel}
        </span>
        {isPage && storyHint ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="agenda-summary-meta-hint">
              <strong>Yaklaşan:</strong> {storyHint}
            </span>
          </>
        ) : null}
      </div>

      {!isPage && storyHint ? (
        <p className="agenda-summary-hint">
          <span className="agenda-summary-hint-label">Yaklaşan:</span> {storyHint}
        </p>
      ) : null}
    </header>
  );
}
