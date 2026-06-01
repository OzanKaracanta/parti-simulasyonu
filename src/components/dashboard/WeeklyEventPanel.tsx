/** Haftanın gündemi — WeeklyAgendaPanel sarmalayıcı */

import type { CampaignAction, GameState, WeeklyEvent } from '../../types/game';
import { Panel } from '../ui/Panel';
import { WeeklyAgendaPanel } from './agenda/WeeklyAgendaPanel';

interface WeeklyEventPanelProps {
  event: WeeklyEvent | null;
  availableActions: CampaignAction[];
  selectedResponseId: string | null;
  onSelectResponse: (responseId: string) => void;
  state: GameState;
  embedded?: boolean;
}

export function WeeklyEventPanel({
  event,
  availableActions,
  selectedResponseId,
  onSelectResponse,
  state,
  embedded = false,
}: WeeklyEventPanelProps) {
  const body = (
    <WeeklyAgendaPanel
      event={event}
      availableActions={availableActions}
      selectedResponseId={selectedResponseId}
      onSelectResponse={onSelectResponse}
      state={state}
    />
  );

  if (embedded) {
    return body;
  }

  return (
    <Panel title="Haftanın Gündemi" variant="critical" className="weekly-event-panel">
      {body}
    </Panel>
  );
}
