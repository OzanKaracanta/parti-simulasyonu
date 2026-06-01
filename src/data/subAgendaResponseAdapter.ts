/** Alt gündem tepkileri — ana gündem özel tepkilerinden veya jenerik şablondan üretim */

import { getScaledMainEventEnergyCost } from '../engine/energyCostUtils';
import { buildPoliticalEffectsForTone } from '../engine/politicalReactionText';
import { SUB_AGENDA_TONE_ENERGY } from './subAgendaConfig';
import type { ResolvedEventSegments } from '../engine/resolveEventSegments';
import type {
  EventResponseOption,
  SegmentId,
  SubAgendaEnergyCostLabel,
  SubAgendaResponseOption,
} from '../types/game';
import { getCustomEventResponses } from './customEventResponses';
import { getCustomRegionalEventResponses } from './customRegionalEventResponses';

/** Alt gündem segment etkileri ana gündemden biraz daha keskin ama daha dar */
const SUB_SEGMENT_SCALE = 0.75;

function segmentBoost(
  segments: SegmentId[],
  amount: number,
): Partial<Record<SegmentId, number>> {
  const effects: Partial<Record<SegmentId, number>> = {};
  for (const segmentId of segments) {
    effects[segmentId] = amount;
  }
  return effects;
}

function segmentPenalty(
  segments: SegmentId[],
  amount: number,
): Partial<Record<SegmentId, number>> {
  if (segments.length === 0) return {};
  return segmentBoost(segments, -Math.abs(amount));
}

function scaleSegmentEffects(
  effects: Partial<Record<SegmentId, number>>,
): Partial<Record<SegmentId, number>> {
  const scaled: Partial<Record<SegmentId, number>> = {};

  for (const [segmentId, value] of Object.entries(effects) as [SegmentId, number][]) {
    if (!value) continue;
    const next = Math.round(value * SUB_SEGMENT_SCALE);
    scaled[segmentId] = next === 0 ? (value > 0 ? 1 : -1) : next;
  }

  return scaled;
}

function energyFromResponse(
  tone: EventResponseOption['tone'],
  resourceEnergy?: number,
): { energyCost: number; energyCostLabel: SubAgendaEnergyCostLabel } {
  const toneFallback = SUB_AGENDA_TONE_ENERGY[tone];
  const cost =
    resourceEnergy !== undefined && resourceEnergy !== 0
      ? getScaledMainEventEnergyCost(resourceEnergy) || toneFallback
      : toneFallback;

  const energyCostLabel: SubAgendaEnergyCostLabel =
    cost >= 5 ? 'yüksek' : cost >= 3 ? 'orta' : 'düşük';

  return { energyCost: cost, energyCostLabel };
}

function convertEventResponseToSubAgenda(
  option: EventResponseOption,
  eventId: string,
  resolved: ResolvedEventSegments,
): SubAgendaResponseOption {
  const { energyCost, energyCostLabel } = energyFromResponse(
    option.tone,
    option.effects?.resources?.energy,
  );

  return {
    id: `sub-${eventId}-${option.id}`,
    label: option.label,
    description: option.description,
    tone: option.tone,
    stanceValue: option.stanceValue,
    outcomeTitle: option.outcomeTitle,
    outcomeDescription: option.outcomeDescription,
    energyCost,
    energyCostLabel,
    segmentEffects: scaleSegmentEffects(option.segmentEffects),
    politicalSegmentEffects: buildPoliticalEffectsForTone(
      {
        primaryPoliticalSegments: resolved.primaryPoliticalSegments,
        tensionPoliticalSegments: resolved.tensionPoliticalSegments,
      },
      option.tone,
    ),
  };
}

function createGenericSubAgendaResponses(
  title: string,
  resolved: ResolvedEventSegments,
): SubAgendaResponseOption[] {
  const {
    primarySegments,
    tensionSegments,
    primaryPoliticalSegments,
    tensionPoliticalSegments,
  } = resolved;

  return [
    {
      id: 'sub-bold',
      label: 'Hedefe net mesaj',
      description: `${title} gündeminde seçtiğin kesime açık destek ver.`,
      tone: 'bold',
      stanceValue: 2,
      outcomeTitle: 'Net mesaj yankı buldu',
      outcomeDescription:
        tensionSegments.length > 0
          ? 'Mesajın hedef tabanda güçlü karşılık buldu; diğer kesimlerde gerilim oluştu.'
          : 'Mesajın hedef tabanda güçlü karşılık buldu.',
      energyCost: SUB_AGENDA_TONE_ENERGY.bold,
      energyCostLabel: 'yüksek',
      segmentEffects: {
        ...segmentBoost(primarySegments, 4),
        ...segmentPenalty(tensionSegments, 3),
      },
      politicalSegmentEffects: buildPoliticalEffectsForTone(
        { primaryPoliticalSegments, tensionPoliticalSegments },
        'bold',
      ),
    },
    {
      id: 'sub-measured',
      label: 'Dengeli yaklaşım',
      description: 'Mesajı yumuşatarak tabanı kırmadan ilerle.',
      tone: 'measured',
      stanceValue: 0,
      outcomeTitle: 'Dengeli çizgi',
      outcomeDescription: 'Hedef kitlede sınırlı kazanç; gerilim daha kontrollü kaldı.',
      energyCost: SUB_AGENDA_TONE_ENERGY.measured,
      energyCostLabel: 'orta',
      segmentEffects: {
        ...segmentBoost(primarySegments, 2),
        ...segmentPenalty(tensionSegments, 1),
      },
      politicalSegmentEffects: buildPoliticalEffectsForTone(
        { primaryPoliticalSegments, tensionPoliticalSegments },
        'measured',
      ),
    },
    {
      id: 'sub-pass',
      label: 'Bu alt gündeme girme',
      description: 'Mesaj kapasiteni ana gündeme ve sahaya sakla.',
      tone: 'passive',
      stanceValue: -1,
      outcomeTitle: 'Sessiz kalındı',
      outcomeDescription: 'Bu konuda konuşmadın; hedef kitlede hayal kırıklığı oluştu.',
      energyCost: SUB_AGENDA_TONE_ENERGY.passive,
      energyCostLabel: 'düşük',
      segmentEffects: segmentPenalty(primarySegments, 2),
      politicalSegmentEffects: buildPoliticalEffectsForTone(
        { primaryPoliticalSegments, tensionPoliticalSegments },
        'passive',
      ),
    },
  ];
}

function getCustomResponsesForEvent(eventId: string): EventResponseOption[] | undefined {
  return getCustomEventResponses(eventId) ?? getCustomRegionalEventResponses(eventId);
}

export function createSubAgendaResponseOptions(
  eventId: string,
  title: string,
  resolved: ResolvedEventSegments,
): SubAgendaResponseOption[] {
  const custom = getCustomResponsesForEvent(eventId);
  if (custom?.length) {
    return custom.map((option) => convertEventResponseToSubAgenda(option, eventId, resolved));
  }
  return createGenericSubAgendaResponses(title, resolved);
}
