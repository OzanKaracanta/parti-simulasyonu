/** Örgüt araçlarının segment erişimi — bölge bazlı */

import { getOrganizationSegmentReach } from '../data/organizationSegmentMap';
import { segmentLabels } from '../data/labels';
import { organizationToolDefinitions } from '../data/organizationTools';
import { nationalOrganizationToolDefinitions } from '../data/nationalOrganizationTools';
import { getNationalOrganizationToolLevel } from '../systems/nationalOrganizationSystem';
import { ALL_REGION_IDS } from '../systems/regionOrganization';
import { getRegionOrganizationToolLevel } from '../systems/regionOrganization';
import { applySegmentEffects } from './segmentEngine';
import type { GameState, RegionId, SegmentId } from '../types/game';

export function applyOrganizationSegmentReach(
  state: GameState,
): { state: GameState; lines: string[]; segmentEffects: Partial<Record<SegmentId, number>> } {
  const segmentEffects: Partial<Record<SegmentId, number>> = {};
  const lines: string[] = [];
  let segmentSupport = { ...state.segmentSupport };

  for (const regionId of ALL_REGION_IDS) {
    for (const tool of organizationToolDefinitions) {
      const level = getRegionOrganizationToolLevel(state, regionId as RegionId, tool.id);
      if (level <= 0) continue;

      const reach = getOrganizationSegmentReach(tool.id);
      if (!reach) continue;

      const amount = reach.amountPerLevel * level;
      const toolEffects: Partial<Record<SegmentId, number>> = {};

      for (const segmentId of reach.segments) {
        toolEffects[segmentId] = amount;
        segmentEffects[segmentId] = (segmentEffects[segmentId] ?? 0) + amount;
      }

      segmentSupport = applySegmentEffects(segmentSupport, toolEffects);

      const segmentNames = reach.segments.map((id) => segmentLabels[id]).join(', ');
      lines.push(`${tool.name} / ${regionId} (Sv.${level}): ${segmentNames} +${amount}`);
    }
  }

  for (const tool of nationalOrganizationToolDefinitions) {
    const level = getNationalOrganizationToolLevel(state, tool.id);
    if (level <= 0) continue;

    const reach = getOrganizationSegmentReach(tool.id);
    if (!reach) continue;

    const amount = reach.amountPerLevel * level;
    const toolEffects: Partial<Record<SegmentId, number>> = {};

    for (const segmentId of reach.segments) {
      toolEffects[segmentId] = amount;
      segmentEffects[segmentId] = (segmentEffects[segmentId] ?? 0) + amount;
    }

    segmentSupport = applySegmentEffects(segmentSupport, toolEffects);

    const segmentNames = reach.segments.map((id) => segmentLabels[id]).join(', ');
    lines.push(`${tool.name} / Ulusal (Sv.${level}): ${segmentNames} +${amount}`);
  }

  return {
    state: { ...state, segmentSupport },
    lines,
    segmentEffects,
  };
}
