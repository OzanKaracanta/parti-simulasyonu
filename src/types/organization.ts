/** Örgütlenme araçları — kalıcı altyapı yatırımları */

import type { ActionCategory, MetricKey, ResourceKey } from './game';

export type OrganizationToolCategory = ActionCategory;

export type OrganizationToolStatus =
  | 'available'
  | 'locked'
  | 'active'
  | 'maxed'
  | 'insufficient_resources';

/** Doküman → oyun eşlemesi: Bilinirlik→campaignVisibility, Yerel Güven→leaderTrust, vb. */
export interface OrganizationLevelRequirements {
  resources?: Partial<Record<ResourceKey, number>>;
  metrics?: Partial<Record<MetricKey, number>>;
  requiredTools?: { toolId: string; minLevel: number }[];
  /** Ulusal araçlar — en az bu kadar bölgede İl Parti Bürosu gerekir */
  minRegionsWithIlOffice?: number;
}

export interface OrganizationEffectBundle {
  resources?: Partial<Record<ResourceKey, number>>;
  metrics?: Partial<Record<MetricKey, number>>;
}

export interface OrganizationLevelDefinition {
  level: number;
  title: string;
  buildCost: Partial<Record<ResourceKey, number>>;
  weeklyMaintenance: Partial<Record<ResourceKey, number>>;
  instantEffects: OrganizationEffectBundle;
  weeklyEffects: OrganizationEffectBundle;
  requirements: OrganizationLevelRequirements;
  unlockActionIds?: string[];
  unlockToolIds?: string[];
  risks: string[];
  maintenanceFailureEffects?: OrganizationEffectBundle;
}

export interface OrganizationToolDefinition {
  id: string;
  name: string;
  category: OrganizationToolCategory;
  description: string;
  maxLevel: number;
  levels: OrganizationLevelDefinition[];
  /** Hibrit araçlar için ek kategori (ör. Esnaf İletişim Ağı) */
  secondaryCategory?: OrganizationToolCategory;
}

export type OrganizationToolLevels = Record<string, number>;

export interface OrganizationToolView {
  definition: OrganizationToolDefinition;
  level: number;
  levelTitle: string | null;
  status: OrganizationToolStatus;
  weeklyEffects: OrganizationEffectBundle;
  weeklyMaintenance: Partial<Record<ResourceKey, number>>;
  nextInstantEffects: OrganizationEffectBundle | null;
  buildCost: Partial<Record<ResourceKey, number>>;
  upgradeCost: Partial<Record<ResourceKey, number>> | null;
  risks: string[];
  unlockActionIds: string[];
  unlockToolIds: string[];
  canRevert: boolean;
}

export interface OrganizationWeeklySummary {
  resourceYield: Partial<Record<ResourceKey, number>>;
  metricEffects: Partial<Record<MetricKey, number>>;
  maintenanceCost: Partial<Record<ResourceKey, number>>;
  netResourceDelta: Partial<Record<ResourceKey, number>>;
  productionLines: string[];
}

export interface OrganizationToolWeekResult {
  toolId: string;
  toolName: string;
  level: number;
  maintenancePaid: boolean;
  maintenance: Partial<Record<ResourceKey, number>>;
  effectsApplied: OrganizationEffectBundle;
}
