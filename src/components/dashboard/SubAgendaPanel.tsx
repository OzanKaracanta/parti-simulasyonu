/** Alt gündemler — Faz C: 6 kart, 3 slot (+ bonus), çapraz kurallar */

import { SUB_AGENDA_MAX_SLOTS } from '../../data/subAgendaConfig';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import { SubAgendaCard } from './SubAgendaCard';
import './SubAgendaPanel.css';

interface SubAgendaPanelProps {
  state: GameState;
  onSelectResponse: (agendaId: string, responseId: string) => void;
  onClearResponse: (agendaId?: string) => void;
  embedded?: boolean;
  layout?: 'embedded' | 'page';
}

export function SubAgendaPanel({
  state,
  onSelectResponse,
  onClearResponse,
  embedded = false,
  layout = 'embedded',
}: SubAgendaPanelProps) {
  const { subAgendas, selectedSubAgendaSelections, bonusSubAgendaSlots } = state;
  const maxSlots = getEffectiveSubAgendaMaxSlots(state);
  const slotsUsed = selectedSubAgendaSelections.length;
  const slotsFull = slotsUsed >= maxSlots;

  if (subAgendas.length === 0) {
    return embedded ? (
      <p className="sub-agenda-empty">Bu hafta alt gündem yok.</p>
    ) : null;
  }

  const selectionFor = (agendaId: string) =>
    selectedSubAgendaSelections.find((item) => item.agendaId === agendaId);

  const introText = `Bu hafta en fazla ${maxSlots} alt gündeme mesaj verebilirsin (temel ${SUB_AGENDA_MAX_SLOTS}${bonusSubAgendaSlots > 0 ? ` + ${bonusSubAgendaSlots} radar bonusu` : ''}). Her mesaj seçildiğinde enerji hemen düşer; tüm gündem tepkileri haftalık enerji tavanıyla sınırlıdır. İki veya daha fazla sert mesaj medyada gürültü yaratır. Boş bırakılan kartlarda rakipler konuşabilir.`;

  const content = (
    <div className={`sub-agenda-panel-body ${layout === 'page' ? 'sub-agenda-panel-body--page' : ''}`}>
      <div className="sub-agenda-toolbar">
        <h3 className="sub-agenda-toolbar-title">Alt Gündemler</h3>
        <div className="sub-agenda-slot-meter" aria-label={`Mesaj slotu ${slotsUsed} / ${maxSlots}`}>
          <span className="sub-agenda-slot-label">Mesaj slotu</span>
          <span className="sub-agenda-slot-value">
            {slotsUsed}/{maxSlots}
          </span>
          {bonusSubAgendaSlots > 0 ? (
            <span className="sub-agenda-slot-bonus">+{bonusSubAgendaSlots} bonus</span>
          ) : null}
        </div>
      </div>

      {layout !== 'page' ? <p className="sub-agenda-intro">{introText}</p> : null}

      <div className="sub-agenda-list">
        {subAgendas.map((agenda) => {
          const selection = selectionFor(agenda.id);
          const isActiveCard = Boolean(selection);
          const cardLocked = slotsFull && !isActiveCard;

          return (
            <SubAgendaCard
              key={agenda.id}
              state={state}
              agenda={agenda}
              selection={selection}
              cardLocked={cardLocked}
              onSelectResponse={(responseId) => onSelectResponse(agenda.id, responseId)}
              onClearResponse={() => onClearResponse(agenda.id)}
            />
          );
        })}
      </div>

      <footer className="sub-agenda-footer">
        {slotsUsed > 0 ? (
          <button type="button" className="sub-agenda-clear-btn" onClick={() => onClearResponse()}>
            Tüm alt gündem seçimlerini temizle
          </button>
        ) : (
          <p className="sub-agenda-optional">
            İsteğe bağlı — seçmezsen alt gündemlerde hedef kitlelerde hafif kayıp oluşur.
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
      title="Alt Gündemler"
      headerExtra={
        <span className="sub-agenda-slot-badge">
          Mesaj slotu: {slotsUsed}/{maxSlots}
          {bonusSubAgendaSlots > 0 ? ` (+${bonusSubAgendaSlots} bonus)` : ''}
        </span>
      }
      className="sub-agenda-panel"
    >
      {content}
    </Panel>
  );
}
