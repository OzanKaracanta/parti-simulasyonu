/**
 * Oyuncu parti başlangıç metrikleri — bölge kartı (arazi zorluğu) ile ayrılmıştır.
 * Kurulum renk/sembol/ideoloji/liderlik bonusları bunun üzerine uygulanır.
 */

import type { MetricKey, RegionId } from '../types/game';

/** Küçük parlamenter grup — ulusal ölçekte sınırlı tanınırlık */
export const PLAYER_START_METRICS: Record<MetricKey, number> = {
  mediaPower: 26,
  campaignVisibility: 24,
  youthReach: 26,
  localOrganization: 28,
  crisisManagement: 28,
  leaderTrust: 28,
  policyCredibility: 26,
  socialGroupReach: 26,
  financialSustainability: 24,
  regionalInfluence: 26,
};

/** Ev bölgesine göre küçük lokal güçlendirme (bölge kartı metriklerinden bağımsız) */
export const HOME_REGION_METRIC_BONUS: Record<RegionId, Partial<Record<MetricKey, number>>> = {
  marmara: { mediaPower: 4, campaignVisibility: 3, youthReach: 3 },
  ege: { leaderTrust: 3, regionalInfluence: 3, localOrganization: 2 },
  'ic-anadolu': { localOrganization: 4, leaderTrust: 3, policyCredibility: 2 },
  akdeniz: { youthReach: 3, socialGroupReach: 2, campaignVisibility: 2 },
  karadeniz: { localOrganization: 3, regionalInfluence: 3, leaderTrust: 2 },
  'dogu-anadolu': { localOrganization: 3, regionalInfluence: 3, leaderTrust: 2 },
  'guneydogu-anadolu': { youthReach: 4, localOrganization: 3, socialGroupReach: 2 },
};

export function getHomeRegionMetricBonus(homeRegionId: RegionId): Partial<Record<MetricKey, number>> {
  return HOME_REGION_METRIC_BONUS[homeRegionId] ?? {};
}
