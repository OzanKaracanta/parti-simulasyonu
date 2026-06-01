/** Mesaj tutarlılığı, duruş birikimi ve ideolojik uyum hesapları */

import {
  getIdeologyPreferredStance,
  getLeadershipToneBonus,
} from '../data/politicalIdentity';
import type {
  EventResponseOption,
  GameState,
  MetricKey,
  PolicyTopicId,
  ResponseAlignmentFeedback,
  SegmentId,
  StanceHistoryEntry,
  WeeklyEvent,
  WeeklyEventOutcomeEffects,
} from '../types/game';

const STANCE_MIN = -50;
const STANCE_MAX = 50;
const CONSISTENCY_MIN = 0;
const CONSISTENCY_MAX = 100;

export function clampStance(value: number): number {
  return Math.max(STANCE_MIN, Math.min(STANCE_MAX, value));
}

export function clampConsistency(value: number): number {
  return Math.max(CONSISTENCY_MIN, Math.min(CONSISTENCY_MAX, value));
}

export function getLastStanceOnTopic(
  history: StanceHistoryEntry[],
  topic: PolicyTopicId,
): number | null {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].topic === topic) return history[i].stanceValue;
  }
  return null;
}

export function computeConsistencyImpact(
  history: StanceHistoryEntry[],
  topic: PolicyTopicId,
  newStanceValue: number,
): number {
  const last = getLastStanceOnTopic(history, topic);
  if (last === null) return 2;

  const gap = Math.abs(newStanceValue - last);
  if (gap === 0) return 3;
  if (gap === 1) return 1;
  if (gap === 2) return -4;
  if (gap === 3) return -8;
  return -12;
}

function ideologyMatchLevel(diff: number): ResponseAlignmentFeedback['ideologyMatch'] {
  if (diff <= 0.5) return 'strong';
  if (diff <= 1.5) return 'moderate';
  if (diff <= 2.5) return 'weak';
  return 'clash';
}

function leadershipMatchLevel(bonus: number): ResponseAlignmentFeedback['leadershipMatch'] {
  if (bonus >= 2) return 'strong';
  if (bonus >= 0) return 'moderate';
  return 'weak';
}

export function evaluateResponseAlignment(
  state: GameState,
  event: WeeklyEvent,
  response: EventResponseOption,
): ResponseAlignmentFeedback {
  const ideologyPref = getIdeologyPreferredStance(state.party.ideologyId, event.policyTopic);
  const ideologyDiff = Math.abs(response.stanceValue - ideologyPref);
  const leadershipBonus = getLeadershipToneBonus(state.party.leadershipStyleId, response.tone);
  const consistencyImpact = computeConsistencyImpact(
    state.stanceHistory,
    event.policyTopic,
    response.stanceValue,
  );

  const ideologyMatch = ideologyMatchLevel(ideologyDiff);
  const leadershipMatch = leadershipMatchLevel(leadershipBonus);

  const notes: string[] = [];

  if (ideologyMatch === 'strong') notes.push('Parti çizginle uyumlu bir duruş.');
  else if (ideologyMatch === 'clash') notes.push('Seçimin parti kimliğiyle çelişiyor.');
  else if (ideologyMatch === 'weak') notes.push('Mesaj ideolojik profilden sapıyor.');

  if (leadershipMatch === 'strong') notes.push('Liderlik tarzına uygun bir ton.');
  else if (leadershipMatch === 'weak') notes.push('Liderlik tarzınla uyumsuz bir ton.');

  if (consistencyImpact >= 2) notes.push('Önceki mesajlarınla tutarlı.');
  else if (consistencyImpact <= -4) notes.push('Bu konuda daha önce verdiğin mesajla çelişiyor.');

  return {
    ideologyMatch,
    leadershipMatch,
    consistencyImpact,
    summary: notes.join(' ') || 'Nötr bir tepki profili.',
  };
}

