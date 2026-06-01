/** Haftalık gündem — Ana / Alt / Radar / Bölgesel sekmeleri */

import { useEffect, useMemo, useState } from 'react';
import { getRegionalAgendaMaxSlots } from '../../data/regionalAgendaConfig';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import type { CampaignAction, GameState, RegionId } from '../../types/game';
import { AgendaTabs, type AgendaTabId } from './agenda/AgendaTabs';
import { WeeklyAgendaPanel } from './agenda/WeeklyAgendaPanel';
import './agenda/weeklyAgenda.css';
import { Panel } from '../ui/Panel';
import { RadarAgendaPanel } from './RadarAgendaPanel';
import { RegionalAgendasPanel } from './RegionalAgendasPanel';
import { SubAgendaPanel } from './SubAgendaPanel';
import './AgendaHubPanel.css';
import './agendasPage.css';
import './WeeklyEventPanel.css';

interface AgendaHubPanelProps {
  state: GameState;
  availableActions: CampaignAction[];
  selectedResponseId: string | null;
  onSelectResponse: (responseId: string) => void;
  onSelectSubAgendaResponse: (agendaId: string, responseId: string) => void;
  onClearSubAgendaResponse: (agendaId?: string) => void;
  regionId?: RegionId;
  onSelectRegion?: (regionId: RegionId) => void;
  onSelectRegionalResponse?: (agendaId: string, responseId: string) => void;
  onClearRegionalResponse?: (agendaId?: string) => void;
  initialTab?: AgendaTabId;
  /** Tam sayfa Gündemler ekranı — Panel sarmalayıcı olmadan geniş düzen */
  layout?: 'embedded' | 'page';
}

export function AgendaHubPanel({
  state,
  availableActions,
  selectedResponseId,
  onSelectResponse,
  onSelectSubAgendaResponse,
  onClearSubAgendaResponse,
  regionId,
  onSelectRegion,
  onSelectRegionalResponse,
  onClearRegionalResponse,
  initialTab = 'main',
  layout = 'embedded',
}: AgendaHubPanelProps) {
  const subCount = state.subAgendas.length;
  const radarCount = state.radarAgendas.length;
  const regionalCount = state.regionalAgendas.length;
  const slotsUsed = state.selectedSubAgendaSelections.length;
  const maxSlots = getEffectiveSubAgendaMaxSlots(state);
  const regionalSlotsUsed = state.selectedRegionalAgendaSelections.length;
  const regionalMaxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);

  const tabs = useMemo(() => {
    const items: { id: AgendaTabId; label: string }[] = [
      { id: 'main', label: 'Ana Gündem' },
    ];
    if (subCount > 0) {
      items.push({ id: 'sub', label: `Alt Gündemler ${slotsUsed}/${maxSlots}` });
    }
    if (radarCount > 0) {
      items.push({ id: 'radar', label: `Radar ${radarCount}` });
    }
    if (regionalCount > 0) {
      items.push({
        id: 'regional',
        label: `Bölgesel ${regionalSlotsUsed}/${regionalMaxSlots}`,
      });
    }
    return items;
  }, [
    subCount,
    radarCount,
    regionalCount,
    slotsUsed,
    maxSlots,
    regionalSlotsUsed,
    regionalMaxSlots,
  ]);

  const [activeTab, setActiveTab] = useState<AgendaTabId>(initialTab);
  const safeTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : 'main';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (safeTab !== 'regional' || !onSelectRegion || state.regionalAgendas.length === 0) return;
    const hasAgendaForSelection = regionId
      ? state.regionalAgendas.some((agenda) => agenda.regionId === regionId)
      : false;
    if (!hasAgendaForSelection) {
      onSelectRegion(state.regionalAgendas[0].regionId);
    }
  }, [safeTab, regionId, state.regionalAgendas, onSelectRegion]);

  const showRegional =
    safeTab === 'regional' && onSelectRegionalResponse && onClearRegionalResponse;

  const tabContent = (
    <>
      {safeTab === 'main' ? (
        <WeeklyAgendaPanel
          event={state.currentWeeklyEvent}
          availableActions={availableActions}
          selectedResponseId={selectedResponseId}
          onSelectResponse={onSelectResponse}
          state={state}
          layout={layout}
        />
      ) : null}

      {safeTab === 'sub' ? (
        <SubAgendaPanel
          state={state}
          onSelectResponse={onSelectSubAgendaResponse}
          onClearResponse={onClearSubAgendaResponse}
          embedded
          layout={layout}
        />
      ) : null}

      {safeTab === 'radar' ? (
        <RadarAgendaPanel state={state} embedded />
      ) : null}

      {showRegional ? (
        <RegionalAgendasPanel
          state={state}
          onSelectResponse={onSelectRegionalResponse}
          onClearResponse={onClearRegionalResponse}
          embedded
          layout={layout}
        />
      ) : null}
    </>
  );

  if (layout === 'page') {
    return (
      <div className="agenda-hub-page">
        <div className="agenda-hub-page-header">
          <div className="agenda-hub-page-heading">
            <span className="agenda-hub-page-kicker">Hafta {state.campaignWeek}</span>
            <h2 className="agenda-hub-page-title">Haftalık Gündem</h2>
          </div>
          <AgendaTabs tabs={tabs} active={safeTab} onChange={setActiveTab} />
        </div>
        <div className="agenda-hub-content agenda-hub-content--page">{tabContent}</div>
      </div>
    );
  }

  return (
    <Panel title="Haftalık Gündem" variant="critical" className="agenda-hub-panel">
      <AgendaTabs tabs={tabs} active={safeTab} onChange={setActiveTab} />

      <div className="agenda-hub-content">{tabContent}</div>
    </Panel>
  );
}
