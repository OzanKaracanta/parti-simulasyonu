/** Gündem olayları için segment eşlemesi — manuel alan + konu tabanlı fallback */

import {
  getIdeologyLabel,
  getPrimaryRivalForPolitics,
  leadingRivalPoliticalSegments,
  politicalSegmentsForIdeology,
} from './ideologyPoliticalMapping';
import { resolveEventTargetRival } from '../data/rivals';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import { resolveEffectiveReactionAxis } from './reactionAxisEngine';
import type { PolicyTopicId, RivalPartyState, SegmentId, WeeklyEvent } from '../types/game';

export type ReactionAxis = 'socioeconomic' | 'political' | 'mixed';

export interface ResolvedEventSegments {
  reactionAxis: ReactionAxis;
  primarySegments: SegmentId[];
  tensionSegments: SegmentId[];
  primaryPoliticalSegments: PoliticalSegmentId[];
  tensionPoliticalSegments: PoliticalSegmentId[];
  tensionRationale?: string;
  politicalRationale?: string;
}

interface TopicSegmentFallback {
  primarySegments: SegmentId[];
  tensionSegments: SegmentId[];
}

interface TopicPoliticalFallback {
  primaryPoliticalSegments: PoliticalSegmentId[];
  tensionPoliticalSegments: PoliticalSegmentId[];
}

const TOPIC_SEGMENT_FALLBACKS: Record<PolicyTopicId, TopicSegmentFallback> = {
  economy: {
    primarySegments: ['workers', 'retirees'],
    tensionSegments: ['merchants', 'industry'],
  },
  transparency: {
    primarySegments: [],
    tensionSegments: ['merchants'],
  },
  labor: {
    primarySegments: ['workers'],
    tensionSegments: ['industry', 'merchants'],
  },
  security: {
    primarySegments: [],
    tensionSegments: ['youth'],
  },
  environment: {
    primarySegments: ['farmers', 'youth'],
    tensionSegments: ['industry', 'merchants'],
  },
  socialWelfare: {
    primarySegments: ['retirees', 'workers'],
    tensionSegments: ['merchants'],
  },
  localGovernance: {
    primarySegments: ['merchants', 'retirees'],
    tensionSegments: ['civilServants'],
  },
  mediaPolitics: {
    primarySegments: ['youth'],
    tensionSegments: [],
  },
};

