/** Bölgesel gündem kartı üretimi */

import { createSubAgendaFromWeeklyEvent } from './subAgendaFactory';
import type { RegionalEventDefinition } from './regionalEvents';
import type { RegionalAgendaItem, RegionId, WeeklyEvent } from '../types/game';

function toWeeklyEventStub(
  event: RegionalEventDefinition,
  regionId: RegionId,
): WeeklyEvent {
  const copy = event.regionalCopy?.[regionId];

  return {
    id: event.id,
    title: copy?.title ?? event.title,
    description: copy?.description ?? event.description,
    type: event.type,
    affectedCategory: event.affectedCategory,
    affectedSegments: event.affectedSegments ?? [],
    policyTopic: event.policyTopic!,
    recommendedActionIds: event.recommendedActionIds ?? [],
    responseOptions: [],
    outcomes: {
      success: { title: '', description: '', effects: {} },
      partial: { title: '', description: '', effects: {} },
      ignored: { title: '', description: '', effects: {} },
    },
  };
}

export function createRegionalAgendaFromEvent(
  event: RegionalEventDefinition,
  regionId: RegionId,
): RegionalAgendaItem {
  const subAgenda = createSubAgendaFromWeeklyEvent(toWeeklyEventStub(event, regionId));

  return {
    ...subAgenda,
    id: `reg-${regionId}-${event.id}`,
    sourceEventId: event.id,
    regionId,
  };
}
