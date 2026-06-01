/** Bölge bazlı örgütlenme state yardımcıları */

import { regionalOrganizationToolDefinitions } from '../data/regionalOrganizationTools';
import { regionDefinitions } from '../data/regions';
import type { GameState, RegionId } from '../types/game';
import type { OrganizationToolLevels } from '../types/organization';

export const ALL_REGION_IDS = regionDefinitions.map((r) => r.id);

export function createEmptyRegionOrganizationLevels(): OrganizationToolLevels {
  return Object.fromEntries(regionalOrganizationToolDefinitions.map((t) => [t.id, 0]));
}

export function createInitialOrganizationToolLevelsByRegion(): Record<
  RegionId,
  OrganizationToolLevels
> {
  return Object.fromEntries(
    ALL_REGION_IDS.map((id) => [id, createEmptyRegionOrganizationLevels()]),
  ) as Record<RegionId, OrganizationToolLevels>;
}

export function getRegionOrganizationLevels(
  state: GameState,
  regionId: RegionId,
): OrganizationToolLevels {
  return state.organizationToolLevelsByRegion[regionId] ?? createEmptyRegionOrganizationLevels();
}

export function getRegionOrganizationToolLevel(
  state: GameState,
  regionId: RegionId,
  toolId: string,
): number {
  return getRegionOrganizationLevels(state, regionId)[toolId] ?? 0;
}

export function withRegionOrganizationLevels(
  state: GameState,
  regionId: RegionId,
  levels: OrganizationToolLevels,
): GameState {
  return {
    ...state,
    organizationToolLevelsByRegion: {
      ...state.organizationToolLevelsByRegion,
      [regionId]: levels,
    },
  };
}

export function setRegionOrganizationToolLevel(
  state: GameState,
  regionId: RegionId,
  toolId: string,
  level: number,
): GameState {
  const current = getRegionOrganizationLevels(state, regionId);
  return withRegionOrganizationLevels(state, regionId, {
    ...current,
    [toolId]: level,
  });
}
