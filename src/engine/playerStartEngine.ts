/** Oyuncu kampanya başlangıç metrik profili */

import { getHomeRegionMetricBonus, PLAYER_START_METRICS } from '../data/playerStartMetrics';
import { clamp } from './gameEngine';
import type { MetricKey, RegionId } from '../types/game';

export function buildPlayerStartMetrics(homeRegionId: RegionId): Record<MetricKey, number> {
  const metrics = { ...PLAYER_START_METRICS };
  const homeBonus = getHomeRegionMetricBonus(homeRegionId);

  for (const [key, value] of Object.entries(homeBonus)) {
    if (value === undefined) continue;
    metrics[key as MetricKey] = clamp(metrics[key as MetricKey] + value);
  }

  return metrics;
}
