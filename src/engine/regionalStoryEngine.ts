/** Bölgesel hikâye zinciri planlama ve ipuçları */

import { findMatchingRegionalStoryChains } from '../data/regionalEventChains';
import { getRegionalEventById } from '../data/regionalEvents';
import type {
  GameState,
  RegionalAgendaItem,
  ScheduledRegionalStoryEvent,
  SubAgendaSelection,
} from '../types/game';

export function scheduleRegionalStoryFollowUps(
  state: GameState,
  regionalEventId: string,
  regionId: ScheduledRegionalStoryEvent['regionId'],
  responseId: string,
): ScheduledRegionalStoryEvent[] {
  const chains = findMatchingRegionalStoryChains(regionalEventId, responseId);

  return chains
    .filter((chain) => !state.storyFlags[chain.storyFlag])
    .map((chain) => {
      const followUp = getRegionalEventById(chain.followUpRegionalEventId);
      if (!followUp?.regionIds.includes(regionId)) return null;

      return {
        regionalEventId: chain.followUpRegionalEventId,
        regionId,
        triggerWeek: state.campaignWeek + chain.delayWeeks,
        reason: chain.reason,
      };
    })
    .filter((item): item is ScheduledRegionalStoryEvent => item != null);
}

export function updateRegionalStoryFlags(
  flags: Record<string, boolean>,
  regionalEventId: string,
  responseId: string,
): Record<string, boolean> {
  const chains = findMatchingRegionalStoryChains(regionalEventId, responseId);
  const next = { ...flags };

  for (const chain of chains) {
    next[chain.storyFlag] = true;
  }

  return next;
}

export function appendScheduledRegionalEvents(
  state: GameState,
  events: ScheduledRegionalStoryEvent[],
): GameState {
  if (events.length === 0) return state;

  return {
    ...state,
    scheduledRegionalStoryEvents: [...state.scheduledRegionalStoryEvents, ...events],
  };
}

export function removeConsumedRegionalSchedules(
  scheduled: ScheduledRegionalStoryEvent[],
  consumed: ScheduledRegionalStoryEvent[],
): ScheduledRegionalStoryEvent[] {
  if (consumed.length === 0) return scheduled;

  return scheduled.filter(
    (item) =>
      !consumed.some(
        (used) =>
          used.regionalEventId === item.regionalEventId &&
          used.regionId === item.regionId &&
          used.triggerWeek === item.triggerWeek,
      ),
  );
}

export function applyRegionalStoryScheduling(
  state: GameState,
  selections: SubAgendaSelection[],
  regionalAgendas: RegionalAgendaItem[],
): GameState {
  let nextState = state;

  for (const selection of selections) {
    const agenda = regionalAgendas.find((item) => item.id === selection.agendaId);
    if (!agenda) continue;

    const scheduled = scheduleRegionalStoryFollowUps(
      nextState,
      agenda.sourceEventId,
      agenda.regionId,
      selection.responseId,
    );
    nextState = appendScheduledRegionalEvents(nextState, scheduled);
    nextState = {
      ...nextState,
      storyFlags: updateRegionalStoryFlags(
        nextState.storyFlags,
        agenda.sourceEventId,
        selection.responseId,
      ),
    };
  }

  return nextState;
}

export function getUpcomingRegionalStoryHint(state: GameState): string {
  const next = state.scheduledRegionalStoryEvents
    .filter((item) => item.triggerWeek > state.campaignWeek)
    .sort((a, b) => a.triggerWeek - b.triggerWeek)[0];

  return next ? next.reason : '';
}

export function getCombinedUpcomingStoryHint(state: GameState): string {
  const national = state.scheduledStoryEvents
    .filter((item) => item.triggerWeek > state.campaignWeek)
    .sort((a, b) => a.triggerWeek - b.triggerWeek)[0];
  const regional = state.scheduledRegionalStoryEvents
    .filter((item) => item.triggerWeek > state.campaignWeek)
    .sort((a, b) => a.triggerWeek - b.triggerWeek)[0];

  if (!national && !regional) return '';
  if (national && !regional) return national.reason;
  if (!national && regional) return regional.reason;

  return (national!.triggerWeek <= regional!.triggerWeek ? national!.reason : regional!.reason);
}
