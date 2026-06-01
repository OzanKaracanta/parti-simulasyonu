/** Hafta bitirme — örgütlenme araçları haftalık üretim entegrasyonu */

import { applyOrganizationSegmentReach } from '../engine/organizationSegmentEngine';
import type { GameState } from '../types/game';
import {
  buildWeeklyOrganizationProductionLines,
  simulateWeeklyOrganizationEffects,
} from './organizationSystem';

export function resolveOrganizationWeekEffects(state: GameState): {
  state: GameState;
  productionLines: string[];
  segmentReachLines: string[];
} {
  const simulation = simulateWeeklyOrganizationEffects(state);
  const segmentReach = applyOrganizationSegmentReach(simulation.state);

  return {
    state: segmentReach.state,
    productionLines: buildWeeklyOrganizationProductionLines(
      simulation.results,
      state.campaignWeek,
    ),
    segmentReachLines: segmentReach.lines,
  };
}
