/** Sempatizan Bağışı — Lider Güveni ile ölçeklenen haftalık pasif gelir */

import { CAMPAIGN_START_CONFIG } from '../data/campaignStartConfig';
import type { GameState, ResourceKey } from '../types/game';
import { clamp } from './gameEngine';

function clampResource(value: number, key: ResourceKey): number {
  const max = key === 'money' ? 999 : 100;
  return clamp(value, 0, max);
}

/** Lider Güveni arttıkça haftalık bağış artar; taban 10 (düşük güvenle de il bürosu kurulabilir). */
export function calculateSympathizerDonation(
  leaderTrust: number,
  campaignWeek = 1,
): number {
  const base = Math.round(clamp(10 + (leaderTrust - 30) * 0.35, 10, 30));

  if (campaignWeek > CAMPAIGN_START_CONFIG.foundingMaintenanceGraceWeeks) {
    return base;
  }

  return base + CAMPAIGN_START_CONFIG.foundingSympathizerDonationBonus;
}

export function applySympathizerDonation(
  state: GameState,
  leaderTrust: number,
): {
  state: GameState;
  amount: number;
  leaderTrust: number;
} {
  const amount = calculateSympathizerDonation(leaderTrust, state.campaignWeek);

  return {
    amount,
    leaderTrust,
    state: {
      ...state,
      resources: {
        ...state.resources,
        money: clampResource(state.resources.money + amount, 'money'),
      },
    },
  };
}

export function formatSympathizerDonationLine(
  amount: number,
  leaderTrust: number,
  week: number,
): string {
  return `H${week}: Sempatizan Bağışı +${amount} para (Lider Güveni ${Math.round(leaderTrust)}).`;
}
