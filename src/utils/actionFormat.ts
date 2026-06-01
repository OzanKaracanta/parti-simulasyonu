/** Aksiyon maliyet ve etki metinleri */

import { metricLabels, resourceLabels } from '../data/labels';
import type { CampaignAction, MetricKey, ResourceKey } from '../types/game';

function costResourceLines(entries: Partial<Record<ResourceKey, number>>): string[] {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => {
      const label = resourceLabels[key as ResourceKey];
      return `-${Math.abs(value!)} ${label}`;
    });
}

function resourceLines(entries: Partial<Record<ResourceKey, number>>): string[] {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => {
      const label = resourceLabels[key as ResourceKey];
      const sign = value! > 0 ? '+' : '';
      return `${sign}${value} ${label}`;
    });
}

function metricLines(effects: Partial<Record<MetricKey, number>>): string[] {
  return Object.entries(effects)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => {
      const label = metricLabels[key as MetricKey];
      const sign = value! > 0 ? '+' : '';
      return `${sign}${value} ${label}`;
    });
}

export function getActionCostLines(action: CampaignAction): string[] {
  const lines = costResourceLines(action.cost);
  const load = action.organizationLoad ?? 0;
  if (load > 0) {
    lines.push(`${load} koordinasyon yükü`);
  }
  return lines;
}

/** Öğretici — maliyet sütunu üstü ipucu */
export function getActionCostBreakdownHint(action: CampaignAction): string {
  const lines = getActionCostLines(action);
  if (lines.length === 0) {
    return 'Bu operasyonun doğrudan kaynak maliyeti yok.';
  }
  return [
    'Bu tur harcanır (tur bitince enerji kısmen yenilenir).',
    ...lines,
    'Aynı turda 3–4 operasyon tipik; kaynaklar birlikte sınırlar.',
  ].join(' ');
}

export function getActionGainLines(action: CampaignAction): string[] {
  return action.gains ? resourceLines(action.gains) : [];
}

export function getActionEffectLines(action: CampaignAction): string[] {
  return metricLines(action.effects);
}

export function formatActionCost(action: CampaignAction): string {
  const lines = getActionCostLines(action);
  return lines.length > 0 ? `Maliyet: ${lines.join(', ')}` : 'Maliyet: —';
}

export function formatActionGains(action: CampaignAction): string | null {
  const lines = getActionGainLines(action);
  return lines.length > 0 ? lines.join(', ') : null;
}

export function formatActionEffects(action: CampaignAction): string {
  const lines = getActionEffectLines(action);
  return lines.length > 0 ? `Etki: ${lines.join(', ')}` : 'Etki: —';
}

export function sumSelectedCosts(
  actions: CampaignAction[],
): Partial<Record<ResourceKey, number>> {
  const total: Partial<Record<ResourceKey, number>> = {};

  for (const action of actions) {
    for (const [key, cost] of Object.entries(action.cost)) {
      const resourceKey = key as ResourceKey;
      total[resourceKey] = (total[resourceKey] ?? 0) + (cost ?? 0);
    }
  }

  return total;
}
