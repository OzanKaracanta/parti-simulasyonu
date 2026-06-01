/** Ulusal örgütlenme araçları — kurulum, yükseltme, bakım ve haftalık üretim */

import { scaleOrganizationEffectBundle } from '../data/campaignConfig';
import {
  getNationalToolAffinityHint,
  scaleNationalEffectBundle,
  scaleNationalResourceCost,
} from '../data/nationalBalance';
import {
  getNationalOrganizationToolById,
  nationalOrganizationToolDefinitions,
} from '../data/nationalOrganizationTools';
import { countRegionsWithIlPartyOffice } from '../engine/electionEligibilityEngine';
import type { GameState, MetricKey, OrganizationRevertEntry, ResourceKey } from '../types/game';
import type {
  OrganizationEffectBundle,
  OrganizationLevelRequirements,
  OrganizationToolDefinition,
  OrganizationToolStatus,
  OrganizationToolView,
  OrganizationToolWeekResult,
} from '../types/organization';
import {
  getLevelDefinition,
  getNextLevelDefinition,
  getOrganizationToolLevel,
  getToolBuildCost,
  getToolUpgradeCost,
  getToolWeeklyEffects,
  getToolWeeklyMaintenance,
} from './organizationSystem';

function getNationalToolBuildCostForState(
  state: GameState,
  tool: OrganizationToolDefinition,
): Partial<Record<ResourceKey, number>> {
  return scaleNationalResourceCost(state, tool.id, getToolBuildCost(tool), 'build');
}

function getNationalToolUpgradeCostForState(
  state: GameState,
  tool: OrganizationToolDefinition,
  currentLevel: number,
): Partial<Record<ResourceKey, number>> | null {
  const base = getToolUpgradeCost(tool, currentLevel);
  if (!base) return null;
  return scaleNationalResourceCost(state, tool.id, base, 'build');
}

function getNationalToolWeeklyMaintenanceForState(
  state: GameState,
  tool: OrganizationToolDefinition,
  level: number,
): Partial<Record<ResourceKey, number>> {
  const base = getToolWeeklyMaintenance(tool, level);
  return scaleNationalResourceCost(state, tool.id, base, 'maintenance');
}

function getNationalToolWeeklyEffectsForState(
  state: GameState,
  tool: OrganizationToolDefinition,
  level: number,
): OrganizationEffectBundle {
  const base = getToolWeeklyEffects(tool, level);
  return scaleNationalEffectBundle(state, tool.id, base);
}

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return Math.max(0, Math.min(max, value));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
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

