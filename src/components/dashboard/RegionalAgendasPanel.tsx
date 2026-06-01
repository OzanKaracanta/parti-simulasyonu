/** Bölgesel gündemler — çoklu bölge kart grid'i */

import { getRegionalAgendaMaxSlots } from '../../data/regionalAgendaConfig';
import {
  canRespondToRegionalAgenda,
  getRegionalAgendaAccessReason,
} from '../../engine/regionalAgendaAccess';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import { RegionalAgendaCard } from './RegionalAgendaCard';
import './RegionalAgendaPanel.css';

interface RegionalAgendasPanelProps {
  state: GameState;
  onSelectResponse: (agendaId: string, responseId: string) => void;
  onClearResponse: (agendaId?: string) => void;
  embedded?: boolean;
  layout?: 'embedded' | 'page';
}

export function RegionalAgendasPanel({
  state,
  onSelectResponse,
  onClearResponse,
  embedded = false,
  layout = 'embedded',
}: RegionalAgendasPanelProps) {
  const { regionalAgendas, selectedRegionalAgendaSelections } = state;
  const maxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);
  const slotsUsed = selectedRegionalAgendaSelections.length;
  const slotsFull = slotsUsed >= maxSlots;

  if (regionalAgendas.length === 0) {
    return embedded ? (
      <p className="regional-agenda-empty">Bu hafta bölgesel gündem yok.</p>
    ) : null;
  }

  const selectionFor = (agendaId: string) =>
    selectedRegionalAgendaSelections.find((item) => item.agendaId === agendaId);

  const content = (
    <div
      className={`regional-agenda-panel-body ${layout === 'page' ? 'regional-agenda-panel-body--page' : ''}`}
    >
      <div className="regional-agenda-toolbar">
        <h3 className="regional-agenda-toolbar-title">Bölgesel Gündemler</h3>
        <div
          className="regional-agenda-slot-meter"
          aria-label={`Mesaj slotu ${slotsUsed} / ${maxSlots}`}
        >
          <span className="regional-agenda-slot-label">Mesaj slotu</span>
          <span className="regional-agenda-slot-value">
            {slotsUsed}/{maxSlots}
          </span>
        </div>
      </div>

      <div className="regional-agenda-list">
        {regionalAgendas.map((agenda) => {
          const selection = selectionFor(agenda.id);
          const isActiveCard = Boolean(selection);
          const canRespond = canRespondToRegionalAgenda(state, agenda.regionId);
          const accessReason = getRegionalAgendaAccessReason(state, agenda.regionId);
          const cardLocked = canRespond && slotsFull && !isActiveCard;

          return (
            <RegionalAgendaCard
              key={agenda.id}
              agenda={agenda}
              selection={selection}
              cardLocked={cardLocked}
              accessReason={canRespond ? null : accessReason}
              onSelectResponse={(responseId) => onSelectResponse(agenda.id, responseId)}
              onClearResponse={() => onClearResponse(agenda.id)}
            />
          );
        })}
      </div>

      <footer className="regional-agenda-footer">
        {slotsUsed > 0 ? (
          <button type="button" className="regional-agenda-clear-btn" onClick={() => onClearResponse()}>
            Tüm bölgesel seçimleri temizle
          </button>
        ) : (
          <p className="regional-agenda-optional">
            İsteğe bağlı — yanıt vermezsen rakipler yerel gündemi sahiplenebilir.
          </p>
        )}
      </footer>
    </div>
  );

  if (embedded) {
    return content;
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
      {content}
    </Panel>
  );
}
