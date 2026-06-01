/** Headless bot — haftalık karar verme stratejileri */

import { getRegionalAgendaMaxSlots } from '../data/regionalAgendaConfig';
import { isRegionalAction } from '../data/regionalActions';
import {
  canAffordAction,
  finishWeek,
  selectAction,
  selectEventResponse,
  selectRegionalAgendaResponse,
  selectSubAgendaResponse,
} from '../engine/gameEngine';
import { canRespondToRegionalAgenda } from '../engine/regionalAgendaAccess';
import { getEffectiveSubAgendaMaxSlots } from '../engine/subAgendaSlots';
import { isActionUnlocked, isActionUnlockedInRegion } from '../systems/actionUnlockSystem';
import type { GameState, RegionId, ResponseTone, WeeklyEventType } from '../types/game';
import { pickRandom, shuffleWithRng, type SeededRng } from './seededRandom';

export type BotStrategyId = 'passive' | 'balanced' | 'aggressive' | 'opportunist' | 'random';

function pickResponseByTone<T extends { id: string; tone: ResponseTone }>(
  options: readonly T[],
  tone: ResponseTone,
  rng: SeededRng,
): T | null {
  const matching = options.filter((option) => option.tone === tone);
  return pickRandom(matching.length > 0 ? matching : options, rng);
}

function resolveMainTone(
  strategy: BotStrategyId,
  rng: SeededRng,
  eventType?: WeeklyEventType,
): ResponseTone {
  switch (strategy) {
    case 'passive':
      // Ana gündem zorunlu — pasif oyuncu da ölçülü yanıt verir, alt/saha pasif kalır
      return rng() < 0.9 ? 'measured' : 'passive';
    case 'aggressive':
      if (eventType === 'opportunity') return 'bold';
      if (eventType === 'crisis') return rng() < 0.5 ? 'measured' : 'bold';
      return rng() < 0.7 ? 'bold' : 'measured';
    case 'opportunist':
      return rng() < 0.55 ? 'bold' : 'measured';
    case 'random':
      return rng() < 0.55 ? 'measured' : pickRandom(['passive', 'bold'] as const, rng) ?? 'measured';
    case 'balanced':
    default:
      return 'measured';
  }
}

function resolveSubTone(strategy: BotStrategyId, rng: SeededRng): ResponseTone {
  switch (strategy) {
    case 'passive':
      return rng() < 0.7 ? 'passive' : 'measured';
    case 'aggressive':
      return rng() < 0.65 ? 'bold' : 'measured';
    case 'opportunist':
      return rng() < 0.45 ? 'bold' : 'measured';
    case 'random':
      return pickRandom(['passive', 'measured', 'bold'] as const, rng) ?? 'measured';
    case 'balanced':
    default:
      return 'measured';
  }
}

function resolveSubCount(strategy: BotStrategyId, maxSlots: number, rng: SeededRng): number {
  if (maxSlots <= 0) return 0;

  switch (strategy) {
    case 'passive':
      return rng() < 0.55 ? 1 : 0;
    case 'balanced':
      return Math.min(maxSlots, rng() < 0.75 ? 1 : 2);
    case 'aggressive':
      return maxSlots;
    case 'opportunist':
      return Math.min(maxSlots, 1 + Math.floor(rng() * 2));
    case 'random':
      return Math.floor(rng() * (maxSlots + 1));
    default:
      return 1;
  }
}

function resolveActionTargetCount(strategy: BotStrategyId, rng: SeededRng): number {
  switch (strategy) {
    case 'passive':
      return rng() < 0.25 ? 1 : 0;
    case 'balanced':
      return rng() < 0.8 ? 1 : 2;
    case 'aggressive':
      return rng() < 0.35 ? 2 : 3;
    case 'opportunist':
      return rng() < 0.5 ? 1 : 2;
    case 'random':
      return Math.floor(rng() * 4);
    default:
      return 1;
  }
}

