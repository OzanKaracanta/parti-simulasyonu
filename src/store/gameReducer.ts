/** Oyun state reducer — UI event'lerini engine fonksiyonlarına yönlendirir */

import {
  finishWeek,
  pruneSelectedActionsToUnlocked,
  selectAction,
  selectEventResponse,
  selectSubAgendaResponse,
  clearSubAgendaResponse,
  selectRegionalAgendaResponse,
  clearRegionalAgendaResponse,
  unselectAction,
  calculateNationalSupport,
} from '../engine/gameEngine';
import { canFinishWeek } from '../engine/eventEvaluation';
import { dismissActiveAdvisorBriefing } from '../engine/advisorEngine';
import { dismissActiveWeekBacklash } from '../engine/backlashEngine';
import { buildGameStateFromSetup, createSetupState } from '../engine/setupEngine';
import { buildTool, revertOrganizationToolChange, upgradeTool } from '../systems/organizationSystem';
import { isNationalOrganizationTool } from '../data/nationalOrganizationTools';
import {
  buildNationalTool,
  revertNationalOrganizationToolChange,
  upgradeNationalTool,
} from '../systems/nationalOrganizationSystem';
import type { GameState, RegionId, SetupChoices } from '../types/game';

export type GameAction =
  | { type: 'SELECT_ACTION'; actionId: string; regionId?: RegionId }
  | { type: 'UNSELECT_ACTION'; actionId: string }
  | { type: 'SELECT_EVENT_RESPONSE'; responseId: string }
  | { type: 'SELECT_SUB_AGENDA_RESPONSE'; agendaId: string; responseId: string }
  | { type: 'CLEAR_SUB_AGENDA_RESPONSE'; agendaId?: string }
  | { type: 'SELECT_REGIONAL_AGENDA_RESPONSE'; agendaId: string; responseId: string }
  | { type: 'CLEAR_REGIONAL_AGENDA_RESPONSE'; agendaId?: string }
  | { type: 'END_WEEK' }
  | { type: 'DISMISS_WEEK_BACKLASH' }
  | { type: 'DISMISS_ADVISOR_BRIEFING' }
  | { type: 'START_GAME'; choices: SetupChoices }
  | { type: 'RESET_GAME' }
  | { type: 'BUILD_ORGANIZATION_TOOL'; toolId: string; regionId?: RegionId }
  | { type: 'UPGRADE_ORGANIZATION_TOOL'; toolId: string; regionId?: RegionId }
  | { type: 'REVERT_ORGANIZATION_TOOL'; toolId: string; regionId?: RegionId };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_ACTION': {
      const selectedAction = state.availableActions.find((item) => item.id === action.actionId);
      if (!selectedAction) return state;

      const nextState = selectAction(state, action.actionId, action.regionId);
      return nextState ?? state;
    }

    case 'UNSELECT_ACTION':
      return unselectAction(state, action.actionId);

    case 'SELECT_EVENT_RESPONSE': {
      const nextState = selectEventResponse(state, action.responseId);
      return nextState ?? state;
    }

    case 'SELECT_SUB_AGENDA_RESPONSE': {
      const nextState = selectSubAgendaResponse(
        state,
        action.agendaId,
        action.responseId,
      );
      return nextState ?? state;
    }

    case 'CLEAR_SUB_AGENDA_RESPONSE':
      return clearSubAgendaResponse(state, action.agendaId);

    case 'SELECT_REGIONAL_AGENDA_RESPONSE': {
      const nextState = selectRegionalAgendaResponse(
        state,
        action.agendaId,
        action.responseId,
      );
      return nextState ?? state;
    }

    case 'CLEAR_REGIONAL_AGENDA_RESPONSE':
      return clearRegionalAgendaResponse(state, action.agendaId);

    case 'END_WEEK': {
      const check = canFinishWeek(state);
      if (!check.ok) return state;
      return finishWeek(state);
    }

    case 'DISMISS_WEEK_BACKLASH':
      return dismissActiveWeekBacklash(state);

    case 'DISMISS_ADVISOR_BRIEFING':
      return dismissActiveAdvisorBriefing(state);

    case 'START_GAME':
      return buildGameStateFromSetup(action.choices);

    case 'RESET_GAME':
      return createSetupState();

    case 'BUILD_ORGANIZATION_TOOL': {
      const nextState = isNationalOrganizationTool(action.toolId)
        ? buildNationalTool(state, action.toolId)
        : action.regionId
          ? buildTool(state, action.toolId, action.regionId)
          : null;
      return nextState ?? state;
    }

    case 'UPGRADE_ORGANIZATION_TOOL': {
      const nextState = isNationalOrganizationTool(action.toolId)
        ? upgradeNationalTool(state, action.toolId)
        : action.regionId
          ? upgradeTool(state, action.toolId, action.regionId)
          : null;
      return nextState ?? state;
    }

    case 'REVERT_ORGANIZATION_TOOL': {
      const reverted = isNationalOrganizationTool(action.toolId)
        ? revertNationalOrganizationToolChange(state, action.toolId)
        : action.regionId
          ? revertOrganizationToolChange(state, action.regionId, action.toolId)
          : null;
      if (!reverted) return state;

      const pruned = pruneSelectedActionsToUnlocked(reverted);
      return {
        ...pruned,
        nationalSupport: calculateNationalSupport(pruned),
      };
    }

    default:
      return state;
  }
}
