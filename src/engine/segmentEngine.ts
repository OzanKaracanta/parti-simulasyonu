/** Segment desteği hesaplama ve bölgesel yansıma */

import { scaleWeeklySegmentDelta } from '../data/campaignConfig';
import { ALL_SEGMENT_IDS, mapGroupLabelToSegment, NATIONAL_SEGMENT_WEIGHTS } from '../data/segments';
import type {
  IdeologyId,
  MetricKey,
  RegionState,
  SegmentId,
  SegmentReaction,
} from '../types/game';

const SEGMENT_SUPPORT_MIN = 10;
const SEGMENT_SUPPORT_MAX = 72;

export function clampSegmentSupport(value: number): number {
  return Math.max(SEGMENT_SUPPORT_MIN, Math.min(SEGMENT_SUPPORT_MAX, value));
}

/** Metrik profilinden başlangıç segment desteği */
const SEGMENT_METRIC_WEIGHTS: Record<SegmentId, Partial<Record<MetricKey, number>>> = {
  youth: { youthReach: 0.55, campaignVisibility: 0.25, mediaPower: 0.2 },
  workers: { socialGroupReach: 0.4, policyCredibility: 0.3, leaderTrust: 0.3 },
  merchants: { financialSustainability: 0.45, localOrganization: 0.3, leaderTrust: 0.25 },
  retirees: { leaderTrust: 0.45, policyCredibility: 0.35, crisisManagement: 0.2 },
  civilServants: { policyCredibility: 0.4, leaderTrust: 0.35, crisisManagement: 0.25 },
  farmers: { localOrganization: 0.45, regionalInfluence: 0.35, leaderTrust: 0.2 },
  tourism: { campaignVisibility: 0.35, mediaPower: 0.35, financialSustainability: 0.3 },
  fisherfolk: { localOrganization: 0.4, regionalInfluence: 0.35, leaderTrust: 0.25 },
  industry: { financialSustainability: 0.35, policyCredibility: 0.35, socialGroupReach: 0.3 },
};

/** İdeoloji başlangıç segment bonusları */
const IDEOLOGY_SEGMENT_BONUS: Partial<Record<IdeologyId, Partial<Record<SegmentId, number>>>> = {
  'populist-social': { workers: 4, retirees: 3, farmers: 2 },
  'nationalist-security': { retirees: 3, civilServants: 2, industry: 2 },
  'liberal-economist': { merchants: 4, industry: 3, youth: 2 },
  'green-localist': { farmers: 4, youth: 3, tourism: 2 },
  'populist-radical': { youth: 4, workers: 3 },
  'conservative-democrat': { retirees: 4, merchants: 2, civilServants: 2 },
  'centrist-reform': { civilServants: 3, merchants: 2, workers: 2 },
  'libertarian-democrat': { youth: 3, merchants: 3, industry: 2 },
};

function scoreFromMetrics(
  metrics: Record<MetricKey, number>,
  weights: Partial<Record<MetricKey, number>>,
): number {
  let total = 0;
  let weightSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (!weight) continue;
    total += metrics[key as MetricKey] * weight;
    weightSum += weight;
  }

  if (weightSum === 0) return 20;
  return total / weightSum;
}

const CAMPAIGN_SEGMENT_BASE = 12;
const CAMPAIGN_SEGMENT_METRIC_FACTOR = 0.18;
const CAMPAIGN_IDEOLOGY_BONUS_SCALE = 0.65;

export function createInitialSegmentSupport(
  metrics: Record<MetricKey, number>,
  ideologyId: IdeologyId,
): Record<SegmentId, number> {
  const support = {} as Record<SegmentId, number>;
  const ideologyBonus = IDEOLOGY_SEGMENT_BONUS[ideologyId] ?? {};

  for (const segmentId of ALL_SEGMENT_IDS) {
    const metricScore = scoreFromMetrics(metrics, SEGMENT_METRIC_WEIGHTS[segmentId]);
    const base = 20 + metricScore * 0.32;
    const bonus = ideologyBonus[segmentId] ?? 0;
    support[segmentId] = clampSegmentSupport(Math.round(base + bonus));
  }

  return support;
}

/** Kampanya t=0 — düşük taban; haftalık recovery için `createInitialSegmentSupport` kullanılmaya devam eder */
export function createCampaignStartSegmentSupport(
  metrics: Record<MetricKey, number>,
  ideologyId: IdeologyId,
): Record<SegmentId, number> {
  const support = {} as Record<SegmentId, number>;
  const ideologyBonus = IDEOLOGY_SEGMENT_BONUS[ideologyId] ?? {};

  for (const segmentId of ALL_SEGMENT_IDS) {
    const metricScore = scoreFromMetrics(metrics, SEGMENT_METRIC_WEIGHTS[segmentId]);
    const base = CAMPAIGN_SEGMENT_BASE + metricScore * CAMPAIGN_SEGMENT_METRIC_FACTOR;
    const bonus = Math.round((ideologyBonus[segmentId] ?? 0) * CAMPAIGN_IDEOLOGY_BONUS_SCALE);
    support[segmentId] = clampSegmentSupport(Math.round(base + bonus));
  }

  return support;
}

/** 52 haftalık kampanyada segment sürüklenmesini önleyen hafif taban çekimi */
const SEGMENT_BASELINE_RECOVERY_RATE = 0.05;

export function applyWeeklySegmentBaselineRecovery(
  segmentSupport: Record<SegmentId, number>,
  metrics: Record<MetricKey, number>,
  ideologyId: IdeologyId,
): Record<SegmentId, number> {
  const baseline = createInitialSegmentSupport(metrics, ideologyId);
  const next = { ...segmentSupport };

  for (const segmentId of ALL_SEGMENT_IDS) {
    const gap = baseline[segmentId] - next[segmentId];
    // Sadece tabanın altındayken yukarı çek — üst banda çıkışa izin ver
    if (gap <= 0.4) continue;
    next[segmentId] = clampSegmentSupport(next[segmentId] + gap * SEGMENT_BASELINE_RECOVERY_RATE);
  }

  return next;
}

