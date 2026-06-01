/** Rakip parti tanımları — soyut NPC rakipler */

import type { IdeologyId, RivalPartyState } from '../types/game';

/** Kampanya başı sabit ulusal oy payları (oyuncu ~%10–13 bandında başlar) */
export const RIVAL_START_NATIONAL_SUPPORT = {
  ruling: 40,
  oppositionMain: 25,
  oppositionSecondary: 21,
} as const;

export interface RivalDefinition {
  id: string;
  name: string;
  shortName: string;
  leaderName: string;
  ideologyId: IdeologyId;
  colorHex: string;
  baseSupport: number;
  isRulingParty?: boolean;
}

export const rivalDefinitions: RivalDefinition[] = [
  {
    id: 'rival-republic-union',
    name: 'Cumhuriyet Birliği',
    shortName: 'CB',
    leaderName: 'Ayşe Korkmaz',
    ideologyId: 'nationalist-security',
    colorHex: '#dc2626',
    baseSupport: RIVAL_START_NATIONAL_SUPPORT.ruling,
    isRulingParty: true,
  },
  {
    id: 'rival-people-path',
    name: 'Halk Yolu Partisi',
    shortName: 'HY',
    leaderName: 'Mehmet Arslan',
    ideologyId: 'populist-social',
    colorHex: '#ea580c',
    baseSupport: RIVAL_START_NATIONAL_SUPPORT.oppositionMain,
  },
  {
    id: 'rival-progress',
    name: 'İlerleme Hareketi',
    shortName: 'İH',
    leaderName: 'Deniz Aydın',
    ideologyId: 'liberal-economist',
    colorHex: '#2563eb',
    baseSupport: RIVAL_START_NATIONAL_SUPPORT.oppositionSecondary,
  },
];

export function createInitialRivalParties(): RivalPartyState[] {
  return rivalDefinitions.map((def) => ({
    id: def.id,
    name: def.name,
    shortName: def.shortName,
    leaderName: def.leaderName,
    ideologyId: def.ideologyId,
    nationalSupport: def.baseSupport,
    colorHex: def.colorHex,
    isRulingParty: def.isRulingParty ?? false,
  }));
}

export function getRulingParty(rivalParties: RivalPartyState[]): RivalPartyState | null {
  return rivalParties.find((rival) => rival.isRulingParty) ?? null;
}

export function resolveEventTargetRival(
  event: { attacksRival?: boolean; targetRivalId?: string },
  rivalParties: RivalPartyState[],
): RivalPartyState | null {
  if (!event.attacksRival) return null;

  if (event.targetRivalId) {
    return rivalParties.find((rival) => rival.id === event.targetRivalId) ?? null;
  }

  return getRulingParty(rivalParties);
}

export function getRivalDefinition(id: string): RivalDefinition | undefined {
  return rivalDefinitions.find((item) => item.id === id);
}
