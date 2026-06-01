/** Saf oyun mantığı — React'tan bağımsız hesaplamalar */

import { WEEKLY_ENERGY_REGEN, WEEKLY_VOLUNTEER_REGEN } from '../data/campaignConfig';
import { resourceLabels } from '../data/labels';
import { getActionUnlockReason, getActionUnlockReasonForRegion, isActionUnlocked, isActionUnlockedInRegion } from '../systems/actionUnlockSystem';
import { isRegionalAction } from '../data/regionalActions';
import type {
  CampaignAction,
  GameState,
  MetricKey,
  OpinionEchoItem,
  RegionId,
  ResourceKey,
  WeekBacklashItem,
} from '../types/game';
import { calculateFinalResult } from './campaignSummaryEngine';
import {
  computeActionSegmentEffects,
  resolveActionForState,
} from './actionSynergyEngine';
import {
  canAffordOrganizationLoad,
  getOrganizationLoadForAction,
  getSelectedOrganizationLoad,
} from './organizationLoadEngine';
import { resolveActionWithWeeklyEvent } from './eventEngine';
import { applyRegionalActionRegionEffects, getRegionalActionCost } from './regionalActionEngine';
import { applySegmentEffects } from './segmentEngine';
import { evaluateAndApplyEventResponse } from './eventEvaluation';
import { getEventResponseById } from '../data/eventResponseFactory';
import { buildPoliticalReactionTextFromEvent } from './politicalReactionText';
import { resolveEventSegmentsForWeek } from './resolveEventSegments';
import { evaluateAndApplySubAgendaResponses, getSubAgendaResponse } from './subAgendaEvaluation';
import { evaluateAndApplyRegionalAgendaResponses } from './regionalAgendaEvaluation';
import { applyRegionalStoryScheduling } from './regionalStoryEngine';
import { getRegionalAgendaMaxSlots } from '../data/regionalAgendaConfig';
import { canRespondToRegionalAgenda, getRegionalAgendaAccessReason } from './regionalAgendaAccess';
import { getEffectiveSubAgendaMaxSlots } from './subAgendaSlots';
import { buildWeeklyHistoryItem } from './weeklyReport';
import {
  buildWeekBacklashContext,
  revealPendingWeekBacklash,
  scheduleWeekBacklash,
} from './backlashEngine';
import { resolveOrganizationWeekEffects } from '../systems/weekResolutionSystem';
import {
  applySympathizerDonation,
} from './sympathizerDonation';
import {
  calculateNationalSupportFromSegments,
  syncRegionsWithSegments,
  applyWeeklySegmentBaselineRecovery,
  applyCampaignMomentumBonus,
} from './segmentEngine';
import { consistencySupportModifier } from './stanceEngine';
import {
  buildPoliticalSegmentReactions,
  calculatePoliticalSupportModifier,
  computePoliticalSegmentDiff,
  ensurePoliticalSegmentSupport,
} from './politicalSegmentEngine';
import { computeSegmentDiff } from './segmentEngine';
import {
  advanceWeekWithPolitics,
  resolveWeeklyPoliticsAfterResponse,
} from './politicalWeekEngine';

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return clamp(value, 0, max);
}

export function adjustResourcesByActionCost(
  resources: Record<ResourceKey, number>,
  action: CampaignAction,
  event: GameState['currentWeeklyEvent'],
  direction: 'charge' | 'refund',
  regionalCost?: Partial<Record<ResourceKey, number>>,
): Record<ResourceKey, number> {
  const cost =
    regionalCost ??
    resolveActionWithWeeklyEvent(event, action).resolved.cost;
  const next = { ...resources };
  const sign = direction === 'charge' ? -1 : 1;

  for (const [key, value] of Object.entries(cost)) {
    const resourceKey = key as ResourceKey;
    if (resourceKey === 'organizationCapacity') continue;
    next[resourceKey] = clampResource(next[resourceKey] + sign * (value ?? 0), resourceKey);
  }

  return next;
}

export function refundSelectedActionCosts(state: GameState): Record<ResourceKey, number> {
  let resources = { ...state.resources };

  for (const actionId of state.selectedActionIds) {
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;
    resources = adjustResourcesByActionCost(
      resources,
      action,
      state.currentWeeklyEvent,
      'refund',
    );
  }

  return resources;
}

