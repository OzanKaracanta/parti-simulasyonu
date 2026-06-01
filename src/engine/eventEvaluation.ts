/** Haftalık olay tepkisi — uyum, tutarlılık ve segment etkileri */

import { scaleWeeklyEventOutcomeEffects } from '../data/campaignConfig';
import { getEventResponseById } from '../data/eventResponseFactory';
import { segmentLabels } from '../data/segments';
import {
  buildPoliticalEffectsForTone,
  mergePoliticalSegmentEffects,
} from './politicalReactionText';
import {
  enrichResolvedForPlayerContext,
  filterSocioSegmentEffectsByAxis,
  getPoliticalAgendaScale,
  resolveEffectiveReactionAxis,
} from './reactionAxisEngine';
import { modulatePoliticalEffectsForPlayerIdeology } from './playerIdeologyPoliticalEngine';
import { resolveEventSegmentsForWeek } from './resolveEventSegments';
import {
  applyPoliticalSegmentEffects,
  buildPoliticalSegmentReactions,
  computePoliticalSegmentDiff,
  scalePoliticalEffects,
} from './politicalSegmentEngine';
import {
  applySegmentEffects,
  buildSegmentReactions,
  computeSegmentDiff,
} from './segmentEngine';
import {
  applyStanceAndConsistencyUpdate,
  computeAlignmentMultiplier,
  evaluateResponseAlignment,
  getConsistencyMetricEffects,
  mergeOutcomeEffects,
  scaleSegmentEffectsByMultiplier,
} from './stanceEngine';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import { stripEnergyFromOutcomeEffects } from './agendaEnergyEngine';
import type {
  EventResponseLevel,
  GameState,
  MetricKey,
  ResourceKey,
  ResponseAlignmentFeedback,
  SegmentId,
  WeeklyEvent,
  WeeklyEventOutcomeDefinition,
  WeeklyEventOutcomeEffects,
} from '../types/game';

export interface EventEvaluationResult {
  eventTitle: string;
  eventType: WeeklyEvent['type'];
  responseLevel: EventResponseLevel;
  outcome: WeeklyEventOutcomeDefinition;
  selectedResponseLabel: string;
  segmentChanges: Partial<Record<SegmentId, number>>;
  segmentReactions: ReturnType<typeof buildSegmentReactions>;
  politicalSegmentChanges: Partial<Record<PoliticalSegmentId, number>>;
  politicalSegmentReactions: ReturnType<typeof buildPoliticalSegmentReactions>;
  alignmentFeedback: ResponseAlignmentFeedback;
  consistencyBefore: number;
  consistencyAfter: number;
}

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return Math.max(0, Math.min(max, value));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyWeeklyEventOutcomeEffects(
  state: GameState,
  effects: WeeklyEventOutcomeEffects,
): GameState {
  const scaled = scaleWeeklyEventOutcomeEffects(effects);
  const nextMetrics = { ...state.metrics };
  const nextResources = { ...state.resources };

  if (scaled.metrics) {
    for (const [key, value] of Object.entries(scaled.metrics)) {
      const metricKey = key as MetricKey;
      nextMetrics[metricKey] = clampMetric(nextMetrics[metricKey] + (value ?? 0));
    }
  }

  if (scaled.resources) {
    for (const [key, value] of Object.entries(scaled.resources)) {
      const resourceKey = key as ResourceKey;
      nextResources[resourceKey] = clampResource(
        nextResources[resourceKey] + (value ?? 0),
        resourceKey,
      );
    }
  }

  return {
    ...state,
    metrics: nextMetrics,
    resources: nextResources,
  };
}

function resolveResponseApplication(
  state: GameState,
  event: WeeklyEvent,
  response: NonNullable<ReturnType<typeof getEventResponseById>>,
) {
  const alignment = evaluateResponseAlignment(state, event, response);
  const multiplier = computeAlignmentMultiplier(state, event, response);
  const resolvedSegments = enrichResolvedForPlayerContext(
    event,
    { playerIdeologyId: state.party.ideologyId, rivalParties: state.rivalParties },
    resolveEventSegmentsForWeek(event, state.rivalParties),
  );
  const effectiveAxis = resolveEffectiveReactionAxis(event);
  const filteredSocioEffects = filterSocioSegmentEffectsByAxis(
    effectiveAxis,
    response.segmentEffects,
    resolvedSegments,
  );
  const scaledSegmentEffects = scaleSegmentEffectsByMultiplier(
    filteredSocioEffects,
    multiplier,
  );
  const consistencyBefore = state.messageConsistency;
  const stanceUpdate = applyStanceAndConsistencyUpdate(state, event, response, alignment);
  const consistencyAfter = stanceUpdate.messageConsistency;
  const consistencyMetrics = getConsistencyMetricEffects(consistencyBefore, consistencyAfter);
  const mergedEffects = mergeOutcomeEffects(response.effects, { metrics: consistencyMetrics });

  const segmentAfter = applySegmentEffects(state.segmentSupport, scaledSegmentEffects);
  const segmentChanges = computeSegmentDiff(state.segmentSupport, segmentAfter);

  const tonePoliticalEffects = buildPoliticalEffectsForTone(resolvedSegments, response.tone);
  const mergedPoliticalEffects = response.politicalSegmentEffects?.length
    ? mergePoliticalSegmentEffects(tonePoliticalEffects, response.politicalSegmentEffects)
    : tonePoliticalEffects;
  const rawPoliticalEffects = modulatePoliticalEffectsForPlayerIdeology(
    mergedPoliticalEffects,
    state.party.ideologyId,
  );
  const scaledPoliticalEffects = scalePoliticalEffects(
    rawPoliticalEffects,
    getPoliticalAgendaScale(effectiveAxis, 'main'),
  );
  const politicalAfter = applyPoliticalSegmentEffects(
    state.politicalSegmentSupport,
    scaledPoliticalEffects,
  );
  const politicalSegmentChanges = computePoliticalSegmentDiff(
    state.politicalSegmentSupport,
    politicalAfter,
  );

  return {
    alignment,
    scaledSegmentEffects,
    mergedEffects,
    stanceUpdate,
    consistencyBefore,
    consistencyAfter,
    segmentChanges,
    segmentAfter,
    politicalSegmentChanges,
    politicalAfter,
  };
}

