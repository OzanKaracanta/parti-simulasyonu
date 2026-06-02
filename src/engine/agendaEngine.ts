/** Gündem atama — birincil olay, alt gündemler, radar, zincir olayları */

import { RADAR_AGENDA_MAX, SUB_AGENDA_COUNT } from '../data/subAgendaConfig';
import {
  createRadarAgendaFromWeeklyEvent,
  createSubAgendaFromWeeklyEvent,
  enrichSubAgendaWithPlayerIdeology,
  enrichSubAgendaWithRivalSegments,
} from '../data/subAgendaFactory';
import { createInitialRivalParties } from '../data/rivals';
import { weeklyEvents } from '../data/weeklyEvents';
import { assignRegionalAgendas, type RegionalAgendaAssignmentInput } from './regionalAgendaEngine';
import { removeConsumedRegionalSchedules } from './regionalStoryEngine';
import type {
  GameState,
  RadarAgendaItem,
  RegionalAgendaItem,
  IdeologyId,
  RivalPartyState,
  ScheduledRegionalStoryEvent,
  ScheduledStoryEvent,
  SubAgendaItem,
  WeeklyEvent,
} from '../types/game';

function pickFromPool<T>(
  pool: WeeklyEvent[],
  excludeIds: string[],
  count: number,
  map: (event: WeeklyEvent) => T,
): T[] {
  const filtered = pool.filter((event) => !excludeIds.includes(event.id));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(map);
}

function pickSubAgendas(
  excludeIds: string[],
  rivalParties: RivalPartyState[],
  playerIdeologyId: IdeologyId,
  count = SUB_AGENDA_COUNT,
): SubAgendaItem[] {
  return pickFromPool(weeklyEvents, excludeIds, count, createSubAgendaFromWeeklyEvent)
    .map((agenda) => enrichSubAgendaWithRivalSegments(agenda, rivalParties))
    .map((agenda) => enrichSubAgendaWithPlayerIdeology(agenda, playerIdeologyId));
}

function pickRadarAgendas(excludeIds: string[]): RadarAgendaItem[] {
  const count = Math.floor(Math.random() * (RADAR_AGENDA_MAX + 1));
  if (count === 0) return [];
  return pickFromPool(weeklyEvents, excludeIds, count, createRadarAgendaFromWeeklyEvent);
}

function findScheduledEvent(
  scheduled: ScheduledStoryEvent[],
  week: number,
): ScheduledStoryEvent | undefined {
  return scheduled.find((item) => item.triggerWeek === week);
}

export function pickWeeklyEventExcluding(excludeIds: string[]): WeeklyEvent {
  const candidates = weeklyEvents.filter((event) => !excludeIds.includes(event.id));
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] ?? weeklyEvents[0];
}

export interface WeekAgendaAssignment {
  primaryEvent: WeeklyEvent;
  subAgendas: SubAgendaItem[];
  radarAgendas: RadarAgendaItem[];
  regionalAgendas: RegionalAgendaItem[];
  consumedSchedule: ScheduledStoryEvent | null;
  consumedRegionalScheduled: ScheduledRegionalStoryEvent[];
  storyHint: string;
}

export function assignWeekAgenda(
  campaignWeek: number,
  previousEventId: string | null | undefined,
  scheduledStoryEvents: ScheduledStoryEvent[],
  regionalContext: RegionalAgendaAssignmentInput,
  dueRegionalScheduled: ScheduledRegionalStoryEvent[] = [],
  rivalParties: RivalPartyState[] = [],
  playerIdeologyId: IdeologyId = 'centrist-reform',
): WeekAgendaAssignment {
  const scheduled = findScheduledEvent(scheduledStoryEvents, campaignWeek);
  let primaryEvent: WeeklyEvent;
  let storyHint = '';

  if (scheduled) {
    primaryEvent =
      weeklyEvents.find((event) => event.id === scheduled.eventId) ??
      pickWeeklyEventExcluding(previousEventId ? [previousEventId] : []);
    storyHint = scheduled.reason;
  } else {
    primaryEvent = pickWeeklyEventExcluding(previousEventId ? [previousEventId] : []);
  }

  const subAgendas = pickSubAgendas([primaryEvent.id], rivalParties, playerIdeologyId);
  const usedEventIds = [
    primaryEvent.id,
    ...subAgendas.map((item) => item.sourceEventId),
  ];
  const radarAgendas = pickRadarAgendas(usedEventIds);

  if (radarAgendas.length > 0 && !storyHint) {
    storyHint = `Radar: ${radarAgendas.map((item) => item.title).join(' · ')}`;
  }

  const regionalAssignment = assignRegionalAgendas(
    regionalContext,
    [primaryEvent.id],
    dueRegionalScheduled,
  );

  const regionalAgendas: RegionalAgendaItem[] = regionalAssignment.agendas.map((agenda) => ({
    ...enrichSubAgendaWithPlayerIdeology(
      enrichSubAgendaWithRivalSegments(agenda, rivalParties),
      playerIdeologyId,
    ),
    regionId: agenda.regionId,
  }));

  return {
    primaryEvent,
    subAgendas,
    radarAgendas,
    regionalAgendas,
    consumedSchedule: scheduled ?? null,
    consumedRegionalScheduled: regionalAssignment.consumedScheduled,
    storyHint,
  };
}

