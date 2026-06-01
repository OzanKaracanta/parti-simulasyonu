/** Örgütlenme araçları — bölge bazlı kurulum, yükseltme, bakım ve haftalık üretim */

import {
  scaleOrganizationEffectBundle,
  scaleResourcePartial,
} from '../data/campaignConfig';
import {
  CENTRAL_TREASURY_TOOL_IDS,
  getOrganizationToolById,
  organizationToolDefinitions,
} from '../data/organizationTools';
import {
  getRegionBuildCostMultiplier,
  getRegionEffectMultiplier,
  getRegionMaintenanceMultiplier,
  getRegionOrganizationGrowthMultiplier,
  getRegionSupportGrowthMultiplier,
  scaleResourceCostForRegion,
} from '../data/regionBalance';
import { metricLabels, resourceLabels } from '../data/labels';
import { getRegionById } from '../data/regions';
import { getFoundingRegionalMaintenanceMultiplier } from '../engine/foundingMaintenanceEngine';
import {
  ALL_REGION_IDS,
  getRegionOrganizationLevels,
  getRegionOrganizationToolLevel,
  setRegionOrganizationToolLevel,
} from './regionOrganization';
import {
  getActiveNationalOrganizationToolViews,
  simulateWeeklyNationalOrganizationEffects,
} from './nationalOrganizationSystem';
import type { GameState, MetricKey, OrganizationRevertEntry, RegionId, ResourceKey } from '../types/game';
import type {
  OrganizationEffectBundle,
  OrganizationLevelDefinition,
  OrganizationLevelRequirements,
  OrganizationToolDefinition,
  OrganizationToolLevels,
  OrganizationToolStatus,
  OrganizationToolView,
  OrganizationToolWeekResult,
  OrganizationWeeklySummary,
} from '../types/organization';

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return Math.max(0, Math.min(max, value));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function clampSupport(value: number): number {
  return Math.max(0, Math.min(50, value));
}

export function getOrganizationToolLevel(
  levels: OrganizationToolLevels,
  toolId: string,
): number {
  return levels[toolId] ?? 0;
}

export function getLevelDefinition(
  tool: OrganizationToolDefinition,
  level: number,
): OrganizationLevelDefinition | null {
  if (level <= 0 || level > tool.maxLevel) return null;
  return tool.levels[level - 1] ?? null;
}

export function getNextLevelDefinition(
  tool: OrganizationToolDefinition,
  currentLevel: number,
): OrganizationLevelDefinition | null {
  if (currentLevel >= tool.maxLevel) return null;
  return tool.levels[currentLevel] ?? null;
}

export function meetsLevelRequirements(
  requirements: OrganizationLevelRequirements,
  state: GameState,
  regionId: RegionId,
): boolean {
  if (requirements.resources) {
    for (const [key, min] of Object.entries(requirements.resources)) {
      if (state.resources[key as ResourceKey] < (min ?? 0)) return false;
    }
  }

  if (requirements.metrics) {
    for (const [key, min] of Object.entries(requirements.metrics)) {
      if (state.metrics[key as MetricKey] < (min ?? 0)) return false;
    }
  }

  if (requirements.requiredTools) {
    const regionLevels = getRegionOrganizationLevels(state, regionId);
    for (const req of requirements.requiredTools) {
      const toolLevel = getOrganizationToolLevel(regionLevels, req.toolId);
      if (toolLevel < req.minLevel) return false;
    }
  }

  return true;
}

function canAffordCost(
  state: GameState,
  cost: Partial<Record<ResourceKey, number>>,
): boolean {
  return Object.entries(cost).every(([key, value]) => {
    const resourceKey = key as ResourceKey;
    return state.resources[resourceKey] >= (value ?? 0);
  });
}

function refundCost(
  state: GameState,
  cost: Partial<Record<ResourceKey, number>>,
): GameState {
  const nextResources = { ...state.resources };

  for (const [key, value] of Object.entries(cost)) {
    const resourceKey = key as ResourceKey;
    nextResources[resourceKey] = clampResource(
      nextResources[resourceKey] + (value ?? 0),
      resourceKey,
    );
  }

  return { ...state, resources: nextResources };
}

