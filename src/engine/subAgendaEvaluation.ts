/** Alt gündem tepkileri — Faz B: çoklu slot, çapraz kurallar, sessiz gündem */

import {
  SUB_AGENDA_DOUBLE_TARGET_MULTIPLIER,
  SUB_AGENDA_MAX_SILENT_PENALTIES_PER_WEEK,
  SUB_AGENDA_MAX_SLOTS,
  SUB_AGENDA_SILENT_PRIMARY_PENALTY,
} from '../data/subAgendaConfig';
import { segmentLabels } from '../data/segments';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type {
  GameState,
  MetricKey,
  ResourceKey,
  SegmentId,
  SubAgendaWeekOutcome,
} from '../types/game';
import {
  applySubAgendaConsistencyUpdate,
  computeNoisePenalty,
  doubleTargetRuleLine,
  noiseRuleLine,
  scaleNegativeSegmentEffects,
  tensionOverlap,
} from './subAgendaCrossRules';
import {
  applySegmentEffects,
  buildSegmentReactions,
  computeSegmentDiff,
} from './segmentEngine';
import {
  applyPoliticalSegmentEffects,
  buildPoliticalSegmentReactions,
  computePoliticalSegmentDiff,
  SUB_AGENDA_POLITICAL_SCALE,
  scalePoliticalEffects,
} from './politicalSegmentEngine';
import { buildPoliticalReactionText } from './politicalReactionText';

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return Math.max(0, Math.min(max, value));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export interface SubAgendaEvaluationResult {
  outcomes: SubAgendaWeekOutcome[];
  crossRuleLines: string[];
  segmentChanges: Partial<Record<SegmentId, number>>;
  politicalSegmentChanges: Partial<Record<PoliticalSegmentId, number>>;
}

export function getSubAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
) {
  const agenda = state.subAgendas.find((item) => item.id === agendaId);
  if (!agenda) return null;
  const response = agenda.responseOptions.find((item) => item.id === responseId);
  if (!response) return null;
  return { agenda, response };
}

function applySilentSubAgendas(
  state: GameState,
  selectedAgendaIds: Set<string>,
): GameState {
  let segmentSupport = { ...state.segmentSupport };

  const silentAgendas = state.subAgendas.filter((agenda) => !selectedAgendaIds.has(agenda.id));
  const penalizedAgendas = silentAgendas.slice(0, SUB_AGENDA_MAX_SILENT_PENALTIES_PER_WEEK);

  for (const agenda of penalizedAgendas) {
    const primarySegment = agenda.primarySegments[0];
    if (!primarySegment) continue;

    segmentSupport = applySegmentEffects(segmentSupport, {
      [primarySegment]: -SUB_AGENDA_SILENT_PRIMARY_PENALTY,
    });
  }

  return { ...state, segmentSupport };
}

