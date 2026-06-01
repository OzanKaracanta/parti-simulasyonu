import { metricLabels, resourceLabels, segmentLabels } from '../../../data/labels';
import { getScaledMainEventEnergyCost } from '../../../engine/energyCostUtils';
import { politicalSegmentLabels } from '../../../data/politicalSegments';
import type {
  AgendaEffectLine,
  AgendaPressure,
  AgendaResponseDisplay,
  AgendaStance,
  AgendaStatus,
} from '../../../types/agenda';
import type {
  EventResponseOption,
  MetricKey,
  PoliticalSegmentEffect,
  ResourceKey,
  ResponseTone,
  SegmentId,
  WeeklyEvent,
  WeeklyEventType,
} from '../../../types/game';

const STANCE_LABELS: Record<AgendaStance, string> = {
  decisive: 'Kararlı Yanıt',
  measured: 'Ölçülü Yanıt',
  passive: 'Sessiz Kal',
};

const TONE_TO_STANCE: Record<ResponseTone, AgendaStance> = {
  bold: 'decisive',
  measured: 'measured',
  passive: 'passive',
};

const PRESSURE_LABELS: Record<AgendaPressure, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export const AGENDA_STATUS_LABELS: Record<AgendaStatus, string> = {
  response_required: 'Tepki Gerekli',
  optional: 'Opsiyonel',
};

export function toneToStance(tone: ResponseTone): AgendaStance {
  return TONE_TO_STANCE[tone];
}

export function getStanceLabel(stance: AgendaStance): string {
  return STANCE_LABELS[stance];
}

export function getEventPressure(type: WeeklyEventType): AgendaPressure {
  if (type === 'crisis') return 'high';
  if (type === 'agenda') return 'medium';
  return 'low';
}

export function getPressureLabel(pressure: AgendaPressure): string {
  return PRESSURE_LABELS[pressure];
}

export function getAgendaStatus(eventType: WeeklyEventType): AgendaStatus {
  if (eventType === 'opportunity') return 'optional';
  return 'response_required';
}

