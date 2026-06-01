/** Gündem durumu — komuta merkezi özeti ve bekleyen karar sayısı */

import { getRegionalAgendaMaxSlots } from '../data/regionalAgendaConfig';
import { getEffectiveSubAgendaMaxSlots } from './subAgendaSlots';
import { canRespondToRegionalAgenda } from './regionalAgendaAccess';
import type { GameState } from '../types/game';

export interface AgendaStatusSnapshot {
  mainPending: boolean;
  mainTitle: string | null;
  mainResponseLabel: string | null;
  subCount: number;
  subSlotsUsed: number;
  subMaxSlots: number;
  radarCount: number;
  regionalCount: number;
  regionalAnswered: number;
  regionalPending: number;
  pendingCount: number;
}

export function getAgendaStatusSnapshot(state: GameState): AgendaStatusSnapshot {
  const event = state.currentWeeklyEvent;
  const mainPending = Boolean(event && !state.selectedEventResponseId);
  const mainResponse = event?.responseOptions.find(
    (option) => option.id === state.selectedEventResponseId,
  );

  const subMaxSlots = getEffectiveSubAgendaMaxSlots(state);
  const subSlotsUsed = state.selectedSubAgendaSelections.length;

  let regionalPending = 0;
  let regionalAnswered = 0;

  for (const agenda of state.regionalAgendas) {
    const answered = state.selectedRegionalAgendaSelections.some(
      (item) => item.agendaId === agenda.id,
    );
    if (answered) {
      regionalAnswered += 1;
      continue;
    }
    if (canRespondToRegionalAgenda(state, agenda.regionId)) {
      regionalPending += 1;
    }
  }

  const pendingCount = (mainPending ? 1 : 0) + regionalPending;

  return {
    mainPending,
    mainTitle: event?.title ?? null,
    mainResponseLabel: mainResponse?.label ?? null,
    subCount: state.subAgendas.length,
    subSlotsUsed,
    subMaxSlots,
    radarCount: state.radarAgendas.length,
    regionalCount: state.regionalAgendas.length,
    regionalAnswered,
    regionalPending,
    pendingCount,
  };
}

export function getRegionalAgendaSlotSummary(state: GameState): string {
  const maxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);
  const slotsUsed = state.selectedRegionalAgendaSelections.length;
  return `${slotsUsed}/${maxSlots}`;
}