export function evaluateAndApplySubAgendaResponses(state: GameState): {
  state: GameState;
  evaluation: SubAgendaEvaluationResult;
} {
  const selections = state.selectedSubAgendaSelections;
  if (selections.length === 0) {
    const withSilent = applySilentSubAgendas(state, new Set());
    const segmentChanges = computeSegmentDiff(state.segmentSupport, withSilent.segmentSupport);
    return {
      state: withSilent,
      evaluation: {
        outcomes: [],
        crossRuleLines: [],
        segmentChanges,
        politicalSegmentChanges: {},
      },
    };
  }

  let nextState = { ...state };
  const outcomes: SubAgendaWeekOutcome[] = [];
  const crossRuleLines: string[] = [];
  const supportBefore = { ...state.segmentSupport };
  const politicalBefore = { ...state.politicalSegmentSupport };
  const boldTensionHits: SegmentId[][] = [];
  let boldCount = 0;

  for (const selection of selections) {
    const resolved = getSubAgendaResponse(nextState, selection.agendaId, selection.responseId);
    if (!resolved) continue;

    const { agenda, response } = resolved;
    let segmentEffects = { ...response.segmentEffects };

    let crossRuleNote: string | undefined;

    if (response.tone === 'bold') {
      boldCount += 1;
      const priorTensions = boldTensionHits.flat();
      if (priorTensions.length > 0) {
        const overlap = tensionOverlap(priorTensions, agenda.tensionSegments);
        if (overlap.length > 0) {
          segmentEffects = scaleNegativeSegmentEffects(
            segmentEffects,
            SUB_AGENDA_DOUBLE_TARGET_MULTIPLIER,
          );
          crossRuleNote = doubleTargetRuleLine(agenda.title);
          if (!crossRuleLines.includes(crossRuleNote)) {
            crossRuleLines.push(crossRuleNote);
          }
        }
      }
      boldTensionHits.push([...agenda.tensionSegments]);
    }

    const segmentAfter = applySegmentEffects(nextState.segmentSupport, segmentEffects);
    const segmentChanges = computeSegmentDiff(nextState.segmentSupport, segmentAfter);
    const segmentReactions = buildSegmentReactions(segmentChanges, segmentLabels);

    const scaledPoliticalEffects = scalePoliticalEffects(
      response.politicalSegmentEffects ?? [],
      SUB_AGENDA_POLITICAL_SCALE,
    );
    const politicalAfter = applyPoliticalSegmentEffects(
      nextState.politicalSegmentSupport,
      scaledPoliticalEffects,
    );
    const politicalSegmentChanges = computePoliticalSegmentDiff(
      nextState.politicalSegmentSupport,
      politicalAfter,
    );
    const politicalSegmentReactions = buildPoliticalSegmentReactions(politicalSegmentChanges);
    const politicalReactionText = buildPoliticalReactionText(
      scaledPoliticalEffects,
      {
        tension: agenda.tensionRationale,
        political: agenda.politicalRationale,
      },
    );

    nextState = {
      ...nextState,
      segmentSupport: segmentAfter,
      politicalSegmentSupport: politicalAfter,
      resources: {
        ...nextState.resources,
        energy: clampResource(
          nextState.resources.energy - response.energyCost,
          'energy',
        ),
      },
    };

    const consistencyUpdate = applySubAgendaConsistencyUpdate(nextState, agenda, response);
    nextState = {
      ...nextState,
      messageConsistency: consistencyUpdate.messageConsistency,
      partyStances: consistencyUpdate.partyStances,
      stanceHistory: consistencyUpdate.stanceHistory,
    };

    if (consistencyUpdate.note) {
      crossRuleLines.push(consistencyUpdate.note);
    }

    outcomes.push({
      agendaId: agenda.id,
      title: agenda.title,
      responseLabel: response.label,
      outcomeTitle: response.outcomeTitle,
      outcomeDescription: response.outcomeDescription,
      segmentReactions,
      politicalSegmentReactions,
      politicalReactionText,
      energyCost: response.energyCost,
      crossRuleNote,
    });
  }

  const noiseLine = noiseRuleLine(boldCount);
  if (noiseLine) {
    crossRuleLines.push(noiseLine);
    const noiseEffects = computeNoisePenalty(boldCount);
    const nextMetrics = { ...nextState.metrics };
    for (const [key, value] of Object.entries(noiseEffects)) {
      const metricKey = key as MetricKey;
      nextMetrics[metricKey] = clampMetric(nextMetrics[metricKey] + (value ?? 0));
    }
    nextState = { ...nextState, metrics: nextMetrics };
  }

  const selectedIds = new Set(selections.map((item) => item.agendaId));
  nextState = applySilentSubAgendas(nextState, selectedIds);

  const unaddressed = state.subAgendas.filter((item) => !selectedIds.has(item.id)).length;
  if (unaddressed > 0) {
    crossRuleLines.push(
      `${unaddressed} alt gündeme mesaj verilmedi; hedef kitlelerde hafif soğuma.`,
    );
  }

  const totalSegmentChanges = computeSegmentDiff(supportBefore, nextState.segmentSupport);
  const totalPoliticalChanges = computePoliticalSegmentDiff(
    politicalBefore,
    nextState.politicalSegmentSupport,
  );

  return {
    state: nextState,
    evaluation: {
      outcomes,
      crossRuleLines,
      segmentChanges: totalSegmentChanges,
      politicalSegmentChanges: totalPoliticalChanges,
    },
  };
}

export function countSubAgendaSlotsUsed(state: GameState): number {
  return state.selectedSubAgendaSelections.length;
}

export { SUB_AGENDA_MAX_SLOTS };
