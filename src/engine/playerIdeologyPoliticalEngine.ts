/** Oyuncu ideolojisi — politik segment zenginleştirme ve taban uyumu modülasyonu */

import { getIdeologyLabel, politicalSegmentsForIdeology } from './ideologyPoliticalMapping';
import type { ResolvedEventSegments } from './resolveEventSegments';
import type { IdeologyId, PoliticalSegmentEffect } from '../types/game';

/** Kendi tabanındaki kazanç/kayıplar biraz güçlenir */
export const PLAYER_ALIGNED_POLITICAL_BOOST = 1.2;
export const PLAYER_ALIGNED_POLITICAL_PENALTY = 1.15;

function scalePlayerAlignedDelta(delta: number, scale: number): number {
  if (delta === 0) return 0;
  const next = Math.round(delta * scale * 10) / 10;
  if (next === 0) return delta > 0 ? 0.5 : -0.5;
  return next;
}

export function modulatePoliticalEffectsForPlayerIdeology(
  effects: PoliticalSegmentEffect[],
  playerIdeologyId: IdeologyId,
): PoliticalSegmentEffect[] {
  const playerSegments = new Set(politicalSegmentsForIdeology(playerIdeologyId));
  if (playerSegments.size === 0) return effects;

  return effects.map(({ segmentId, delta }) => {
    if (!playerSegments.has(segmentId) || delta === 0) {
      return { segmentId, delta };
    }
    const scale = delta > 0 ? PLAYER_ALIGNED_POLITICAL_BOOST : PLAYER_ALIGNED_POLITICAL_PENALTY;
    return { segmentId, delta: scalePlayerAlignedDelta(delta, scale) };
  });
}

/** Boş primary politik alanları oyuncu tabanıyla doldur; gerilimle çakışanı temizle */
export function enrichResolvedWithPlayerIdeology(
  resolved: ResolvedEventSegments,
  playerIdeologyId: IdeologyId,
): ResolvedEventSegments {
  if (resolved.reactionAxis === 'socioeconomic') return resolved;

  const playerPolitical = politicalSegmentsForIdeology(playerIdeologyId);
  const playerSet = new Set(playerPolitical);

  const hasManualPrimary = resolved.primaryPoliticalSegments.length > 0;
  const primaryPoliticalSegments = hasManualPrimary
    ? resolved.primaryPoliticalSegments
    : playerPolitical;

  const tensionPoliticalSegments = resolved.tensionPoliticalSegments.filter(
    (id) => !playerSet.has(id),
  );

  let politicalRationale = resolved.politicalRationale;
  if (!hasManualPrimary && playerPolitical.length > 0 && !politicalRationale) {
    politicalRationale = `Kendi tabanın: ${getIdeologyLabel(playerIdeologyId)}`;
  }

  return {
    ...resolved,
    primaryPoliticalSegments,
    tensionPoliticalSegments,
    politicalRationale,
  };
}

/** Rakip saldırısı sonrası — oyuncu segmentlerinin gerilim listesinde kalmaması */
export function stripPlayerSegmentsFromPoliticalTension(
  resolved: ResolvedEventSegments,
  playerIdeologyId: IdeologyId,
): ResolvedEventSegments {
  const playerSet = new Set(politicalSegmentsForIdeology(playerIdeologyId));
  if (playerSet.size === 0) return resolved;

  return {
    ...resolved,
    tensionPoliticalSegments: resolved.tensionPoliticalSegments.filter((id) => !playerSet.has(id)),
  };
}
