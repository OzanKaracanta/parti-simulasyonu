/** Gölge yankı — hafta sonu planlama, hafta açılışı uygulama */

import {
  BACKLASH_FALLBACK_ROLL,
  BACKLASH_FIRST_WEEK,
  backlashDefinitions,
  isPrHeavyActionCategory,
  isSocialEventCategory,
  type BacklashDefinition,
} from '../data/backlashDefinitions';
import { getEventResponseById } from '../data/eventResponseFactory';
import { getActionSynergyLevel, type ActionSynergyLevel } from './actionSynergyEngine';
import { getSubAgendaResponse } from './subAgendaEvaluation';
import { applySegmentEffects } from './segmentEngine';
import { applyPoliticalSegmentEffects } from './politicalSegmentEngine';
import type {
  EventResponseLevel,
  GameState,
  MetricKey,
  PendingWeekBacklash,
  ResponseAlignmentFeedback,
  ResponseTone,
  RivalWeeklyMove,
  WeekBacklashItem,
  WeeklyEvent,
} from '../types/game';
import type { EventEvaluationResult } from './eventEvaluation';

let backlashCounter = 0;

function nextBacklashId(): string {
  backlashCounter += 1;
  return `backlash-${backlashCounter}`;
}

export interface WeekBacklashContext {
  campaignWeek: number;
  event: WeeklyEvent | null;
  responseId: string | null;
  responseLabel: string;
  tone: ResponseTone | null;
  responseLevel: EventResponseLevel | null;
  alignment: ResponseAlignmentFeedback | null;
  consistencyImpact: number;
  actionCount: number;
  hasRecommendedAction: boolean;
  worstSynergy: ActionSynergyLevel;
  allActionsPrHeavy: boolean;
  rivalNarrativeWin: boolean;
  subBoldCount: number;
  subSilentCount: number;
  leaderTrust: number;
  mediaPower: number;
  campaignVisibility: number;
  crisisManagement: number;
  messageConsistency: number;
  nextWeek: number;
  hasStoryEventNextWeek: boolean;
}

const SYNERGY_RANK: Record<ActionSynergyLevel, number> = {
  misaligned: 4,
  weak: 3,
  neutral: 2,
  moderate: 1,
  strong: 0,
};

export function rivalMoveIsNarrativeWin(move: RivalWeeklyMove): boolean {
  return move.impactSummary.includes('önüne geçti');
}

export function buildWeekBacklashContext(
  state: GameState,
  evaluation: EventEvaluationResult | null,
  rivalMoves: RivalWeeklyMove[],
): WeekBacklashContext {
  const event = state.currentWeeklyEvent;
  const responseId = state.selectedEventResponseId;
  const response = event && responseId
    ? getEventResponseById(event.responseOptions, responseId)
    : null;

  const selectedActions = state.availableActions.filter((action) =>
    state.selectedActionIds.includes(action.id),
  );

  let worstSynergy: ActionSynergyLevel = 'neutral';
  for (const action of selectedActions) {
    const level = getActionSynergyLevel(state, action);
    if (SYNERGY_RANK[level] > SYNERGY_RANK[worstSynergy]) {
      worstSynergy = level;
    }
  }

  const hasRecommendedAction =
    event !== null &&
    event !== undefined &&
    selectedActions.some((action) => event.recommendedActionIds.includes(action.id));

  const allActionsPrHeavy =
    selectedActions.length >= 2 &&
    selectedActions.every((action) => isPrHeavyActionCategory(action.category));

  const subAnswered = state.selectedSubAgendaSelections.length;
  let subBoldCount = 0;
  for (const selection of state.selectedSubAgendaSelections) {
    const resolved = getSubAgendaResponse(state, selection.agendaId, selection.responseId);
    if (resolved?.response.tone === 'bold') subBoldCount += 1;
  }
  const subSilentCount = Math.max(0, state.subAgendas.length - subAnswered);

  const nextWeek = state.campaignWeek + 1;
  const hasStoryEventNextWeek = state.scheduledStoryEvents.some(
    (item) => item.triggerWeek === nextWeek,
  );

  return {
    campaignWeek: state.campaignWeek,
    event: event ?? null,
    responseId,
    responseLabel: response?.label ?? '',
    tone: response?.tone ?? null,
    responseLevel: evaluation?.responseLevel ?? response?.responseLevel ?? null,
    alignment: evaluation?.alignmentFeedback ?? null,
    consistencyImpact: evaluation?.alignmentFeedback?.consistencyImpact ?? 0,
    actionCount: selectedActions.length,
    hasRecommendedAction,
    worstSynergy,
    allActionsPrHeavy,
    rivalNarrativeWin: rivalMoves.some(rivalMoveIsNarrativeWin),
    subBoldCount,
    subSilentCount,
    leaderTrust: state.metrics.leaderTrust,
    mediaPower: state.metrics.mediaPower,
    campaignVisibility: state.metrics.campaignVisibility,
    crisisManagement: state.metrics.crisisManagement,
    messageConsistency: state.messageConsistency,
    nextWeek,
    hasStoryEventNextWeek,
  };
}

