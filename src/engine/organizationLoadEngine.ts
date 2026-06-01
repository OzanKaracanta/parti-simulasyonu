/** Haftalık örgüt kapasitesi yükü — tahsis edilir, tüketilmez */

import { resolveActionWithWeeklyEvent } from './eventEngine';
import type { CampaignAction, GameState } from '../types/game';

export function getOrganizationLoadForAction(
  state: GameState,
  action: CampaignAction,
): number {
  const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
  return resolved.organizationLoad ?? 0;
}

export function getSelectedOrganizationLoad(
  state: GameState,
  excludeActionId?: string,
): number {
  let total = 0;

  for (const actionId of state.selectedActionIds) {
    if (actionId === excludeActionId) continue;
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;
    total += getOrganizationLoadForAction(state, action);
  }

  return total;
}

export function getRemainingOrganizationLoad(
  state: GameState,
  excludeActionId?: string,
): number {
  return state.resources.organizationCapacity - getSelectedOrganizationLoad(state, excludeActionId);
}

export function canAffordOrganizationLoad(state: GameState, action: CampaignAction): boolean {
  const load = getOrganizationLoadForAction(state, action);
  if (load <= 0) return true;
  return getRemainingOrganizationLoad(state) >= load;
}

export function formatOrganizationLoadUsage(state: GameState): string {
  const used = getSelectedOrganizationLoad(state);
  const capacity = state.resources.organizationCapacity;
  return `${used}/${capacity}`;
}
