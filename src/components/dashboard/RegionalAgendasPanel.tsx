/** Bölgesel gündemler — çoklu bölge kart grid'i */

import { useEffect } from 'react';
import { getRegionalAgendaMaxSlots } from '../../data/regionalAgendaConfig';
import { scrollToAgendaFocus } from './overview/agendaFocusScroll';
import {
  canRespondToRegionalAgenda,
  getRegionalAgendaAccessReason,
} from '../../engine/regionalAgendaAccess';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import { AgendaFlowActionBar } from './agenda/AgendaFlowActionBar';
import { RegionalAgendaCard } from './RegionalAgendaCard';
import { RegionalAgendaSummaryAside } from './RegionalAgendaSummaryAside';
import './RegionalAgendaPanel.css';
import './agenda/weeklyAgenda.css';

interface RegionalAgendasPanelProps {
  state: GameState;
  onSelectResponse: (agendaId: string, responseId: string) => void;
  onClearResponse: (agendaId?: string) => void;
  embedded?: boolean;
  layout?: 'embedded' | 'page';
  focusAgendaId?: string | null;
  onFocusApplied?: () => void;
  onGoToSub?: () => void;
  nextStepLabel?: string;
}

export function RegionalAgendasPanel({
  state,
  onSelectResponse,
  onClearResponse,
  embedded = false,
  layout = 'embedded',
  focusAgendaId = null,
  onFocusApplied,
  onGoToSub,
  nextStepLabel = 'Sonraki adım →',
}: RegionalAgendasPanelProps) {
  const { regionalAgendas, selectedRegionalAgendaSelections } = state;
  const maxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);
  const slotsUsed = selectedRegionalAgendaSelections.length;
  const slotsFull = slotsUsed >= maxSlots;
  const isPage = layout === 'page';

  useEffect(() => {
    if (!focusAgendaId) return;
    const hasTarget = regionalAgendas.some((agenda) => agenda.id === focusAgendaId);
    if (!hasTarget) return;

    const timer = window.setTimeout(() => {
      scrollToAgendaFocus(focusAgendaId);
      onFocusApplied?.();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [focusAgendaId, regionalAgendas, onFocusApplied]);

  if (regionalAgendas.length === 0) {
    return embedded ? (
      <p className="regional-agenda-empty">Bu hafta bölgesel gündem yok.</p>
    ) : null;
  }

  const selectionFor = (agendaId: string) =>
    selectedRegionalAgendaSelections.find((item) => item.agendaId === agendaId);

  const cardList = (
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
            state={state}
            agenda={agenda}
            selection={selection}
            cardLocked={cardLocked}
            accessReason={canRespond ? null : accessReason}
            compact={isPage}
            onSelectResponse={(responseId) => onSelectResponse(agenda.id, responseId)}
            onClearResponse={() => onClearResponse(agenda.id)}
          />
        );
      })}
    </div>
  );

  const pageContent = (
    <div className="regional-agenda-page">
      <div className="regional-agenda-page-main">
        <section className="regional-agenda-page-intro">
          <h5 className="agenda-section-title">Bu hafta hangi bölgelere mesaj vereceksin?</h5>
          <p className="regional-agenda-page-intro-text">
            En fazla <strong>{maxSlots}</strong> bölgeye mesaj verebilirsin — seçim anında kaydedilir.
          </p>
        </section>

        {cardList}

        <AgendaFlowActionBar
          hasSelection={slotsUsed > 0}
          required={false}
          nextStepLabel={nextStepLabel}
          onContinue={onGoToSub}
          emptyMessage="İsteğe bağlı — bölge kartlarından mesaj seçebilir veya doğrudan devam edebilirsin."
          savedMessage={`${slotsUsed} mesaj kaydedildi`}
          savedDetail="Başka bölgelerle değiştirebilir veya sonraki adıma geçebilirsin."
        />

        {slotsUsed > 0 ? (
          <button
            type="button"
            className="regional-agenda-clear-btn regional-agenda-clear-btn--inline"
            onClick={() => onClearResponse()}
          >
            Tüm bölgesel seçimleri temizle
          </button>
        ) : null}
      </div>

      <RegionalAgendaSummaryAside state={state} slotsUsed={slotsUsed} maxSlots={maxSlots} />
    </div>
  );

  const embeddedContent = (
    <div className="regional-agenda-panel-body">
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

      {cardList}

      <footer className="regional-agenda-footer">
        {onGoToSub ? (
          <button type="button" className="agenda-flow-continue-btn" onClick={onGoToSub}>
            Alt Gündemlere Geç
          </button>
        ) : null}
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

  const content = isPage ? pageContent : embeddedContent;

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