function negateEffectBundle(effects: OrganizationEffectBundle): OrganizationEffectBundle {
  const resources = effects.resources
    ? (Object.fromEntries(
        Object.entries(effects.resources).map(([key, value]) => [key, -(value ?? 0)]),
      ) as Partial<Record<ResourceKey, number>>)
    : undefined;

  const metrics = effects.metrics
    ? (Object.fromEntries(
        Object.entries(effects.metrics).map(([key, value]) => [key, -(value ?? 0)]),
      ) as Partial<Record<MetricKey, number>>)
    : undefined;

  return { resources, metrics };
}

function pushOrganizationRevertEntry(
  state: GameState,
  entry: OrganizationRevertEntry,
): GameState {
  return {
    ...state,
    organizationRevertStack: [...state.organizationRevertStack, entry],
  };
}

function findLastRevertEntryIndex(
  stack: OrganizationRevertEntry[],
  regionId: RegionId,
  toolId: string,
): number {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (entry?.scope === 'regional' && entry.regionId === regionId && entry.toolId === toolId) {
      return index;
    }
  }

  return -1;
}

export function canRevertOrganizationToolChange(
  state: GameState,
  regionId: RegionId,
  toolId: string,
): boolean {
  return findLastRevertEntryIndex(state.organizationRevertStack, regionId, toolId) >= 0;
}

function applyRegionalInstantDelta(
  state: GameState,
  regionId: RegionId,
  delta: { organization: number; support: number },
): GameState {
  const regions = state.regions.map((region) => {
    if (region.id !== regionId) return region;
    return {
      ...region,
      organization: clampMetric(region.organization + delta.organization),
      support: clampSupport(region.support + delta.support),
    };
  });

  return { ...state, regions };
}

function computeRegionalInstantDelta(
  toolId: string,
  levelDef: OrganizationLevelDefinition,
  regionId: RegionId,
): { organization: number; support: number } {
  const localOrg = levelDef.instantEffects.metrics?.localOrganization ?? 0;
  const regional = levelDef.instantEffects.metrics?.regionalInfluence ?? 0;
  const visibility = levelDef.instantEffects.metrics?.campaignVisibility ?? 0;

  const orgMult = getRegionOrganizationGrowthMultiplier(regionId, toolId);
  const supportMult = getRegionSupportGrowthMultiplier(regionId, toolId);

  let organization = localOrg;
  let support = 0;

  if (toolId === 'il_party_office') {
    organization += 8;
    support += 1.35;
  } else if (localOrg > 0 || regional > 0) {
    organization += Math.max(localOrg, regional * 0.5);
    support += (localOrg + regional) * 0.1;
  }

  if (visibility > 0) {
    support += visibility * 0.06;
  }

  return {
    organization: Math.round(organization * orgMult * 10) / 10,
    support: Math.round(support * supportMult * 10) / 10,
  };
}

export function revertOrganizationToolChange(
  state: GameState,
  regionId: RegionId,
  toolId: string,
): GameState | null {
  const entryIndex = findLastRevertEntryIndex(state.organizationRevertStack, regionId, toolId);
  if (entryIndex < 0) return null;

  const entry = state.organizationRevertStack[entryIndex];
  let nextState = refundCost(state, entry.paidCost);
  nextState = setRegionOrganizationToolLevel(
    nextState,
    regionId,
    toolId,
    entry.previousLevel,
  );
  nextState = {
    ...nextState,
    organizationRevertStack: state.organizationRevertStack.filter((_, index) => index !== entryIndex),
  };

  if (
    Object.keys(entry.instantEffects.resources ?? {}).length > 0 ||
    Object.keys(entry.instantEffects.metrics ?? {}).length > 0
  ) {
    nextState = applyEffectBundle(nextState, negateEffectBundle(entry.instantEffects));
  }

  if (entry.regionalInstantDelta) {
    nextState = applyRegionalInstantDelta(nextState, regionId, {
      organization: -entry.regionalInstantDelta.organization,
      support: -entry.regionalInstantDelta.support,
    });
  }

  return nextState;
}

