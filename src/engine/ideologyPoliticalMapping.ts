/** İdeoloji → politik segment eşlemesi — rakip tabanı ve otomatik gerilim */

import { getIdeologyById } from '../data/setupOptions';
import { getRulingParty } from '../data/rivals';
import type { IdeologyId, RivalPartyState } from '../types/game';
import type { PoliticalSegmentId } from '../types/politicalSegments';

export const IDEOLOGY_POLITICAL_PROFILE: Record<IdeologyId, PoliticalSegmentId[]> = {
  'nationalist-security': ['nationalist', 'conservative'],
  'populist-social': ['socialDemocrat', 'populist'],
  'liberal-economist': ['liberal'],
  'centrist-reform': ['liberal', 'socialDemocrat'],
  'conservative-democrat': ['conservative', 'socialDemocrat'],
  'libertarian-democrat': ['liberal', 'populist'],
  'green-localist': ['socialDemocrat', 'liberal'],
  'populist-radical': ['populist', 'socialDemocrat'],
};

export function politicalSegmentsForIdeology(ideologyId: IdeologyId): PoliticalSegmentId[] {
  return IDEOLOGY_POLITICAL_PROFILE[ideologyId] ?? [];
}

export function getIdeologyLabel(ideologyId: IdeologyId): string {
  return getIdeologyById(ideologyId).name;
}

export function getLeadingRival(rivalParties: RivalPartyState[]): RivalPartyState | null {
  if (rivalParties.length === 0) return null;
  return [...rivalParties].sort((a, b) => b.nationalSupport - a.nationalSupport)[0] ?? null;
}

/** Politik gerilim için öncelik: iktidar partisi, yoksa en yüksek destekli rakip */
export function getPrimaryRivalForPolitics(rivalParties: RivalPartyState[]): RivalPartyState | null {
  return getRulingParty(rivalParties) ?? getLeadingRival(rivalParties);
}

export function leadingRivalPoliticalSegments(
  rivalParties: RivalPartyState[],
  max = 2,
): PoliticalSegmentId[] {
  const primary = getPrimaryRivalForPolitics(rivalParties);
  if (!primary) return [];
  return politicalSegmentsForIdeology(primary.ideologyId).slice(0, max);
}
