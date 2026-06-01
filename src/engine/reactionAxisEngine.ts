/** Gündem ekseni — sosyo/politik etki filtreleme ve rakip ideoloji çözümlemesi */

import { resolveEventTargetRival } from '../data/rivals';
import { politicalSegmentsForIdeology } from './ideologyPoliticalMapping';
import {
  MAIN_EVENT_POLITICAL_SCALE,
  SUB_AGENDA_POLITICAL_SCALE,
} from './politicalSegmentEngine';
import type { ResolvedEventSegments } from './resolveEventSegments';
import {
  enrichResolvedWithPlayerIdeology,
  stripPlayerSegmentsFromPoliticalTension,
} from './playerIdeologyPoliticalEngine';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type {
  IdeologyId,
  PolicyTopicId,
  ReactionAxis,
  RivalPartyState,
  SegmentId,
  WeeklyEvent,
} from '../types/game';

/** Faz 3 — toplumsal–siyasal konu alanları (elle mixed yazılmadıysa political varsayılan) */
export const POLITICAL_POLICY_TOPICS: PolicyTopicId[] = [
  'security',
  'mediaPolitics',
  'transparency',
];

export function resolveEffectiveReactionAxis(
  event: Pick<
    WeeklyEvent,
    'reactionAxis' | 'policyTopic' | 'primaryPoliticalSegments' | 'attacksRival'
  >,
): ReactionAxis {
  if (event.reactionAxis) return event.reactionAxis;
  if (event.attacksRival) return 'political';
  if (
    POLITICAL_POLICY_TOPICS.includes(event.policyTopic) ||
    (event.primaryPoliticalSegments?.length ?? 0) > 0
  ) {
    return 'political';
  }
  return 'socioeconomic';
}

/** Toplum & siyaset ekseninde toplu sosyo ceza/kazanç yasakları */
const BLOCKED_SOCIO_ON_POLITICAL: SegmentId[] = [
  'retirees',
  'workers',
  'civilServants',
  'industry',
];

const NARROW_SOCIO_ALLOWLIST: SegmentId[] = [
  'youth',
  'merchants',
  'farmers',
  'tourism',
  'fisherfolk',
];

/** İkili gündem — sosyo etkiler biraz yumuşatılır, ideoloji öne çıkar */
export const MIXED_SOCIO_EFFECT_SCALE = 0.75;

/** İkili gündem — politik etkiler saf politik gündeme göre güçlendirilir */
export const MIXED_MAIN_POLITICAL_SCALE = 0.9;
export const MIXED_SUB_POLITICAL_SCALE = 0.85;

export function getPoliticalAgendaScale(
  reactionAxis: ReactionAxis,
  channel: 'main' | 'sub',
): number {
  if (reactionAxis === 'mixed') {
    return channel === 'main' ? MIXED_MAIN_POLITICAL_SCALE : MIXED_SUB_POLITICAL_SCALE;
  }
  return channel === 'main' ? MAIN_EVENT_POLITICAL_SCALE : SUB_AGENDA_POLITICAL_SCALE;
}

function scaleSignedDelta(value: number, scale: number): number {
  if (value === 0) return 0;
  const next = Math.round(value * scale);
  if (next === 0) return value > 0 ? 1 : -1;
  return next;
}

export function scaleSocioEffectsForAxis(
  reactionAxis: ReactionAxis,
  effects: Partial<Record<SegmentId, number>>,
): Partial<Record<SegmentId, number>> {
  if (reactionAxis !== 'mixed') return { ...effects };

  const scaled: Partial<Record<SegmentId, number>> = {};
  for (const [key, value] of Object.entries(effects)) {
    if (value === 0 || value === undefined) continue;
    scaled[key as SegmentId] = scaleSignedDelta(value, MIXED_SOCIO_EFFECT_SCALE);
  }
  return scaled;
}

