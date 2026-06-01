/**
 * Ulusal örgüt araçları denge katmanı.
 *
 * Bölgesel ayak izi (İl Bürosu sayısı), aktif ulusal araç yükü (bürokrasi),
 * ideoloji/liderlik uyumu ve kampanya evresi maliyet/etkiyi modüle eder.
 */

import type { GameState, IdeologyId, LeadershipStyleId } from '../types/game';
import type { OrganizationEffectBundle } from '../types/organization';
import { countRegionsWithIlPartyOffice } from '../engine/electionEligibilityEngine';
import {
  NATIONAL_ORGANIZATION_TOOL_IDS,
  type NationalOrganizationToolId,
} from './nationalOrganizationTools';
import { scaleResourceCostForRegion } from './regionBalance';

function getNationalToolLevel(state: GameState, toolId: string): number {
  return state.nationalOrganizationToolLevels[toolId] ?? 0;
}

export const NATIONAL_FOOTPRINT_BUILD_DISCOUNT_PER_OFFICE = 0.025;
export const NATIONAL_FOOTPRINT_BUILD_DISCOUNT_CAP = 0.12;
export const NATIONAL_FOOTPRINT_MAINTENANCE_PER_EXTRA_OFFICE = 0.04;
export const NATIONAL_BUREAUCRACY_OVERHEAD_PER_TOOL = 0.05;
export const NATIONAL_BUREAUCRACY_OVERHEAD_CAP = 0.35;

export type NationalToolTier = 'foundation' | 'core' | 'premium';

export interface NationalToolBalanceProfile {
  tier: NationalToolTier;
  roleLabel: string;
  buildCostMultiplier?: number;
  maintenanceMultiplier?: number;
  effectMultiplier?: number;
}

export interface NationalAffinityModifier {
  build?: number;
  maintenance?: number;
  effect?: number;
  label?: string;
}

export interface NationalBalanceSummary {
  ilOfficeCount: number;
  activeNationalTools: number;
  buildDiscountPercent: number;
  maintenanceSurchargePercent: number;
  bureaucracyOverheadPercent: number;
  campaignPhaseLabel: string;
  affinityLabels: string[];
}

export const nationalToolBalanceProfiles: Record<
  NationalOrganizationToolId,
  NationalToolBalanceProfile
> = {
  party_headquarters: {
    tier: 'foundation',
    roleLabel: 'Merkez omurga — diğer ulusal araçların kapısı',
    maintenanceMultiplier: 1.08,
  },
  social_media_team: {
    tier: 'core',
    roleLabel: 'Görünürlük motoru — genç ve medya metrikleri',
    effectMultiplier: 1.05,
  },
  membership_fee_system: {
    tier: 'core',
    roleLabel: 'Mali sürdürülebilirlik — haftalık net gelir üretir',
    buildCostMultiplier: 0.95,
  },
  legal_team_unit: {
    tier: 'core',
    roleLabel: 'Kriz ve hukuk savunması — seçim dönemi sigortası',
    maintenanceMultiplier: 1.05,
    effectMultiplier: 1.05,
  },
  polling_center: {
    tier: 'premium',
    roleLabel: 'Strateji verisi — geç oyun yatırımı',
    buildCostMultiplier: 1.08,
    maintenanceMultiplier: 1.1,
  },
  campaign_consultancy: {
    tier: 'premium',
    roleLabel: 'Profesyonel kampanya — yüksek bakım, yüksek görünürlük',
    buildCostMultiplier: 1.12,
    maintenanceMultiplier: 1.15,
    effectMultiplier: 1.08,
  },
};

const ideologyNationalAffinities: Partial<
  Record<IdeologyId, Partial<Record<NationalOrganizationToolId, NationalAffinityModifier>>>
> = {
  'liberal-economist': {
    membership_fee_system: { build: 0.9, effect: 1.15, label: 'Liberal ekonomi — aidat ağı verimli' },
    campaign_consultancy: { build: 0.92, label: 'Profesyonel kampanyaya yatkın' },
  },
  'libertarian-democrat': {
    social_media_team: { build: 0.92, effect: 1.18, label: 'Dijital seçmen erişimi güçlü' },
    legal_team_unit: { build: 0.95, effect: 1.1, label: 'Hukuk devleti vurgusu' },
  },
  'populist-social': {
    membership_fee_system: { effect: 1.12, maintenance: 1.06, label: 'Taban aidatı — kurumsal maliyet biraz yüksek' },
    party_headquarters: { maintenance: 1.05, label: 'Merkez kurumsallaşması daha ağır' },
  },
  'nationalist-security': {
    legal_team_unit: { build: 0.93, effect: 1.15, label: 'Hukuk ve kriz savunması güçlü' },
    social_media_team: { effect: 0.95, label: 'Dijital kanallarda daha yavaş büyüme' },
  },
  'centrist-reform': {
    polling_center: { build: 0.94, effect: 1.1, label: 'Veri odaklı merkez siyaseti' },
    party_headquarters: { build: 0.96, label: 'Kurumsal merkez kurulumu kolay' },
  },
  'conservative-democrat': {
    membership_fee_system: { effect: 1.08, label: 'Yerel bağış ve aidat ağı verimli' },
    social_media_team: { effect: 0.92, label: 'Dijital erişim daha maliyetli' },
  },
  'green-localist': {
    party_headquarters: { maintenance: 1.08, label: 'Ulusal merkez yükü — yerel odak' },
    polling_center: { build: 1.05, label: 'Ulusal anket altyapısı pahalı' },
  },
  'populist-radical': {
    social_media_team: { build: 0.9, effect: 1.12, label: 'Viral söylem avantajı' },
    legal_team_unit: { maintenance: 1.1, label: 'Hukuk savunması sürekli yük bindirir' },
  },
};

