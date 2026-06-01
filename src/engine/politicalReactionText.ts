/** Politik yankı metinleri ve etki tanımları */

import { politicalSegmentLabels } from '../data/politicalSegments';
import type { PoliticalSegmentId } from '../types/politicalSegments';
import type { PoliticalSegmentEffect, ResponseTone } from '../types/game';
import type { ResolvedEventSegments } from './resolveEventSegments';

export type { PoliticalSegmentEffect };

function formatSegmentList(ids: PoliticalSegmentId[]): string {
  if (ids.length === 0) return '';
  if (ids.length === 1) return politicalSegmentLabels[ids[0]!];
  const last = ids[ids.length - 1]!;
  const rest = ids.slice(0, -1).map((id) => politicalSegmentLabels[id]);
  return `${rest.join(', ')} ve ${politicalSegmentLabels[last]}`;
}

/** Elle yazılmış etkiler ton şablonunu segment bazında geçersiz kılar */
export function mergePoliticalSegmentEffects(
  fromTone: PoliticalSegmentEffect[],
  explicit: PoliticalSegmentEffect[],
): PoliticalSegmentEffect[] {
  const map = new Map(fromTone.map((effect) => [effect.segmentId, effect.delta]));

  for (const effect of explicit) {
    map.set(effect.segmentId, effect.delta);
  }

  return [...map.entries()].map(([segmentId, delta]) => ({
    segmentId: segmentId as PoliticalSegmentEffect['segmentId'],
    delta,
  }));
}

export function buildPoliticalEffectsForTone(
  resolved: Pick<
    ResolvedEventSegments,
    'primaryPoliticalSegments' | 'tensionPoliticalSegments'
  >,
  tone: ResponseTone,
): PoliticalSegmentEffect[] {
  const effects: PoliticalSegmentEffect[] = [];

  const primaryDelta = tone === 'bold' ? 2 : tone === 'measured' ? 1 : -1;
  const tensionDelta = tone === 'bold' ? -2 : tone === 'measured' ? -1 : 0;

  if (tone === 'passive') {
    for (const segmentId of resolved.primaryPoliticalSegments) {
      effects.push({ segmentId, delta: -1 });
    }
    return effects;
  }

  for (const segmentId of resolved.primaryPoliticalSegments) {
    effects.push({ segmentId, delta: primaryDelta });
  }

  for (const segmentId of resolved.tensionPoliticalSegments) {
    if (tensionDelta !== 0) {
      effects.push({ segmentId, delta: tensionDelta });
    }
  }

  return effects;
}

export function buildPoliticalReactionText(
  effects: PoliticalSegmentEffect[],
  rationale?: { tension?: string; political?: string },
): string | undefined {
  if (effects.length === 0) return rationale?.political ?? rationale?.tension;

  const positive = effects.filter((effect) => effect.delta > 0).map((effect) => effect.segmentId);
  const negative = effects.filter((effect) => effect.delta < 0).map((effect) => effect.segmentId);

  const parts: string[] = [];

  if (positive.length > 0) {
    parts.push(
      `${formatSegmentList(positive)} seçmende mesajın karşılık bulduğu yorumlandı.`,
    );
  }

  if (negative.length > 0) {
    parts.push(
      `${formatSegmentList(negative)} tabanında ise söylemin partizan veya sert bulunduğu algısı oluştu.`,
    );
  }

  if (parts.length === 0 && rationale?.political) {
    return rationale.political;
  }

  return parts.join(' ');
}

export function buildPoliticalReactionTextFromEvent(
  resolved: ResolvedEventSegments,
  tone: ResponseTone,
): string | undefined {
  const effects = buildPoliticalEffectsForTone(resolved, tone);
  const text = buildPoliticalReactionText(effects, {
    tension: resolved.tensionRationale,
    political: resolved.politicalRationale,
  });
  return text || undefined;
}