function matchesContentTrigger(
  def: BacklashDefinition,
  ctx: WeekBacklashContext,
): boolean {
  const content = def.content;
  if (!content || !ctx.event || !ctx.responseId) return false;

  if (content.sourceEventId !== ctx.event.id) return false;

  if (content.sourceResponseIds?.length) {
    if (!content.sourceResponseIds.includes(ctx.responseId)) return false;
  }

  if (content.sourceResponseTones?.length && ctx.tone) {
    if (!content.sourceResponseTones.includes(ctx.tone)) return false;
  }

  if (content.requireNoActions && ctx.actionCount > 0) return false;

  return true;
}

function matchesRuleTrigger(def: BacklashDefinition, ctx: WeekBacklashContext): boolean {
  if (!def.rule || !ctx.event) return false;

  const type = ctx.event.type;
  const tone = ctx.tone;
  const level = ctx.responseLevel;
  const category = ctx.event.affectedCategory;

  switch (def.rule) {
    case 'crisis_measured_no_actions':
      return (
        type === 'crisis' &&
        tone === 'measured' &&
        level !== 'ignored' &&
        ctx.actionCount === 0
      );
    case 'crisis_measured_no_recommended_action':
      return (
        type === 'crisis' &&
        tone === 'measured' &&
        level !== 'ignored' &&
        ctx.actionCount >= 1 &&
        !ctx.hasRecommendedAction
      );
    case 'crisis_passive_or_ignored':
      return type === 'crisis' && (tone === 'passive' || level === 'ignored');
    case 'opportunity_passive_or_ignored':
      return type === 'opportunity' && (tone === 'passive' || level === 'ignored');
    case 'bold_success_rival_win':
      return tone === 'bold' && level === 'success' && ctx.rivalNarrativeWin;
    case 'bold_success_identity_clash':
      return (
        tone === 'bold' &&
        level === 'success' &&
        (ctx.alignment?.ideologyMatch === 'clash' ||
          ctx.alignment?.leadershipMatch === 'weak')
      );
    case 'partial_high_consistency_crisis':
      return (
        type === 'crisis' &&
        level === 'partial' &&
        ctx.messageConsistency >= 65
      );
    case 'main_response_inconsistency':
      return ctx.consistencyImpact <= -8;
    case 'action_misaligned':
      return ctx.actionCount >= 1 && ctx.worstSynergy === 'misaligned';
    case 'crisis_pr_heavy_actions':
      return (
        type === 'crisis' &&
        ctx.actionCount >= 2 &&
        ctx.allActionsPrHeavy &&
        isSocialEventCategory(category)
      );
    case 'bold_success_no_actions':
      return tone === 'bold' && level === 'success' && ctx.actionCount === 0;
    case 'sub_many_bold':
      return ctx.subBoldCount >= 2;
    case 'sub_many_silent_crisis':
      return type === 'crisis' && ctx.subSilentCount >= 3;
    case 'high_trust_low_media':
      return (
        ctx.leaderTrust >= 55 &&
        ctx.mediaPower < 40 &&
        (tone === 'measured' || level === 'partial')
      );
    case 'high_crisis_mgmt_low_visibility':
      return (
        type === 'crisis' &&
        ctx.crisisManagement >= 50 &&
        ctx.campaignVisibility < 35
      );
    default:
      return false;
  }
}

function isOnCooldown(
  def: BacklashDefinition,
  state: GameState,
  currentWeek: number,
): boolean {
  if (state.lastBacklashWeek <= 0) return false;
  return currentWeek - state.lastBacklashWeek < def.cooldownWeeks;
}

function isStoryFlagConsumed(def: BacklashDefinition, state: GameState): boolean {
  if (!def.storyFlag) return false;
  return Boolean(state.backlashStoryFlags[def.storyFlag]);
}

function matchesDefinition(def: BacklashDefinition, ctx: WeekBacklashContext): boolean {
  if (def.kind === 'content') return matchesContentTrigger(def, ctx);
  return matchesRuleTrigger(def, ctx);
}

function resolveTemplate(
  template: string,
  ctx: WeekBacklashContext,
  leaderName: string,
): string {
  return template
    .replace(/\{eventTitle\}/g, ctx.event?.title ?? 'Gündem')
    .replace(/\{responseLabel\}/g, ctx.responseLabel || 'Tepkin')
    .replace(/\{leaderName\}/g, leaderName);
}

function pickWeightedDefinition(candidates: BacklashDefinition[]): BacklashDefinition | null {
  if (candidates.length === 0) return null;
  const maxPriority = Math.max(...candidates.map((c) => c.priority));
  const top = candidates.filter((c) => c.priority === maxPriority);
  const totalWeight = top.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const candidate of top) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate;
  }
  return top[top.length - 1] ?? null;
}