function payCost(state: GameState, cost: Partial<Record<ResourceKey, number>>): GameState {
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

function refundCost(state: GameState, cost: Partial<Record<ResourceKey, number>>): GameState {
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

function applyEffectBundle(state: GameState, effects: OrganizationEffectBundle): GameState {
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

export function getNationalOrganizationToolLevel(state: GameState, toolId: string): number {
  return getOrganizationToolLevel(state.nationalOrganizationToolLevels, toolId);
}

export function setNationalOrganizationToolLevel(
  state: GameState,
  toolId: string,
  level: number,
): GameState {
  return {
    ...state,
    nationalOrganizationToolLevels: {
      ...state.nationalOrganizationToolLevels,
      [toolId]: level,
    },
  };
}

export function meetsNationalLevelRequirements(
  requirements: OrganizationLevelRequirements,
  state: GameState,
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

  if (requirements.minRegionsWithIlOffice !== undefined) {
    if (countRegionsWithIlPartyOffice(state) < requirements.minRegionsWithIlOffice) {
      return false;
    }
  }

  if (requirements.requiredTools) {
    for (const req of requirements.requiredTools) {
      const toolLevel = getNationalOrganizationToolLevel(state, req.toolId);
      if (toolLevel < req.minLevel) return false;
    }
  }

  return true;
}

function findLastNationalRevertEntryIndex(
  stack: OrganizationRevertEntry[],
  toolId: string,
): number {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (entry?.scope === 'national' && entry.toolId === toolId) return index;
  }

  return -1;
}

export function canRevertNationalOrganizationToolChange(
  state: GameState,
  toolId: string,
): boolean {
  return findLastNationalRevertEntryIndex(state.organizationRevertStack, toolId) >= 0;
}

export function revertNationalOrganizationToolChange(
  state: GameState,
  toolId: string,
): GameState | null {
  const entryIndex = findLastNationalRevertEntryIndex(state.organizationRevertStack, toolId);
  if (entryIndex < 0) return null;

  const entry = state.organizationRevertStack[entryIndex];
  let nextState = refundCost(state, entry.paidCost);
  nextState = setNationalOrganizationToolLevel(nextState, toolId, entry.previousLevel);
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

  return nextState;
}

function getNationalToolStatus(
  tool: OrganizationToolDefinition,
  level: number,
  state: GameState,
): OrganizationToolStatus {
  if (level >= tool.maxLevel) return 'maxed';

  const nextLevelDef = getNextLevelDefinition(tool, level);
  if (!nextLevelDef) return level > 0 ? 'active' : 'locked';

  if (!meetsNationalLevelRequirements(nextLevelDef.requirements, state)) return 'locked';

  const cost =
    level === 0
      ? getNationalToolBuildCostForState(state, tool)
      : getNationalToolUpgradeCostForState(state, tool, level);
  if (!cost) return level > 0 ? 'active' : 'locked';

  if (!canAffordCost(state, cost)) {
    return level > 0 ? 'active' : 'insufficient_resources';
  }

  return 'available';
}

export function buildNationalOrganizationToolView(
  tool: OrganizationToolDefinition,
  level: number,
  state: GameState,
): OrganizationToolView {
  const levelDef = getLevelDefinition(tool, level);
  const nextLevelDef = getNextLevelDefinition(tool, level);

  return {
    definition: tool,
    level,
    levelTitle: levelDef?.title ?? null,
    status: getNationalToolStatus(tool, level, state),
    weeklyEffects: getNationalToolWeeklyEffectsForState(state, tool, level),
    weeklyMaintenance: getNationalToolWeeklyMaintenanceForState(state, tool, level),
    nextInstantEffects: nextLevelDef?.instantEffects ?? null,
    buildCost: getNationalToolBuildCostForState(state, tool),
    upgradeCost: getNationalToolUpgradeCostForState(state, tool, level),
    risks: levelDef?.risks ?? nextLevelDef?.risks ?? [],
    unlockActionIds: levelDef?.unlockActionIds ?? [],
    unlockToolIds: levelDef?.unlockToolIds ?? [],
    canRevert: canRevertNationalOrganizationToolChange(state, tool.id),
  };
}

export function getNationalOrganizationToolViews(state: GameState): OrganizationToolView[] {
  return nationalOrganizationToolDefinitions.map((tool) =>
    buildNationalOrganizationToolView(
      tool,
      getNationalOrganizationToolLevel(state, tool.id),
      state,
    ),
  );
}

export function getActiveNationalOrganizationToolViews(state: GameState): OrganizationToolView[] {
  return getNationalOrganizationToolViews(state).filter((view) => view.level > 0);
}

function canBuildNationalTool(tool: OrganizationToolDefinition, state: GameState): boolean {
  const level = getNationalOrganizationToolLevel(state, tool.id);
  if (level !== 0) return false;

  const levelDef = tool.levels[0];
  if (!levelDef) return false;
  if (!meetsNationalLevelRequirements(levelDef.requirements, state)) return false;

  return canAffordCost(state, getNationalToolBuildCostForState(state, tool));
}

function canUpgradeNationalTool(tool: OrganizationToolDefinition, state: GameState): boolean {
  const level = getNationalOrganizationToolLevel(state, tool.id);
  if (level <= 0 || level >= tool.maxLevel) return false;

  const nextLevelDef = getNextLevelDefinition(tool, level);
  if (!nextLevelDef) return false;
  if (!meetsNationalLevelRequirements(nextLevelDef.requirements, state)) return false;

  const cost = getNationalToolUpgradeCostForState(state, tool, level);
  if (!cost) return false;

  return canAffordCost(state, cost);
}

export function getNationalToolBalanceHint(state: GameState, toolId: string): string | null {
  return getNationalToolAffinityHint(state, toolId);
}

export function buildNationalTool(state: GameState, toolId: string): GameState | null {
  const tool = getNationalOrganizationToolById(toolId);
  if (!tool || !canBuildNationalTool(tool, state)) return null;

  const levelDef = tool.levels[0];
  if (!levelDef) return null;

  let nextState = payCost(state, getNationalToolBuildCostForState(state, tool));
  nextState = setNationalOrganizationToolLevel(nextState, toolId, 1);
  nextState = applyEffectBundle(nextState, levelDef.instantEffects);

  const buildCost = getNationalToolBuildCostForState(state, tool);

  return {
    ...nextState,
    organizationRevertStack: [
      ...nextState.organizationRevertStack,
      {
        scope: 'national',
        toolId,
        previousLevel: 0,
        paidCost: buildCost,
        instantEffects: levelDef.instantEffects,
      },
    ],
  };
}

export function upgradeNationalTool(state: GameState, toolId: string): GameState | null {
  const tool = getNationalOrganizationToolById(toolId);
  if (!tool || !canUpgradeNationalTool(tool, state)) return null;

  const currentLevel = getNationalOrganizationToolLevel(state, toolId);
  const nextLevelDef = getNextLevelDefinition(tool, currentLevel);
  if (!nextLevelDef) return null;

  const upgradeCost = getNationalToolUpgradeCostForState(state, tool, currentLevel)!;

  let nextState = payCost(state, upgradeCost);
  nextState = setNationalOrganizationToolLevel(nextState, toolId, currentLevel + 1);
  nextState = applyEffectBundle(nextState, nextLevelDef.instantEffects);

  return {
    ...nextState,
    organizationRevertStack: [
      ...nextState.organizationRevertStack,
      {
        scope: 'national',
        toolId,
        previousLevel: currentLevel,
        paidCost: upgradeCost,
        instantEffects: nextLevelDef.instantEffects,
      },
    ],
  };
}

function getMaintenanceTotal(maintenance: Partial<Record<ResourceKey, number>>): number {
  return Object.values(maintenance).reduce((sum, value) => sum + (value ?? 0), 0);
}

export function simulateWeeklyNationalOrganizationEffects(state: GameState): {
  state: GameState;
  results: OrganizationToolWeekResult[];
} {
  let nextState = state;
  const results: OrganizationToolWeekResult[] = [];

  for (const tool of nationalOrganizationToolDefinitions) {
    const level = getNationalOrganizationToolLevel(nextState, tool.id);
    if (level <= 0) continue;

    const levelDef = getLevelDefinition(tool, level);
    if (!levelDef) continue;

    const maintenance = getNationalToolWeeklyMaintenanceForState(nextState, tool, level);
    const weeklyEffects = getNationalToolWeeklyEffectsForState(nextState, tool, level);
    const maintenanceTotal = getMaintenanceTotal(maintenance);
    const toolLabel = `${tool.name} (Ulusal)`;

    if (maintenanceTotal > 0 && canAffordCost(nextState, maintenance)) {
      nextState = payCost(nextState, maintenance);
      nextState = applyEffectBundle(nextState, weeklyEffects);
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
      const failureEffects = scaleNationalEffectBundle(
        nextState,
        tool.id,
        scaleOrganizationEffectBundle(levelDef.maintenanceFailureEffects),
      );
      nextState = applyEffectBundle(nextState, failureEffects);
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
      nextState = applyEffectBundle(nextState, weeklyEffects);
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

  return { state: nextState, results };
}
