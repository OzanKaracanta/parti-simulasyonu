/** Haftalık rapor metinleri ve değişim hesapları */

import { metricLabels, resourceLabels } from '../data/labels';
import type { EventEvaluationResult } from './eventEvaluation';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type {
  GameState,
  MetricKey,
  OpinionEchoItem,
  ResourceKey,
  RivalWeeklyMove,
  SegmentId,
  SubAgendaWeekOutcome,
  RegionalAgendaWeekOutcome,
  WeekBacklashItem,
  WeeklyEventOutcomeEffects,
  WeeklyHistoryItem,
  PoliticalSegmentReaction,
} from '../types/game';

export interface WeeklyPoliticsExtras {
  rivalMoves: RivalWeeklyMove[];
  opinionEchoes: OpinionEchoItem[];
  backgroundAgendaTitles: string[];
  subAgendaOutcomes: SubAgendaWeekOutcome[];
  subAgendaCrossRuleLines: string[];
  subAgendaSlotsUsed: number;
  subAgendaSlotsMax: number;
  subAgendaBonusSlots: number;
  radarAgendaTitles: string[];
  radarEffectLines: string[];
  regionalAgendaOutcomes: RegionalAgendaWeekOutcome[];
  upcomingStoryHint: string;
  weekBacklash: WeekBacklashItem | null;
  mainEventPoliticalReactionText?: string;
  mainEventPoliticalReactions?: PoliticalSegmentReaction[];
  totalSegmentChanges?: Partial<Record<SegmentId, number>>;
  politicalSegmentChanges?: Partial<Record<PoliticalSegmentId, number>>;
  politicalSegmentReactions?: PoliticalSegmentReaction[];
}

export function computeRecordDiff<T extends string>(
  before: Record<T, number>,
  after: Record<T, number>,
): Partial<Record<T, number>> {
  const changes: Partial<Record<T, number>> = {};

  for (const key of Object.keys(after) as T[]) {
    const delta = Math.round((after[key] - before[key]) * 10) / 10;
    if (delta !== 0) {
      changes[key] = delta;
    }
  }

  return changes;
}

export function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function formatOutcomeEffects(effects: WeeklyEventOutcomeEffects): string[] {
  const lines: string[] = [];

  if (effects.metrics) {
    for (const [key, value] of Object.entries(effects.metrics)) {
      if (!value) continue;
      lines.push(`${metricLabels[key as MetricKey]}: ${formatDelta(value)}`);
    }
  }

  if (effects.resources) {
    for (const [key, value] of Object.entries(effects.resources)) {
      if (!value) continue;
      lines.push(`${resourceLabels[key as ResourceKey]}: ${formatDelta(value)}`);
    }
  }

  return lines;
}

export function generateWeeklySummary(
  actionCount: number,
  supportBefore: number,
  supportAfter: number,
  responseLabel?: string,
): string {
  const delta = supportAfter - supportBefore;
  const direction =
    delta > 0 ? 'yükseldi' : delta < 0 ? 'geriledi' : 'değişmedi';

  const responseNote = responseLabel ? ` "${responseLabel}" tepkisi verildi.` : '';

  if (actionCount === 0) {
    return `Bu hafta aksiyon alınmadı.${responseNote} Tahmini oy oranı ${supportBefore.toFixed(1)}% seviyesinde ${direction}.`;
  }

  return `${actionCount} aksiyon uygulandı.${responseNote} Tahmini oy oranı ${supportBefore.toFixed(1)}%'den ${supportAfter.toFixed(1)}%'e ${direction}.`;
}

