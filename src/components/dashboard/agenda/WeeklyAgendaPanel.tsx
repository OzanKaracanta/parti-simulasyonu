/** Ana haftalık gündem — sade karar akışı */

import { useEffect, useMemo } from 'react';
import { getAgendaFocusElementId, scrollToAgendaFocus } from '../overview/agendaFocusScroll';
import { getUpcomingStoryHint } from '../../../engine/opinionEchoEngine';
import type { CampaignAction, GameState, WeeklyEvent } from '../../../types/game';
import { AgendaResponseCard } from './AgendaResponseCard';
import { AgendaSummary } from './AgendaSummary';
import { ExpectedOutcomePanel } from './ExpectedOutcomePanel';
import { SupportOperationsSection } from './SupportOperationsSection';
import { AgendaFlowActionBar } from './AgendaFlowActionBar';
import {
  buildPoliticalEffectsForTone,
  mergePoliticalSegmentEffects,
} from '../../../engine/politicalReactionText';
import {
  enrichResolvedForPlayerContext,
  filterSocioSegmentEffectsByAxis,
  resolveEffectiveReactionAxis,
} from '../../../engine/reactionAxisEngine';
import { modulatePoliticalEffectsForPlayerIdeology } from '../../../engine/playerIdeologyPoliticalEngine';
import { resolveEventSegmentsForWeek } from '../../../engine/resolveEventSegments';
import {
  canSelectMainEventResponse,
  getAgendaEnergyDisabledReason,
  getMainEventResponseEnergyCost,
  getProjectedAgendaEnergySpend,
} from '../../../engine/agendaEnergyEngine';
import {
  getAgendaStatus,
  getEventPressure,
  toAgendaResponseDisplay,
} from './agendaDisplayUtils';
import './weeklyAgenda.css';

interface WeeklyAgendaPanelProps {
  event: WeeklyEvent | null;
  availableActions: CampaignAction[];
  selectedResponseId: string | null;
  onSelectResponse: (responseId: string) => void;
  state: GameState;
  layout?: 'embedded' | 'page';
  focusAgendaId?: string | null;
  onFocusApplied?: () => void;
  onGoToRegional?: () => void;
  /** Sonraki adım butonu metni — tam sayfa akış çubuğu */
  nextStepLabel?: string;
}

export function WeeklyAgendaPanel({
  event,
  availableActions,
  selectedResponseId,
  onSelectResponse,
  state,
  layout = 'embedded',
  focusAgendaId = null,
  onFocusApplied,
  onGoToRegional,
  nextStepLabel = 'Sonraki adım: Bölgesel gündemler →',
}: WeeklyAgendaPanelProps) {
  const storyHint = getUpcomingStoryHint(state);

  const recommendedOperationNames = useMemo(() => {
    if (!event) return [];
    return event.recommendedActionIds
      .map((id) => availableActions.find((action) => action.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }, [event, availableActions]);

  const resolvedSegments = useMemo(
    () =>
      event
        ? enrichResolvedForPlayerContext(
            event,
            { playerIdeologyId: state.party.ideologyId, rivalParties: state.rivalParties },
            resolveEventSegmentsForWeek(event, state.rivalParties),
          )
        : null,
    [event, state],
  );

  const responseDisplays = useMemo(() => {
    if (!event || !resolvedSegments) return [];

    return event.responseOptions.map((option) => {
      const filteredSocio = filterSocioSegmentEffectsByAxis(
        resolveEffectiveReactionAxis(event),
        option.segmentEffects,
        resolvedSegments,
      );
      const tonePolitical = buildPoliticalEffectsForTone(resolvedSegments, option.tone);
      const mergedPolitical = option.politicalSegmentEffects?.length
        ? mergePoliticalSegmentEffects(tonePolitical, option.politicalSegmentEffects)
        : tonePolitical;
      const politicalPreview = modulatePoliticalEffectsForPlayerIdeology(
        mergedPolitical,
        state.party.ideologyId,
      );

      return toAgendaResponseDisplay(
        { ...option, segmentEffects: filteredSocio },
        politicalPreview,
      );
    });
  }, [event, resolvedSegments]);

  const selectedResponse = useMemo(
    () => responseDisplays.find((option) => option.id === selectedResponseId) ?? null,
    [responseDisplays, selectedResponseId],
  );

  useEffect(() => {
    if (!event || !focusAgendaId || focusAgendaId !== event.id) return;
    const timer = window.setTimeout(() => {
      scrollToAgendaFocus(event.id);
      onFocusApplied?.();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [event, focusAgendaId, onFocusApplied]);

  if (!event) {
    return <p className="weekly-agenda-empty">Bu hafta için gündem bilgisi yükleniyor.</p>;
  }

  const pressure = getEventPressure(event.type);
  const status = getAgendaStatus(event.type);

  const isPage = layout === 'page';

  const decisionSection = (
    <section className="agenda-decision-section">
      <h5 className="agenda-section-title">Bu hafta nasıl yanıt vereceksin?</h5>
      <div className="agenda-response-grid" role="radiogroup" aria-label="Ana gündem tepkisi">
        {responseDisplays.map((option) => {
          const isSelected = selectedResponseId === option.id;
          const canAfford = isSelected || canSelectMainEventResponse(state, option.id);
          const oldCost = selectedResponseId
            ? getMainEventResponseEnergyCost(state, selectedResponseId)
            : 0;
          const newCost = getMainEventResponseEnergyCost(state, option.id);
          const projected = getProjectedAgendaEnergySpend(state, oldCost, newCost);
          const disabledReason = canAfford
            ? null
            : getAgendaEnergyDisabledReason(state, newCost - oldCost, projected);

          return (
            <AgendaResponseCard
              key={option.id}
              option={option}
              selected={isSelected}
              disabled={!canAfford}
              disabledReason={disabledReason}
              compact={isPage}
              onSelect={() => onSelectResponse(option.id)}
            />
          );
        })}
      </div>

      {isPage ? (
        <AgendaFlowActionBar
          hasSelection={Boolean(selectedResponse)}
          nextStepLabel={nextStepLabel}
          onContinue={onGoToRegional}
        />
      ) : null}
    </section>
  );

  if (layout === 'page') {
    return (
      <div
        id={getAgendaFocusElementId(event.id)}
        className={`weekly-agenda weekly-agenda--page type-${event.type}`}
      >
        <AgendaSummary
          week={state.campaignWeek}
          event={event}
          pressure={pressure}
          status={status}
          storyHint={storyHint}
          rivalParties={state.rivalParties}
          playerIdeologyId={state.party.ideologyId}
          layout="page"
          selectedResponseTitle={selectedResponse?.title ?? null}
        />

        <div className="weekly-agenda-body">
          {decisionSection}
          <aside className="weekly-agenda-aside">
            <ExpectedOutcomePanel
              selectedResponse={selectedResponse}
              showContinueAction={false}
              onGoToRegional={onGoToRegional}
            />
            <SupportOperationsSection operationNames={recommendedOperationNames} />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div
      id={getAgendaFocusElementId(event.id)}
      className={`weekly-agenda type-${event.type}`}
    >
      <AgendaSummary
        week={state.campaignWeek}
        event={event}
        pressure={pressure}
        status={status}
        storyHint={storyHint}
        rivalParties={state.rivalParties}
        playerIdeologyId={state.party.ideologyId}
      />

      {decisionSection}
      <SupportOperationsSection operationNames={recommendedOperationNames} />
      <ExpectedOutcomePanel selectedResponse={selectedResponse} />
    </div>
  );
}
