/** Politik segment desteği — başlangıç, etki uygulama, ulusal oy ince ayarı */

import { scaleWeeklySegmentDelta } from '../data/campaignConfig';
import { NATIONAL_POLITICAL_WEIGHTS, politicalSegmentLabels } from '../data/politicalSegments';
import { ALL_POLITICAL_SEGMENT_IDS } from '../types/politicalSegments';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type {
  GameState,
  IdeologyId,
  PoliticalSegmentEffect,
  PoliticalSegmentReaction,
} from '../types/game';

const POLITICAL_SUPPORT_MIN = 8;
const POLITICAL_SUPPORT_MAX = 72;
const POLITICAL_BASE = 28;

/** Ana gündem politik etki çarpanı (doküman: ×0.7) */
export const MAIN_EVENT_POLITICAL_SCALE = 0.7;

/** Alt / bölgesel gündem politik etki çarpanı (doküman: ×0.75) */
export const SUB_AGENDA_POLITICAL_SCALE = 0.75;

const IDEOLOGY_POLITICAL_BONUS: Partial<
  Record<IdeologyId, Partial<Record<PoliticalSegmentId, number>>>
> = {
  'populist-social': { socialDemocrat: 6, populist: 5, liberal: 2 },
  'nationalist-security': { nationalist: 7, conservative: 5 },
  'liberal-economist': { liberal: 6, conservative: 2 },
  'green-localist': { socialDemocrat: 4, liberal: 5, populist: 2 },
  'populist-radical': { populist: 7, socialDemocrat: 4 },
  'conservative-democrat': { conservative: 7, nationalist: 3 },
  'centrist-reform': { liberal: 3, socialDemocrat: 3, conservative: 2 },
  'libertarian-democrat': { liberal: 6, populist: 2 },
};

export function clampPoliticalSupport(value: number): number {
  return Math.max(POLITICAL_SUPPORT_MIN, Math.min(POLITICAL_SUPPORT_MAX, value));
}

export function createInitialPoliticalSegmentSupport(
  ideologyId: IdeologyId,
): Record<PoliticalSegmentId, number> {
  const bonus = IDEOLOGY_POLITICAL_BONUS[ideologyId] ?? {};
  const support = {} as Record<PoliticalSegmentId, number>;

  for (const segmentId of ALL_POLITICAL_SEGMENT_IDS) {
    support[segmentId] = clampPoliticalSupport(POLITICAL_BASE + (bonus[segmentId] ?? 0));
  }

  return support;
}

export function ensurePoliticalSegmentSupport(state: GameState): GameState {
  if (state.politicalSegmentSupport) return state;

  return {
    ...state,
    politicalSegmentSupport: createInitialPoliticalSegmentSupport(state.party.ideologyId),
  };
}

export function scalePoliticalEffects(
  effects: PoliticalSegmentEffect[],
  multiplier: number,
): PoliticalSegmentEffect[] {
  return effects
    .map((effect) => ({
      ...effect,
      delta: Math.round(effect.delta * multiplier * 10) / 10,
    }))
    .filter((effect) => effect.delta !== 0);
}

export function applyPoliticalSegmentEffects(
  politicalSupport: Record<PoliticalSegmentId, number>,
  effects: PoliticalSegmentEffect[],
): Record<PoliticalSegmentId, number> {
  const next = { ...politicalSupport };

  for (const { segmentId, delta } of effects) {
    const scaledDelta = scaleWeeklySegmentDelta(delta);
    if (scaledDelta === 0) continue;
    next[segmentId] = clampPoliticalSupport(next[segmentId] + scaledDelta);
  }

  return next;
}

export function computePoliticalSegmentDiff(
  before: Record<PoliticalSegmentId, number>,
  after: Record<PoliticalSegmentId, number>,
): Partial<Record<PoliticalSegmentId, number>> {
  const changes: Partial<Record<PoliticalSegmentId, number>> = {};

  for (const segmentId of ALL_POLITICAL_SEGMENT_IDS) {
    const delta = Math.round((after[segmentId] - before[segmentId]) * 10) / 10;
    if (delta !== 0) {
      changes[segmentId] = delta;
    }
  }

  return changes;
}

const POLITICAL_REACTION_TEMPLATES: Record<'positive' | 'negative' | 'neutral', string[]> = {
  positive: [
    '{segment} tabanında mesajın karşılık bulduğu yorumlandı.',
    '{segment} seçmeninde destek sinyali güçlendi.',
  ],
  negative: [
    '{segment} tabanında söylemin partizan veya sert bulunduğu algısı oluştu.',
    '{segment} seçmeninde mesafe arttı.',
  ],
  neutral: ['{segment} tabanında tepki sınırlı kaldı.'],
};

export function buildPoliticalSegmentReactions(
  changes: Partial<Record<PoliticalSegmentId, number>>,
): PoliticalSegmentReaction[] {
  const reactions: PoliticalSegmentReaction[] = [];

  const sorted = Object.entries(changes)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0));

  for (const [segmentId, delta] of sorted.slice(0, 4)) {
    const id = segmentId as PoliticalSegmentId;
    const label = politicalSegmentLabels[id];
    const tone = (delta ?? 0) > 0.5 ? 'positive' : (delta ?? 0) < -0.5 ? 'negative' : 'neutral';
    const templates = POLITICAL_REACTION_TEMPLATES[tone];
    const template = templates[Math.abs(Math.round(delta ?? 0)) % templates.length];
    reactions.push({
      segmentId: id,
      delta: delta ?? 0,
      message: template.replace('{segment}', label),
    });
  }

  return reactions;
}

/** Politik segment ağırlıklı ortalamadan ulusal oy ince ayarı (±4 puan) */
export function calculatePoliticalSupportModifier(
  politicalSupport: Record<PoliticalSegmentId, number>,
): number {
  let weighted = 0;

  for (const segmentId of ALL_POLITICAL_SEGMENT_IDS) {
    weighted += politicalSupport[segmentId] * NATIONAL_POLITICAL_WEIGHTS[segmentId];
  }

  const baseline = 36;
  const modifier = (weighted - baseline) * 0.18;
  return Math.max(-4, Math.min(4, Math.round(modifier * 10) / 10));
}
