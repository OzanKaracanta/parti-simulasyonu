/** Faz 6 — headless sim için politik segment özet metrikleri */

import { politicalSegmentsForIdeology } from '../engine/ideologyPoliticalMapping';
import type { WeeklyHistoryItem } from '../types/game';
import type { IdeologyId } from '../types/game';
import type { PoliticalSegmentId } from '../types/politicalSegments';

export function sumAbsPoliticalChanges(
  changes: WeeklyHistoryItem['politicalSegmentChanges'],
): number {
  if (!changes) return 0;
  return Object.values(changes).reduce((sum, value) => sum + Math.abs(value ?? 0), 0);
}

export function netPlayerBasePoliticalDelta(
  changes: WeeklyHistoryItem['politicalSegmentChanges'],
  ideologyId: IdeologyId,
): number {
  const playerSegments = new Set(politicalSegmentsForIdeology(ideologyId));
  if (!changes || playerSegments.size === 0) return 0;

  let net = 0;
  for (const [segmentId, delta] of Object.entries(changes)) {
    if (playerSegments.has(segmentId as PoliticalSegmentId)) {
      net += delta ?? 0;
    }
  }
  return Math.round(net * 10) / 10;
}

export function averagePlayerBasePoliticalSupport(
  support: Record<PoliticalSegmentId, number>,
  ideologyId: IdeologyId,
): number {
  const segments = politicalSegmentsForIdeology(ideologyId);
  if (segments.length === 0) return 0;
  const total = segments.reduce((sum, id) => sum + support[id], 0);
  return Math.round((total / segments.length) * 10) / 10;
}

export interface PoliticalSimMetrics {
  weeksWithPoliticalActivity: number;
  totalPoliticalAbsDelta: number;
  avgWeeklyPoliticalAbsDelta: number;
  netPlayerBasePoliticalDelta: number;
  finalPlayerBasePoliticalSupport: number;
}

export function computePoliticalSimMetrics(
  history: WeeklyHistoryItem[],
  finalPoliticalSupport: Record<PoliticalSegmentId, number>,
  ideologyId: IdeologyId,
): PoliticalSimMetrics {
  let weeksWithPoliticalActivity = 0;
  let totalPoliticalAbsDelta = 0;
  let playerBaseNet = 0;

  for (const item of history) {
    const magnitude = sumAbsPoliticalChanges(item.politicalSegmentChanges);
    if (magnitude > 0) weeksWithPoliticalActivity += 1;
    totalPoliticalAbsDelta += magnitude;
    playerBaseNet += netPlayerBasePoliticalDelta(item.politicalSegmentChanges, ideologyId);
  }

  const weeks = history.length;
  return {
    weeksWithPoliticalActivity,
    totalPoliticalAbsDelta: Math.round(totalPoliticalAbsDelta * 10) / 10,
    avgWeeklyPoliticalAbsDelta:
      weeks > 0 ? Math.round((totalPoliticalAbsDelta / weeks) * 10) / 10 : 0,
    netPlayerBasePoliticalDelta: Math.round(playerBaseNet * 10) / 10,
    finalPlayerBasePoliticalSupport: averagePlayerBasePoliticalSupport(
      finalPoliticalSupport,
      ideologyId,
    ),
  };
}