function payCost(
  state: GameState,
  cost: Partial<Record<ResourceKey, number>>,
): GameState {
  const nextResources = { ...state.resources };

  for (const [key, value] of Object.entries(cost)) {
    const resourceKey = key as ResourceKey;
    nextResources[resourceKey] = clampResource(
      nextResources[resourceKey] - (value ?? 0),
      resourceKey,
    );
  }

  return { ...state, resources: nextResources };
}

function applyEffectBundle(
  state: GameState,
  effects: OrganizationEffectBundle,
): GameState {
  const nextResources = { ...state.resources };
  const nextMetrics = { ...state.metrics };

  if (effects.resources) {
    for (const [key, value] of Object.entries(effects.resources)) {
      const resourceKey = key as ResourceKey;
      nextResources[resourceKey] = clampResource(
        nextResources[resourceKey] + (value ?? 0),
        resourceKey,
      );
    }
  }

  if (effects.metrics) {
    for (const [key, value] of Object.entries(effects.metrics)) {
      const metricKey = key as MetricKey;
      nextMetrics[metricKey] = clampMetric(nextMetrics[metricKey] + (value ?? 0));
    }
  }

  return { ...state, resources: nextResources, metrics: nextMetrics };
}

function applyRegionalWeeklyDelta(
  state: GameState,
  regionId: RegionId,
  toolId: string,
  effects: OrganizationEffectBundle,
): GameState {
  const localOrg = effects.metrics?.localOrganization ?? 0;
  const regional = effects.metrics?.regionalInfluence ?? 0;
  if (localOrg === 0 && regional === 0) return state;

  const orgMult = getRegionOrganizationGrowthMultiplier(regionId, toolId);
  const supportMult = getRegionSupportGrowthMultiplier(regionId, toolId);

  const regions = state.regions.map((region) => {
    if (region.id !== regionId) return region;
    return {
      ...region,
      organization: clampMetric(region.organization + localOrg * 0.55 * orgMult),
      support: clampSupport(region.support + (localOrg + regional) * 0.05 * supportMult),
    };
  });

  return { ...state, regions };
}

function mergeResourceTotals(
  target: Partial<Record<ResourceKey, number>>,
  source: Partial<Record<ResourceKey, number>>,
): Partial<Record<ResourceKey, number>> {
  const merged = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const resourceKey = key as ResourceKey;
    merged[resourceKey] = (merged[resourceKey] ?? 0) + (value ?? 0);
  }
  return merged;
}

function mergeMetricTotals(
  target: Partial<Record<MetricKey, number>>,
  source: Partial<Record<MetricKey, number>>,
): Partial<Record<MetricKey, number>> {
  const merged = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const metricKey = key as MetricKey;
    merged[metricKey] = (merged[metricKey] ?? 0) + (value ?? 0);
  }
  return merged;
}

export function getToolBuildCost(
  tool: OrganizationToolDefinition,
): Partial<Record<ResourceKey, number>> {
  return { ...(tool.levels[0]?.buildCost ?? {}) };
}

export function getToolUpgradeCost(
  tool: OrganizationToolDefinition,
  currentLevel: number,
): Partial<Record<ResourceKey, number>> | null {
  const nextLevel = getNextLevelDefinition(tool, currentLevel);
  return nextLevel ? { ...nextLevel.buildCost } : null;
}

export function getToolBuildCostForRegion(
  tool: OrganizationToolDefinition,
  regionId: RegionId,
  homeRegionId: RegionId,
): Partial<Record<ResourceKey, number>> {
  const multiplier = getRegionBuildCostMultiplier(regionId, tool.id, homeRegionId);
  return scaleResourceCostForRegion(getToolBuildCost(tool), multiplier);
}

