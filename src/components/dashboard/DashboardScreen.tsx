export type DashboardView =
  | 'overview'
  | 'agendas'
  | 'campaign'
  | 'regions'
  | 'organization'
  | 'statistics'
  | 'reports';

import { useCallback, useMemo, useState, type Dispatch, type CSSProperties } from 'react';
import { colorOptions } from '../../data/setupOptions';
import { isRegionalAction } from '../../data/regionalActions';
import { getAgendaStatusSnapshot } from '../../engine/agendaStatus';
import { ELIGIBILITY_OFFICE_TOOL_ID } from '../../engine/electionEligibilityEngine';
import { hasRegionalAgendaForRegion } from '../../engine/regionalAgendaEngine';
import { getRegionOrganizationToolLevel } from '../../systems/regionOrganization';
import { ActionList } from '../actions/ActionList';
import { SelectedActionsPanel } from '../actions/SelectedActionsPanel';
import { ReportsScreen } from '../report/ReportsScreen';
import { StatisticsScreen } from '../statistics/StatisticsScreen';
import { AgendaStatusSummary } from './AgendaStatusSummary';
import { AgendasScreen } from './AgendasScreen';
import { CommandCenterPanel } from './CommandCenterPanel';
import { RegionalCommandPanels } from './RegionalCommandPanels';
import { OrganizationScreen } from '../organization/OrganizationScreen';
import { RegionMap, RegionPanel } from './RegionPanel';
import { RegionSelectorBar } from './RegionSelectorBar';
import { EventFeed } from './EventFeed';
import { SidebarNav } from './SidebarNav';
import { RivalPanel } from './RivalPanel';
import { SidebarSegmentSupport } from './SidebarSegmentSupport';
import { TopBar } from './TopBar';
import { WeekBacklashModal } from './WeekBacklashModal';
import { WeeklyCashFlowPanel } from './WeeklyCashFlowPanel';
import type { GameAction } from '../../store/gameReducer';
import type { GameState, RegionId } from '../../types/game';
import './CommandCenterPanel.css';
import './dashboard.css';

interface DashboardScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function DashboardScreen({ state, dispatch }: DashboardScreenProps) {
  const [view, setView] = useState<DashboardView>('overview');
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>(state.party.homeRegionId);

  const selectAction = (actionId: string) => dispatch({ type: 'SELECT_ACTION', actionId });
  const unselectAction = (actionId: string) => dispatch({ type: 'UNSELECT_ACTION', actionId });
  const selectResponse = (responseId: string) =>
    dispatch({ type: 'SELECT_EVENT_RESPONSE', responseId });
  const selectSubAgendaResponse = (agendaId: string, responseId: string) =>
    dispatch({ type: 'SELECT_SUB_AGENDA_RESPONSE', agendaId, responseId });
  const clearSubAgendaResponse = (agendaId?: string) =>
    dispatch({ type: 'CLEAR_SUB_AGENDA_RESPONSE', agendaId });

  const partyColor = colorOptions.find((c) => c.id === state.party.colorId)?.hex ?? '#3498db';
  const pendingAgendaCount = useMemo(
    () => getAgendaStatusSnapshot(state).pendingCount,
    [state],
  );

  const nationalActions = state.availableActions.filter((action) => !isRegionalAction(action.id));

  const hasIlPartyOffice = useCallback(
    (regionId: string) =>
      getRegionOrganizationToolLevel(state, regionId as RegionId, ELIGIBILITY_OFFICE_TOOL_ID) >= 1,
    [state],
  );

  const openAgendas = () => setView('agendas');

  const lastHistory = state.history.length > 0 ? state.history[state.history.length - 1] : null;