function effectTypeFromValue(value: number): AgendaEffectLine['type'] {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function segmentDisplayLabel(segmentId: SegmentId): string {
  const raw = segmentLabels[segmentId];
  if (segmentId === 'youth') return 'Genç Seçmen';
  if (segmentId === 'workers') return 'Emek Algısı';
  return raw;
}

function deriveRisk(option: EventResponseOption): string {
  if (option.tone === 'passive' || option.responseLevel === 'ignored') {
    return 'Gündemi rakipler sahiplenir';
  }
  if (option.tone === 'bold') {
    return 'Beklenti yükselir';
  }
  if (option.responseLevel === 'partial') {
    return 'Kamuoyu bu yanıtı yetersiz bulabilir';
  }
  return 'Etkisi sınırlı kalabilir';
}

function buildMetricAndResourceEffects(option: EventResponseOption): AgendaEffectLine[] {
  const lines: AgendaEffectLine[] = [];
  const metrics = option.effects?.metrics;
  if (metrics) {
    for (const [key, value] of Object.entries(metrics) as [MetricKey, number][]) {
      if (value === 0) continue;
      lines.push({
        label: metricLabels[key],
        value,
        type: effectTypeFromValue(value),
      });
    }
  }

  const resources = option.effects?.resources;
  if (resources) {
    for (const [key, value] of Object.entries(resources) as [ResourceKey, number][]) {
      if (!value) continue;
      if (key === 'energy' && value < 0) {
        const scaledCost = getScaledMainEventEnergyCost(value);
        if (scaledCost > 0) {
          lines.push({
            label: resourceLabels[key],
            value: -scaledCost,
            type: 'negative',
          });
        }
        continue;
      }
      if (value < 0) {
        lines.push({
          label: resourceLabels[key],
          value,
          type: 'negative',
        });
      } else {
        lines.push({
          label: resourceLabels[key],
          value,
          type: 'positive',
        });
      }
    }
  }

  return lines;
}

function buildSegmentEffects(option: EventResponseOption): AgendaEffectLine[] {
  return Object.entries(option.segmentEffects)
    .filter((entry): entry is [SegmentId, number] => typeof entry[1] === 'number' && entry[1] !== 0)
    .map(([segmentId, value]) => ({
      label: segmentDisplayLabel(segmentId),
      value,
      type: effectTypeFromValue(value),
    }));
}

function buildPoliticalSegmentEffectLines(
  effects: PoliticalSegmentEffect[],
): AgendaEffectLine[] {
  return effects
    .filter((effect) => effect.delta !== 0)
    .map((effect) => ({
      label: politicalSegmentLabels[effect.segmentId],
      value: effect.delta,
      type: effectTypeFromValue(effect.delta),
    }));
}

export function toAgendaResponseDisplay(
  option: EventResponseOption,
  politicalPreview?: PoliticalSegmentEffect[],
): AgendaResponseDisplay {
  const stance = toneToStance(option.tone);
  const metricLines = buildMetricAndResourceEffects(option);
  const politicalLines = buildPoliticalSegmentEffectLines(
    option.politicalSegmentEffects ?? politicalPreview ?? [],
  );
  const segmentLines = buildSegmentEffects(option);

  const cost: AgendaResponseDisplay['cost'] = {};
  const energy = option.effects?.resources?.energy;
  const money = option.effects?.resources?.money;
  const scaledEnergy = getScaledMainEventEnergyCost(energy);
  if (scaledEnergy > 0) cost.energy = scaledEnergy;
  if (money && money < 0) cost.money = Math.abs(money);

  const effects = [
    ...politicalLines,
    ...segmentLines,
    ...metricLines.filter((line) => !line.label.includes('Enerji') && !line.label.includes('Para')),
  ];

  if (option.tone === 'measured' && !effects.some((line) => line.type === 'neutral' && line.label === 'Düşük maliyet')) {
    const hasLowResourceCost =
      scaledEnergy <= 2 ||
      (energy === undefined && option.responseLevel === 'partial');
    if (hasLowResourceCost) {
      effects.push({ label: 'Düşük maliyet', type: 'neutral' });
    }
  }

  if (option.tone === 'passive' && !effects.some((line) => line.label.includes('Kaynak'))) {
    effects.unshift({ label: 'Kaynak korunur', type: 'positive' });
  }

  return {
    id: option.id,
    stance,
    stanceLabel: getStanceLabel(stance),
    title: option.label,
    description: option.description,
    effects,
    risk: deriveRisk(option),
    cost: Object.keys(cost).length > 0 ? cost : undefined,
  };
}

export function getEventTopicLine(event: WeeklyEvent): string {
  const policyMap: Record<string, string> = {
    economy: 'Ekonomi',
    labor: 'Emek',
    security: 'Güvenlik',
    transparency: 'Şeffaflık',
    environment: 'Çevre',
    socialWelfare: 'Sosyal Refah',
    localGovernance: 'Yerel Yönetim',
    mediaPolitics: 'Medya',
  };

  const labels: string[] = [policyMap[event.policyTopic] ?? event.policyTopic];
  for (const segmentId of event.affectedSegments.slice(0, 2)) {
    const seg = segmentDisplayLabel(segmentId);
    if (!labels.includes(seg)) labels.push(seg);
  }

  return labels.join(' · ');
}

export function mergeEffectLines(lines: AgendaEffectLine[]): AgendaEffectLine[] {
  const merged = new Map<string, AgendaEffectLine>();

  for (const line of lines) {
    const existing = merged.get(line.label);
    if (!existing) {
      merged.set(line.label, { ...line });
      continue;
    }
    if (line.value !== undefined && existing.value !== undefined) {
      const sum = existing.value + line.value;
      merged.set(line.label, {
        label: line.label,
        value: sum,
        type: effectTypeFromValue(sum),
      });
    }
  }

  return [...merged.values()];
}

export function formatEffectLine(line: AgendaEffectLine): string {
  if (line.value === undefined) return line.label;
  return `${line.label}: ${formatSigned(line.value)}`;
}