export function getToolUpgradeCostForRegion(
  tool: OrganizationToolDefinition,
  currentLevel: number,
  regionId: RegionId,
  homeRegionId: RegionId,
): Partial<Record<ResourceKey, number>> | null {
  const base = getToolUpgradeCost(tool, currentLevel);
  if (!base) return null;
  const multiplier = getRegionBuildCostMultiplier(regionId, tool.id, homeRegionId);
  return scaleResourceCostForRegion(base, multiplier);
}

export function getToolWeeklyMaintenanceForRegion(
  tool: OrganizationToolDefinition,
  level: number,
  regionId: RegionId,
  state?: GameState,
): Partial<Record<ResourceKey, number>> {
  const base = getToolWeeklyMaintenance(tool, level);
  let multiplier = getRegionMaintenanceMultiplier(regionId, tool.id);

  if (state) {
    multiplier *= getFoundingRegionalMaintenanceMultiplier(state, regionId, tool.id);
  }

  return scaleResourceCostForRegion(base, multiplier);
}

export function getToolWeeklyEffects(
  tool: OrganizationToolDefinition,
  level: number,
): OrganizationEffectBundle {
  const levelDef = getLevelDefinition(tool, level);
  if (!levelDef) return {};
  return scaleOrganizationEffectBundle(levelDef.weeklyEffects);
}

export function getToolWeeklyMaintenance(
  tool: OrganizationToolDefinition,
  level: number,
): Partial<Record<ResourceKey, number>> {
  const levelDef = getLevelDefinition(tool, level);
  return scaleResourcePartial(levelDef?.weeklyMaintenance);
}

export function getToolStatus(
  tool: OrganizationToolDefinition,
  level: number,
  state: GameState,
  regionId: RegionId,
): OrganizationToolStatus {
  if (level >= tool.maxLevel) return 'maxed';

  const nextLevelDef = getNextLevelDefinition(tool, level);
  if (!nextLevelDef) return level > 0 ? 'active' : 'locked';

  if (!meetsLevelRequirements(nextLevelDef.requirements, state, regionId)) return 'locked';

  const cost =
    level === 0
      ? getToolBuildCostForRegion(tool, regionId, state.party.homeRegionId)
      : getToolUpgradeCostForRegion(tool, level, regionId, state.party.homeRegionId);
  if (!cost) return level > 0 ? 'active' : 'locked';

  if (!canAffordCost(state, cost)) {
    return level > 0 ? 'active' : 'insufficient_resources';
  }

  return 'available';
}

export function buildOrganizationToolView(
  tool: OrganizationToolDefinition,
  level: number,
  state: GameState,
  regionId: RegionId,
): OrganizationToolView {
  const levelDef = getLevelDefinition(tool, level);
  const nextLevelDef = getNextLevelDefinition(tool, level);

  return {
    definition: tool,
    level,
    levelTitle: levelDef?.title ?? null,
    status: getToolStatus(tool, level, state, regionId),
    weeklyEffects: getToolWeeklyEffects(tool, level),
    weeklyMaintenance: getToolWeeklyMaintenanceForRegion(tool, level, regionId, state),
    nextInstantEffects: nextLevelDef?.instantEffects ?? null,
    buildCost: getToolBuildCostForRegion(tool, regionId, state.party.homeRegionId),
    upgradeCost: getToolUpgradeCostForRegion(tool, level, regionId, state.party.homeRegionId),
    risks: levelDef?.risks ?? nextLevelDef?.risks ?? [],
    unlockActionIds: levelDef?.unlockActionIds ?? [],
    unlockToolIds: levelDef?.unlockToolIds ?? [],
    canRevert: canRevertOrganizationToolChange(state, regionId, tool.id),
  };
}

export function getOrganizationToolViews(
  state: GameState,
  regionId: RegionId,
): OrganizationToolView[] {
  return organizationToolDefinitions.map((tool) =>
    buildOrganizationToolView(
      tool,
      getRegionOrganizationToolLevel(state, regionId, tool.id),
      state,
      regionId,
    ),
  );
}

export function getAllActiveOrganizationToolViews(state: GameState): OrganizationToolView[] {
  const views: OrganizationToolView[] = [];

  for (const regionId of ALL_REGION_IDS) {
    for (const view of getOrganizationToolViews(state, regionId as RegionId)) {
      if (view.level > 0) {
        views.push(view);
      }
    }
  }

  views.push(...getActiveNationalOrganizationToolViews(state));

  return views;
}

