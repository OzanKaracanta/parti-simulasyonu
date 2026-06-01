/** Haftalık segment değişim özeti — rapor chip'leri */

import { politicalSegmentLabels } from '../../data/politicalSegments';
import { segmentLabels } from '../../data/labels';
import { formatDelta } from '../../engine/weeklyReport';
import type { SegmentId } from '../../types/game';
import type { PoliticalSegmentId } from '../../types/politicalSegments';

export interface SegmentChangeChip {
  id: string;
  label: string;
  delta: number;
  kind: 'socio' | 'political';
}

export function buildSegmentChangeChips(
  segmentChanges: Partial<Record<SegmentId, number>> = {},
  politicalSegmentChanges: Partial<Record<PoliticalSegmentId, number>> = {},
  maxPerKind = 3,
): SegmentChangeChip[] {
  const socio = Object.entries(segmentChanges)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))
    .slice(0, maxPerKind)
    .map(([segmentId, delta]) => ({
      id: segmentId,
      label: segmentLabels[segmentId as SegmentId],
      delta: delta ?? 0,
      kind: 'socio' as const,
    }));

  const political = Object.entries(politicalSegmentChanges)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))
    .slice(0, maxPerKind)
    .map(([segmentId, delta]) => ({
      id: segmentId,
      label: politicalSegmentLabels[segmentId as PoliticalSegmentId],
      delta: delta ?? 0,
      kind: 'political' as const,
    }));

  return [...socio, ...political];
}

export function formatSegmentChangeChip(chip: SegmentChangeChip): string {
  return `${formatDelta(chip.delta)} ${chip.label}`;
}