export function canAffordAction(
  state: GameState,
  action: CampaignAction,
  regionId?: RegionId,
): boolean {
  const cost =
    isRegionalAction(action.id) && regionId
      ? getRegionalActionCost(state, action, regionId)
      : resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action).resolved.cost;

  const canAffordResources = Object.entries(cost).every(([key, value]) => {
    const resourceKey = key as ResourceKey;
    if (resourceKey === 'organizationCapacity') return true;
    return state.resources[resourceKey] >= (value ?? 0);
  });

  return canAffordResources && canAffordOrganizationLoad(state, action);
}

export function getActionDisabledReason(
  state: GameState,
  action: CampaignAction,
  regionId?: RegionId,
): string | null {
  if (state.selectedActionIds.includes(action.id)) return null;

  const unlockReason = regionId
    ? getActionUnlockReasonForRegion(state, action, regionId)
    : getActionUnlockReason(state, action);
  if (unlockReason) return unlockReason;

  const cost =
    regionId && isRegionalAction(action.id)
      ? getRegionalActionCost(state, action, regionId)
      : resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action).resolved.cost;

  const missingResources = Object.entries(cost)
    .filter(([key, cost]) => {
      const resourceKey = key as ResourceKey;
      if (resourceKey === 'organizationCapacity') return false;
      return state.resources[resourceKey] < (cost ?? 0);
    })
    .map(([key, cost]) => {
      const resourceKey = key as ResourceKey;
      const have = state.resources[resourceKey];
      return `${resourceLabels[resourceKey]} (${have}/${cost})`;
    });

  if (missingResources.length > 0) {
    return `Yetersiz kaynak: ${missingResources.join(', ')}`;
  }

  const load = getOrganizationLoadForAction(state, action);
  if (load > 0 && !canAffordOrganizationLoad(state, action)) {
    const used = getSelectedOrganizationLoad(state);
    const capacity = state.resources.organizationCapacity;
    return `Örgüt kapasitesi dolu (${used + load}/${capacity} yük)`;
  }

  return null;
}

/** Geri alınan örgüt değişikliği sonrası artık kilitli aksiyonları plandan çıkarır. */
export function pruneSelectedActionsToUnlocked(state: GameState): GameState {
  let nextState = state;

  for (const actionId of state.selectedActionIds) {
    if (!isActionUnlocked(nextState, actionId)) {
      nextState = unselectAction(nextState, actionId);
    }
  }

  return nextState;
}

export function selectAction(
  state: GameState,
  actionId: string,
  regionId?: RegionId,
): GameState | null {
  if (state.selectedActionIds.includes(actionId)) return state;

  const action = state.availableActions.find((item) => item.id === actionId);
  if (!action) return null;

  if (isRegionalAction(actionId)) {
    if (!regionId) return null;
    if (!isActionUnlockedInRegion(state, actionId, regionId)) return null;
  } else if (!isActionUnlocked(state, actionId)) {
    return null;
  }

  if (!canAffordAction(state, action, regionId)) return null;

  const regionalCost =
    regionId && isRegionalAction(action.id)
      ? getRegionalActionCost(state, action, regionId)
      : undefined;

  const nextTargets = { ...state.selectedActionTargets };
  if (regionId) {
    nextTargets[actionId] = regionId;
  }

  return {
    ...state,
    selectedActionIds: [...state.selectedActionIds, actionId],
    selectedActionTargets: nextTargets,
    resources: adjustResourcesByActionCost(
      state.resources,
      action,
      state.currentWeeklyEvent,
      'charge',
      regionalCost,
    ),
  };
}

export function unselectAction(state: GameState, actionId: string): GameState {
  if (!state.selectedActionIds.includes(actionId)) return state;

  const action = state.availableActions.find((item) => item.id === actionId);
  const nextTargets = { ...state.selectedActionTargets };
  delete nextTargets[actionId];

  if (!action) {
    return {
      ...state,
      selectedActionIds: state.selectedActionIds.filter((id) => id !== actionId),
      selectedActionTargets: nextTargets,
    };
  }

  const regionalCost =
    state.selectedActionTargets[actionId] && isRegionalAction(actionId)
      ? getRegionalActionCost(state, action, state.selectedActionTargets[actionId]!)
      : undefined;

  return {
    ...state,
    selectedActionIds: state.selectedActionIds.filter((id) => id !== actionId),
    selectedActionTargets: nextTargets,
    resources: adjustResourcesByActionCost(
      state.resources,
      action,
      state.currentWeeklyEvent,
      'refund',
      regionalCost,
    ),
  };
}