export interface OrganizationToolSummaryEntry {
  scope: 'national' | RegionId;
  scopeLabel: string;
  toolId: string;
  toolName: string;
  level: number;
  levelTitle: string | null;
  maxLevel: number;
}

export interface OrganizationToolSummaryGroup {
  scope: 'national' | RegionId;
  scopeLabel: string;
  tools: OrganizationToolSummaryEntry[];
}

/** Kampanya genelinde kurulu örgüt araçları — özet paneli */
export function getOrganizationToolsSummaryGroups(state: GameState): OrganizationToolSummaryGroup[] {
  const groups: OrganizationToolSummaryGroup[] = [];

  const nationalTools: OrganizationToolSummaryEntry[] = getActiveNationalOrganizationToolViews(
    state,
  ).map((view) => ({
    scope: 'national' as const,
    scopeLabel: 'Ulusal',
    toolId: view.definition.id,
    toolName: view.definition.name,
    level: view.level,
    levelTitle: view.levelTitle,
    maxLevel: view.definition.maxLevel,
  }));

  if (nationalTools.length > 0) {
    groups.push({ scope: 'national', scopeLabel: 'Ulusal', tools: nationalTools });
  }

  for (const regionId of ALL_REGION_IDS) {
    const id = regionId as RegionId;
    const tools: OrganizationToolSummaryEntry[] = getOrganizationToolViews(state, id)
      .filter((view) => view.level > 0)
      .map((view) => ({
        scope: id,
        scopeLabel: getRegionById(id).name,
        toolId: view.definition.id,
        toolName: view.definition.name,
        level: view.level,
        levelTitle: view.levelTitle,
        maxLevel: view.definition.maxLevel,
      }));

    if (tools.length > 0) {
      groups.push({
        scope: id,
        scopeLabel: getRegionById(id).name,
        tools,
      });
    }
  }

  return groups;
}

export function canBuildTool(
  tool: OrganizationToolDefinition,
  state: GameState,
  regionId: RegionId,
): boolean {
  const level = getRegionOrganizationToolLevel(state, regionId, tool.id);
  if (level !== 0) return false;

  const levelDef = tool.levels[0];
  if (!levelDef) return false;
  if (!meetsLevelRequirements(levelDef.requirements, state, regionId)) return false;

  return canAffordCost(
    state,
    getToolBuildCostForRegion(tool, regionId, state.party.homeRegionId),
  );
}

export function canUpgradeTool(
  tool: OrganizationToolDefinition,
  state: GameState,
  regionId: RegionId,
): boolean {
  const level = getRegionOrganizationToolLevel(state, regionId, tool.id);
  if (level <= 0 || level >= tool.maxLevel) return false;

  const nextLevelDef = getNextLevelDefinition(tool, level);
  if (!nextLevelDef) return false;
  if (!meetsLevelRequirements(nextLevelDef.requirements, state, regionId)) return false;

  const cost = getToolUpgradeCostForRegion(tool, level, regionId, state.party.homeRegionId);
  if (!cost) return false;

  return canAffordCost(state, cost);
}

export function buildTool(
  state: GameState,
  toolId: string,
  regionId: RegionId,
): GameState | null {
  const tool = getOrganizationToolById(toolId);
  if (!tool || !canBuildTool(tool, state, regionId)) return null;

  const levelDef = tool.levels[0];
  if (!levelDef) return null;

  let nextState = payCost(
    state,
    getToolBuildCostForRegion(tool, regionId, state.party.homeRegionId),
  );
  nextState = setRegionOrganizationToolLevel(nextState, regionId, toolId, 1);
  nextState = applyEffectBundle(nextState, levelDef.instantEffects);

  const regionalInstantDelta = computeRegionalInstantDelta(toolId, levelDef, regionId);
  nextState = applyRegionalInstantDelta(nextState, regionId, regionalInstantDelta);

  return pushOrganizationRevertEntry(nextState, {
    scope: 'regional',
    regionId,
    toolId,
    previousLevel: 0,
    paidCost: getToolBuildCostForRegion(tool, regionId, state.party.homeRegionId),
    instantEffects: levelDef.instantEffects,
    regionalInstantDelta,
  });
}

