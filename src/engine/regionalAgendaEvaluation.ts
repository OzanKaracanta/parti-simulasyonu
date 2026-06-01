/** Bölgesel gündem tepkileri — bölge desteği + segment */

import {
  REGIONAL_AGENDA_SILENT_SUPPORT_PENALTY,
  REGIONAL_ORG_BONUS_ON_BOLD,
  REGIONAL_SEGMENT_EFFECT_SCALE,
  REGIONAL_SUPPORT_DELTA,
} from '../data/regionalAgendaConfig';
import { getRegionById } from '../data/regions';
import { segmentLabels } from '../data/segments';
import { applySubAgendaConsistencyUpdate } from './subAgendaCrossRules';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type {
  GameState,
  RegionalAgendaWeekOutcome,
  ResourceKey,
  SegmentId,
} from '../types/game';
import {
  applySegmentEffects,
  buildSegmentReactions,
  computeSegmentDiff,
} from './segmentEngine';
import {
  applyPoliticalSegmentEffects,
  computePoliticalSegmentDiff,
  SUB_AGENDA_POLITICAL_SCALE,
  scalePoliticalEffects,
} from './politicalSegmentEngine';

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return Math.max(0, Math.min(max, value));
}

function clampSupport(value: number): number {
  return Math.max(0, Math.min(50, value));
}

function clampOrganization(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function scaleSegmentEffects(
  effects: Partial<Record<SegmentId, number>>,
): Partial<Record<SegmentId, number>> {
  const scaled: Partial<Record<SegmentId, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (value == null || value === 0) continue;
    const next = Math.round(value * REGIONAL_SEGMENT_EFFECT_SCALE * 10) / 10;
    if (next !== 0) {
      scaled[key as SegmentId] = next;
    }
  }

  return scaled;
}

export function getRegionalAgendaResponse(
  state: GameState,
  agendaId: string,
  responseId: string,
) {
  const agenda = state.regionalAgendas.find((item) => item.id === agendaId);
  if (!agenda) return null;

  const response = agenda.responseOptions.find((item) => item.id === responseId);
  if (!response) return null;

  return { agenda, response };
}

function applyRegionalSupportDelta(
  state: GameState,
  regionId: string,
  supportDelta: number,
  organizationDelta = 0,
): GameState {
  const regions = state.regions.map((region) => {
    if (region.id !== regionId) return region;
    return {
      ...region,
      support: clampSupport(region.support + supportDelta),
      organization: clampOrganization(region.organization + organizationDelta),
    };
  });

  return { ...state, regions };
}

function applySilentRegionalAgendas(
  state: GameState,
  selectedAgendaIds: Set<string>,
): GameState {
  let nextState = state;

  for (const agenda of state.regionalAgendas) {
    if (selectedAgendaIds.has(agenda.id)) continue;
    nextState = applyRegionalSupportDelta(
      nextState,
      agenda.regionId,
      -REGIONAL_AGENDA_SILENT_SUPPORT_PENALTY,
    );
  }

  return nextState;
}

export interface RegionalAgendaEvaluationResult {
  outcomes: RegionalAgendaWeekOutcome[];
  segmentChanges: Partial<Record<SegmentId, number>>;
  politicalSegmentChanges: Partial<Record<PoliticalSegmentId, number>>;
}

export function evaluateAndApplyRegionalAgendaResponses(state: GameState): {
  state: GameState;
  evaluation: RegionalAgendaEvaluationResult;
} {
  const selections = state.selectedRegionalAgendaSelections;
  const selectedIds = new Set(selections.map((item) => item.agendaId));

  if (selections.length === 0) {
    const withSilent = applySilentRegionalAgendas(state, selectedIds);
    const segmentChanges = computeSegmentDiff(state.segmentSupport, withSilent.segmentSupport);
    return {
      state: withSilent,
      evaluation: { outcomes: [], segmentChanges, politicalSegmentChanges: {} },
    };
  }

  let nextState = { ...state };
  const outcomes: RegionalAgendaWeekOutcome[] = [];
  const supportBefore = { ...state.segmentSupport };
  const politicalBefore = { ...state.politicalSegmentSupport };

  for (const selection of selections) {
    const resolved = getRegionalAgendaResponse(nextState, selection.agendaId, selection.responseId);
    if (!resolved) continue;

    const { agenda, response } = resolved;
    const segmentEffects = scaleSegmentEffects(response.segmentEffects);
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

    const supportDelta = REGIONAL_SUPPORT_DELTA[response.tone];
    const organizationDelta = response.tone === 'bold' ? REGIONAL_ORG_BONUS_ON_BOLD : 0;

    nextState = {
      ...nextState,
      segmentSupport: segmentAfter,
      politicalSegmentSupport: politicalAfter,
      resources: {
        ...nextState.resources,
        energy: clampResource(nextState.resources.energy - response.energyCost, 'energy'),
      },
    };

    nextState = applyRegionalSupportDelta(
      nextState,
      agenda.regionId,
      supportDelta,
      organizationDelta,
    );

    const consistencyUpdate = applySubAgendaConsistencyUpdate(
      nextState,
      agenda as import('../types/game').SubAgendaItem,
      response,
    );
    nextState = {
      ...nextState,
      messageConsistency: consistencyUpdate.messageConsistency,
      partyStances: consistencyUpdate.partyStances,
      stanceHistory: consistencyUpdate.stanceHistory,
    };

    outcomes.push({
      agendaId: agenda.id,
      regionId: agenda.regionId,
      regionName: getRegionById(agenda.regionId).name,
      title: agenda.title,
      responseLabel: response.label,
      outcomeTitle: response.outcomeTitle,
      outcomeDescription: response.outcomeDescription,
      supportDelta,
      segmentReactions,
      energyCost: response.energyCost,
    });
  }

  nextState = applySilentRegionalAgendas(nextState, selectedIds);

  const segmentChanges = computeSegmentDiff(supportBefore, nextState.segmentSupport);
  const politicalSegmentChanges = computePoliticalSegmentDiff(
    politicalBefore,
    nextState.politicalSegmentSupport,
  );

  return {
    state: nextState,
    evaluation: { outcomes, segmentChanges, politicalSegmentChanges },
  };
}
