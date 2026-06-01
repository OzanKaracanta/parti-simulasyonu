import type { Dispatch } from 'react';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { RegionalAgendaPanel } from './RegionalAgendaPanel';
import './dashboard.css';

interface RegionOperationsPanelProps {
  state: GameState;
  regionId: RegionId;
  dispatch: Dispatch<GameAction>;
}

export function RegionOperationsPanel({ state, regionId, dispatch }: RegionOperationsPanelProps) {
  return (
    <div className="region-operations-panel">
      <RegionalAgendaPanel
        state={state}
        regionId={regionId}
        onSelectResponse={(agendaId, responseId) =>
          dispatch({ type: 'SELECT_REGIONAL_AGENDA_RESPONSE', agendaId, responseId })
        }
        onClearResponse={(agendaId) =>
          dispatch({ type: 'CLEAR_REGIONAL_AGENDA_RESPONSE', agendaId })
        }
      />
    </div>
  );
}
