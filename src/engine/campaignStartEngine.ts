/**
 * Kampanya başlangıç örgüt footprint — kuruluş mirası.
 * Seviyeler doğrudan yazılır; buildTool/instantEffects tetiklenmez.
 */

import {
  CAMPAIGN_START_CONFIG,
  CAMPAIGN_START_NATIONAL_SUPPORT,
  CAMPAIGN_START_TOOL_IDS,
} from '../data/campaignStartConfig';
import {
  createInitialRivalParties,
  getRulingParty,
  RIVAL_START_NATIONAL_SUPPORT,
} from '../data/rivals';
import { pickStartingIlOfficeRegions } from '../data/regionAdjacency';
import { createInitialNationalOrganizationToolLevels } from '../data/nationalOrganizationTools';
import { getRegionById } from '../data/regions';
import { createInitialOrganizationToolLevelsByRegion } from '../systems/regionOrganization';
import type { RegionId } from '../types/game';
import type { OrganizationToolLevels } from '../types/organization';

export interface CampaignStartFootprint {
  homeRegionId: RegionId;
  /** Merkez + komşu — toplam 3 bölgede il bürosu */
  ilOfficeRegionIds: RegionId[];
  /** Yalnızca komşu bölgeler (2) */
  neighborIlOfficeRegionIds: RegionId[];
  organizationToolLevelsByRegion: Record<RegionId, OrganizationToolLevels>;
  nationalOrganizationToolLevels: Record<string, number>;
}

function setToolLevel(
  levels: OrganizationToolLevels,
  toolId: string,
  level: number,
): void {
  if (level <= 0) return;
  levels[toolId] = level;
}

function applyFoundingIlOfficeChain(levels: OrganizationToolLevels, ilLevel: number): void {
  const { grantFoundingPrerequisites } = CAMPAIGN_START_CONFIG;
  const tools = CAMPAIGN_START_TOOL_IDS;

  setToolLevel(levels, tools.ilOffice, ilLevel);

  if (!grantFoundingPrerequisites) return;

  setToolLevel(levels, tools.volunteerNetwork, 1);
  setToolLevel(levels, tools.neighborhoodOrganization, 1);
}

export function buildCampaignStartFootprint(homeRegionId: RegionId): CampaignStartFootprint {
  const { neighborIlOfficeRegionCount, ilOfficeLevel, nationalHeadquartersLevel } =
    CAMPAIGN_START_CONFIG;

  const neighborIlOfficeRegionIds = pickStartingIlOfficeRegions(
    homeRegionId,
    neighborIlOfficeRegionCount,
  );
  const organizationToolLevelsByRegion = createInitialOrganizationToolLevelsByRegion();

  applyFoundingIlOfficeChain(organizationToolLevelsByRegion[homeRegionId], ilOfficeLevel);

  for (const regionId of neighborIlOfficeRegionIds) {
    applyFoundingIlOfficeChain(organizationToolLevelsByRegion[regionId], ilOfficeLevel);
  }

  const nationalOrganizationToolLevels = createInitialNationalOrganizationToolLevels();
  setToolLevel(
    nationalOrganizationToolLevels,
    CAMPAIGN_START_TOOL_IDS.nationalHeadquarters,
    nationalHeadquartersLevel,
  );

  const ilOfficeRegionIds = [homeRegionId, ...neighborIlOfficeRegionIds];

  return {
    homeRegionId,
    ilOfficeRegionIds,
    neighborIlOfficeRegionIds,
    organizationToolLevelsByRegion,
    nationalOrganizationToolLevels,
  };
}

/** Kurulum önizlemesi ve doğrulama scriptleri için okunabilir özet */
export function describeCampaignStartFootprint(homeRegionId: RegionId): {
  homeRegionName: string;
  neighborIlOfficeRegionNames: string[];
} {
  const footprint = buildCampaignStartFootprint(homeRegionId);

  return {
    homeRegionName: getRegionById(footprint.homeRegionId).name,
    neighborIlOfficeRegionNames: footprint.neighborIlOfficeRegionIds.map(
      (id) => getRegionById(id).name,
    ),
  };
}

export interface CampaignStartPreviewSummary {
  homeRegionName: string;
  neighborIlOfficeRegionNames: string[];
  playerSupportLabel: string;
  rulingPartyName: string;
  rulingPartySupport: number;
}

/** Kurulum ekranı — kuruluş mirası ve rakip kıyası */
export function getCampaignStartPreviewSummary(homeRegionId: RegionId): CampaignStartPreviewSummary {
  const { homeRegionName, neighborIlOfficeRegionNames } =
    describeCampaignStartFootprint(homeRegionId);
  const ruling = getRulingParty(createInitialRivalParties());
  const { min, max } = CAMPAIGN_START_NATIONAL_SUPPORT;

  return {
    homeRegionName,
    neighborIlOfficeRegionNames,
    playerSupportLabel: `~%${min}–${max}`,
    rulingPartyName: ruling?.shortName ?? 'İktidar',
    rulingPartySupport: ruling?.nationalSupport ?? RIVAL_START_NATIONAL_SUPPORT.ruling,
  };
}