/** Tutarlı cesur oyun — ideoloji segmentlerine haftalık momentum bonusu */
export function applyCampaignMomentumBonus(
  segmentSupport: Record<SegmentId, number>,
  consistency: number,
  ideologyId: IdeologyId,
  weeklyBoldMoves: number,
): Record<SegmentId, number> {
  if (consistency < 55 || weeklyBoldMoves < 1) return segmentSupport;

  const ideologyBonus = IDEOLOGY_SEGMENT_BONUS[ideologyId] ?? {};
  const lift = consistency >= 75 ? 0.38 : 0.24;
  const next = { ...segmentSupport };

  for (const segmentId of Object.keys(ideologyBonus) as SegmentId[]) {
    next[segmentId] = clampSegmentSupport(next[segmentId] + lift);
  }

  return next;
}

export function applySegmentEffects(
  segmentSupport: Record<SegmentId, number>,
  effects: Partial<Record<SegmentId, number>>,
): Record<SegmentId, number> {
  const next = { ...segmentSupport };

  for (const [key, delta] of Object.entries(effects)) {
    const segmentId = key as SegmentId;
    const scaledDelta = scaleWeeklySegmentDelta(delta ?? 0);
    if (scaledDelta === 0) continue;
    next[segmentId] = clampSegmentSupport(next[segmentId] + scaledDelta);
  }

  return next;
}

/** Ulusal oy tahmini — segment ağırlıklı ortalama + metrik düzeltmesi */
export function calculateNationalSupportFromSegments(
  segmentSupport: Record<SegmentId, number>,
  metrics: Record<MetricKey, number>,
): number {
  let weighted = 0;

  for (const segmentId of ALL_SEGMENT_IDS) {
    weighted += segmentSupport[segmentId] * NATIONAL_SEGMENT_WEIGHTS[segmentId];
  }

  const metricBoost =
    metrics.campaignVisibility * 0.06 +
    metrics.leaderTrust * 0.05 +
    metrics.mediaPower * 0.04;

  return Math.max(0, Math.min(60, Math.round((weighted * 0.6 + metricBoost * 0.13) * 10) / 10));
}

export function calculateRegionalSupportFromSegments(
  dominantGroups: string[],
  segmentSupport: Record<SegmentId, number>,
  isHomeRegion: boolean,
): number {
  const segments = dominantGroups
    .map(mapGroupLabelToSegment)
    .filter((item): item is SegmentId => item !== null);

  if (segments.length === 0) {
    return (
      calculateNationalSupportFromSegments(segmentSupport, {
        campaignVisibility: 40,
        leaderTrust: 40,
        mediaPower: 40,
      } as Record<MetricKey, number>) * (isHomeRegion ? 0.28 : 0.18)
    );
  }

  let weighted = 0;
  let weightSum = 0;

  segments.forEach((segmentId, index) => {
    const weight = index === 0 ? 2 : 1;
    weighted += segmentSupport[segmentId] * weight;
    weightSum += weight;
  });

  const avg = weighted / weightSum;
  const scale = isHomeRegion ? 0.22 : 0.14;

  return Math.max(2, Math.min(18, Math.round(avg * scale * 10) / 10));
}

export function syncRegionsWithSegments(
  regions: RegionState[],
  segmentSupport: Record<SegmentId, number>,
  homeRegionId: string,
): RegionState[] {
  return regions.map((region) => ({
    ...region,
    support: calculateRegionalSupportFromSegments(
      region.dominantGroups,
      segmentSupport,
      region.id === homeRegionId,
    ),
  }));
}

const REACTION_TEMPLATES: Record<'positive' | 'negative' | 'neutral', string[]> = {
  positive: [
    '{segment} grubunda destek arttı.',
    '{segment} sizin hamlenizi olumlu karşıladı.',
    '{segment} arasında ivme kazandınız.',
  ],
  negative: [
    '{segment} grubunda güven sarsıldı.',
    '{segment} tepkinizi eleştirdi.',
    '{segment} arasında kayıp yaşandı.',
  ],
  neutral: ['{segment} tepkisi sınırlı kaldı.'],
};

export function buildSegmentReactions(
  changes: Partial<Record<SegmentId, number>>,
  segmentLabels: Record<SegmentId, string>,
): SegmentReaction[] {
  const reactions: SegmentReaction[] = [];

  const sorted = Object.entries(changes)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0));

  for (const [segmentId, delta] of sorted.slice(0, 5)) {
    const id = segmentId as SegmentId;
    const label = segmentLabels[id];
    const tone = (delta ?? 0) > 1 ? 'positive' : (delta ?? 0) < -1 ? 'negative' : 'neutral';
    const templates = REACTION_TEMPLATES[tone];
    const template = templates[Math.abs(Math.round(delta ?? 0)) % templates.length];
    reactions.push({
      segmentId: id,
      delta: delta ?? 0,
      message: template.replace('{segment}', label),
    });
  }

  return reactions;
}

export function computeSegmentDiff(
  before: Record<SegmentId, number>,
  after: Record<SegmentId, number>,
): Partial<Record<SegmentId, number>> {
  const changes: Partial<Record<SegmentId, number>> = {};

  for (const segmentId of ALL_SEGMENT_IDS) {
    const delta = Math.round((after[segmentId] - before[segmentId]) * 10) / 10;
    if (delta !== 0) {
      changes[segmentId] = delta;
    }
  }

  return changes;
}
