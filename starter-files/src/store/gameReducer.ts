import { initialGameState } from '../data/initialGameData';
import { canAffordAction, finishWeek } from '../engine/gameEngine';
import type { GameState } from '../types/game';

export type GameAction =
  | { type: 'SELECT_ACTION'; actionId: string }
  | { type: 'UNSELECT_ACTION'; actionId: string }
  | { type: 'END_WEEK' }
  | { type: 'RESET_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_ACTION': {
      if (state.selectedActionIds.includes(action.actionId)) return state;
      if (state.selectedActionIds.length >= 3) return state;

      const selectedAction = state.availableActions.find((item) => item.id === action.actionId);
      if (!selectedAction || !canAffordAction(state, selectedAction)) return state;

      return {
        ...state,
        selectedActionIds: [...state.selectedActionIds, action.actionId],
      };
    }

    case 'UNSELECT_ACTION':
      return {
        ...state,
        selectedActionIds: state.selectedActionIds.filter((id) => id !== action.actionId),
      };

    case 'END_WEEK':
      return finishWeek(state);

    case 'RESET_GAME':
      return initialGameState;

    default:
      return state;
  }
}
