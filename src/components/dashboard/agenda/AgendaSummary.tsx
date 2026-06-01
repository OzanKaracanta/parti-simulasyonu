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
}

export function AgendaSummary({
  week,
  event,
  pressure,
  status,
  storyHint,
  rivalParties,
  playerIdeologyId,
}: AgendaSummaryProps) {
  const topics = getEventTopicLine(event);
  const resolved = enrichResolvedForPlayerContext(
    event,
    { playerIdeologyId, rivalParties },
    resolveEventSegmentsForWeek(event, rivalParties),
  );
  const targetRival = event.attacksRival ? resolveEventTargetRival(event, rivalParties) : null;

  return (
    <header className="agenda-summary">
      <div className="agenda-summary-top">
        <h3 className="agenda-summary-week">HAFTA {week} GÜNDEMİ</h3>
        <div className="agenda-summary-badges">
          <ReactionAxisBadge axis={resolved.reactionAxis} />
          <span className={`agenda-status-badge status-${status}`}>
            {AGENDA_STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      <h4 className="agenda-summary-title">{event.title}</h4>
      <p className="agenda-summary-desc">{event.description}</p>

      {targetRival ? (
        <p className="agenda-summary-rival-target">
          <strong>Rakip hedef:</strong> {targetRival.name}
          {targetRival.isRulingParty ? ' (İktidar)' : ''} ·{' '}
          {getIdeologyById(targetRival.ideologyId).name}
        </p>
      ) : null}

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

      <div className="agenda-summary-meta">
        <span>
          <strong>Baskı:</strong> {getPressureLabel(pressure)}
        </span>
        <span>
          <strong>Konu:</strong> {topics || policyTopicLabels[event.policyTopic]}
        </span>
      </div>

      {storyHint ? (
        <p className="agenda-summary-hint">
          <span className="agenda-summary-hint-label">Yaklaşan:</span> {storyHint}
        </p>
      ) : null}
    </header>
  );
}