export function calculateNationalSupport(state: GameState): number {
  const base = calculateNationalSupportFromSegments(state.segmentSupport, state.metrics);
  const consistencyMod = consistencySupportModifier(state.messageConsistency);
  const politicalMod = calculatePoliticalSupportModifier(state.politicalSegmentSupport);
  return Math.max(
    0,
    Math.min(60, Math.round((base + consistencyMod + politicalMod) * 10) / 10),
  );
}

export function selectEventResponse(state: GameState, responseId: string): GameState | null {
  if (!state.currentWeeklyEvent) return null;

  const isValid = state.currentWeeklyEvent.responseOptions.some(
    (option) => option.id === responseId,
  );
  if (!isValid) return null;

  return {
    ...state,
    selectedEventResponseId: responseId,
  };
}

export function selectSubAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
): GameState | null {
  const agenda = state.subAgendas.find((item) => item.id === agendaId);
  if (!agenda) return null;

  const isValid = agenda.responseOptions.some((option) => option.id === responseId);
  if (!isValid) return null;

  const selections = [...state.selectedSubAgendaSelections];
  const existingIndex = selections.findIndex((item) => item.agendaId === agendaId);

  if (existingIndex >= 0) {
    if (selections[existingIndex].responseId === responseId) {
      selections.splice(existingIndex, 1);
    } else {
      selections[existingIndex] = { agendaId, responseId };
    }
    return { ...state, selectedSubAgendaSelections: selections };
  }

  if (selections.length >= getEffectiveSubAgendaMaxSlots(state)) {
    return null;
  }

  return {
    ...state,
    selectedSubAgendaSelections: [...selections, { agendaId, responseId }],
  };
}

export function clearSubAgendaResponse(state: GameState, agendaId?: string): GameState {
  if (!agendaId) {
    return { ...state, selectedSubAgendaSelections: [] };
  }

  return {
    ...state,
    selectedSubAgendaSelections: state.selectedSubAgendaSelections.filter(
      (item) => item.agendaId !== agendaId,
    ),
  };
}

export function selectRegionalAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
): GameState | null {
  const agenda = state.regionalAgendas.find((item) => item.id === agendaId);
  if (!agenda) return null;

  if (!canRespondToRegionalAgenda(state, agenda.regionId)) return null;

  const isValid = agenda.responseOptions.some((option) => option.id === responseId);
  if (!isValid) return null;

  const selections = [...state.selectedRegionalAgendaSelections];
  const existingIndex = selections.findIndex((item) => item.agendaId === agendaId);

  if (existingIndex >= 0) {
    if (selections[existingIndex].responseId === responseId) {
      selections.splice(existingIndex, 1);
    } else {
      selections[existingIndex] = { agendaId, responseId };
    }
    return { ...state, selectedRegionalAgendaSelections: selections };
  }

  if (selections.length >= getRegionalAgendaMaxSlots(state.campaignWeek)) {
    return null;
  }

  return {
    ...state,
    selectedRegionalAgendaSelections: [...selections, { agendaId, responseId }],
  };
}

export function clearRegionalAgendaResponse(state: GameState, agendaId?: string): GameState {
  if (!agendaId) {
    return { ...state, selectedRegionalAgendaSelections: [] };
  }

  return {
    ...state,
    selectedRegionalAgendaSelections: state.selectedRegionalAgendaSelections.filter(
      (item) => item.agendaId !== agendaId,
    ),
  };
}

export { getRegionalAgendaAccessReason };

