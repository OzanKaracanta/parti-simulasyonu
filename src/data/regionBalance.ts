/**
 * Bölge bazlı denge — maliyet, destek artışı ve araç farklılaştırması.
 *
 * difficultyMultiplier: kurulum/bakım maliyeti (zor bölgeler pahalı)
 * potentialMultiplier: destek artış hızı (yüksek potansiyel = daha hızlı büyüme)
 * organizationAffinity: örgüt metriklerinin bölgeye yansıması
 */

import type { RegionId } from '../types/game';
import type { RegionalOrganizationToolId } from './regionalOrganizationTools';

export interface RegionToolModifier {
  buildCostMultiplier?: number;
  maintenanceMultiplier?: number;
  supportMultiplier?: number;
  organizationMultiplier?: number;
  /** Haftalık/anlık metrik etkilerine ek çarpan */
  effectMultiplier?: number;
}

export interface RegionBalanceProfile {
  id: RegionId;
  difficultyMultiplier: number;
  potentialMultiplier: number;
  organizationAffinity: number;
  /** UI'da gösterilen bölgesel uzmanlık */
  specialtyToolId: RegionalOrganizationToolId;
  specialtyLabel: string;
  toolModifiers: Partial<Record<RegionalOrganizationToolId, RegionToolModifier>>;
}

export const HOME_REGION_BUILD_DISCOUNT = 0.88;
export const REMOTE_REGION_IDS = new Set<RegionId>(['dogu-anadolu', 'guneydogu-anadolu']);

const toolMod = (modifier: RegionToolModifier): RegionToolModifier => modifier;

export const regionBalanceProfiles: Record<RegionId, RegionBalanceProfile> = {
  marmara: {
    id: 'marmara',
    difficultyMultiplier: 1.22,
    potentialMultiplier: 1.18,
    organizationAffinity: 0.95,
    specialtyToolId: 'local_press_network',
    specialtyLabel: 'Medya ağırlıklı — Yerel Basın daha verimli',
    toolModifiers: {
      local_press_network: toolMod({
        buildCostMultiplier: 0.82,
        maintenanceMultiplier: 0.88,
        effectMultiplier: 1.25,
        supportMultiplier: 1.15,
      }),
      il_party_office: toolMod({ buildCostMultiplier: 1.12, maintenanceMultiplier: 1.1 }),
      volunteer_network: toolMod({ buildCostMultiplier: 1.05 }),
    },
  },
  ege: {
    id: 'ege',
    difficultyMultiplier: 0.96,
    potentialMultiplier: 1.08,
    organizationAffinity: 1.05,
    specialtyToolId: 'neighborhood_organization',
    specialtyLabel: 'Mahalle teması güçlü — yerel güven hızlı artar',
    toolModifiers: {
      neighborhood_organization: toolMod({
        buildCostMultiplier: 0.92,
        supportMultiplier: 1.22,
        organizationMultiplier: 1.15,
      }),
      il_party_office: toolMod({ buildCostMultiplier: 0.95 }),
    },
  },
  'ic-anadolu': {
    id: 'ic-anadolu',
    difficultyMultiplier: 0.94,
    potentialMultiplier: 1.1,
    organizationAffinity: 1.12,
    specialtyToolId: 'il_party_office',
    specialtyLabel: 'Teşkilat geleneği — İl Bürosu daha ucuz',
    toolModifiers: {
      il_party_office: toolMod({
        buildCostMultiplier: 0.78,
        maintenanceMultiplier: 0.9,
        organizationMultiplier: 1.2,
        supportMultiplier: 1.1,
      }),
      volunteer_network: toolMod({
        buildCostMultiplier: 0.9,
        organizationMultiplier: 1.12,
      }),
      local_press_network: toolMod({ buildCostMultiplier: 1.08 }),
    },
  },
  akdeniz: {
    id: 'akdeniz',
    difficultyMultiplier: 1,
    potentialMultiplier: 1.12,
    organizationAffinity: 1,
    specialtyToolId: 'volunteer_network',
    specialtyLabel: 'Saha teması — Gönüllü Ağı hızlı büyür',
    toolModifiers: {
      volunteer_network: toolMod({
        buildCostMultiplier: 0.9,
        supportMultiplier: 1.18,
        organizationMultiplier: 1.1,
      }),
      district_party_office: toolMod({ supportMultiplier: 1.12 }),
    },
  },
  karadeniz: {
    id: 'karadeniz',
    difficultyMultiplier: 1.06,
    potentialMultiplier: 0.96,
    organizationAffinity: 1.08,
    specialtyToolId: 'neighborhood_organization',
    specialtyLabel: 'Kırsal örgüt — Mahalle ağı verimli',
    toolModifiers: {
      neighborhood_organization: toolMod({
        buildCostMultiplier: 0.85,
        supportMultiplier: 1.2,
        organizationMultiplier: 1.18,
      }),
      local_press_network: toolMod({ buildCostMultiplier: 1.15, effectMultiplier: 0.85 }),
      volunteer_network: toolMod({ supportMultiplier: 1.1 }),
    },
  },
  'dogu-anadolu': {
    id: 'dogu-anadolu',
    difficultyMultiplier: 1.28,
    potentialMultiplier: 0.92,
    organizationAffinity: 1.05,
    specialtyToolId: 'volunteer_network',
    specialtyLabel: 'Uzak bölge — giriş ucuz, kurumsallaşma pahalı',
    toolModifiers: {
      volunteer_network: toolMod({ buildCostMultiplier: 0.8, supportMultiplier: 1.08 }),
      neighborhood_organization: toolMod({ buildCostMultiplier: 1.05 }),
      il_party_office: toolMod({
        buildCostMultiplier: 1.22,
        maintenanceMultiplier: 1.15,
        supportMultiplier: 1.25,
        organizationMultiplier: 1.15,
      }),
      district_party_office: toolMod({ buildCostMultiplier: 1.12 }),
    },
  },
  'guneydogu-anadolu': {
    id: 'guneydogu-anadolu',
    difficultyMultiplier: 1.2,
    potentialMultiplier: 1.14,
    organizationAffinity: 1.06,
    specialtyToolId: 'volunteer_network',
    specialtyLabel: 'Genç nüfus — Gönüllü ve saha etkisi yüksek',
    toolModifiers: {
      volunteer_network: toolMod({
        buildCostMultiplier: 0.88,
        supportMultiplier: 1.28,
        organizationMultiplier: 1.15,
      }),
      il_party_office: toolMod({ buildCostMultiplier: 1.1 }),
      small_donation_campaign: toolMod({ effectMultiplier: 0.9 }),
    },
  },
};