const leadershipNationalAffinities: Partial<
  Record<LeadershipStyleId, Partial<Record<NationalOrganizationToolId, NationalAffinityModifier>>>
> = {
  charismatic: {
    social_media_team: { effect: 1.12, label: 'Karizmatik lider — medya etkisi yüksek' },
    campaign_consultancy: { effect: 1.08, label: 'Danışmanlık görünürlüğü güçlenir' },
  },
  organizer: {
    party_headquarters: { build: 0.92, maintenance: 0.92, label: 'Teşkilatçı — merkez maliyeti düşük' },
    membership_fee_system: { effect: 1.1, label: 'Saha aidat ağı verimli' },
    social_media_team: { effect: 0.9, label: 'Ulusal medya etkisi sınırlı' },
  },
  technocrat: {
    polling_center: { build: 0.9, effect: 1.15, label: 'Teknokrat — anket ve veri güçlü' },
    campaign_consultancy: { build: 0.94, effect: 1.1, label: 'Profesyonel yönetim avantajı' },
    legal_team_unit: { effect: 1.08, label: 'Hukuki savunma disiplini' },
  },
  populist: {
    social_media_team: { effect: 1.1, label: 'Popülist söylem dijitalde hızlı yayılır' },
    legal_team_unit: { maintenance: 1.08, label: 'Hukuk birimi sürekli meşgul' },
  },
  conciliator: {
    party_headquarters: { build: 0.94, label: 'Uzlaşmacı — merkez kurulumu kolay' },
    polling_center: { effect: 1.08, label: 'Ortak veri dili güven yaratır' },
  },
};

function combineModifiers(
  ...modifiers: Array<NationalAffinityModifier | undefined>
): NationalAffinityModifier {
  let build = 1;
  let maintenance = 1;
  let effect = 1;

  for (const mod of modifiers) {
    if (!mod) continue;
    build *= mod.build ?? 1;
    maintenance *= mod.maintenance ?? 1;
    effect *= mod.effect ?? 1;
  }

  return { build, maintenance, effect };
}

export function getNationalIlOfficeCount(state: GameState): number {
  return countRegionsWithIlPartyOffice(state);
}

export function getActiveNationalToolCount(state: GameState): number {
  return NATIONAL_ORGANIZATION_TOOL_IDS.filter(
    (toolId) => getNationalToolLevel(state, toolId) > 0,
  ).length;
}

export function getNationalFootprintBuildDiscount(state: GameState): number {
  const offices = getNationalIlOfficeCount(state);
  return Math.min(
    NATIONAL_FOOTPRINT_BUILD_DISCOUNT_CAP,
    offices * NATIONAL_FOOTPRINT_BUILD_DISCOUNT_PER_OFFICE,
  );
}

export function getNationalFootprintMaintenanceSurcharge(state: GameState): number {
  const extraOffices = Math.max(0, getNationalIlOfficeCount(state) - 1);
  return extraOffices * NATIONAL_FOOTPRINT_MAINTENANCE_PER_EXTRA_OFFICE;
}

export function getNationalBureaucracyOverhead(state: GameState): number {
  const activeTools = getActiveNationalToolCount(state);
  if (activeTools <= 1) return 0;

  return Math.min(
    NATIONAL_BUREAUCRACY_OVERHEAD_CAP,
    (activeTools - 1) * NATIONAL_BUREAUCRACY_OVERHEAD_PER_TOOL,
  );
}

function getCampaignPhaseModifiers(state: GameState): NationalAffinityModifier & { label: string } {
  const week = state.campaignWeek;

  if (week <= 16) {
    return {
      build: 1.08,
      maintenance: 1,
      effect: 0.98,
      label: 'Erken kampanya — kurulum maliyeti +%8',
    };
  }

  if (week >= 40) {
    return {
      build: 1,
      maintenance: 1.06,
      effect: 1.02,
      label: 'Seçim sprinti — bakım +%6, etki +%2',
    };
  }

  return {
    build: 1,
    maintenance: 1,
    effect: 1,
    label: 'Orta kampanya — standart denge',
  };
}

function getIdeologyModifier(
  state: GameState,
  toolId: NationalOrganizationToolId,
): NationalAffinityModifier | undefined {
  return ideologyNationalAffinities[state.party.ideologyId]?.[toolId];
}