export function applyActionEffects(
  state: GameState,
  actions: CampaignAction[],
): { state: GameState; synergyLines: string[] } {
  const nextResources = { ...state.resources };
  const nextMetrics = { ...state.metrics };
  let segmentSupport = { ...state.segmentSupport };
  const synergyLines: string[] = [];

  for (const baseAction of actions) {
    const context = resolveActionForState(state, baseAction);
    const action = context.resolved;

    for (const [key, effect] of Object.entries(action.effects)) {
      const metricKey = key as MetricKey;
      nextMetrics[metricKey] = clamp(nextMetrics[metricKey] + (effect ?? 0));
    }

    if (action.gains) {
      for (const [key, gain] of Object.entries(action.gains)) {
        const resourceKey = key as ResourceKey;
        nextResources[resourceKey] = clampResource(nextResources[resourceKey] + (gain ?? 0), resourceKey);
      }
    }

    const segmentEffects = computeActionSegmentEffects(
      state,
      baseAction,
      context.synergyLevel,
    );
    segmentSupport = applySegmentEffects(segmentSupport, segmentEffects);

    if (context.synergyLabel && context.synergyLevel !== 'neutral') {
      synergyLines.push(`${baseAction.name}: ${context.synergyLabel}`);
    }
  }

  return {
    synergyLines,
    state: {
      ...state,
      segmentSupport,
      resources: {
        ...nextResources,
        energy: clamp(nextResources.energy + WEEKLY_ENERGY_REGEN, 0, 100),
        volunteers: clampResource(
          nextResources.volunteers + WEEKLY_VOLUNTEER_REGEN,
          'volunteers',
        ),
      },
      metrics: nextMetrics,
    },
  };
}

