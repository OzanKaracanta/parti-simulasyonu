/** Kampanya süresi ve haftalık pasif etki ölçekleme (12 haftalık MVP dengesi → 52 hafta) */

import type { MetricKey, ResourceKey, WeeklyEventOutcomeEffects } from '../types/game';
import type { OrganizationEffectBundle } from '../types/organization';

export const CAMPAIGN_MAX_WEEKS = 52;

/** Önceki MVP kampanya uzunluğu — haftalık pasif etkiler buna göre ölçeklenir */
export const LEGACY_CAMPAIGN_WEEKS = 12;

/** Haftalık pasif gelir/gider/etki çarpanı (toplam kampanya etkisi ~12 hafta ile aynı kalır) */
export const CAMPAIGN_WEEKLY_SCALE = LEGACY_CAMPAIGN_WEEKS / CAMPAIGN_MAX_WEEKS;

/** Segment kazançları kayıplardan biraz daha güçlü — iyi oyun 35–45% bandına çıkabilsin */
export const SEGMENT_GAIN_WEEKLY_SCALE = CAMPAIGN_WEEKLY_SCALE * 2;
export const SEGMENT_LOSS_WEEKLY_SCALE = CAMPAIGN_WEEKLY_SCALE;

/**
 * Enerji ve gönüllü 0–100 ile sınırlı.
 * Erken oyunda ~3–4 operasyon + 1–3 gündem tepkisi: yenilenme tam dolum sağlamaz.
 */
export const WEEKLY_ENERGY_REGEN = 22;

/** Operasyon enerji maliyetleri (ham 8–16) — seçim anında uygulanır */
export const CAMPAIGN_ACTION_ENERGY_MULTIPLIER = 0.88;

/** Ana + alt + bölgesel gündem — haftalık toplam söylem enerjisi tavanı */
export const MAX_WEEKLY_AGENDA_ENERGY_SPEND = 14;

export const WEEKLY_VOLUNTEER_REGEN = 8;

export function scaleActionEnergyCost(raw: number): number {
  if (raw <= 0) return 0;
  return Math.max(1, Math.round(raw * CAMPAIGN_ACTION_ENERGY_MULTIPLIER));
}

export function scaleCampaignWeeklyValue(value: number): number {
  if (value === 0) return 0;

  const scaled = value * CAMPAIGN_WEEKLY_SCALE;

  if (Math.abs(scaled) < 0.5) {
    return value > 0 ? 1 : -1;
  }

  return Math.round(scaled);
}

/** Segment desteği — kesirli haftalık delta (52 hafta dengesi) */
export function scaleWeeklySegmentDelta(value: number): number {
  if (value === 0) return 0;
  const scale = value > 0 ? SEGMENT_GAIN_WEEKLY_SCALE : SEGMENT_LOSS_WEEKLY_SCALE;
  return Math.round(value * scale * 10) / 10;
}

export function scaleResourcePartial(
  record: Partial<Record<ResourceKey, number>> | undefined,
): Partial<Record<ResourceKey, number>> {
  if (!record) return {};

  const out: Partial<Record<ResourceKey, number>> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value != null) {
      out[key as ResourceKey] = scaleCampaignWeeklyValue(value);
    }
  }

  return out;
}

export function scaleMetricPartial(
  record: Partial<Record<MetricKey, number>> | undefined,
): Partial<Record<MetricKey, number>> {
  if (!record) return {};

  const out: Partial<Record<MetricKey, number>> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value != null) {
      out[key as MetricKey] = scaleCampaignWeeklyValue(value);
    }
  }

  return out;
}

export function scaleOrganizationEffectBundle(
  bundle: OrganizationEffectBundle,
): OrganizationEffectBundle {
  return {
    resources: bundle.resources ? scaleResourcePartial(bundle.resources) : undefined,
    metrics: bundle.metrics ? scaleMetricPartial(bundle.metrics) : undefined,
  };
}

export function scaleWeeklyEventOutcomeEffects(
  effects: WeeklyEventOutcomeEffects,
): WeeklyEventOutcomeEffects {
  return {
    resources: effects.resources ? scaleResourcePartial(effects.resources) : undefined,
    metrics: effects.metrics ? scaleMetricPartial(effects.metrics) : undefined,
  };
}
