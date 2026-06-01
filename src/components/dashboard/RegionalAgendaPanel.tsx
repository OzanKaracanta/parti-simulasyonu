/** Bölgesel gündem — tek bölge sarmalayıcı (RegionOperationsPanel) */

import { getRegionalAgendaMaxSlots } from '../../data/regionalAgendaConfig';
import {
  canRespondToRegionalAgenda,
  getRegionalAgendaAccessReason,
} from '../../engine/regionalAgendaAccess';
import { getRegionalAgendaForRegion } from '../../engine/regionalAgendaEngine';
import type { GameState, RegionId } from '../../types/game';
import { Panel } from '../ui/Panel';
import { RegionalAgendaCard } from './RegionalAgendaCard';
import './RegionalAgendaPanel.css';

interface RegionalAgendaPanelProps {
  state: GameState;
  regionId: RegionId;
  onSelectResponse: (agendaId: string, responseId: string) => void;
  onClearResponse: (agendaId?: string) => void;
  embedded?: boolean;
}

export function RegionalAgendaPanel({
  state,
  regionId,
  onSelectResponse,
  onClearResponse,
  embedded = false,
}: RegionalAgendaPanelProps) {
  const agenda = getRegionalAgendaForRegion(state.regionalAgendas, regionId);
  const maxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);
  const slotsUsed = state.selectedRegionalAgendaSelections.length;

  if (!agenda) return null;

  const selection = state.selectedRegionalAgendaSelections.find(
    (item) => item.agendaId === agenda.id,
  );
  const canRespond = canRespondToRegionalAgenda(state, regionId);
  const accessReason = getRegionalAgendaAccessReason(state, regionId);
  const slotsFull = slotsUsed >= maxSlots;
  const cardLocked = canRespond && slotsFull && !selection;

  const card = (
    <RegionalAgendaCard
      state={state}
      agenda={agenda}
      selection={selection}
      cardLocked={cardLocked}
      accessReason={canRespond ? null : accessReason}
      onSelectResponse={(responseId) => onSelectResponse(agenda.id, responseId)}
      onClearResponse={() => onClearResponse(agenda.id)}
    />
  );

  if (embedded) {
    return card;
  }

  return (
    <Panel
      title="Bölgesel Gündem"
      headerExtra={
        <span className="regional-agenda-slot-badge">
          Slot {slotsUsed}/{maxSlots}
        </span>
      }
      className="regional-agenda-panel"
    >
      {card}
    </Panel>
  );
}