export function upgradeTool(
  state: GameState,
  toolId: string,
  regionId: RegionId,
): GameState | null {
  const tool = getOrganizationToolById(toolId);
  if (!tool || !canUpgradeTool(tool, state, regionId)) return null;

  const currentLevel = getRegionOrganizationToolLevel(state, regionId, toolId);
  const nextLevelDef = getNextLevelDefinition(tool, currentLevel);
  if (!nextLevelDef) return null;

  let nextState = payCost(
    state,
    getToolUpgradeCostForRegion(tool, currentLevel, regionId, state.party.homeRegionId)!,
  );
  nextState = setRegionOrganizationToolLevel(nextState, regionId, toolId, currentLevel + 1);
  nextState = applyEffectBundle(nextState, nextLevelDef.instantEffects);

  const regionalInstantDelta = computeRegionalInstantDelta(toolId, nextLevelDef, regionId);
  nextState = applyRegionalInstantDelta(nextState, regionId, regionalInstantDelta);

  return pushOrganizationRevertEntry(nextState, {
    scope: 'regional',
    regionId,
    toolId,
    previousLevel: currentLevel,
    paidCost: getToolUpgradeCostForRegion(tool, currentLevel, regionId, state.party.homeRegionId)!,
    instantEffects: nextLevelDef.instantEffects,
    regionalInstantDelta,
  });
}

function getMaintenanceTotal(maintenance: Partial<Record<ResourceKey, number>>): number {
  return Object.values(maintenance).reduce((sum, value) => sum + (value ?? 0), 0);
}

function splitWeeklyEffects(
  toolId: string,
  effects: OrganizationEffectBundle,
): { globalEffects: OrganizationEffectBundle; regionalEffects: OrganizationEffectBundle } {
  if (!CENTRAL_TREASURY_TOOL_IDS.has(toolId)) {
    return { globalEffects: effects, regionalEffects: effects };
  }

  const globalResources = effects.resources ? { ...effects.resources } : undefined;
  const regionalResources = effects.resources
    ? Object.fromEntries(
        Object.entries(effects.resources).filter(([key]) => key !== 'money'),
      )
    : undefined;

  return {
    globalEffects: {
      resources: globalResources,
      metrics: effects.metrics,
    },
    regionalEffects: {
      resources: regionalResources as Partial<Record<ResourceKey, number>> | undefined,
      metrics: effects.metrics,
    },
  };
}

function scaleWeeklyEffectsForRegion(
  toolId: string,
  regionId: RegionId,
  effects: OrganizationEffectBundle,
): OrganizationEffectBundle {
  const mult = getRegionEffectMultiplier(regionId, toolId);
  if (mult === 1 || !effects.metrics) return effects;

  const metrics = Object.fromEntries(
    Object.entries(effects.metrics).map(([key, value]) => [
      key,
      Math.round((value ?? 0) * mult),
    ]),
  ) as OrganizationEffectBundle['metrics'];

  return { ...effects, metrics };
}

