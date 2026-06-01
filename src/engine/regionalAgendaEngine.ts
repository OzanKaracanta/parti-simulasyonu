/** Bölgesel gündem atama — Faz 2: ağırlıklı çoklu bölge seçimi */

import {
  getRegionalAgendaCardCount,
  REGIONAL_WEIGHT_HOME,
  REGIONAL_WEIGHT_IL_OFFICE,
  REGIONAL_WEIGHT_LOW_SUPPORT,
  REGIONAL_WEIGHT_LOW_SUPPORT_THRESHOLD,
  REGIONAL_WEIGHT_RECENT_REPEAT,
} from '../data/regionalAgendaConfig';
import { createRegionalAgendaFromEvent } from '../data/regionalAgendaFactory';
import { getRegionalEventById, getRegionalEventsForRegion } from '../data/regionalEvents';
import { ELIGIBILITY_OFFICE_TOOL_ID } from './electionEligibilityEngine';
import { ALL_REGION_IDS } from '../systems/regionOrganization';
import type {
  GameState,
  RegionalAgendaItem,
  RegionId,
  ScheduledRegionalStoryEvent,
} from '../types/game';

export interface RegionalAgendaAssignmentInput {
  homeRegionId: RegionId;
  campaignWeek: number;
  regions: GameState['regions'];
  organizationToolLevelsByRegion: GameState['organizationToolLevelsByRegion'];
  recentRegionIds: RegionId[];
}

export interface RegionalAgendaAssignmentResult {
  agendas: RegionalAgendaItem[];
  assignedRegionIds: RegionId[];
  consumedScheduled: ScheduledRegionalStoryEvent[];
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRegionSupport(state: RegionalAgendaAssignmentInput, regionId: RegionId): number {
  return state.regions.find((region) => region.id === regionId)?.support ?? 0;
}

function hasIlPartyOffice(state: RegionalAgendaAssignmentInput, regionId: RegionId): boolean {
  const levels = state.organizationToolLevelsByRegion[regionId];
  return (levels?.[ELIGIBILITY_OFFICE_TOOL_ID] ?? 0) >= 1;
}

export function scoreRegionForAgenda(
  state: RegionalAgendaAssignmentInput,
  regionId: RegionId,
): number {
  let weight = 1;

  if (regionId === state.homeRegionId) {
    weight *= REGIONAL_WEIGHT_HOME;
  }

  if (hasIlPartyOffice(state, regionId)) {
    weight *= REGIONAL_WEIGHT_IL_OFFICE;
  }

  if (getRegionSupport(state, regionId) < REGIONAL_WEIGHT_LOW_SUPPORT_THRESHOLD) {
    weight *= REGIONAL_WEIGHT_LOW_SUPPORT;
  }

  if (state.recentRegionIds.includes(regionId)) {
    weight *= REGIONAL_WEIGHT_RECENT_REPEAT;
  }

  return weight;
}

function pickWeightedRegions(
  state: RegionalAgendaAssignmentInput,
  count: number,
  excludeRegionIds: RegionId[] = [],
): RegionId[] {
  const eligible = ALL_REGION_IDS.filter(
    (regionId) =>
      !excludeRegionIds.includes(regionId as RegionId) &&
      getRegionalEventsForRegion(regionId as RegionId).length > 0,
  ) as RegionId[];

  if (eligible.length === 0) return [];

  const picked: RegionId[] = [];
  let pool = [...eligible];

  while (picked.length < count && pool.length > 0) {
    const weights = pool.map((regionId) => scoreRegionForAgenda(state, regionId));
    const total = weights.reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * total;

    let chosenIndex = 0;
    for (let index = 0; index < pool.length; index += 1) {
      roll -= weights[index] ?? 0;
      if (roll <= 0) {
        chosenIndex = index;
        break;
      }
    }

    const regionId = pool[chosenIndex]!;
    picked.push(regionId);
    pool = pool.filter((id) => id !== regionId);
  }

  return picked;
}

export function assignRegionalAgendas(
  state: RegionalAgendaAssignmentInput,
  excludeEventIds: string[] = [],
  dueScheduled: ScheduledRegionalStoryEvent[] = [],
): RegionalAgendaAssignmentResult {
  const cardCount = getRegionalAgendaCardCount(state.campaignWeek);
  const agendas: RegionalAgendaItem[] = [];
  const consumedScheduled: ScheduledRegionalStoryEvent[] = [];
  const usedEventIds = new Set(excludeEventIds);
  const usedRegionIds = new Set<RegionId>();

  for (const scheduled of dueScheduled) {
    if (agendas.length >= cardCount) break;
    if (usedRegionIds.has(scheduled.regionId)) continue;

    const event = getRegionalEventById(scheduled.regionalEventId);
    if (!event || !event.regionIds.includes(scheduled.regionId)) continue;
    if (usedEventIds.has(event.id)) continue;

    agendas.push({
      ...createRegionalAgendaFromEvent(event, scheduled.regionId),
      storyHint: scheduled.reason,
    });
    usedEventIds.add(event.id);
    usedRegionIds.add(scheduled.regionId);
    consumedScheduled.push(scheduled);
  }

  const remaining = cardCount - agendas.length;
  if (remaining > 0) {
    const regionIds = pickWeightedRegions(state, remaining, [...usedRegionIds]);

    for (const regionId of regionIds) {
      const pool = getRegionalEventsForRegion(regionId).filter(
        (event) => !usedEventIds.has(event.id),
      );
      if (pool.length === 0) continue;

      const event = shuffle(pool)[0]!;
      usedEventIds.add(event.id);
      agendas.push(createRegionalAgendaFromEvent(event, regionId));
    }
  }

  return {
    agendas,
    assignedRegionIds: agendas.map((agenda) => agenda.regionId),
    consumedScheduled,
  };
}

export function getRegionalAgendaForRegion(
  agendas: RegionalAgendaItem[],
  regionId: RegionId,
): RegionalAgendaItem | undefined {
  return agendas.find((agenda) => agenda.regionId === regionId);
}

export function getRegionalAgendaRegionIds(agendas: RegionalAgendaItem[]): RegionId[] {
  return agendas.map((agenda) => agenda.regionId);
}

export function hasRegionalAgendaForRegion(
  agendas: RegionalAgendaItem[],
  regionId: RegionId,
): boolean {
  return agendas.some((agenda) => agenda.regionId === regionId);
}
