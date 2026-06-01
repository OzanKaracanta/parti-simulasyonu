/** Rakip parti tanımları — soyut NPC rakipler */

import type { IdeologyId, RivalPartyState } from '../types/game';

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
    baseSupport: 22,
    isRulingParty: true,
  },
  {
    id: 'rival-people-path',
    name: 'Halk Yolu Partisi',
    shortName: 'HY',
    leaderName: 'Mehmet Arslan',
    ideologyId: 'populist-social',
    colorHex: '#ea580c',
    baseSupport: 18,
  },
  {
    id: 'rival-progress',
    name: 'İlerleme Hareketi',
    shortName: 'İH',
    leaderName: 'Deniz Aydın',
    ideologyId: 'liberal-economist',
    colorHex: '#2563eb',
    baseSupport: 16,
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