export function finishWeek(state: GameState): GameState {
  const weekState = ensurePoliticalSegmentSupport(
    state.activeWeekBacklash !== null
      ? { ...state, activeWeekBacklash: null }
      : state,
  );

  const selectedActions = weekState.availableActions.filter((action) =>
    weekState.selectedActionIds.includes(action.id),
  );
  const supportBefore = weekState.nationalSupport;
  const segmentBefore = { ...weekState.segmentSupport };
  const politicalBefore = { ...weekState.politicalSegmentSupport };
  const actionResult = applyActionEffects(weekState, selectedActions);
  let appliedState = applyRegionalActionRegionEffects(actionResult.state, selectedActions);
  const eventEvaluation = evaluateAndApplyEventResponse(appliedState);
  appliedState = eventEvaluation.state;

  const subAgendaEvaluation = evaluateAndApplySubAgendaResponses(appliedState);
  appliedState = subAgendaEvaluation.state;

  const regionalAgendaEvaluation = evaluateAndApplyRegionalAgendaResponses(appliedState);
  appliedState = regionalAgendaEvaluation.state;

  appliedState = applyRegionalStoryScheduling(
    appliedState,
    weekState.selectedRegionalAgendaSelections,
    weekState.regionalAgendas,
  );

  const politics = resolveWeeklyPoliticsAfterResponse(appliedState, eventEvaluation.evaluation);
  appliedState = politics.state;

  const organizationWeek = resolveOrganizationWeekEffects(appliedState);
  appliedState = organizationWeek.state;

  const sympathizerLeaderTrust = weekState.metrics.leaderTrust;
  const sympathizer = applySympathizerDonation(appliedState, sympathizerLeaderTrust);
  appliedState = sympathizer.state;

  const recoveredSegments = applyWeeklySegmentBaselineRecovery(
    appliedState.segmentSupport,
    appliedState.metrics,
    appliedState.party.ideologyId,
  );

  let weeklyBoldMoves = 0;
  if (weekState.currentWeeklyEvent && weekState.selectedEventResponseId) {
    const mainResponse = getEventResponseById(
      weekState.currentWeeklyEvent.responseOptions,
      weekState.selectedEventResponseId,
    );
    if (mainResponse?.tone === 'bold') weeklyBoldMoves += 1;
  }
  for (const selection of weekState.selectedSubAgendaSelections) {
    const resolved = getSubAgendaResponse(
      weekState,
      selection.agendaId,
      selection.responseId,
    );
    if (resolved?.response.tone === 'bold') weeklyBoldMoves += 1;
  }

  const momentumSegments = applyCampaignMomentumBonus(
    recoveredSegments,
    appliedState.messageConsistency,
    appliedState.party.ideologyId,
    weeklyBoldMoves,
  );

  appliedState = {
    ...appliedState,
    segmentSupport: momentumSegments,
    regions: syncRegionsWithSegments(
      appliedState.regions,
      momentumSegments,
      appliedState.party.homeRegionId,
    ),
  };

  const supportAfter = calculateNationalSupport(appliedState);
  const isFinalWeek = weekState.campaignWeek >= weekState.maxWeeks;
  const backlashContext = buildWeekBacklashContext(
    weekState,
    eventEvaluation.evaluation,
    politics.rivalMoves,
  );

  let nextState: GameState = {
    ...appliedState,
    campaignWeek: isFinalWeek ? weekState.campaignWeek : weekState.campaignWeek + 1,
    selectedActionIds: [],
    selectedActionTargets: {},
    selectedEventResponseId: null,
    selectedSubAgendaSelections: [],
    selectedRegionalAgendaSelections: [],
    organizationRevertStack: [],
    nationalSupport: supportAfter,
    history: weekState.history,
    currentWeeklyEvent: isFinalWeek ? weekState.currentWeeklyEvent : null,
    activeWeekBacklash: null,
  };

  let transitionEchoes: OpinionEchoItem[] = [];
  let weekBacklashItem: WeekBacklashItem | null = null;

  if (!isFinalWeek) {
    nextState = scheduleWeekBacklash(nextState, backlashContext);

    const advanced = advanceWeekWithPolitics(nextState);
    nextState = {
      ...advanced.state,
      bonusSubAgendaSlots: politics.bonusSlotsNextWeek,
    };
    transitionEchoes = advanced.opinionEchoes;

    const backlashReveal = revealPendingWeekBacklash(nextState);
    nextState = backlashReveal.state;
    weekBacklashItem = backlashReveal.item;

    if (transitionEchoes.length > 0 || weekBacklashItem) {
      nextState = {
        ...nextState,
        nationalSupport: calculateNationalSupport(nextState),
        regions: syncRegionsWithSegments(
          nextState.regions,
          nextState.segmentSupport,
          nextState.party.homeRegionId,
        ),
      };
    }
  }

  const totalPoliticalChanges = computePoliticalSegmentDiff(
    politicalBefore,
    appliedState.politicalSegmentSupport,
  );
  const totalPoliticalReactions = buildPoliticalSegmentReactions(totalPoliticalChanges);
  const totalSegmentChanges = computeSegmentDiff(segmentBefore, appliedState.segmentSupport);

  const mainEvent = weekState.currentWeeklyEvent;
  const mainEventResponse =
    mainEvent && weekState.selectedEventResponseId
      ? getEventResponseById(mainEvent.responseOptions, weekState.selectedEventResponseId)
      : null;
  const mainEventPoliticalReactionText =
    mainEvent && mainEventResponse
      ? buildPoliticalReactionTextFromEvent(
          resolveEventSegmentsForWeek(mainEvent, weekState.rivalParties),
          mainEventResponse.tone,
        )
      : undefined;

  const weeklyReport = buildWeeklyHistoryItem(
    { ...weekState, resources: refundSelectedActionCosts(weekState) },
    appliedState,
    selectedActions.map((action) => action.name),
    supportBefore,
    isFinalWeek ? supportAfter : nextState.nationalSupport,
    eventEvaluation.evaluation,
    organizationWeek.productionLines,
    sympathizer.amount,
    sympathizer.leaderTrust,
    actionResult.synergyLines,
    organizationWeek.segmentReachLines,
    {
      rivalMoves: politics.rivalMoves,
      opinionEchoes: transitionEchoes,
      backgroundAgendaTitles: weekState.subAgendas.map((item) => item.title),
      subAgendaOutcomes: subAgendaEvaluation.evaluation.outcomes,
      subAgendaCrossRuleLines: subAgendaEvaluation.evaluation.crossRuleLines,
      subAgendaSlotsUsed: subAgendaEvaluation.evaluation.outcomes.length,
      subAgendaSlotsMax: getEffectiveSubAgendaMaxSlots(weekState),
      subAgendaBonusSlots: weekState.bonusSubAgendaSlots,
      radarAgendaTitles: weekState.radarAgendas.map((item) => item.title),
      radarEffectLines: politics.radarEffectLines,
      regionalAgendaOutcomes: regionalAgendaEvaluation.evaluation.outcomes,
      upcomingStoryHint: politics.upcomingStoryHint,
      weekBacklash: weekBacklashItem,
      mainEventPoliticalReactionText,
      mainEventPoliticalReactions: eventEvaluation.evaluation?.politicalSegmentReactions ?? [],
      totalSegmentChanges,
      politicalSegmentChanges: totalPoliticalChanges,
      politicalSegmentReactions: totalPoliticalReactions,
    },
  );

  nextState = {
    ...nextState,
    nationalSupport: isFinalWeek ? supportAfter : nextState.nationalSupport,
    history: [...weekState.history, weeklyReport],
  };

  if (isFinalWeek) {
    return {
      ...nextState,
      status: 'finished',
      finalResult: calculateFinalResult(nextState),
    };
  }

  return nextState;
}
