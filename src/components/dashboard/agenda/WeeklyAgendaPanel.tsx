/** Ana haftalık gündem — sade karar akışı */

import { useMemo } from 'react';
import { getUpcomingStoryHint } from '../../../engine/opinionEchoEngine';
import type { CampaignAction, GameState, WeeklyEvent } from '../../../types/game';
import { AgendaResponseCard } from './AgendaResponseCard';
import { AgendaSummary } from './AgendaSummary';
import { ExpectedOutcomePanel } from './ExpectedOutcomePanel';
import { SupportOperationsSection } from './SupportOperationsSection';
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
}

export function WeeklyAgendaPanel({
  event,
  availableActions,
  selectedResponseId,
  onSelectResponse,
  state,
  layout = 'embedded',
}: WeeklyAgendaPanelProps) {
  const storyHint = getUpcomingStoryHint(state);

  const recommendedOperationNames = useMemo(() => {
    if (!event) return [];
    return event.recommendedActionIds
      .map((id) => availableActions.find((action) => action.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }, [event, availableActions]);

  const responseDisplays = useMemo(
    () => (event ? event.responseOptions.map(toAgendaResponseDisplay) : []),
    [event],
  );

  const selectedResponse = useMemo(
    () => responseDisplays.find((option) => option.id === selectedResponseId) ?? null,
    [responseDisplays, selectedResponseId],
  );

  if (!event) {
    return <p className="weekly-agenda-empty">Bu hafta için gündem bilgisi yükleniyor.</p>;
  }

  const pressure = getEventPressure(event.type);
  const status = getAgendaStatus(event.type);

  const decisionSection = (
    <section className="agenda-decision-section">
      <h5 className="agenda-section-title">Bu hafta nasıl yanıt vereceksin?</h5>
      <div className="agenda-response-grid" role="radiogroup" aria-label="Ana gündem tepkisi">
        {responseDisplays.map((option) => (
          <AgendaResponseCard
            key={option.id}
            option={option}
            selected={selectedResponseId === option.id}
            onSelect={() => onSelectResponse(option.id)}
          />
        ))}
      </div>
    </section>
  );

  if (layout === 'page') {
    return (
      <div className={`weekly-agenda weekly-agenda--page type-${event.type}`}>
        <AgendaSummary
          week={state.campaignWeek}
          event={event}
          pressure={pressure}
          status={status}
          storyHint={storyHint}
          rivalParties={state.rivalParties}
        />

        <div className="weekly-agenda-body">
          {decisionSection}
          <aside className="weekly-agenda-aside">
            <ExpectedOutcomePanel selectedResponse={selectedResponse} />
            <SupportOperationsSection operationNames={recommendedOperationNames} />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={`weekly-agenda type-${event.type}`}>
      <AgendaSummary
        week={state.campaignWeek}
        event={event}
        pressure={pressure}
        status={status}
        storyHint={storyHint}
        rivalParties={state.rivalParties}
      />

      {decisionSection}
      <SupportOperationsSection operationNames={recommendedOperationNames} />
      <ExpectedOutcomePanel selectedResponse={selectedResponse} />
    </div>
  );
}
