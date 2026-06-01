/** Bölgesel kampanya aksiyonlarının hedef bölgeye haftalık yansıması */

import { isRegionalAction } from '../data/regionalActions';
import {
  getRegionalActionCostMultiplier,
  getRegionalActionSupportMultiplier,
  scaleResourceCostForRegion,
} from '../data/regionBalance';
import { resolveActionForState } from './actionSynergyEngine';
import { resolveActionWithWeeklyEvent } from './eventEngine';
import type { CampaignAction, GameState, RegionId, ResourceKey } from '../types/game';

function clampSupport(value: number): number {
  return Math.max(0, Math.min(50, Math.round(value * 10) / 10));
}

function clampOrganization(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function getRegionalActionCost(
  state: GameState,
  action: CampaignAction,
  regionId: RegionId,
): Partial<Record<ResourceKey, number>> {
  const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
  const multiplier = getRegionalActionCostMultiplier(regionId, state.party.homeRegionId);
  return scaleResourceCostForRegion(resolved.cost, multiplier) as Partial<Record<ResourceKey, number>>;
}

export function resolveRegionalActionForDisplay(
  state: GameState,
  action: CampaignAction,
  regionId: RegionId,
): CampaignAction {
  const { resolved } = resolveActionForState(state, action);
  return {
    ...resolved,
    cost: getRegionalActionCost(state, action, regionId),
  };
}

export function applyRegionalActionRegionEffects(
  state: GameState,
  actions: CampaignAction[],
): GameState {
  if (actions.length === 0) return state;

  let regions = state.regions;

  for (const action of actions) {
    if (!isRegionalAction(action.id)) continue;

    const regionId = state.selectedActionTargets[action.id];
    if (!regionId) continue;

    const regionalInfluence = action.effects.regionalInfluence ?? 0;
    const localOrganization = action.effects.localOrganization ?? 0;
    const mediaPower = action.effects.mediaPower ?? 0;
    const growth = getRegionalActionSupportMultiplier(regionId);

    const supportDelta =
      (regionalInfluence * 0.14 + localOrganization * 0.1 + mediaPower * 0.06) * growth;
    const organizationDelta = localOrganization * 0.45 * growth;
    const mediaDelta = mediaPower * 0.35;

    regions = regions.map((region) => {
      if (region.id !== regionId) return region;
      return {
        ...region,
        support: clampSupport(region.support + supportDelta),
        organization: clampOrganization(region.organization + organizationDelta),
        mediaReach: clampOrganization(region.mediaReach + mediaDelta),
      };
    });
  }

  return { ...state, regions };
}
