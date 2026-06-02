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
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type CSSProperties,
} from 'react';
import { TutorialPanel } from '../tutorial/TutorialPanel';
import { TutorialWeekIntroModal } from '../tutorial/TutorialWeekIntroModal';
import {
  canEndWeekStrict,
  getTutorialProgress,
  isTutorialActive,
  markRadarTutorialViewed,
} from '../../tutorial/tutorialEngine';
import {
  isTutorialIntroSeen,
  isTutorialSkipped,
  setTutorialIntroSeen,
} from '../../tutorial/tutorialStorage';
import { TUTORIAL_LAST_WEEK } from '../../tutorial/tutorialSteps';
import {
  scrollToTutorialSection,
  type TutorialScrollSection,
} from '../../tutorial/tutorialScroll';
import { WeekFlowPanel } from './WeekFlowPanel';
import { colorOptions } from '../../data/setupOptions';
import { isRegionalAction } from '../../data/regionalActions';
import { getAgendaStatusSnapshot } from '../../engine/agendaStatus';
import { ELIGIBILITY_OFFICE_TOOL_ID } from '../../engine/electionEligibilityEngine';
import { ensurePoliticalSegmentSupport } from '../../engine/politicalSegmentEngine';
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
import { AdvisorBriefingModal } from './AdvisorBriefingModal';
import { EarlyWeekEndWarningModal } from './EarlyWeekEndWarningModal';
import {
  getEarlyWeekMissingActivities,
  isEarlyWeekEndWarningActive,
  type EarlyWeekMissingActivity,
} from '../../engine/earlyWeekEndWarning';
import { TopBar } from './TopBar';
import { WeeklyAgendaNewsSection } from './overview/WeeklyAgendaNewsSection';
import { WeeklyCashFlowPanel } from './WeeklyCashFlowPanel';
import { WeeklyEnergyBudgetPanel } from './WeeklyEnergyBudgetPanel';
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
  const [tutorialSkipped, setTutorialSkipped] = useState(() => isTutorialSkipped());
  const [tutorialTick, setTutorialTick] = useState(0);
  const [agendaFocusId, setAgendaFocusId] = useState<string | null>(null);
  const [pendingTutorialScroll, setPendingTutorialScroll] =
    useState<TutorialScrollSection | null>(null);
  const [showWeekIntro, setShowWeekIntro] = useState(
    () => state.campaignWeek === 1 && !isTutorialSkipped() && !isTutorialIntroSeen(),
  );
  const [pendingEarlyWeekEnd, setPendingEarlyWeekEnd] = useState<
    EarlyWeekMissingActivity[] | null
  >(null);
  const lastCampaignWeekRef = useRef(state.campaignWeek);

  const showTutorialCostBreakdown =
    !tutorialSkipped && state.campaignWeek === 4;

  const tutorialHighlightView = useMemo(() => {
    const progress = getTutorialProgress(state, tutorialSkipped);
    return progress?.nextStep?.targetView ?? null;
  }, [state, tutorialSkipped, tutorialTick]);

  const finishCheck = useMemo(
    () => canEndWeekStrict(state, tutorialSkipped),
    [state, tutorialSkipped, tutorialTick],
  );

  const handleEndWeek = useCallback(() => {
    if (!finishCheck.ok || pendingEarlyWeekEnd) return;

    if (isEarlyWeekEndWarningActive(state)) {
      const missing = getEarlyWeekMissingActivities(state);
      if (missing.length > 0) {
        setPendingEarlyWeekEnd(missing);
        return;
      }
    }

    dispatch({ type: 'END_WEEK' });
  }, [dispatch, finishCheck.ok, pendingEarlyWeekEnd, state]);

  const confirmEarlyWeekEnd = useCallback(() => {
    setPendingEarlyWeekEnd(null);
    dispatch({ type: 'END_WEEK' });
  }, [dispatch]);

  const cancelEarlyWeekEnd = useCallback(() => {
    setPendingEarlyWeekEnd(null);
  }, []);

  useEffect(() => {
    if (lastCampaignWeekRef.current === state.campaignWeek) return;
    lastCampaignWeekRef.current = state.campaignWeek;
    setPendingEarlyWeekEnd(null);
    setView('overview');
    setAgendaFocusId(null);
    setOrganizationFocusRegion(null);
  }, [state.campaignWeek]);

  const handleRadarTutorialViewed = useCallback(() => {
    markRadarTutorialViewed(state);
    setTutorialTick((n) => n + 1);
  }, [state.party.name, state.campaignWeek]);

  const handleTutorialNavigate = useCallback(
    (target: DashboardView, section?: TutorialScrollSection) => {
      if (target === 'organization-regional') {
        setOrganizationFocusRegion(state.party.homeRegionId);
        setSelectedRegionId(state.party.homeRegionId);
      }
      setView(target);
      if (section) setPendingTutorialScroll(section);
    },
    [state.party.homeRegionId],
  );

  useEffect(() => {
    if (!pendingTutorialScroll) return;
    const timer = window.setTimeout(() => {
      scrollToTutorialSection(pendingTutorialScroll, state);
      setPendingTutorialScroll(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [view, pendingTutorialScroll, state]);

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

  const openAgendaNational = (focusAgendaId?: string) => {
    if (focusAgendaId) setAgendaFocusId(focusAgendaId);
    setView('agenda-national');
  };
  const openAgendaRegional = (focusAgendaId?: string, regionId?: RegionId) => {
    if (regionId) setSelectedRegionId(regionId);
    if (focusAgendaId) setAgendaFocusId(focusAgendaId);
    setView('agenda-regional');
  };
  const openAgendaSub = () => setView('agenda-sub');
  const openCampaignRegional = () => setView('campaign-regional');

  const goToAgendasForSelectedRegion = () => openAgendaRegional(undefined, selectedRegionId);
  const goToCampaignForSelectedRegion = () => openCampaignRegional();
  const goToOrganizationForSelectedRegion = () => {
    setOrganizationFocusRegion(selectedRegionId);
    setView('organization-regional');
  };
  const clearOrganizationFocus = useCallback(() => setOrganizationFocusRegion(null), []);

  const lastHistory = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  const politicalSegmentSupport = ensurePoliticalSegmentSupport(state).politicalSegmentSupport;

  const dismissWeekIntro = () => {
    setTutorialIntroSeen();
    setShowWeekIntro(false);
  };

  const suppressAdvisorBriefingDuringTutorial =
    !tutorialSkipped && isTutorialActive(state, false);

  useEffect(() => {
    if (!suppressAdvisorBriefingDuringTutorial || !state.activeAdvisorBriefing) return;
    dispatch({ type: 'DISMISS_ADVISOR_BRIEFING' });
  }, [
    suppressAdvisorBriefingDuringTutorial,
    state.activeAdvisorBriefing,
    dispatch,
  ]);

  return (
    <div
      className="dashboard-layout"
      style={{ '--party-color': partyColor } as CSSProperties}
    >
      {showWeekIntro && !tutorialSkipped ? (
        <TutorialWeekIntroModal partyName={state.party.name} onDismiss={dismissWeekIntro} />
      ) : null}

      {pendingEarlyWeekEnd && pendingEarlyWeekEnd.length > 0 ? (
        <EarlyWeekEndWarningModal
          week={state.campaignWeek}
          missingActivities={pendingEarlyWeekEnd}
          onConfirm={confirmEarlyWeekEnd}
          onCancel={cancelEarlyWeekEnd}
        />
      ) : null}

      <TopBar
        state={state}
        finishCheck={finishCheck}
        onEndWeek={handleEndWeek}
      />

      {state.activeAdvisorBriefing &&
      !pendingEarlyWeekEnd &&
      (tutorialSkipped || state.campaignWeek > TUTORIAL_LAST_WEEK) ? (
        <AdvisorBriefingModal
          briefing={state.activeAdvisorBriefing}
          onDismiss={() => dispatch({ type: 'DISMISS_ADVISOR_BRIEFING' })}
        />
      ) : null}

      <div className="dashboard-body">
        <aside className="dashboard-sidebar" aria-label="Sol panel">
          <SidebarNav
            active={view}
            onChange={setView}
            pendingAgendaCount={pendingAgendaCount}
            tutorialHighlightView={tutorialHighlightView}
          />
        </aside>

        <main className="dashboard-main">
          <TutorialPanel
            state={state}
            skipped={tutorialSkipped}
            onSkipChange={setTutorialSkipped}
            onNavigate={handleTutorialNavigate}
          />

          {view === 'overview' && (
            <div className="overview-command-layout">
              <section className="overview-map-section" aria-label="Türkiye haritası">
                <RegionMap
                  regions={state.regions}
                  homeRegionId={state.party.homeRegionId}
                  partyName={state.party.name}
                  segmentSupport={state.segmentSupport}
                  politicalSegmentSupport={politicalSegmentSupport}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={(id) => setSelectedRegionId(id as RegionId)}
                  hasIlPartyOffice={hasIlPartyOffice}
                  hasRegionalAgenda={(regionId) =>
                    hasRegionalAgendaForRegion(state.regionalAgendas, regionId as RegionId)
                  }
                  onMapGoToRegionalAgenda={(regionId) =>
                    openAgendaRegional(undefined, regionId)
                  }
                />
                <WeeklyAgendaNewsSection
                  state={state}
                  onOpenNationalAgenda={(agendaId) => openAgendaNational(agendaId)}
                  onOpenRegionalAgenda={(agendaId, regionId) =>
                    openAgendaRegional(agendaId, regionId as RegionId)
                  }
                  onViewAllRegionalAgendas={() => openAgendaRegional()}
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
                  <WeekFlowPanel
                    state={state}
                    tutorialSkipped={tutorialSkipped}
                    finishCheck={finishCheck}
                    onNavigate={handleTutorialNavigate}
                  />
                  <AgendaStatusSummary
                    state={state}
                    onOpenAgendaNational={() => openAgendaNational()}
                    onOpenAgendaRegional={() => openAgendaRegional()}
                    onOpenAgendaSub={openAgendaSub}
                  />
                  <SelectedActionsPanel state={state} onRemove={unselectAction} />
                  <WeeklyCashFlowPanel state={state} />
                  <WeeklyEnergyBudgetPanel state={state} />
                </CommandCenterPanel>
              </section>
            </div>
          )}

          {view === 'agenda-national' && (
            <AgendasScreen
              mode="national"
              focusAgendaId={agendaFocusId}
              onFocusApplied={() => setAgendaFocusId(null)}
              onRadarViewed={handleRadarTutorialViewed}
              onGoToRegional={
                state.regionalAgendas.length > 0 ? () => openAgendaRegional() : undefined
              }
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
              focusAgendaId={agendaFocusId}
              onFocusApplied={() => setAgendaFocusId(null)}
              onGoToSub={state.subAgendas.length > 0 ? openAgendaSub : undefined}
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
              showTutorialCostBreakdown={showTutorialCostBreakdown}
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
              showTutorialCostBreakdown={showTutorialCostBreakdown}
            />
          )}

          {view === 'regions' && (
            <div className="view-grid regions-grid">
              <div className="regions-map-column">
                <RegionMap
                  regions={state.regions}
                  homeRegionId={state.party.homeRegionId}
                  partyName={state.party.name}
                  segmentSupport={state.segmentSupport}
                  politicalSegmentSupport={politicalSegmentSupport}
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
                  onMapGoToRegionalAgenda={(regionId) =>
                    openAgendaRegional(undefined, regionId)
                  }
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

          {view === 'reports' && (
            <ReportsScreen state={state} tutorialSkipped={tutorialSkipped} />
          )}
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