/** Konu bazlı ideolojik eksen — elle yazılmamış mixed/political olaylar için */
const TOPIC_POLITICAL_FALLBACKS: Record<PolicyTopicId, TopicPoliticalFallback> = {
  economy: {
    primaryPoliticalSegments: ['populist', 'socialDemocrat'],
    tensionPoliticalSegments: ['liberal'],
  },
  labor: {
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
  },
  socialWelfare: {
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
  },
  environment: {
    primaryPoliticalSegments: ['socialDemocrat', 'liberal'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
  },
  localGovernance: {
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative'],
  },
  transparency: {
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative'],
  },
  mediaPolitics: {
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
  },
  security: {
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal', 'populist'],
  },
};

function inferReactionAxis(event: WeeklyEvent): ReactionAxis {
  const explicit = event.reactionAxis;
  if (explicit) return explicit;

  const topicDefault = resolveEffectiveReactionAxis(event);
  if (topicDefault === 'political') return 'political';

  const hasPolitical =
    (event.primaryPoliticalSegments?.length ?? 0) > 0 ||
    (event.tensionPoliticalSegments?.length ?? 0) > 0;

  if (hasPolitical) {
    const hasSocioManual = (event.primarySegments?.length ?? 0) > 0;
    return hasSocioManual || event.affectedSegments.length > 0 ? 'mixed' : 'political';
  }

  return 'socioeconomic';
}

function resolveSocioeconomicSegments(
  event: WeeklyEvent,
  reactionAxis: ReactionAxis,
): Pick<ResolvedEventSegments, 'primarySegments' | 'tensionSegments'> {
  const fallback = TOPIC_SEGMENT_FALLBACKS[event.policyTopic];

  const primarySegments =
    event.primarySegments ??
    (reactionAxis === 'political' ? [] : fallback?.primarySegments ?? event.affectedSegments.slice(0, 2));

  const tensionSegments = event.tensionSegments ?? fallback?.tensionSegments ?? [];

  return { primarySegments, tensionSegments };
}

function resolvePoliticalSegments(
  event: WeeklyEvent,
  reactionAxis: ReactionAxis,
): Pick<ResolvedEventSegments, 'primaryPoliticalSegments' | 'tensionPoliticalSegments'> {
  const fallback = TOPIC_POLITICAL_FALLBACKS[event.policyTopic];

  if (reactionAxis === 'socioeconomic') {
    return {
      primaryPoliticalSegments: event.primaryPoliticalSegments ?? [],
      tensionPoliticalSegments: event.tensionPoliticalSegments ?? [],
    };
  }

  return {
    primaryPoliticalSegments:
      event.primaryPoliticalSegments ?? fallback?.primaryPoliticalSegments ?? [],
    tensionPoliticalSegments:
      event.tensionPoliticalSegments ?? fallback?.tensionPoliticalSegments ?? [],
  };
}

export function resolveEventSegments(event: WeeklyEvent): ResolvedEventSegments {
  const reactionAxis = inferReactionAxis(event);
  const socio = resolveSocioeconomicSegments(event, reactionAxis);
  const political = resolvePoliticalSegments(event, reactionAxis);

  return {
    reactionAxis,
    ...socio,
    ...political,
    tensionRationale: event.tensionRationale,
    politicalRationale: event.politicalRationale,
  };
}

/** Rakip saldırı olayları — hedef partinin ideoloji tabanını gerilim segmenti yap */
export function enrichWithRivalTarget(
  event: Pick<WeeklyEvent, 'attacksRival' | 'targetRivalId'>,
  resolved: ResolvedEventSegments,
  rivalParties: RivalPartyState[],
): ResolvedEventSegments {
  if (!event.attacksRival) return resolved;

  const target = resolveEventTargetRival(event, rivalParties);
  if (!target) return resolved;

  const segments = politicalSegmentsForIdeology(target.ideologyId);
  if (segments.length === 0) return resolved;

  const roleLabel = target.isRulingParty ? 'İktidar' : target.shortName;
  const ideologyLabel = getIdeologyLabel(target.ideologyId);

  return {
    ...resolved,
    tensionPoliticalSegments: segments,
    tensionRationale:
      resolved.tensionRationale ??
      `${roleLabel} tabanı (${target.leaderName} çizgisi) saldırgan mesajda savunmacılığa geçebilir.`,
    politicalRationale:
      resolved.politicalRationale ??
      `Hedef: ${target.name} · ${ideologyLabel}`,
  };
}

/** Rakip ideolojisi — boş politik gerilim alanlarına otomatik tension (Faz 5) */
export function enrichResolvedSegmentsWithRivals(
  resolved: ResolvedEventSegments,
  rivalParties: RivalPartyState[],
): ResolvedEventSegments {
  if (resolved.tensionPoliticalSegments.length > 0) return resolved;
  if (resolved.reactionAxis === 'socioeconomic') return resolved;

  const segments = leadingRivalPoliticalSegments(rivalParties, 2);
  if (segments.length === 0) return resolved;

  const primary = getPrimaryRivalForPolitics(rivalParties);
  const tensionRationale =
    resolved.tensionRationale ??
    (primary
      ? `${primary.isRulingParty ? 'İktidar' : primary.shortName} tabanı (${primary.leaderName} çizgisi) sert mesajda savunmacılığa geçebilir.`
      : undefined);

  return {
    ...resolved,
    tensionPoliticalSegments: segments,
    tensionRationale,
  };
}

export function resolveEventSegmentsForWeek(
  event: WeeklyEvent,
  rivalParties: RivalPartyState[],
): ResolvedEventSegments {
  const base = resolveEventSegments(event);
  const withTarget = enrichWithRivalTarget(event, base, rivalParties);
  return enrichResolvedSegmentsWithRivals(withTarget, rivalParties);
}
