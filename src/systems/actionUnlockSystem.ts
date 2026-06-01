/** Kampanya aksiyonlarının örgütlenme araçlarıyla kilidi — bölgesel + ulusal */

import { isRegionalAction } from '../data/regionalActions';
import {
  getAllOrganizationToolDefinitions,
  organizationToolDefinitions,
} from '../data/organizationTools';
import { nationalOrganizationToolDefinitions } from '../data/nationalOrganizationTools';
import { getRegionOrganizationToolLevel } from './regionOrganization';
import { getNationalOrganizationToolLevel } from './nationalOrganizationSystem';
import type { CampaignAction, GameState, RegionId } from '../types/game';
import { getOrganizationToolLevel } from './organizationSystem';

/** Oyun başında serbest — haftalık gündeme cevap vermek için */
export const DEFAULT_UNLOCKED_ACTION_IDS = new Set<string>([
  'crisis-statement',
  'agenda-commentary',
]);

const ALL_UNLOCKABLE_ACTION_IDS = new Set<string>();

for (const tool of getAllOrganizationToolDefinitions()) {
  for (const levelDef of tool.levels) {
    for (const actionId of levelDef.unlockActionIds ?? []) {
      ALL_UNLOCKABLE_ACTION_IDS.add(actionId);
    }
  }
}

export function getUnlockedActionIdsForRegion(
  state: GameState,
  regionId: RegionId,
): Set<string> {
  const unlocked = new Set<string>();
  const regionLevels = state.organizationToolLevelsByRegion[regionId];

  for (const tool of organizationToolDefinitions) {
    const currentLevel = getOrganizationToolLevel(regionLevels ?? {}, tool.id);

    for (let level = 1; level <= currentLevel; level += 1) {
      const levelDef = tool.levels[level - 1];
      for (const actionId of levelDef?.unlockActionIds ?? []) {
        unlocked.add(actionId);
      }
    }
  }

  return unlocked;
}

export function getUnlockedNationalActionIds(state: GameState): Set<string> {
  const unlocked = new Set<string>();

  for (const tool of nationalOrganizationToolDefinitions) {
    const currentLevel = getNationalOrganizationToolLevel(state, tool.id);

    for (let level = 1; level <= currentLevel; level += 1) {
      const levelDef = tool.levels[level - 1];
      for (const actionId of levelDef?.unlockActionIds ?? []) {
        unlocked.add(actionId);
      }
    }
  }

  return unlocked;
}

export function getUnlockedActionIds(state: GameState): Set<string> {
  const unlocked = new Set(DEFAULT_UNLOCKED_ACTION_IDS);

  for (const regionId of Object.keys(state.organizationToolLevelsByRegion) as RegionId[]) {
    for (const actionId of getUnlockedActionIdsForRegion(state, regionId)) {
      unlocked.add(actionId);
    }
  }

  for (const actionId of getUnlockedNationalActionIds(state)) {
    unlocked.add(actionId);
  }

  return unlocked;
}

export function isActionUnlockedInRegion(
  state: GameState,
  actionId: string,
  regionId: RegionId,
): boolean {
  if (!isRegionalAction(actionId)) {
    return isActionUnlocked(state, actionId);
  }

  return getUnlockedActionIdsForRegion(state, regionId).has(actionId);
}

export function isActionUnlocked(state: GameState, actionId: string): boolean {
  if (DEFAULT_UNLOCKED_ACTION_IDS.has(actionId)) return true;

  if (isRegionalAction(actionId)) {
    return Object.keys(state.organizationToolLevelsByRegion).some((regionId) =>
      getUnlockedActionIdsForRegion(state, regionId as RegionId).has(actionId),
    );
  }

  if (!ALL_UNLOCKABLE_ACTION_IDS.has(actionId)) {
    return true;
  }

  return getUnlockedActionIds(state).has(actionId);
}

export function getActionUnlockSourceForRegion(
  state: GameState,
  actionId: string,
  regionId: RegionId,
): { toolName: string; level: number; levelTitle: string } | null {
  if (!isRegionalAction(actionId)) return getActionUnlockSource(state, actionId);

  for (const tool of organizationToolDefinitions) {
    for (const levelDef of tool.levels) {
      if (!(levelDef.unlockActionIds ?? []).includes(actionId)) continue;

      const currentLevel = getRegionOrganizationToolLevel(state, regionId, tool.id);
      if (currentLevel >= levelDef.level) return null;

      return {
        toolName: tool.name,
        level: levelDef.level,
        levelTitle: levelDef.title,
      };
    }
  }

  return null;
}

export function getActionUnlockSource(
  state: GameState,
  actionId: string,
): { toolName: string; level: number; levelTitle: string } | null {
  if (DEFAULT_UNLOCKED_ACTION_IDS.has(actionId)) return null;

  for (const tool of nationalOrganizationToolDefinitions) {
    for (const levelDef of tool.levels) {
      if (!(levelDef.unlockActionIds ?? []).includes(actionId)) continue;

      const currentLevel = getNationalOrganizationToolLevel(state, tool.id);
      if (currentLevel >= levelDef.level) return null;

      return {
        toolName: tool.name,
        level: levelDef.level,
        levelTitle: levelDef.title,
      };
    }
  }

  for (const tool of organizationToolDefinitions) {
    for (const levelDef of tool.levels) {
      if (!(levelDef.unlockActionIds ?? []).includes(actionId)) continue;

      const unlockedInAnyRegion = Object.keys(state.organizationToolLevelsByRegion).some(
        (regionId) =>
          getRegionOrganizationToolLevel(state, regionId as RegionId, tool.id) >= levelDef.level,
      );
      if (unlockedInAnyRegion) return null;

      return {
        toolName: tool.name,
        level: levelDef.level,
        levelTitle: levelDef.title,
      };
    }
  }

  return null;
}

export function formatActionUnlockReason(source: {
  toolName: string;
  level: number;
  levelTitle: string;
}): string {
  if (source.level === 1) {
    return `${source.toolName} kurulmalı`;
  }

  return `${source.toolName} — ${source.levelTitle} seviyesine yükseltilmeli`;
}

export function getActionUnlockReasonForRegion(
  state: GameState,
  action: CampaignAction,
  regionId: RegionId,
): string | null {
  if (isActionUnlockedInRegion(state, action.id, regionId)) return null;

  const source = getActionUnlockSourceForRegion(state, action.id, regionId);
  if (source) {
    return formatActionUnlockReason(source);
  }

  return 'Bu bölgede örgütlenme aracı ile açılmalı';
}

export function getActionUnlockReason(state: GameState, action: CampaignAction): string | null {
  if (isActionUnlocked(state, action.id)) return null;

  const source = getActionUnlockSource(state, action.id);
  if (source) {
    return formatActionUnlockReason(source);
  }

  return 'Örgütlenme aracı ile açılmalı';
}

export function filterUnlockedActions(state: GameState, actions: CampaignAction[]): CampaignAction[] {
  return actions.filter((action) => isActionUnlocked(state, action.id));
}

export function filterRegionalActionsForRegion(
  state: GameState,
  actions: CampaignAction[],
  regionId: RegionId,
): CampaignAction[] {
  return actions.filter(
    (action) => isRegionalAction(action.id) && isActionUnlockedInRegion(state, action.id, regionId),
  );
}
