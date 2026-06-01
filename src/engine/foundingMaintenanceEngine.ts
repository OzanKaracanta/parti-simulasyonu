/**
 * Kuruluş mirası bakım indirimi — kampanya başında verilen bölgesel araçlar.
 */

import {
  CAMPAIGN_START_CONFIG,
  CAMPAIGN_START_TOOL_IDS,
} from '../data/campaignStartConfig';
import { pickStartingIlOfficeRegions } from '../data/regionAdjacency';
import type { GameState, RegionId } from '../types/game';

const FOUNDING_REGIONAL_TOOL_IDS = new Set<string>([
  CAMPAIGN_START_TOOL_IDS.volunteerNetwork,
  CAMPAIGN_START_TOOL_IDS.neighborhoodOrganization,
  CAMPAIGN_START_TOOL_IDS.ilOffice,
]);

function getFoundingRegionIds(homeRegionId: RegionId): Set<RegionId> {
  const neighbors = pickStartingIlOfficeRegions(
    homeRegionId,
    CAMPAIGN_START_CONFIG.neighborIlOfficeRegionCount,
  );
  return new Set<RegionId>([homeRegionId, ...neighbors]);
}

/** Kuruluş mirası bölgesel araç bakım çarpanı (1 = indirim yok) */
export function getFoundingRegionalMaintenanceMultiplier(
  state: GameState,
  regionId: RegionId,
  toolId: string,
): number {
  const { foundingRegionalMaintenanceMultiplier, foundingMaintenanceGraceWeeks } =
    CAMPAIGN_START_CONFIG;

  if (state.campaignWeek > foundingMaintenanceGraceWeeks) return 1;
  if (!FOUNDING_REGIONAL_TOOL_IDS.has(toolId)) return 1;

  const foundingRegions = getFoundingRegionIds(state.party.homeRegionId);
  if (!foundingRegions.has(regionId)) return 1;

  const level = state.organizationToolLevelsByRegion[regionId]?.[toolId] ?? 0;
  if (level < 1) return 1;

  return foundingRegionalMaintenanceMultiplier;
}