export function simulateWeeklyOrganizationEffects(state: GameState): {
  state: GameState;
  results: OrganizationToolWeekResult[];
} {
  let nextState = state;
  const results: OrganizationToolWeekResult[] = [];

  for (const regionId of ALL_REGION_IDS) {
    for (const tool of organizationToolDefinitions) {
      const level = getRegionOrganizationToolLevel(nextState, regionId, tool.id);
      if (level <= 0) continue;

      const levelDef = getLevelDefinition(tool, level);
      if (!levelDef) continue;

      const maintenance = getToolWeeklyMaintenanceForRegion(tool, level, regionId, nextState);
      const weeklyEffects = scaleWeeklyEffectsForRegion(
        tool.id,
        regionId,
        scaleOrganizationEffectBundle(levelDef.weeklyEffects),
      );
      const maintenanceTotal = getMaintenanceTotal(maintenance);
      const toolLabel = `${tool.name} (${regionId})`;

      if (maintenanceTotal > 0 && canAffordCost(nextState, maintenance)) {
        nextState = payCost(nextState, maintenance);
        const { globalEffects, regionalEffects } = splitWeeklyEffects(tool.id, weeklyEffects);
        nextState = applyEffectBundle(nextState, globalEffects);
        nextState = applyRegionalWeeklyDelta(nextState, regionId, tool.id, regionalEffects);
        results.push({
          toolId: tool.id,
          toolName: toolLabel,
          level,
          maintenancePaid: true,
          maintenance,
          effectsApplied: weeklyEffects,
        });
        continue;
      }

      if (maintenanceTotal > 0 && levelDef.maintenanceFailureEffects) {
        const failureEffects = scaleOrganizationEffectBundle(levelDef.maintenanceFailureEffects);
        const { globalEffects, regionalEffects } = splitWeeklyEffects(tool.id, failureEffects);
        nextState = applyEffectBundle(nextState, globalEffects);
        nextState = applyRegionalWeeklyDelta(nextState, regionId, tool.id, regionalEffects);
        results.push({
          toolId: tool.id,
          toolName: toolLabel,
          level,
          maintenancePaid: false,
          maintenance,
          effectsApplied: failureEffects,
        });
        continue;
      }

      if (maintenanceTotal === 0) {
        const { globalEffects, regionalEffects } = splitWeeklyEffects(tool.id, weeklyEffects);
        nextState = applyEffectBundle(nextState, globalEffects);
        nextState = applyRegionalWeeklyDelta(nextState, regionId, tool.id, regionalEffects);
        results.push({
          toolId: tool.id,
          toolName: toolLabel,
          level,
          maintenancePaid: true,
          maintenance,
          effectsApplied: weeklyEffects,
        });
        continue;
      }

      results.push({
        toolId: tool.id,
        toolName: toolLabel,
        level,
        maintenancePaid: false,
        maintenance,
        effectsApplied: {},
      });
    }
  }

  const nationalSimulation = simulateWeeklyNationalOrganizationEffects(nextState);
  nextState = nationalSimulation.state;
  results.push(...nationalSimulation.results);

  return { state: nextState, results };
}

function aggregateAppliedResourceEffects(
  results: OrganizationToolWeekResult[],
): Partial<Record<ResourceKey, number>> {
  let total: Partial<Record<ResourceKey, number>> = {};

  for (const result of results) {
    if (!result.maintenancePaid) continue;
    total = mergeResourceTotals(total, result.effectsApplied.resources ?? {});
  }

  return total;
}

function aggregateAppliedMetricEffects(
  results: OrganizationToolWeekResult[],
): Partial<Record<MetricKey, number>> {
  let total: Partial<Record<MetricKey, number>> = {};

  for (const result of results) {
    if (!result.maintenancePaid) continue;
    total = mergeMetricTotals(total, result.effectsApplied.metrics ?? {});
  }

  return total;
}

function aggregatePaidMaintenance(
  results: OrganizationToolWeekResult[],
): Partial<Record<ResourceKey, number>> {
  let total: Partial<Record<ResourceKey, number>> = {};

  for (const result of results) {
    if (!result.maintenancePaid) continue;
    total = mergeResourceTotals(total, result.maintenance);
  }

  return total;
}

function computeNetResourceDelta(
  before: GameState['resources'],
  after: GameState['resources'],
): Partial<Record<ResourceKey, number>> {
  const delta: Partial<Record<ResourceKey, number>> = {};

  for (const key of Object.keys(after) as ResourceKey[]) {
    const change = Math.round((after[key] - before[key]) * 10) / 10;
    if (change !== 0) delta[key] = change;
  }

  return delta;
}

export function calculateWeeklyToolMaintenance(
  state: GameState,
): Partial<Record<ResourceKey, number>> {
  const { results } = simulateWeeklyOrganizationEffects(state);
  return aggregatePaidMaintenance(results);
}

