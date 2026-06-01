/** Bölge bazlı sosyo-ekonomik ve ideolojik segment profilleri */

import { getRegionById } from './regions';
import { mapGroupLabelToSegment } from './segments';
import type { RegionId, SegmentId } from '../types/game';
import type { PoliticalSegmentId } from '../types/politicalSegments';

/** Bölgede baskın ideolojik yankı blokları */
export const REGION_POLITICAL_PROFILES: Record<RegionId, PoliticalSegmentId[]> = {
  marmara: ['liberal', 'socialDemocrat', 'populist'],
  ege: ['liberal', 'socialDemocrat'],
  'ic-anadolu': ['conservative', 'nationalist', 'socialDemocrat'],
  akdeniz: ['socialDemocrat', 'populist', 'nationalist'],
  karadeniz: ['conservative', 'nationalist'],
  'dogu-anadolu': ['conservative', 'nationalist', 'populist'],
  'guneydogu-anadolu': ['socialDemocrat', 'populist', 'liberal'],
};

export function getRegionSocioSegmentIds(regionId: RegionId): SegmentId[] {
  const seen = new Set<SegmentId>();
  const ids: SegmentId[] = [];

  for (const group of getRegionById(regionId).dominantGroups) {
    const segmentId = mapGroupLabelToSegment(group);
    if (segmentId && !seen.has(segmentId)) {
      seen.add(segmentId);
      ids.push(segmentId);
    }
  }

  return ids;
}

export function getRegionPoliticalSegmentIds(regionId: RegionId): PoliticalSegmentId[] {
  return REGION_POLITICAL_PROFILES[regionId];
}
