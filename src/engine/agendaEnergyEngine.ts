/** Gündem tepkileri — enerji maliyeti seçim anında tahsil edilir */

import { MAX_WEEKLY_AGENDA_ENERGY_SPEND } from '../data/campaignConfig';
import { getEventResponseById } from '../data/eventResponseFactory';
import { resourceLabels } from '../data/labels';
import { getScaledMainEventEnergyCost } from './energyCostUtils';
import { getRegionalAgendaResponse } from './regionalAgendaEvaluation';
import { getSubAgendaResponse } from './subAgendaEvaluation';
import type { GameState, ResourceKey, SubAgendaResponseOption } from '../types/game';

function clampEnergy(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyEnergyDelta(
  resources: Record<ResourceKey, number>,
  delta: number,
): Record<ResourceKey, number> {
  if (delta === 0) return resources;
  return {
    ...resources,
    energy: clampEnergy(resources.energy + delta),
  };
}

export function getMainEventResponseEnergyCost(
  state: GameState,
  responseId: string,
): number {
  if (!state.currentWeeklyEvent) return 0;
  const response = getEventResponseById(
    state.currentWeeklyEvent.responseOptions,
    responseId,
  );
  return getScaledMainEventEnergyCost(response?.effects?.resources?.energy);
}

export function getSubAgendaOptionEnergyCost(option: SubAgendaResponseOption): number {
  return option.energyCost;
}

export function sumCommittedAgendaEnergy(state: GameState): number {
  let total = 0;

  if (state.selectedEventResponseId) {
    total += getMainEventResponseEnergyCost(state, state.selectedEventResponseId);
  }

  for (const selection of state.selectedSubAgendaSelections) {
    const resolved = getSubAgendaResponse(state, selection.agendaId, selection.responseId);
    if (resolved) total += resolved.response.energyCost;
  }

  for (const selection of state.selectedRegionalAgendaSelections) {
    const resolved = getRegionalAgendaResponse(
      state,
      selection.agendaId,
      selection.responseId,
    );
    if (resolved) total += resolved.response.energyCost;
  }

  return total;
}

export function getProjectedAgendaEnergySpend(
  state: GameState,
  oldCost: number,
  newCost: number,
): number {
  return sumCommittedAgendaEnergy(state) - oldCost + newCost;
}

export function exceedsAgendaEnergyCap(projectedSpend: number): boolean {
  return projectedSpend > MAX_WEEKLY_AGENDA_ENERGY_SPEND;
}

export function getAgendaEnergyCapDisabledReason(projectedSpend: number): string | null {
  if (!exceedsAgendaEnergyCap(projectedSpend)) return null;
  return `Haftalık gündem enerjisi dolu (${projectedSpend}/${MAX_WEEKLY_AGENDA_ENERGY_SPEND} ⚡)`;
}

export function canAffordEnergyDelta(state: GameState, additionalCost: number): boolean {
  if (additionalCost <= 0) return true;
  return state.resources.energy >= additionalCost;
}

export function getAgendaEnergyDisabledReason(
  state: GameState,
  additionalCost: number,
  projectedAgendaSpend?: number,
): string | null {
  const capReason =
    projectedAgendaSpend !== undefined
      ? getAgendaEnergyCapDisabledReason(projectedAgendaSpend)
      : null;
  if (capReason) return capReason;
  if (additionalCost <= 0) return null;
  if (canAffordEnergyDelta(state, additionalCost)) return null;
  return `Yetersiz ${resourceLabels.energy.toLowerCase()} (${state.resources.energy}/${additionalCost})`;
}

export function canSelectMainEventResponse(state: GameState, responseId: string): boolean {
  const newCost = getMainEventResponseEnergyCost(state, responseId);
  const oldCost = state.selectedEventResponseId
    ? getMainEventResponseEnergyCost(state, state.selectedEventResponseId)
    : 0;
  const projected = getProjectedAgendaEnergySpend(state, oldCost, newCost);
  return (
    canAffordEnergyDelta(state, newCost - oldCost) && !exceedsAgendaEnergyCap(projected)
  );
}

export function canSelectSubAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
): boolean {
  const resolved = getSubAgendaResponse(state, agendaId, responseId);
  if (!resolved) return false;

  const newCost = resolved.response.energyCost;
  const existing = state.selectedSubAgendaSelections.find((item) => item.agendaId === agendaId);
  const oldCost = existing
    ? getSubAgendaResponse(state, agendaId, existing.responseId)?.response.energyCost ?? 0
    : 0;
  const projected = getProjectedAgendaEnergySpend(state, oldCost, newCost);

  return (
    canAffordEnergyDelta(state, newCost - oldCost) && !exceedsAgendaEnergyCap(projected)
  );
}

export function canSelectRegionalAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
): boolean {
  const resolved = getRegionalAgendaResponse(state, agendaId, responseId);
  if (!resolved) return false;

  const newCost = resolved.response.energyCost;
  const existing = state.selectedRegionalAgendaSelections.find(
    (item) => item.agendaId === agendaId,
  );
  const oldCost = existing
    ? getRegionalAgendaResponse(state, agendaId, existing.responseId)?.response.energyCost ?? 0
    : 0;
  const projected = getProjectedAgendaEnergySpend(state, oldCost, newCost);

  return (
    canAffordEnergyDelta(state, newCost - oldCost) && !exceedsAgendaEnergyCap(projected)
  );
}

/** Hafta sonu uygulamasında enerji tekrar düşülmesin */
export function stripEnergyFromOutcomeEffects<
  T extends { resources?: Partial<Record<ResourceKey, number>> },
>(effects: T): T {
  if (!effects.resources?.energy) return effects;

  const { energy: _removed, ...restResources } = effects.resources;
  const hasOtherResources = Object.values(restResources).some(
    (value) => value !== undefined && value !== 0,
  );

  return {
    ...effects,
    resources: hasOtherResources ? restResources : undefined,
  };
}
