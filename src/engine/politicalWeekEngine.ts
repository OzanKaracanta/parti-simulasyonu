/** Haftalık siyasi ortam — rakipler, yankılar, zincir olayları, radar */

import { getEventResponseById } from '../data/eventResponseFactory';
import { advanceWeekAgenda } from './agendaEngine';
import {
  appendPendingEchoes,
  appendScheduledEvents,
  createOpinionEchoesFromResponse,
  processDueOpinionEchoes,
  scheduleStoryFollowUps,
  updateStoryFlags,
} from './opinionEchoEngine';
import {
  applyRivalMovesToState,
  simulateRivalMoves,
} from './rivalEngine';
import { getCombinedUpcomingStoryHint } from './regionalStoryEngine';
import {
  simulateRivalRadarMoves,
  simulateRivalRegionalAgendaMoves,
  simulateRivalSubAgendaMoves,
} from './rivalSubAgendaEngine';
import { resolveRadarAgendaWeek } from './subAgendaRadarEngine';
import type {
  GameState,
  OpinionEchoItem,
  RivalWeeklyMove,
} from '../types/game';
import type { EventEvaluationResult } from './eventEvaluation';

export interface WeeklyPoliticsResult {
  state: GameState;
  rivalMoves: RivalWeeklyMove[];
  opinionEchoes: OpinionEchoItem[];
  upcomingStoryHint: string;
  radarEffectLines: string[];
  bonusSlotsNextWeek: number;
}

export function resolveWeeklyPoliticsAfterResponse(
  state: GameState,
  evaluation: EventEvaluationResult | null,
): WeeklyPoliticsResult {
  const event = state.currentWeeklyEvent;
  const responseId = state.selectedEventResponseId;
  let nextState = state;
  let rivalMoves: RivalWeeklyMove[] = [];

  if (event && responseId && evaluation) {
    const response = getEventResponseById(event.responseOptions, responseId);
    if (response) {
      const rivalResult = simulateRivalMoves(state, event, evaluation.responseLevel);
      rivalMoves = rivalResult.moves;
      nextState = { ...state, rivalParties: rivalResult.rivalParties };
    }
  }

  const subRivalMoves = simulateRivalSubAgendaMoves(
    state,
    state.selectedSubAgendaSelections,
    state.subAgendas,
  );
  const radarRivalMoves = simulateRivalRadarMoves(
    state,
    state.selectedSubAgendaSelections,
    state.subAgendas,
    state.radarAgendas,
  );
  const regionalRivalMoves = simulateRivalRegionalAgendaMoves(
    state,
    state.selectedRegionalAgendaSelections,
    state.regionalAgendas,
  );
  const extraRivalMoves = [...subRivalMoves, ...radarRivalMoves, ...regionalRivalMoves];
  rivalMoves = [...rivalMoves, ...extraRivalMoves];
  nextState = applyRivalMovesToState(nextState, rivalMoves);

  const radarWeek = resolveRadarAgendaWeek(nextState, state.selectedSubAgendaSelections);
  nextState = radarWeek.state;
  const { effectLines: radarEffectLines, bonusSlotsNextWeek } = radarWeek;

  if (event && responseId && evaluation) {
    const response = getEventResponseById(event.responseOptions, responseId);
    if (response) {
      const pendingEchoes = createOpinionEchoesFromResponse(
        state,
        event,
        response.label,
        evaluation.responseLevel,
        response.tone,
      );
      nextState = appendPendingEchoes(nextState, pendingEchoes);

      const scheduled = scheduleStoryFollowUps(state, event.id, responseId);
      nextState = appendScheduledEvents(nextState, scheduled);
      nextState = {
        ...nextState,
        storyFlags: updateStoryFlags(state.storyFlags, event.id, responseId),
      };
    }
  }

  return {
    state: nextState,
    rivalMoves,
    opinionEchoes: [],
    upcomingStoryHint: getCombinedUpcomingStoryHint(nextState),
    radarEffectLines,
    bonusSlotsNextWeek,
  };
}

export function advanceWeekWithPolitics(state: GameState): {
  state: GameState;
  opinionEchoes: OpinionEchoItem[];
} {
  const nextWeek = state.campaignWeek + 1;
  const echoResult = processDueOpinionEchoes(state, nextWeek);
  const nextState = advanceWeekAgenda(echoResult.state);

  return {
    state: nextState,
    opinionEchoes: echoResult.newEchoes,
  };
}
