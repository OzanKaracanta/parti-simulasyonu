/** Tepki + aksiyon sinerjisi — operasyonel hamleler siyasi mesajı taşır */

import { getActionTargetSegments } from '../data/actionSegments';
import { segmentLabels } from '../data/labels';
import { getEventResponseById } from '../data/eventResponseFactory';
import { resolveActionWithWeeklyEvent } from './eventEngine';
import { applySegmentEffects } from './segmentEngine';
import type {
  CampaignAction,
  GameState,
  MetricKey,
  SegmentId,
} from '../types/game';

export type ActionSynergyLevel = 'strong' | 'moderate' | 'weak' | 'misaligned' | 'neutral';

const SYNERGY_EFFECT_MULTIPLIER: Record<ActionSynergyLevel, number> = {
  strong: 1.3,
  moderate: 1.12,
  weak: 1,
  misaligned: 0.82,
  neutral: 1,
};

const SYNERGY_SEGMENT_BONUS: Record<ActionSynergyLevel, number> = {
  strong: 2,
  moderate: 1,
  weak: 0,
  misaligned: -1,
  neutral: 0,
};

export interface ResolvedActionContext {
  resolved: CampaignAction;
  labels: string[];
  synergyLevel: ActionSynergyLevel;
  synergyLabel: string | null;
}

function countSegmentOverlap(a: SegmentId[], b: SegmentId[]): number {
  return a.filter((id) => b.includes(id)).length;
}

function getPositiveSegments(
  effects: Partial<Record<SegmentId, number>>,
): SegmentId[] {
  return Object.entries(effects)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([id]) => id as SegmentId);
}

export function getActionSynergyLevel(state: GameState, action: CampaignAction): ActionSynergyLevel {
  const event = state.currentWeeklyEvent;
  const responseId = state.selectedEventResponseId;

  if (!event || !responseId) return 'neutral';

  const actionSegments = getActionTargetSegments(action.id);
  const eventOverlap = countSegmentOverlap(actionSegments, event.affectedSegments);
  const isRecommended = event.recommendedActionIds.includes(action.id);
  const categoryMatch = action.category === event.affectedCategory;

  const response = getEventResponseById(event.responseOptions, responseId);
  if (!response) return 'neutral';

  const responseSegments = getPositiveSegments(response.segmentEffects);
  const responseOverlap = countSegmentOverlap(actionSegments, responseSegments);

  const isPassiveResponse =
    response.tone === 'passive' || response.responseLevel === 'ignored';

  if (isPassiveResponse && (isRecommended || categoryMatch)) {
    return 'misaligned';
  }

  if (isRecommended && (eventOverlap >= 1 || responseOverlap >= 1)) {
    return 'strong';
  }

  if (isRecommended || (categoryMatch && eventOverlap >= 1)) {
    return 'strong';
  }

  if (categoryMatch || eventOverlap >= 1 || responseOverlap >= 1) {
    return 'moderate';
  }

  return 'weak';
}

export function getSynergyLabel(level: ActionSynergyLevel): string | null {
  switch (level) {
    case 'strong':
      return 'Tepki sinerjisi';
    case 'moderate':
      return 'Destekleyici';
    case 'misaligned':
      return 'Mesaj çelişkisi';
    case 'weak':
      return 'Zayıf bağ';
    default:
      return null;
  }
}

function scaleEffects(
  effects: Partial<Record<MetricKey, number>>,
  multiplier: number,
): Partial<Record<MetricKey, number>> {
  const scaled: Partial<Record<MetricKey, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (!value) continue;
    if (value > 0) {
      scaled[key as MetricKey] = Math.max(1, Math.round(value * multiplier));
    } else {
      scaled[key as MetricKey] = Math.round(value * multiplier);
    }
  }

  return scaled;
}

export function computeActionSegmentEffects(
  state: GameState,
  action: CampaignAction,
  synergyLevel: ActionSynergyLevel,
): Partial<Record<SegmentId, number>> {
  if (synergyLevel === 'neutral') return {};

  const event = state.currentWeeklyEvent;
  const actionSegments = getActionTargetSegments(action.id);
  const bonus = SYNERGY_SEGMENT_BONUS[synergyLevel];
  if (bonus === 0) return {};

  const effects: Partial<Record<SegmentId, number>> = {};
  const targets =
    synergyLevel === 'misaligned' && event
      ? event.affectedSegments
      : actionSegments.filter((id) =>
          event ? event.affectedSegments.includes(id) || actionSegments.includes(id) : true,
        );

  const uniqueTargets = [...new Set(targets.length > 0 ? targets : actionSegments)];

  for (const segmentId of uniqueTargets.slice(0, 3)) {
    effects[segmentId] = bonus;
  }

  return effects;
}

export function resolveActionForState(
  state: GameState,
  action: CampaignAction,
): ResolvedActionContext {
  const { resolved, labels } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
  const synergyLevel = getActionSynergyLevel(state, action);
  const synergyLabel = getSynergyLabel(synergyLevel);
  const multiplier = SYNERGY_EFFECT_MULTIPLIER[synergyLevel];

  const extraLabels = synergyLabel ? [...labels, synergyLabel] : labels;

  return {
    labels: extraLabels,
    synergyLevel,
    synergyLabel,
    resolved: {
      ...resolved,
      effects: scaleEffects(resolved.effects, multiplier),
    },
  };
}

export function applyActionsWithSegmentSynergy(
  state: GameState,
  actions: CampaignAction[],
): {
  state: GameState;
  synergyLines: string[];
  segmentEffects: Partial<Record<SegmentId, number>>;
} {
  let segmentSupport = { ...state.segmentSupport };
  const synergyLines: string[] = [];
  const totalSegmentEffects: Partial<Record<SegmentId, number>> = {};

  for (const baseAction of actions) {
    const context = resolveActionForState(state, baseAction);
    const segmentEffects = computeActionSegmentEffects(
      state,
      baseAction,
      context.synergyLevel,
    );

    segmentSupport = applySegmentEffects(segmentSupport, segmentEffects);

    for (const [key, value] of Object.entries(segmentEffects)) {
      const segmentId = key as SegmentId;
      totalSegmentEffects[segmentId] = (totalSegmentEffects[segmentId] ?? 0) + (value ?? 0);
    }

    if (context.synergyLabel && context.synergyLevel !== 'neutral') {
      const segmentNames = Object.keys(segmentEffects)
        .map((id) => segmentLabels[id as SegmentId])
        .join(', ');
      synergyLines.push(
        `${baseAction.name}: ${context.synergyLabel}${segmentNames ? ` (${segmentNames})` : ''}`,
      );
    }
  }

  return {
    state: { ...state, segmentSupport },
    synergyLines,
    segmentEffects: totalSegmentEffects,
  };
}

export function getRecommendedActionsForResponse(state: GameState): string[] {
  const event = state.currentWeeklyEvent;
  if (!event || !state.selectedEventResponseId) {
    return event?.recommendedActionIds ?? [];
  }

  return state.availableActions
    .filter((action) => {
      const level = getActionSynergyLevel(state, action);
      return level === 'strong' || level === 'moderate';
    })
    .map((action) => action.id)
    .slice(0, 4);
}
