/** Gündemler ekranı — ulusal, bölgesel veya alt gündem sayfası */

import type { Dispatch } from 'react';
import type { CampaignAction, GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { AgendaHubPanel, type AgendaPageMode } from './AgendaHubPanel';
import './AgendasScreen.css';

interface AgendasScreenProps {
  mode: AgendaPageMode;
  focusAgendaId?: string | null;
  onFocusApplied?: () => void;
  onRadarViewed?: () => void;
  state: GameState;
  availableActions: CampaignAction[];
  selectedResponseId: string | null;
  selectedRegionId: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
  onSelectResponse: (responseId: string) => void;
  onSelectSubAgendaResponse: (agendaId: string, responseId: string) => void;
  onClearSubAgendaResponse: (agendaId?: string) => void;
  dispatch: Dispatch<GameAction>;
}

export function AgendasScreen({
  mode,
  focusAgendaId = null,
  onFocusApplied,
  onRadarViewed,
  state,
  availableActions,
  selectedResponseId,
  selectedRegionId,
  onSelectRegion,
  onSelectResponse,
  onSelectSubAgendaResponse,
  onClearSubAgendaResponse,
  dispatch,
}: AgendasScreenProps) {
  return (
    <div className="agendas-screen">
      <AgendaHubPanel
        pageMode={mode}
        layout="page"
        focusAgendaId={focusAgendaId}
        onFocusApplied={onFocusApplied}
        onRadarViewed={onRadarViewed}
        state={state}
        availableActions={availableActions}
        selectedResponseId={selectedResponseId}
        onSelectResponse={onSelectResponse}
        onSelectSubAgendaResponse={onSelectSubAgendaResponse}
        onClearSubAgendaResponse={onClearSubAgendaResponse}
        regionId={selectedRegionId}
        onSelectRegion={onSelectRegion}
        onSelectRegionalResponse={(agendaId, responseId) =>
          dispatch({ type: 'SELECT_REGIONAL_AGENDA_RESPONSE', agendaId, responseId })
        }
        onClearRegionalResponse={(agendaId) =>
          dispatch({ type: 'CLEAR_REGIONAL_AGENDA_RESPONSE', agendaId })
        }
      />
    </div>
  );
}
