/** Alt gündem slot hesabı — temel + bonus */

import { SUB_AGENDA_MAX_SLOTS } from '../data/subAgendaConfig';
import type { GameState } from '../types/game';

export function getEffectiveSubAgendaMaxSlots(state: GameState): number {
  return SUB_AGENDA_MAX_SLOTS + Math.max(0, state.bonusSubAgendaSlots ?? 0);
}