/** İdeoloji + liderlik uyumuna göre segment etkisi çarpanı */
export function computeAlignmentMultiplier(
  state: GameState,
  event: WeeklyEvent,
  response: EventResponseOption,
): number {
  const ideologyPref = getIdeologyPreferredStance(state.party.ideologyId, event.policyTopic);
  const ideologyDiff = Math.abs(response.stanceValue - ideologyPref);
  const leadershipBonus = getLeadershipToneBonus(state.party.leadershipStyleId, response.tone);

  const ideologyFactor = 1 - ideologyDiff * 0.08;
  const leadershipFactor = 1 + leadershipBonus * 0.04;

  return Math.max(0.7, Math.min(1.3, ideologyFactor * leadershipFactor));
}

export function scaleSegmentEffectsByMultiplier(
  effects: Partial<Record<SegmentId, number>>,
  multiplier: number,
): Partial<Record<SegmentId, number>> {
  const scaled: Partial<Record<SegmentId, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (!value) continue;
    const scaledValue = value > 0 ? value * multiplier : value * (2 - multiplier);
    const rounded = Math.round(scaledValue * 10) / 10;
    if (rounded !== 0) {
      scaled[key as SegmentId] = rounded;
    }
  }

  return scaled;
}

export function applyStanceAndConsistencyUpdate(
  state: GameState,
  event: WeeklyEvent,
  response: EventResponseOption,
  alignment: ResponseAlignmentFeedback,
): Pick<GameState, 'partyStances' | 'messageConsistency' | 'stanceHistory'> {
  const nextStances = { ...state.partyStances };
  nextStances[event.policyTopic] = clampStance(
    nextStances[event.policyTopic] + response.stanceValue * 3,
  );

  const nextConsistency = clampConsistency(
    state.messageConsistency + alignment.consistencyImpact,
  );

  const nextHistory: StanceHistoryEntry[] = [
    ...state.stanceHistory,
    {
      week: state.campaignWeek,
      topic: event.policyTopic,
      stanceValue: response.stanceValue,
      responseLabel: response.label,
    },
  ].slice(-40);

  return {
    partyStances: nextStances,
    messageConsistency: nextConsistency,
    stanceHistory: nextHistory,
  };
}

/** Tutarlılık düşükse politika güvenilirliğine ek ceza */
export function getConsistencyMetricEffects(
  consistencyBefore: number,
  consistencyAfter: number,
): Partial<Record<MetricKey, number>> {
  const delta = consistencyAfter - consistencyBefore;
  const effects: Partial<Record<MetricKey, number>> = {};

  if (delta < -4) {
    effects.policyCredibility = -2;
    effects.leaderTrust = -1;
  } else if (delta > 2) {
    effects.policyCredibility = 1;
  }

  if (consistencyAfter < 35) {
    effects.policyCredibility = (effects.policyCredibility ?? 0) - 1;
  }

  return effects;
}

export function mergeOutcomeEffects(
  base: WeeklyEventOutcomeEffects | undefined,
  extra: WeeklyEventOutcomeEffects,
): WeeklyEventOutcomeEffects {
  const merged: WeeklyEventOutcomeEffects = {
    metrics: { ...base?.metrics },
    resources: { ...base?.resources },
  };

  if (extra.metrics) {
    merged.metrics = { ...merged.metrics };
    for (const [key, value] of Object.entries(extra.metrics)) {
      const metricKey = key as MetricKey;
      merged.metrics[metricKey] = (merged.metrics[metricKey] ?? 0) + (value ?? 0);
    }
  }

  if (extra.resources) {
    merged.resources = { ...merged.resources };
    for (const [key, value] of Object.entries(extra.resources)) {
      merged.resources[key as keyof typeof merged.resources] =
        (merged.resources[key as keyof typeof merged.resources] ?? 0) + (value ?? 0);
    }
  }

  return merged;
}

/** Ulusal oy hesabına tutarlılık düzeltmesi */
export function consistencySupportModifier(consistency: number): number {
  if (consistency >= 65) {
    return 1 + (consistency - 65) * 0.07;
  }
  if (consistency < 50) {
    return (consistency - 50) * 0.05;
  }
  return (consistency - 50) * 0.04;
}