  return (
    <div
      className="dashboard-layout"
      style={{ '--party-color': partyColor } as CSSProperties}
    >
      <TopBar state={state} onEndWeek={() => dispatch({ type: 'END_WEEK' })} />

      {state.activeWeekBacklash ? (
        <WeekBacklashModal
          item={state.activeWeekBacklash}
          week={state.campaignWeek}
          onDismiss={() => dispatch({ type: 'DISMISS_WEEK_BACKLASH' })}
        />
      ) : null}

      <div className="dashboard-body">
        <aside className="dashboard-sidebar" aria-label="Sol panel">
          <SidebarNav
            active={view}
            onChange={setView}
            pendingAgendaCount={pendingAgendaCount}
          />
        </aside>

        <main className="dashboard-main">
          {view === 'overview' && (
            <div className="overview-command-layout">
              <section className="overview-map-section" aria-label="Türkiye haritası">
                <RegionMap
                  regions={state.regions}
                  homeRegionId={state.party.homeRegionId}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={(id) => setSelectedRegionId(id as RegionId)}
                  hasIlPartyOffice={hasIlPartyOffice}
                  hasRegionalAgenda={(regionId) =>
                    hasRegionalAgendaForRegion(state.regionalAgendas, regionId as RegionId)
                  }
                />
                <div className="overview-map-tables" aria-label="Ulusal taban ve rakip partiler">
                  <SidebarSegmentSupport
                    variant="table"
                    segmentSupport={state.segmentSupport}
                    segmentChanges={lastHistory?.segmentChanges}
                  />
                  <RivalPanel
                    variant="table"
                    compact
                    rivals={state.rivalParties}
                    playerSupport={state.nationalSupport}
                    playerPartyName={state.party.name}
                    latestMoves={lastHistory?.rivalMoves}
                  />
                </div>
              </section>

              <section className="overview-command-panel" aria-label="Komuta merkezi">
                <CommandCenterPanel subtitle="Harita, plan ve bütçe özeti">
                  <AgendaStatusSummary state={state} onOpenAgendas={openAgendas} />
                  <SelectedActionsPanel state={state} onRemove={unselectAction} />
                  <WeeklyCashFlowPanel state={state} />
                </CommandCenterPanel>
              </section>
            </div>
          )}

          {view === 'agendas' && (
            <AgendasScreen
              state={state}
              availableActions={state.availableActions}
              selectedResponseId={state.selectedEventResponseId}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              onSelectResponse={selectResponse}
              onSelectSubAgendaResponse={selectSubAgendaResponse}
              onClearSubAgendaResponse={clearSubAgendaResponse}
              dispatch={dispatch}
            />
          )}

          {view === 'campaign' && (
            <div className="campaign-layout">
              <section className="theater-column" aria-label="Kampanya operasyonları">
                <ActionList
                  state={{ ...state, availableActions: nationalActions }}
                  onSelect={selectAction}
                  onUnselect={unselectAction}
                />
              </section>
              <section className="campaign-side-column" aria-label="Bölgesel kampanya">
                <RegionSelectorBar
                  regions={state.regions}
                  homeRegionId={state.party.homeRegionId}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
                <RegionalCommandPanels
                  state={state}
                  regionId={selectedRegionId}
                  dispatch={dispatch}
                />
              </section>
            </div>
          )}

          {view === 'regions' && (
            <div className="view-grid regions-grid">
              <div className="regions-map-column">
                <RegionMap
                  regions={state.regions}
                  homeRegionId={state.party.homeRegionId}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={(id) => setSelectedRegionId(id as RegionId)}
                  hasIlPartyOffice={hasIlPartyOffice}
                  hasRegionalAgenda={(regionId) =>
                    hasRegionalAgendaForRegion(state.regionalAgendas, regionId as RegionId)
                  }
                />
              </div>
              <RegionPanel regions={state.regions} homeRegionId={state.party.homeRegionId} />
            </div>
          )}

          {view === 'organization' && (
            <OrganizationScreen state={state} dispatch={dispatch} />
          )}

          {view === 'statistics' && <StatisticsScreen state={state} />}

          {view === 'reports' && <ReportsScreen state={state} />}
        </main>
      </div>

      <EventFeed
        history={state.history}
        opinionFeed={state.opinionFeed}
        currentEventTitle={state.currentWeeklyEvent?.title ?? null}
      />
    </div>
  );
}
