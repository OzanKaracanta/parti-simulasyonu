/** Örgütlenme aracı maliyet, üretim ve gereksinim metinleri */

import { categoryLabels, metricLabels, resourceLabels } from '../data/labels';
import { getOrganizationToolById } from '../data/organizationTools';
import type { MetricKey, ResourceKey } from '../types/game';
import type {
  OrganizationEffectBundle,
  OrganizationLevelRequirements,
  OrganizationToolCategory,
} from '../types/organization';

export type OrganizationValueTone = 'cost' | 'gain' | 'delta';

export interface OrganizationValuePart {
  id: string;
  text: string;
  tone: OrganizationValueTone;
}

function formatSignedValue(value: number, tone: OrganizationValueTone): string {
  if (tone === 'cost') {
    return `-${Math.abs(value)}`;
  }

  if (tone === 'gain') {
    return value >= 0 ? `+${value}` : String(value);
  }

  return value > 0 ? `+${value}` : String(value);
}

function buildResourceParts(
  entries: Partial<Record<ResourceKey, number>>,
  tone: OrganizationValueTone,
): OrganizationValuePart[] {
  return Object.entries(entries)
    .filter(([, value]) => (value ?? 0) !== 0)
    .map(([key, value]) => {
      const resourceKey = key as ResourceKey;
      const signed = formatSignedValue(value!, tone);
      const partTone = tone === 'delta' ? (value! < 0 ? 'cost' : 'gain') : tone;

      return {
        id: `resource-${resourceKey}`,
        text: `${signed} ${resourceLabels[resourceKey]}`,
        tone: partTone,
      };
    });
}

function buildMetricParts(
  entries: Partial<Record<MetricKey, number>>,
  tone: OrganizationValueTone,
): OrganizationValuePart[] {
  return Object.entries(entries)
    .filter(([, value]) => (value ?? 0) !== 0)
    .map(([key, value]) => {
      const metricKey = key as MetricKey;
      const signed = formatSignedValue(value!, tone);
      const partTone = tone === 'delta' ? (value! < 0 ? 'cost' : 'gain') : tone;

      return {
        id: `metric-${metricKey}`,
        text: `${signed} ${metricLabels[metricKey]}`,
        tone: partTone,
      };
    });
}

export function buildOrganizationCostParts(
  cost: Partial<Record<ResourceKey, number>>,
): OrganizationValuePart[] {
  return buildResourceParts(cost, 'cost');
}

export function buildOrganizationGainParts(
  effects: OrganizationEffectBundle,
): OrganizationValuePart[] {
  return [
    ...buildResourceParts(effects.resources ?? {}, 'gain'),
    ...buildMetricParts(effects.metrics ?? {}, 'gain'),
  ];
}

export function buildOrganizationDeltaParts(
  resources: Partial<Record<ResourceKey, number>>,
): OrganizationValuePart[] {
  return buildResourceParts(resources, 'delta');
}

export function formatOrganizationCost(cost: Partial<Record<ResourceKey, number>>): string {
  const parts = buildOrganizationCostParts(cost);
  return parts.length > 0 ? parts.map((part) => part.text).join(', ') : '—';
}

export function formatOrganizationEffects(effects: OrganizationEffectBundle): string {
  const parts = buildOrganizationGainParts(effects);
  return parts.length > 0 ? parts.map((part) => part.text).join(', ') : '—';
}

export function formatOrganizationCategory(category: OrganizationToolCategory): string {
  return categoryLabels[category];
}

export function formatLevelRequirements(requirements: OrganizationLevelRequirements): string[] {
  const lines: string[] = [];

  if (requirements.resources) {
    for (const [key, min] of Object.entries(requirements.resources)) {
      lines.push(`${resourceLabels[key as ResourceKey]} ≥ ${min}`);
    }
  }

  if (requirements.metrics) {
    for (const [key, min] of Object.entries(requirements.metrics)) {
      lines.push(`${metricLabels[key as MetricKey]} ≥ ${min}`);
    }
  }

  if (requirements.requiredTools) {
    for (const req of requirements.requiredTools) {
      const tool = getOrganizationToolById(req.toolId);
      lines.push(`${tool?.name ?? req.toolId} Seviye ${req.minLevel}+`);
    }
  }

  if (requirements.minRegionsWithIlOffice !== undefined) {
    lines.push(`En az ${requirements.minRegionsWithIlOffice} bölgede İl Parti Bürosu`);
  }

  return lines;
}
