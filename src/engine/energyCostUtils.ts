/** Enerji maliyeti — UI ve tahmin ile motor arasında ortak kurallar */

import { scaleCampaignWeeklyValue } from '../data/campaignConfig';

/** Ana gündem tepkisinde uygulanan ölçeklenmiş enerji maliyeti (0–100 kaynak ölçeği). */
export function getScaledMainEventEnergyCost(rawEnergy?: number): number {
  if (rawEnergy === undefined || rawEnergy >= 0) return 0;
  return Math.abs(scaleCampaignWeeklyValue(rawEnergy));
}
