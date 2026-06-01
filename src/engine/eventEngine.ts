/** Haftalık olay seçimi ve aksiyon modifikasyonları */

import { scaleActionEnergyCost } from '../data/campaignConfig';
import { weeklyEvents } from '../data/weeklyEvents';
import { categoryLabels } from '../data/labels';
import type { CampaignAction, GameState, MetricKey, ResourceKey, WeeklyEvent } from '../types/game';

const OPPORTUNITY_COST_MULTIPLIER = 0.85;
const OPPORTUNITY_EFFECT_MULTIPLIER = 1.25;
const CRISIS_COST_MULTIPLIER = 1.15;
const CRISIS_EFFECT_MULTIPLIER = 0.85;
const AGENDA_FLAT_EFFECT_BONUS = 3;

export interface ResolvedActionWithEvent {
  resolved: CampaignAction;
  labels: string[];
}

export function getActionEventLabels(
  event: WeeklyEvent | null,
  action: CampaignAction,
): string[] {
  if (!event) return [];

  const labels: string[] = [];

  if (event.type === 'opportunity' && action.category === event.affectedCategory) {
    labels.push('Fırsat bonusu');
  }

  if (event.type === 'crisis' && action.category === event.affectedCategory) {
    labels.push('Kriz etkisi');
  }

  if (event.type === 'agenda' && event.recommendedActionIds.includes(action.id)) {
    labels.push('Gündem bonusu');
  }

  return labels;
}

function withScaledEnergyCost(
  cost: Partial<Record<ResourceKey, number>>,
): Partial<Record<ResourceKey, number>> {
  if (!cost.energy) return cost;
  return { ...cost, energy: scaleActionEnergyCost(cost.energy) };
}

function adjustActionCost(
  cost: Partial<Record<ResourceKey, number>>,
  multiplier: number,
): Partial<Record<ResourceKey, number>> {
  const adjusted: Partial<Record<ResourceKey, number>> = {};

  for (const [key, value] of Object.entries(cost)) {
    if (!value) continue;
    if (key === 'organizationCapacity') continue;
    const base = key === 'energy' ? scaleActionEnergyCost(value) : value;
    adjusted[key as ResourceKey] = Math.max(1, Math.round(base * multiplier));
  }

  return adjusted;
}

function adjustOrganizationLoad(load: number | undefined, multiplier: number): number | undefined {
  if (!load || load <= 0) return undefined;
  return Math.max(1, Math.round(load * multiplier));
}

function adjustActionEffects(
  effects: Partial<Record<MetricKey, number>>,
  multiplier: number,
  flatBonus: number,
): Partial<Record<MetricKey, number>> {
  const adjusted: Partial<Record<MetricKey, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (value === undefined || value === 0) continue;

    if (value > 0) {
      adjusted[key as MetricKey] = Math.max(1, Math.round(value * multiplier) + flatBonus);
    } else {
      adjusted[key as MetricKey] = value;
    }
  }

  return adjusted;
}

export function resolveActionWithWeeklyEvent(
  event: WeeklyEvent | null,
  action: CampaignAction,
): ResolvedActionWithEvent {
  const labels = getActionEventLabels(event, action);

  if (!event || labels.length === 0) {
    return {
      resolved: { ...action, cost: withScaledEnergyCost(action.cost) },
      labels,
    };
  }

  let costMultiplier = 1;
  let effectMultiplier = 1;
  let flatEffectBonus = 0;

  if (event.type === 'opportunity' && action.category === event.affectedCategory) {
    costMultiplier = OPPORTUNITY_COST_MULTIPLIER;
    effectMultiplier = OPPORTUNITY_EFFECT_MULTIPLIER;
  }

  if (event.type === 'crisis' && action.category === event.affectedCategory) {
    costMultiplier = CRISIS_COST_MULTIPLIER;
    effectMultiplier = CRISIS_EFFECT_MULTIPLIER;
  }

  if (event.type === 'agenda' && event.recommendedActionIds.includes(action.id)) {
    flatEffectBonus = AGENDA_FLAT_EFFECT_BONUS;
  }

  return {
    labels,
    resolved: {
      ...action,
      cost: adjustActionCost(action.cost, costMultiplier),
      organizationLoad: adjustOrganizationLoad(action.organizationLoad, costMultiplier),
      effects: adjustActionEffects(action.effects, effectMultiplier, flatEffectBonus),
    },
  };
}

export function getWeeklyEventEffectSummary(event: WeeklyEvent): string {
  const category = categoryLabels[event.affectedCategory];

  switch (event.type) {
    case 'opportunity':
      return `${category} aksiyonlarında maliyet %15 düşük, pozitif etkiler %25 güçlü.`;
    case 'crisis':
      return `${category} aksiyonlarında maliyet %15 yüksek, pozitif etkiler %15 zayıf. Önerilen aksiyon alınmazsa hafta sonu güven kaybı riski.`;
    case 'agenda':
      return `Önerilen aksiyonlarda tüm pozitif metrik etkilerine +${AGENDA_FLAT_EFFECT_BONUS} bonus.`;
  }
}

export function getRecommendedActionNames(
  event: WeeklyEvent,
  availableActions: CampaignAction[],
): string[] {
  return event.recommendedActionIds
    .map((id) => availableActions.find((action) => action.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function pickWeeklyEvent(excludeEventId?: string | null): WeeklyEvent {
  const candidates = excludeEventId
    ? weeklyEvents.filter((event) => event.id !== excludeEventId)
    : weeklyEvents;

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] ?? weeklyEvents[0];
}

export function assignWeeklyEventForNewWeek(
  previousEventId?: string | null,
): WeeklyEvent {
  return pickWeeklyEvent(previousEventId);
}

export function resolveSelectedActions(state: GameState): ResolvedActionWithEvent[] {
  return state.availableActions
    .filter((action) => state.selectedActionIds.includes(action.id))
    .map((action) => resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action));
}