export function filterSocioSegmentEffectsByAxis(
  reactionAxis: ReactionAxis,
  effects: Partial<Record<SegmentId, number>>,
  resolved: Pick<ResolvedEventSegments, 'primarySegments' | 'tensionSegments'>,
): Partial<Record<SegmentId, number>> {
  if (reactionAxis === 'socioeconomic') {
    return { ...effects };
  }

  const filtered: Partial<Record<SegmentId, number>> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (value === 0 || value === undefined) continue;
    const segmentId = key as SegmentId;

    if (reactionAxis === 'political') {
      if (BLOCKED_SOCIO_ON_POLITICAL.includes(segmentId)) continue;
      if (
        NARROW_SOCIO_ALLOWLIST.includes(segmentId) &&
        resolved.tensionSegments.includes(segmentId)
      ) {
        filtered[segmentId] = value;
      }
      continue;
    }

    // mixed — yasaklı sosyo yalnızca olayda açıkça hedef/gerilim ise
    if (BLOCKED_SOCIO_ON_POLITICAL.includes(segmentId)) {
      if (
        !resolved.primarySegments.includes(segmentId) &&
        !resolved.tensionSegments.includes(segmentId)
      ) {
        continue;
      }
    }

    filtered[segmentId] = value;
  }

  return scaleSocioEffectsForAxis(reactionAxis, filtered);
}

function dedupePolitical(ids: PoliticalSegmentId[]): PoliticalSegmentId[] {
  return [...new Set(ids)];
}

/** Rakip hedefli gündem — gerilim rakip tabanı, primary oyuncu (veya çakışmasız elle yazım) */
export function enrichResolvedForPlayerRivalAttack(
  event: Pick<
    WeeklyEvent,
    'attacksRival' | 'targetRivalId' | 'primaryPoliticalSegments' | 'policyTopic' | 'reactionAxis'
  >,
  context: { playerIdeologyId: IdeologyId; rivalParties: RivalPartyState[] },
  resolved: ResolvedEventSegments,
): ResolvedEventSegments {
  if (!event.attacksRival) return resolved;

  const target = resolveEventTargetRival(event, context.rivalParties);
  if (!target) return resolved;

  const rivalPolitical = politicalSegmentsForIdeology(target.ideologyId);
  const playerPolitical = politicalSegmentsForIdeology(context.playerIdeologyId);

  const manualPrimary =
    event.primaryPoliticalSegments ?? resolved.primaryPoliticalSegments;
  const primaryWithoutRival = manualPrimary.filter((id) => !rivalPolitical.includes(id));
  const primaryPolitical =
    primaryWithoutRival.length > 0 ? primaryWithoutRival : playerPolitical;

  const next: ResolvedEventSegments = {
    ...resolved,
    tensionPoliticalSegments: dedupePolitical(rivalPolitical),
    primaryPoliticalSegments: dedupePolitical(primaryPolitical),
  };

  if (resolveEffectiveReactionAxis(event) === 'political') {
    next.primarySegments = [];
    next.reactionAxis = 'political';
  }

  return next;
}

export function enrichResolvedForPlayerContext(
  event: Pick<WeeklyEvent, 'attacksRival' | 'targetRivalId' | 'primaryPoliticalSegments' | 'policyTopic' | 'reactionAxis'>,
  context: { playerIdeologyId: IdeologyId; rivalParties: RivalPartyState[] },
  resolved: ResolvedEventSegments,
): ResolvedEventSegments {
  let next = enrichResolvedForPlayerRivalAttack(event, context, resolved);

  if (event.attacksRival) {
    return stripPlayerSegmentsFromPoliticalTension(next, context.playerIdeologyId);
  }

  return enrichResolvedWithPlayerIdeology(next, context.playerIdeologyId);
}

export function resolveAgendaSegmentsForPlayer(
  event: WeeklyEvent,
  context: { playerIdeologyId: IdeologyId; rivalParties: RivalPartyState[] },
  resolved: ResolvedEventSegments,
): ResolvedEventSegments {
  return enrichResolvedForPlayerContext(event, context, resolved);
}