export function calculateWeeklyToolYield(state: GameState): Partial<Record<ResourceKey, number>> {
  const { results } = simulateWeeklyOrganizationEffects(state);
  return aggregateAppliedResourceEffects(results);
}

export function calculateToolMetricEffects(state: GameState): Partial<Record<MetricKey, number>> {
  const { results } = simulateWeeklyOrganizationEffects(state);
  return aggregateAppliedMetricEffects(results);
}

function formatEffectParts(
  values: Partial<Record<string, number>>,
  labels: Record<string, string>,
): string[] {
  return Object.entries(values)
    .filter(([, value]) => (value ?? 0) !== 0)
    .map(([key, value]) => `${value! >= 0 ? '+' : ''}${value} ${labels[key]}`);
}

export function buildWeeklyOrganizationProductionLines(
  results: OrganizationToolWeekResult[],
  week: number,
): string[] {
  const prefix = `H${week}: `;
  const lines: string[] = [];

  for (const result of results) {
    const maintenanceTotal = getMaintenanceTotal(result.maintenance);

    if (maintenanceTotal > 0 && !result.maintenancePaid) {
      lines.push(`${prefix}${result.toolName} bakım gideri karşılanamadı; haftalık üretim durdu.`);

      const failureResourceParts = formatEffectParts(
        result.effectsApplied.resources ?? {},
        resourceLabels,
      );
      const failureMetricParts = formatEffectParts(
        result.effectsApplied.metrics ?? {},
        metricLabels,
      );
      const failureParts = [...failureResourceParts, ...failureMetricParts];

      if (failureParts.length > 0) {
        lines.push(`${prefix}${result.toolName} bakım kaçını: ${failureParts.join(', ')}.`);
      }

      continue;
    }

    if (maintenanceTotal > 0) {
      const maintenanceParts = Object.entries(result.maintenance)
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([key, value]) => `-${value} ${resourceLabels[key as ResourceKey]}`);
      lines.push(`${prefix}${result.toolName} bakım gideri (${maintenanceParts.join(', ')}) ödendi.`);
    }

    const resourceParts = formatEffectParts(result.effectsApplied.resources ?? {}, resourceLabels);
    if (resourceParts.length > 0) {
      lines.push(`${prefix}${result.toolName} ${resourceParts.join(', ')} üretti.`);
    }

    const metricParts = formatEffectParts(result.effectsApplied.metrics ?? {}, metricLabels);
    if (metricParts.length > 0) {
      lines.push(`${prefix}${result.toolName}, ${metricParts.join(', ')} artırdı.`);
    }
  }

  return lines;
}

export function summarizeWeeklyOrganizationEffects(state: GameState): OrganizationWeeklySummary {
  const simulation = simulateWeeklyOrganizationEffects(state);

  return {
    resourceYield: aggregateAppliedResourceEffects(simulation.results),
    metricEffects: aggregateAppliedMetricEffects(simulation.results),
    maintenanceCost: aggregatePaidMaintenance(simulation.results),
    netResourceDelta: computeNetResourceDelta(state.resources, simulation.state.resources),
    productionLines: buildWeeklyOrganizationProductionLines(
      simulation.results,
      state.campaignWeek,
    ),
  };
}

export function applyWeeklyOrganizationEffects(state: GameState): GameState {
  return simulateWeeklyOrganizationEffects(state).state;
}

export { createInitialOrganizationToolLevels } from '../data/organizationTools';

/** @deprecated Eski API uyumluluğu */
export function applyWeeklyToolYield(state: GameState): GameState {
  return applyWeeklyOrganizationEffects(state);
}

/** @deprecated Eski API uyumluluğu */
export function applyToolMetricEffects(state: GameState): GameState {
  return state;
}

/** @deprecated meetsLevelRequirements(regionId) kullanın */
export function meetsUnlockRequirements(
  requirements: OrganizationLevelRequirements,
  state: GameState,
): boolean {
  return meetsLevelRequirements(requirements, state, state.party.homeRegionId);
}
