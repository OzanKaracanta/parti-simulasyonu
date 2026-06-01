/** Alt gündem çapraz kuralları — Faz B */

import {
  clampConsistency,
  clampStance,
  computeConsistencyImpact,
} from './stanceEngine';
import type {
  GameState,
  MetricKey,
  SegmentId,
  SubAgendaItem,
  SubAgendaResponseOption,
  StanceHistoryEntry,
} from '../types/game';

export function scaleNegativeSegmentEffects(
  effects: Partial<Record<SegmentId, number>>,
  multiplier: number,
): Partial<Record<SegmentId, number>> {
  const scaled: Partial<Record<SegmentId, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (!value) continue;
    const segmentId = key as SegmentId;
    scaled[segmentId] =
      value < 0 ? Math.round(value * multiplier) : value;
  }

  return scaled;
}

export function tensionOverlap(
  a: SegmentId[],
  b: SegmentId[],
): SegmentId[] {
  const setB = new Set(b);
  return a.filter((id) => setB.has(id));
}

export function applySubAgendaConsistencyUpdate(
  state: GameState,
  agenda: SubAgendaItem,
  response: SubAgendaResponseOption,
): {
  messageConsistency: number;
  partyStances: GameState['partyStances'];
  stanceHistory: StanceHistoryEntry[];
  consistencyDelta: number;
  note: string | null;
} {
  const consistencyImpact = computeConsistencyImpact(
    state.stanceHistory,
    agenda.policyTopic,
    response.stanceValue,
  );
  const nextConsistency = clampConsistency(state.messageConsistency + consistencyImpact);

  const nextStances = { ...state.partyStances };
  nextStances[agenda.policyTopic] = clampStance(
    nextStances[agenda.policyTopic] + response.stanceValue * 2,
  );

  const nextHistory: StanceHistoryEntry[] = [
    ...state.stanceHistory,
    {
      week: state.campaignWeek,
      topic: agenda.policyTopic,
      stanceValue: response.stanceValue,
      responseLabel: `${agenda.title}: ${response.label}`,
    },
  ].slice(-40);

  let note: string | null = null;
  if (consistencyImpact <= -4) {
    note = `"${agenda.title}" mesajı önceki haftalarla çelişti; tutarlılık zayıfladı.`;
  }

  return {
    messageConsistency: nextConsistency,
    partyStances: nextStances,
    stanceHistory: nextHistory,
    consistencyDelta: consistencyImpact,
    note,
  };
}

export function computeNoisePenalty(boldCount: number): Partial<Record<MetricKey, number>> {
  if (boldCount < 2) return {};
  return {
    campaignVisibility: 1,
    leaderTrust: -2,
  };
}

export function noiseRuleLine(boldCount: number): string | null {
  if (boldCount < 2) return null;
  return 'Aynı hafta birden fazla sert alt gündem mesajı: görünürlük arttı, lider güveni zayıfladı.';
}

export function doubleTargetRuleLine(agendaTitle: string): string {
  return `"${agendaTitle}" mesajı aynı hassas kesimlere ikinci kez vurdu; gerilim cezası arttı.`;
}