function pickRegionalRegionId(
  state: GameState,
  actionId: string,
  rng: SeededRng,
): RegionId | undefined {
  const unlocked = state.regions
    .filter((region) => isActionUnlockedInRegion(state, actionId, region.id as RegionId))
    .map((region) => region.id as RegionId);

  if (unlocked.length === 0) return undefined;

  const home = unlocked.find((regionId) => regionId === state.party.homeRegionId);
  if (home && rng() < 0.7) return home;

  return pickRandom(unlocked, rng) ?? home;
}

function applyBotActions(state: GameState, strategy: BotStrategyId, rng: SeededRng): GameState {
  let nextState = state;
  const targetCount = resolveActionTargetCount(strategy, rng);
  const candidates = shuffleWithRng(nextState.availableActions, rng);

  for (const action of candidates) {
    if (nextState.selectedActionIds.length >= targetCount) break;
    if (nextState.selectedActionIds.includes(action.id)) continue;

    if (isRegionalAction(action.id)) {
      const regionId = pickRegionalRegionId(nextState, action.id, rng);
      if (!regionId || !isActionUnlockedInRegion(nextState, action.id, regionId)) continue;
      if (!canAffordAction(nextState, action, regionId)) continue;

      const applied = selectAction(nextState, action.id, regionId);
      if (applied) nextState = applied;
      continue;
    }

    if (!isActionUnlocked(nextState, action.id)) continue;
    if (!canAffordAction(nextState, action)) continue;

    const applied = selectAction(nextState, action.id);
    if (applied) nextState = applied;
  }

  return nextState;
}

export function playBotWeek(
  state: GameState,
  strategy: BotStrategyId,
  rng: SeededRng,
): GameState {
  let nextState = state;

  if (nextState.currentWeeklyEvent) {
    const response = pickResponseByTone(
      nextState.currentWeeklyEvent.responseOptions,
      resolveMainTone(strategy, rng, nextState.currentWeeklyEvent.type),
      rng,
    );

    if (response) {
      const applied = selectEventResponse(nextState, response.id);
      if (applied) nextState = applied;
    }
  }

  const subTone = resolveSubTone(strategy, rng);
  const subCount = resolveSubCount(strategy, getEffectiveSubAgendaMaxSlots(nextState), rng);
  const subAgendas = shuffleWithRng(nextState.subAgendas, rng);

  for (const [index, agenda] of subAgendas.slice(0, subCount).entries()) {
    const tone =
      strategy === 'aggressive' && index >= 2 ? 'measured' : subTone;
    const response = pickResponseByTone(agenda.responseOptions, tone, rng);
    if (!response) continue;

    const applied = selectSubAgendaResponse(nextState, agenda.id, response.id);
    if (applied) nextState = applied;
  }

  const regionalMax = getRegionalAgendaMaxSlots(nextState.campaignWeek);
  const regionalCount =
    strategy === 'passive'
      ? 0
      : strategy === 'aggressive'
        ? regionalMax
        : Math.min(regionalMax, strategy === 'random' ? Math.floor(rng() * (regionalMax + 1)) : 1);

  const regionalAgendas = shuffleWithRng(nextState.regionalAgendas, rng);

  for (const agenda of regionalAgendas.slice(0, regionalCount)) {
    if (!canRespondToRegionalAgenda(nextState, agenda.regionId)) continue;

    const response = pickResponseByTone(agenda.responseOptions, resolveSubTone(strategy, rng), rng);
    if (!response) continue;

    const applied = selectRegionalAgendaResponse(nextState, agenda.id, response.id);
    if (applied) nextState = applied;
  }

  nextState = applyBotActions(nextState, strategy, rng);

  if (nextState.currentWeeklyEvent && !nextState.selectedEventResponseId) {
    const fallback = nextState.currentWeeklyEvent.responseOptions[0];
    if (fallback) {
      const applied = selectEventResponse(nextState, fallback.id);
      if (applied) nextState = applied;
    }
  }

  return finishWeek(nextState);
}
