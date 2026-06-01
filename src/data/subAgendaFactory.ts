/** Alt gündem kartları — haftalık olay havuzundan prosedürel üretim */

import { enrichResolvedSegmentsWithRivals, enrichWithRivalTarget, resolveEventSegments } from '../engine/resolveEventSegments';
import type { ResolvedEventSegments } from '../engine/resolveEventSegments';
import type {
  RadarAgendaItem,
  RivalPartyState,
  SubAgendaItem,
  WeeklyEvent,
  WeeklyEventType,
} from '../types/game';
import { createSubAgendaResponseOptions } from './subAgendaResponseAdapter';
import { getWeeklyEventById } from './weeklyEvents';

const SALIENCE_BY_TYPE: Record<WeeklyEventType, number> = {
  crisis: 72,
  agenda: 48,
  opportunity: 38,
};

function radarEffectHint(type: WeeklyEventType): string {
  switch (type) {
    case 'opportunity':
      return 'Fırsat penceresi: önümüzdeki hafta ek mesaj slotu açılabilir.';
    case 'crisis':
      return 'Kriz sinyali: yanıt yoksa rakip alan kazanır, konu ulusal gündeme taşınabilir.';
    case 'agenda':
      return 'Yükselen konu: aynı eksende mesaj vermezsen rakipler çerçeveyi doldurur.';
  }
}

export function createRadarAgendaFromWeeklyEvent(event: WeeklyEvent): RadarAgendaItem {
  const resolved = resolveEventSegments(event);

  return {
    id: `radar-${event.id}`,
    sourceEventId: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    policyTopic: event.policyTopic,
    salience: SALIENCE_BY_TYPE[event.type],
    primarySegments: resolved.primarySegments,
    effectHint: radarEffectHint(event.type),
  };
}

export function createSubAgendaFromWeeklyEvent(event: WeeklyEvent): SubAgendaItem {
  const resolved = resolveEventSegments(event);

  return buildSubAgendaItemFromResolved(event, resolved);
}

function buildSubAgendaItemFromResolved(
  event: WeeklyEvent,
  resolved: ResolvedEventSegments,
): SubAgendaItem {
  return {
    id: `sub-${event.id}`,
    sourceEventId: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    policyTopic: event.policyTopic,
    primarySegments: resolved.primarySegments,
    tensionSegments: resolved.tensionSegments,
    primaryPoliticalSegments: resolved.primaryPoliticalSegments,
    tensionPoliticalSegments: resolved.tensionPoliticalSegments,
    reactionAxis: resolved.reactionAxis,
    tensionRationale: resolved.tensionRationale,
    politicalRationale: resolved.politicalRationale,
    responseOptions: createSubAgendaResponseOptions(event.id, event.title, resolved),
  };
}

export function enrichSubAgendaWithRivalSegments(
  agenda: SubAgendaItem,
  rivalParties: RivalPartyState[],
): SubAgendaItem {
  const baseResolved: ResolvedEventSegments = {
    reactionAxis: agenda.reactionAxis,
    primarySegments: agenda.primarySegments,
    tensionSegments: agenda.tensionSegments,
    primaryPoliticalSegments: agenda.primaryPoliticalSegments,
    tensionPoliticalSegments: agenda.tensionPoliticalSegments,
    tensionRationale: agenda.tensionRationale,
    politicalRationale: agenda.politicalRationale,
  };

  const sourceEvent = getWeeklyEventById(agenda.sourceEventId);
  let enriched = sourceEvent
    ? enrichWithRivalTarget(sourceEvent, baseResolved, rivalParties)
    : baseResolved;
  enriched = enrichResolvedSegmentsWithRivals(enriched, rivalParties);

  const tensionUnchanged =
    enriched.tensionPoliticalSegments.join(',') === agenda.tensionPoliticalSegments.join(',');
  const rationaleUnchanged =
    enriched.tensionRationale === agenda.tensionRationale &&
    enriched.politicalRationale === agenda.politicalRationale;

  if (tensionUnchanged && rationaleUnchanged) return agenda;

  return {
    ...agenda,
    tensionPoliticalSegments: enriched.tensionPoliticalSegments,
    tensionRationale: enriched.tensionRationale,
    politicalRationale: enriched.politicalRationale,
    responseOptions: createSubAgendaResponseOptions(
      agenda.sourceEventId,
      agenda.title,
      enriched,
    ),
  };
}