function getLeadershipModifier(
  state: GameState,
  toolId: NationalOrganizationToolId,
): NationalAffinityModifier | undefined {
  return leadershipNationalAffinities[state.party.leadershipStyleId]?.[toolId];
}

export function getNationalToolBalanceModifiers(
  state: GameState,
  toolId: string,
): { build: number; maintenance: number; effect: number } {
  const profile =
    nationalToolBalanceProfiles[toolId as NationalOrganizationToolId] ??
    nationalToolBalanceProfiles.party_headquarters;

  const phase = getCampaignPhaseModifiers(state);
  const ideology = getIdeologyModifier(state, toolId as NationalOrganizationToolId);
  const leadership = getLeadershipModifier(state, toolId as NationalOrganizationToolId);
  const affinity = combineModifiers(ideology, leadership);

  const buildDiscount = getNationalFootprintBuildDiscount(state);
  const maintenanceSurcharge = getNationalFootprintMaintenanceSurcharge(state);
  const bureaucracy = getNationalBureaucracyOverhead(state);

  const build =
    (profile.buildCostMultiplier ?? 1) *
    (1 - buildDiscount) *
    (affinity.build ?? 1) *
    (phase.build ?? 1);

  const maintenance =
    (profile.maintenanceMultiplier ?? 1) *
    (1 + maintenanceSurcharge) *
    (1 + bureaucracy) *
    (affinity.maintenance ?? 1) *
    (phase.maintenance ?? 1);

  const effect = (profile.effectMultiplier ?? 1) * (affinity.effect ?? 1) * (phase.effect ?? 1);

  return {
    build: Math.round(build * 1000) / 1000,
    maintenance: Math.round(maintenance * 1000) / 1000,
    effect: Math.round(effect * 1000) / 1000,
  };
}

export function scaleNationalResourceCost(
  state: GameState,
  toolId: string,
  cost: Partial<Record<string, number>>,
  kind: 'build' | 'maintenance',
): Partial<Record<string, number>> {
  const modifiers = getNationalToolBalanceModifiers(state, toolId);
  const multiplier = kind === 'build' ? modifiers.build : modifiers.maintenance;
  return scaleResourceCostForRegion(cost, multiplier);
}

export function scaleNationalEffectBundle(
  state: GameState,
  toolId: string,
  bundle: OrganizationEffectBundle,
): OrganizationEffectBundle {
  const { effect } = getNationalToolBalanceModifiers(state, toolId);
  if (effect === 1) return bundle;

  const scaleRecord = <T extends string>(
    record: Partial<Record<T, number>> | undefined,
  ): Partial<Record<T, number>> | undefined => {
    if (!record) return undefined;

    const scaled = {} as Partial<Record<T, number>>;
    for (const [key, value] of Object.entries(record)) {
      if (typeof value !== 'number') continue;
      const next = Math.round(value * effect);
      if (next !== 0) {
        scaled[key as T] = next;
      }
    }
    return Object.keys(scaled).length > 0 ? scaled : undefined;
  };

  return {
    resources: scaleRecord(bundle.resources),
    metrics: scaleRecord(bundle.metrics),
  };
}

export function getNationalToolRoleLabel(toolId: string): string | null {
  return nationalToolBalanceProfiles[toolId as NationalOrganizationToolId]?.roleLabel ?? null;
}

export function getNationalBalanceSummary(state: GameState): NationalBalanceSummary {
  const phase = getCampaignPhaseModifiers(state);
  const affinityLabels = new Set<string>();

  for (const toolId of NATIONAL_ORGANIZATION_TOOL_IDS) {
    if (getNationalToolLevel(state, toolId) <= 0) continue;

    const ideology = getIdeologyModifier(state, toolId);
    const leadership = getLeadershipModifier(state, toolId);

    if (ideology?.label) affinityLabels.add(ideology.label);
    if (leadership?.label) affinityLabels.add(leadership.label);
  }

  return {
    ilOfficeCount: getNationalIlOfficeCount(state),
    activeNationalTools: getActiveNationalToolCount(state),
    buildDiscountPercent: Math.round(getNationalFootprintBuildDiscount(state) * 100),
    maintenanceSurchargePercent: Math.round(getNationalFootprintMaintenanceSurcharge(state) * 100),
    bureaucracyOverheadPercent: Math.round(getNationalBureaucracyOverhead(state) * 100),
    campaignPhaseLabel: phase.label,
    affinityLabels: [...affinityLabels],
  };
}

export function getNationalToolAffinityHint(
  state: GameState,
  toolId: string,
): string | null {
  const ideology = getIdeologyModifier(state, toolId as NationalOrganizationToolId);
  const leadership = getLeadershipModifier(state, toolId as NationalOrganizationToolId);

  if (ideology?.label) return ideology.label;
  if (leadership?.label) return leadership.label;
  return getNationalToolRoleLabel(toolId);
}