export function getRegionBalanceProfile(regionId: RegionId): RegionBalanceProfile {
  return regionBalanceProfiles[regionId];
}

export function getRegionToolModifier(
  regionId: RegionId,
  toolId: string,
): RegionToolModifier {
  return getRegionBalanceProfile(regionId).toolModifiers[toolId as RegionalOrganizationToolId] ?? {};
}

export function getRegionBuildCostMultiplier(
  regionId: RegionId,
  toolId: string,
  homeRegionId: RegionId,
): number {
  const profile = getRegionBalanceProfile(regionId);
  const tool = getRegionToolModifier(regionId, toolId);
  let multiplier = profile.difficultyMultiplier * (tool.buildCostMultiplier ?? 1);

  if (regionId === homeRegionId) {
    multiplier *= HOME_REGION_BUILD_DISCOUNT;
  }

  return Math.round(multiplier * 100) / 100;
}

export function getRegionMaintenanceMultiplier(regionId: RegionId, toolId: string): number {
  const profile = getRegionBalanceProfile(regionId);
  const tool = getRegionToolModifier(regionId, toolId);
  return profile.difficultyMultiplier * (tool.maintenanceMultiplier ?? 1);
}

export function getRegionSupportGrowthMultiplier(regionId: RegionId, toolId: string): number {
  const profile = getRegionBalanceProfile(regionId);
  const tool = getRegionToolModifier(regionId, toolId);
  return profile.potentialMultiplier * (tool.supportMultiplier ?? 1);
}

export function getRegionOrganizationGrowthMultiplier(regionId: RegionId, toolId: string): number {
  const profile = getRegionBalanceProfile(regionId);
  const tool = getRegionToolModifier(regionId, toolId);
  return profile.organizationAffinity * (tool.organizationMultiplier ?? 1);
}

export function getRegionEffectMultiplier(regionId: RegionId, toolId: string): number {
  const tool = getRegionToolModifier(regionId, toolId);
  return tool.effectMultiplier ?? 1;
}

export function scaleResourceCostForRegion(
  cost: Partial<Record<string, number>>,
  multiplier: number,
): Partial<Record<string, number>> {
  if (multiplier === 1) return { ...cost };

  const scaled: Partial<Record<string, number>> = {};
  for (const [key, value] of Object.entries(cost)) {
    if (value == null) continue;
    scaled[key] = Math.max(key === 'money' ? 1 : 1, Math.round(value * multiplier));
  }
  return scaled;
}

export function getRegionalActionSupportMultiplier(regionId: RegionId): number {
  return getRegionBalanceProfile(regionId).potentialMultiplier;
}

export function getRegionalActionCostMultiplier(
  regionId: RegionId,
  homeRegionId: RegionId,
): number {
  let multiplier = getRegionBalanceProfile(regionId).difficultyMultiplier;
  if (regionId === homeRegionId) {
    multiplier *= HOME_REGION_BUILD_DISCOUNT;
  }
  if (REMOTE_REGION_IDS.has(regionId) && regionId !== homeRegionId) {
    multiplier *= 1.08;
  }
  return Math.round(multiplier * 100) / 100;
}