export function removeConsumedSchedule(
  scheduled: ScheduledStoryEvent[],
  consumed: ScheduledStoryEvent | null,
): ScheduledStoryEvent[] {
  if (!consumed) return scheduled;
  return scheduled.filter(
    (item) =>
      !(item.eventId === consumed.eventId && item.triggerWeek === consumed.triggerWeek),
  );
}

export function advanceWeekAgenda(state: GameState): GameState {
  const nextWeek = state.campaignWeek + 1;
  const dueRegionalScheduled = state.scheduledRegionalStoryEvents.filter(
    (item) => item.triggerWeek === nextWeek,
  );
  const regionalContext: RegionalAgendaAssignmentInput = {
    homeRegionId: state.party.homeRegionId,
    campaignWeek: nextWeek,
    regions: state.regions,
    organizationToolLevelsByRegion: state.organizationToolLevelsByRegion,
    recentRegionIds: state.regionalAgendaRecentRegionIds,
  };
  const assignment = assignWeekAgenda(
    nextWeek,
    state.currentWeeklyEvent?.id,
    state.scheduledStoryEvents,
    regionalContext,
    dueRegionalScheduled,
    state.rivalParties,
    state.party.ideologyId,
  );

  return {
    ...state,
    currentWeeklyEvent: assignment.primaryEvent,
    subAgendas: assignment.subAgendas,
    radarAgendas: assignment.radarAgendas,
    regionalAgendas: assignment.regionalAgendas,
    regionalAgendaRecentRegionIds: assignment.regionalAgendas.map((agenda) => agenda.regionId),
    selectedSubAgendaSelections: [],
    selectedRegionalAgendaSelections: [],
    scheduledStoryEvents: removeConsumedSchedule(
      state.scheduledStoryEvents,
      assignment.consumedSchedule,
    ),
    scheduledRegionalStoryEvents: removeConsumedRegionalSchedules(
      state.scheduledRegionalStoryEvents,
      assignment.consumedRegionalScheduled,
    ),
  };
}

export function initializeFirstWeekAgenda(
  regionalContext: RegionalAgendaAssignmentInput,
  rivalParties: RivalPartyState[] = createInitialRivalParties(),
  playerIdeologyId: IdeologyId = 'centrist-reform',
): Pick<
  GameState,
  'currentWeeklyEvent' | 'subAgendas' | 'radarAgendas' | 'regionalAgendas' | 'regionalAgendaRecentRegionIds'
> {
  const assignment = assignWeekAgenda(
    1,
    null,
    [],
    regionalContext,
    [],
    rivalParties,
    playerIdeologyId,
  );

  return {
    currentWeeklyEvent: assignment.primaryEvent,
    subAgendas: assignment.subAgendas,
    radarAgendas: assignment.radarAgendas,
    regionalAgendas: assignment.regionalAgendas,
    regionalAgendaRecentRegionIds: assignment.regionalAgendas.map((agenda) => agenda.regionId),
  };
}

export function createEmptyPoliticalState(): Pick<
  GameState,
  | 'rivalParties'
  | 'subAgendas'
  | 'radarAgendas'
  | 'regionalAgendas'
  | 'bonusSubAgendaSlots'
  | 'selectedSubAgendaSelections'
  | 'selectedRegionalAgendaSelections'
  | 'regionalAgendaRecentRegionIds'
  | 'opinionFeed'
  | 'pendingOpinionEchoes'
  | 'scheduledStoryEvents'
  | 'scheduledRegionalStoryEvents'
  | 'storyFlags'
  | 'pendingWeekBacklash'
  | 'activeWeekBacklash'
  | 'activeAdvisorBriefing'
  | 'lastBacklashWeek'
  | 'backlashStoryFlags'
> {
  const firstWeek = initializeFirstWeekAgenda({
    homeRegionId: 'ege',
    campaignWeek: 1,
    regions: [],
    organizationToolLevelsByRegion: {} as GameState['organizationToolLevelsByRegion'],
    recentRegionIds: [],
  });

  return {
    rivalParties: createInitialRivalParties(),
    subAgendas: firstWeek.subAgendas,
    radarAgendas: firstWeek.radarAgendas,
    regionalAgendas: firstWeek.regionalAgendas,
    regionalAgendaRecentRegionIds: firstWeek.regionalAgendaRecentRegionIds,
    bonusSubAgendaSlots: 0,
    selectedSubAgendaSelections: [],
    selectedRegionalAgendaSelections: [],
    opinionFeed: [],
    pendingOpinionEchoes: [],
    scheduledStoryEvents: [],
    scheduledRegionalStoryEvents: [],
    storyFlags: {},
    pendingWeekBacklash: null,
    activeWeekBacklash: null,
    activeAdvisorBriefing: null,
    lastBacklashWeek: 0,
    backlashStoryFlags: {},
  };
}