export function selectWeekBacklashDefinition(
  ctx: WeekBacklashContext,
  state: GameState,
): BacklashDefinition | null {
  if (ctx.campaignWeek < BACKLASH_FIRST_WEEK) return null;
  if (ctx.hasStoryEventNextWeek) return null;
  if (state.pendingWeekBacklash) return null;

  const weeksSince =
    state.lastBacklashWeek > 0 ? ctx.campaignWeek - state.lastBacklashWeek : 99;
  if (weeksSince < 2) return null;

  const contentCandidates = backlashDefinitions.filter(
    (def) =>
      def.kind === 'content' &&
      matchesDefinition(def, ctx) &&
      !isStoryFlagConsumed(def, state),
  );
  if (contentCandidates.length > 0) {
    return pickWeightedDefinition(contentCandidates);
  }

  const ruleCandidates = backlashDefinitions.filter(
    (def) =>
      def.kind === 'rule' &&
      matchesDefinition(def, ctx) &&
      !isOnCooldown(def, state, ctx.campaignWeek),
  );

  if (ruleCandidates.length > 0) {
    return pickWeightedDefinition(ruleCandidates);
  }

  const softCandidates = backlashDefinitions.filter(
    (def) => def.kind === 'rule' && matchesDefinition(def, ctx),
  );
  if (softCandidates.length > 0 && Math.random() < BACKLASH_FALLBACK_ROLL) {
    return pickWeightedDefinition(softCandidates);
  }

  return null;
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyWeekBacklashEffects(
  state: GameState,
  def: BacklashDefinition,
): GameState {
  let segmentSupport = applySegmentEffects(state.segmentSupport, def.segmentEffects);
  let politicalSegmentSupport = state.politicalSegmentSupport;

  if (def.politicalSegmentEffects?.length) {
    politicalSegmentSupport = applyPoliticalSegmentEffects(
      politicalSegmentSupport,
      def.politicalSegmentEffects,
    );
  }

  const metrics = { ...state.metrics };

  if (def.metricEffects) {
    for (const [key, value] of Object.entries(def.metricEffects)) {
      const metricKey = key as MetricKey;
      metrics[metricKey] = clampMetric(metrics[metricKey] + (value ?? 0));
    }
  }

  return { ...state, segmentSupport, politicalSegmentSupport, metrics };
}

export function buildWeekBacklashItem(
  def: BacklashDefinition,
  triggerWeek: number,
  ctx: WeekBacklashContext,
  leaderName: string,
): WeekBacklashItem {
  return {
    id: nextBacklashId(),
    week: triggerWeek,
    definitionId: def.id,
    headline: def.headline,
    body: resolveTemplate(def.bodyTemplate, ctx, leaderName),
    effectSummary: def.effectSummary,
    segmentEffects: def.segmentEffects,
    politicalSegmentEffects: def.politicalSegmentEffects,
    metricEffects: def.metricEffects,
  };
}

export function scheduleWeekBacklash(
  state: GameState,
  ctx: WeekBacklashContext,
): GameState {
  const def = selectWeekBacklashDefinition(ctx, state);
  if (!def) return state;

  const draft = buildWeekBacklashItem(
    def,
    ctx.nextWeek,
    ctx,
    state.party.leaderName,
  );

  const pending: PendingWeekBacklash = {
    id: draft.id,
    triggerWeek: ctx.nextWeek,
    definitionId: def.id,
    headline: draft.headline,
    body: draft.body,
    effectSummary: draft.effectSummary,
    segmentEffects: draft.segmentEffects,
    politicalSegmentEffects: draft.politicalSegmentEffects,
    metricEffects: draft.metricEffects,
  };

  const backlashStoryFlags = { ...state.backlashStoryFlags };
  if (def.storyFlag) {
    backlashStoryFlags[def.storyFlag] = true;
  }

  return {
    ...state,
    pendingWeekBacklash: pending,
    backlashStoryFlags,
  };
}

export function revealPendingWeekBacklash(state: GameState): {
  state: GameState;
  item: WeekBacklashItem | null;
} {
  const pending = state.pendingWeekBacklash;
  if (!pending || pending.triggerWeek !== state.campaignWeek) {
    return { state, item: null };
  }

  const def = backlashDefinitions.find((item) => item.id === pending.definitionId);
  if (!def) {
    return {
      state: { ...state, pendingWeekBacklash: null },
      item: null,
    };
  }

  const item: WeekBacklashItem = {
    id: pending.id,
    week: state.campaignWeek,
    definitionId: pending.definitionId,
    headline: pending.headline,
    body: pending.body,
    effectSummary: pending.effectSummary,
    segmentEffects: pending.segmentEffects,
    politicalSegmentEffects: pending.politicalSegmentEffects,
    metricEffects: pending.metricEffects,
  };

  let nextState = applyWeekBacklashEffects(state, def);
  nextState = {
    ...nextState,
    pendingWeekBacklash: null,
    activeWeekBacklash: item,
    lastBacklashWeek: state.campaignWeek,
  };

  return { state: nextState, item };
}

export function dismissActiveWeekBacklash(state: GameState): GameState {
  return { ...state, activeWeekBacklash: null };
}

export function getBacklashHintForContext(
  ctx: WeekBacklashContext,
  state: GameState,
): string {
  const def = selectWeekBacklashDefinition(ctx, state);
  return def?.hintTemplate ?? '';
}
