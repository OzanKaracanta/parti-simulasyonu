export type AgendaDashboardView = 'agenda-national' | 'agenda-regional' | 'agenda-sub';

export type CampaignDashboardView = 'campaign-national' | 'campaign-regional';

export type OrganizationDashboardView = 'organization-national' | 'organization-regional';

export type DashboardView =
  | 'overview'
  | AgendaDashboardView
  | CampaignDashboardView
  | OrganizationDashboardView
  | 'regions'
  | 'statistics'
  | 'reports';

export function isAgendaView(view: DashboardView): view is AgendaDashboardView {
  return view === 'agenda-national' || view === 'agenda-regional' || view === 'agenda-sub';
}

export function isCampaignView(view: DashboardView): view is CampaignDashboardView {
  return view === 'campaign-national' || view === 'campaign-regional';
}

export function isOrganizationView(view: DashboardView): view is OrganizationDashboardView {
  return view === 'organization-national' || view === 'organization-regional';
}

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type CSSProperties,
} from 'react';
import { colorOptions } from '../../data/setupOptions';
import { isRegionalAction } from '../../data/regionalActions';
import { getAgendaStatusSnapshot } from '../../engine/agendaStatus';
import { ELIGIBILITY_OFFICE_TOOL_ID } from '../../engine/electionEligibilityEngine';
import { hasRegionalAgendaForRegion } from '../../engine/regionalAgendaEngine';
import { getRegionOrganizationToolLevel } from '../../systems/regionOrganization';
import { SelectedActionsPanel } from '../actions/SelectedActionsPanel';
import { CampaignScreen } from './CampaignScreen';
import { ReportsScreen } from '../report/ReportsScreen';
import { StatisticsScreen } from '../statistics/StatisticsScreen';
import { AgendaStatusSummary } from './AgendaStatusSummary';
import { AgendasScreen } from './AgendasScreen';
import { CommandCenterPanel } from './CommandCenterPanel';
import { OrganizationScreen } from '../organization/OrganizationScreen';
import { RegionMap, RegionPanel } from './RegionPanel';
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
  const [organizationFocusRegion, setOrganizationFocusRegion] = useState<RegionId | null>(null);

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

  const openAgendaNational = () => setView('agenda-national');
  const openAgendaRegional = () => setView('agenda-regional');
  const openAgendaSub = () => setView('agenda-sub');
  const openCampaignRegional = () => setView('campaign-regional');

  const goToAgendasForSelectedRegion = () => openAgendaRegional();
  const goToCampaignForSelectedRegion = () => openCampaignRegional();
  const goToOrganizationForSelectedRegion = () => {
    setOrganizationFocusRegion(selectedRegionId);
    setView('organization-regional');
  };
  const clearOrganizationFocus = useCallback(() => setOrganizationFocusRegion(null), []);

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
                  calloutVariant="overview"
                  onMapGoToAgendas={goToAgendasForSelectedRegion}
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
                  <AgendaStatusSummary
                    state={state}
                    onOpenAgendaNational={openAgendaNational}
                    onOpenAgendaRegional={openAgendaRegional}
                    onOpenAgendaSub={openAgendaSub}
                  />
                  <SelectedActionsPanel state={state} onRemove={unselectAction} />
                  <WeeklyCashFlowPanel state={state} />
                </CommandCenterPanel>
              </section>
            </div>
          )}

          {view === 'agenda-national' && (
            <AgendasScreen
              mode="national"
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

          {view === 'agenda-regional' && (
            <AgendasScreen
              mode="regional"
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

          {view === 'agenda-sub' && (
            <AgendasScreen
              mode="sub"
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

          {view === 'campaign-national' && (
            <CampaignScreen
              mode="national"
              state={state}
              nationalActions={nationalActions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              onSelectAction={selectAction}
              onUnselectAction={unselectAction}
              dispatch={dispatch}
            />
          )}

          {view === 'campaign-regional' && (
            <CampaignScreen
              mode="regional"
              state={state}
              nationalActions={nationalActions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              onSelectAction={selectAction}
              onUnselectAction={unselectAction}
              dispatch={dispatch}
            />
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
                  calloutVariant="regions"
                  onMapGoToAgendas={goToAgendasForSelectedRegion}
                  onMapGoToCampaign={goToCampaignForSelectedRegion}
                  onMapGoToOrganization={goToOrganizationForSelectedRegion}
                />
              </div>
              <RegionPanel regions={state.regions} homeRegionId={state.party.homeRegionId} />
            </div>
          )}

          {view === 'organization-national' && (
            <OrganizationScreen
              mode="national"
              state={state}
              dispatch={dispatch}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />
          )}

          {view === 'organization-regional' && (
            <OrganizationScreen
              mode="regional"
              state={state}
              dispatch={dispatch}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              focusRegionId={organizationFocusRegion}
              onFocusApplied={clearOrganizationFocus}
            />
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