export function generateWeeklyInsight(
  state: GameState,
  resourceChanges: Partial<Record<ResourceKey, number>>,
  metricChanges: Partial<Record<MetricKey, number>>,
  supportChange: number,
  segmentChanges: Partial<Record<SegmentId, number>> = {},
): string {
  const notes: string[] = [];

  if (supportChange > 1) {
    notes.push('Kampanya ivmesi güçlü görünüyor.');
  } else if (supportChange < -1) {
    notes.push('Kamuoyu desteğinde baskı oluştu; strateji gözden geçirilmeli.');
  }

  const topSegmentGain = Object.entries(segmentChanges)
    .filter(([, value]) => (value ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];

  const topSegmentLoss = Object.entries(segmentChanges)
    .filter(([, value]) => (value ?? 0) < 0)
    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0];

  if (topSegmentGain) {
    notes.push(`En güçlü segment kazancı: +${topSegmentGain[1]} puan.`);
  }

  if (topSegmentLoss) {
    notes.push(`En büyük segment kaybı: ${topSegmentLoss[1]} puan.`);
  }

  if ((resourceChanges.reputation ?? 0) < 0) {
    notes.push('İtibar kaybı riski oluştu.');
  }

  if (state.resources.energy < 30) {
    notes.push('Enerji düşük; önümüzdeki hafta daha seçici olunmalı.');
  }

  if (state.resources.money < 40) {
    notes.push('Bütçe baskısı artıyor; finansman aksiyonları öne çıkabilir.');
  }

  const topMetricGain = Object.entries(metricChanges)
    .filter(([, value]) => (value ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];

  if (topMetricGain) {
    notes.push(
      `En güçlü artış: ${metricLabels[topMetricGain[0] as MetricKey]}.`,
    );
  }

  if (notes.length === 0) {
    return 'Dengeli bir hafta geçti. Küçük adımlar birikimli etki yaratabilir.';
  }

  return notes.join(' ');
}

export function buildWeeklyHistoryItem(
  state: GameState,
  appliedState: GameState,
  selectedActionNames: string[],
  supportBefore: number,
  supportAfter: number,
  evaluation: EventEvaluationResult | null,
  organizationProductionLines: string[] = [],
  sympathizerDonation = 0,
  sympathizerLeaderTrust = 0,
  actionSynergyLines: string[] = [],
  organizationSegmentLines: string[] = [],
  politics: WeeklyPoliticsExtras = {
    rivalMoves: [],
    opinionEchoes: [],
    backgroundAgendaTitles: [],
    subAgendaOutcomes: [],
    subAgendaCrossRuleLines: [],
    subAgendaSlotsUsed: 0,
    subAgendaSlotsMax: 0,
    subAgendaBonusSlots: 0,
    radarAgendaTitles: [],
    radarEffectLines: [],
    regionalAgendaOutcomes: [],
    upcomingStoryHint: '',
    weekBacklash: null,
  },
): WeeklyHistoryItem {
  const resourceChanges = computeRecordDiff(state.resources, appliedState.resources);
  const metricChanges = computeRecordDiff(state.metrics, appliedState.metrics);
  const supportChange = Math.round((supportAfter - supportBefore) * 10) / 10;

  return {
    week: state.campaignWeek,
    selectedActions: selectedActionNames,
    resourceChanges,
    metricChanges,
    supportBefore,
    supportAfter,
    supportChange,
    summary: generateWeeklySummary(
      selectedActionNames.length,
      supportBefore,
      supportAfter,
      evaluation?.selectedResponseLabel,
    ),
    insight: [
      generateWeeklyInsight(
        appliedState,
        resourceChanges,
        metricChanges,
        supportChange,
        evaluation?.segmentChanges ?? {},
      ),
      evaluation?.alignmentFeedback?.summary ?? '',
      ...politics.subAgendaCrossRuleLines,
      ...politics.radarEffectLines,
    ]
      .filter(Boolean)
      .join(' '),
    eventTitle: evaluation?.eventTitle ?? '',
    eventType: evaluation?.eventType ?? null,
    eventResponseLevel: evaluation?.responseLevel ?? null,
    eventOutcomeTitle: evaluation?.outcome.title ?? '',
    eventOutcomeDescription: evaluation?.outcome.description ?? '',
    eventOutcomeEffects: evaluation?.outcome.effects ?? {},
    organizationProductionLines,
    actionSynergyLines,
    organizationSegmentLines,
    sympathizerDonation,
    sympathizerLeaderTrust,
    selectedResponseLabel: evaluation?.selectedResponseLabel ?? '',
    segmentChanges: politics.totalSegmentChanges ?? evaluation?.segmentChanges ?? {},
    segmentReactions: evaluation?.segmentReactions ?? [],
    politicalSegmentChanges: politics.politicalSegmentChanges ?? evaluation?.politicalSegmentChanges ?? {},
    politicalSegmentReactions:
      politics.politicalSegmentReactions ?? evaluation?.politicalSegmentReactions ?? [],
    mainEventPoliticalReactionText: politics.mainEventPoliticalReactionText,
    mainEventPoliticalReactions:
      politics.mainEventPoliticalReactions ?? evaluation?.politicalSegmentReactions ?? [],
    alignmentFeedback: evaluation?.alignmentFeedback ?? null,
    consistencyBefore: evaluation?.consistencyBefore ?? 0,
    consistencyAfter: evaluation?.consistencyAfter ?? 0,
    rivalMoves: politics.rivalMoves,
    opinionEchoes: politics.opinionEchoes,
    backgroundAgendaTitles: politics.backgroundAgendaTitles,
    subAgendaOutcomes: politics.subAgendaOutcomes,
    subAgendaCrossRuleLines: politics.subAgendaCrossRuleLines,
    subAgendaSlotsUsed: politics.subAgendaSlotsUsed,
    subAgendaSlotsMax: politics.subAgendaSlotsMax,
    subAgendaBonusSlots: politics.subAgendaBonusSlots,
    radarAgendaTitles: politics.radarAgendaTitles,
    radarEffectLines: politics.radarEffectLines,
    regionalAgendaOutcomes: politics.regionalAgendaOutcomes,
    upcomingStoryHint: politics.upcomingStoryHint,
    weekBacklash: politics.weekBacklash,
  };
}
