/** Seçime yeterlilik — 4/7 bölgede İl Parti Bürosu + %15 ulusal destek */

import type { GameState, RegionId } from '../types/game';
import { getRegionOrganizationToolLevel } from '../systems/regionOrganization';

export const ELIGIBILITY_REQUIRED_REGIONS = 4;
export const ELIGIBILITY_MIN_NATIONAL_SUPPORT = 15;
export const ELIGIBILITY_OFFICE_TOOL_ID = 'il_party_office';

export interface ElectionEligibilityStatus {
  regionsWithOffice: number;
  requiredRegions: number;
  nationalSupport: number;
  requiredSupport: number;
  meetsRegionalRequirement: boolean;
  meetsSupportRequirement: boolean;
  isEligible: boolean;
  regionsWithOfficeIds: RegionId[];
}

export function countRegionsWithIlPartyOffice(state: GameState): number {
  return state.regions.filter(
    (region) =>
      getRegionOrganizationToolLevel(state, region.id as RegionId, ELIGIBILITY_OFFICE_TOOL_ID) >= 1,
  ).length;
}

export function getRegionsWithIlPartyOffice(state: GameState): RegionId[] {
  return state.regions
    .filter(
      (region) =>
        getRegionOrganizationToolLevel(state, region.id as RegionId, ELIGIBILITY_OFFICE_TOOL_ID) >=
        1,
    )
    .map((region) => region.id as RegionId);
}

export function getElectionEligibility(state: GameState): ElectionEligibilityStatus {
  const regionsWithOfficeIds = getRegionsWithIlPartyOffice(state);
  const regionsWithOffice = regionsWithOfficeIds.length;
  const nationalSupport = state.nationalSupport;
  const meetsRegionalRequirement = regionsWithOffice >= ELIGIBILITY_REQUIRED_REGIONS;
  const meetsSupportRequirement = nationalSupport >= ELIGIBILITY_MIN_NATIONAL_SUPPORT;

  return {
    regionsWithOffice,
    requiredRegions: ELIGIBILITY_REQUIRED_REGIONS,
    nationalSupport,
    requiredSupport: ELIGIBILITY_MIN_NATIONAL_SUPPORT,
    meetsRegionalRequirement,
    meetsSupportRequirement,
    isEligible: meetsRegionalRequirement && meetsSupportRequirement,
    regionsWithOfficeIds,
  };
}