export function evaluateSelectedEventResponse(
  state: GameState,
  event: WeeklyEvent | null,
  selectedResponseId: string | null,
): EventEvaluationResult | null {
  if (!event || !selectedResponseId) return null;

  const response = getEventResponseById(event.responseOptions, selectedResponseId);
  if (!response) return null;

  const resolved = resolveResponseApplication(state, event, response);

  return {
    eventTitle: event.title,
    eventType: event.type,
    responseLevel: response.responseLevel,
    outcome: {
      title: response.outcomeTitle,
      description: response.outcomeDescription,
      effects: resolved.mergedEffects,
    },
    selectedResponseLabel: response.label,
    segmentChanges: resolved.segmentChanges,
    segmentReactions: buildSegmentReactions(resolved.segmentChanges, segmentLabels),
    politicalSegmentChanges: resolved.politicalSegmentChanges,
    politicalSegmentReactions: buildPoliticalSegmentReactions(resolved.politicalSegmentChanges),
    alignmentFeedback: resolved.alignment,
    consistencyBefore: resolved.consistencyBefore,
    consistencyAfter: resolved.consistencyAfter,
  };
}

export function evaluateAndApplyEventResponse(
  state: GameState,
): { state: GameState; evaluation: EventEvaluationResult | null } {
  const event = state.currentWeeklyEvent;
  const selectedResponseId = state.selectedEventResponseId;

  if (!event || !selectedResponseId) {
    return { state, evaluation: null };
  }

  const response = getEventResponseById(event.responseOptions, selectedResponseId);
  if (!response) {
    return { state, evaluation: null };
  }

  const resolved = resolveResponseApplication(state, event, response);

  let nextState: GameState = {
    ...state,
    ...resolved.stanceUpdate,
    segmentSupport: resolved.segmentAfter,
    politicalSegmentSupport: resolved.politicalAfter,
  };

  nextState = applyWeeklyEventOutcomeEffects(
    nextState,
    stripEnergyFromOutcomeEffects(resolved.mergedEffects),
  );

  const evaluation: EventEvaluationResult = {
    eventTitle: event.title,
    eventType: event.type,
    responseLevel: response.responseLevel,
    outcome: {
      title: response.outcomeTitle,
      description: response.outcomeDescription,
      effects: resolved.mergedEffects,
    },
    selectedResponseLabel: response.label,
    segmentChanges: resolved.segmentChanges,
    segmentReactions: buildSegmentReactions(resolved.segmentChanges, segmentLabels),
    politicalSegmentChanges: resolved.politicalSegmentChanges,
    politicalSegmentReactions: buildPoliticalSegmentReactions(resolved.politicalSegmentChanges),
    alignmentFeedback: resolved.alignment,
    consistencyBefore: resolved.consistencyBefore,
    consistencyAfter: resolved.consistencyAfter,
  };

  return { state: nextState, evaluation };
}

export function canFinishWeek(state: GameState): { ok: boolean; reason?: string } {
  if (state.currentWeeklyEvent && !state.selectedEventResponseId) {
    return {
      ok: false,
      reason: 'Haftayı bitirmek için gündeme bir tepki seçmelisin.',
    };
  }

  return { ok: true };
}

/** UI önizlemesi — tepki seçilirken uyum ipuçları */
export function previewResponseAlignment(
  state: GameState,
  responseId: string,
): ResponseAlignmentFeedback | null {
  const event = state.currentWeeklyEvent;
  if (!event) return null;

  const response = getEventResponseById(event.responseOptions, responseId);
  if (!response) return null;

  return evaluateResponseAlignment(state, event, response);
}
