/** Haftalık gündem — Ana / Alt / Radar / Bölgesel sekmeleri */

import { useEffect, useMemo, useState } from 'react';
import { getRegionalAgendaMaxSlots } from '../../data/regionalAgendaConfig';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import type { CampaignAction, GameState, RegionId } from '../../types/game';
import { AgendaTabs, type AgendaTabId } from './agenda/AgendaTabs';
import { WeeklyAgendaPanel } from './agenda/WeeklyAgendaPanel';
import { AgendaWeekFlowStrip } from './agenda/AgendaWeekFlowStrip';
import './agenda/weeklyAgenda.css';
import { Panel } from '../ui/Panel';
import { RadarAgendaPanel } from './RadarAgendaPanel';
import { RegionalAgendasPanel } from './RegionalAgendasPanel';
import { SubAgendaPanel } from './SubAgendaPanel';
import './AgendaHubPanel.css';
import './agendasPage.css';
import './WeeklyEventPanel.css';
import type { DashboardView } from './DashboardScreen';
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
  onRadarViewed?: () => void;
  /** Tam sayfa Gündemler ekranı — Panel sarmalayıcı olmadan geniş düzen */
  layout?: 'embedded' | 'page';
  /** Sayfa modu — sekmeler yerine tek gündem türü */
  pageMode?: AgendaPageMode;
  focusAgendaId?: string | null;
  onFocusApplied?: () => void;
  onGoToRegional?: () => void;
  onGoToSub?: () => void;
  onGoToCampaign?: () => void;
  onNavigate?: (view: DashboardView) => void;
}

export type AgendaPageMode = 'national' | 'regional' | 'sub';

const PAGE_MODE_TITLES: Record<AgendaPageMode, string> = {
  national: 'Ulusal Gündem',
  regional: 'Bölgesel Gündem',
  sub: 'Alt Gündemler',
};

const PAGE_MODE_HINTS: Record<AgendaPageMode, string> = {
  national: 'Haftalık ulusal olay, radar izleme ve yanıt seçimi',
  regional: 'Bölge bazlı gündem kartları ve mesaj slotları',
  sub: 'Ek gündem kartları — sınırlı yanıt slotu',
};

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
  onRadarViewed,
  layout = 'embedded',
  pageMode,
  focusAgendaId = null,
  onFocusApplied,
  onGoToRegional,
  onGoToSub,
  onGoToCampaign,
  onNavigate,
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

  const showRegionalPage =
    (layout === 'page' && pageMode === 'regional') || safeTab === 'regional';

  useEffect(() => {
    if (!showRegionalPage || !onSelectRegion || state.regionalAgendas.length === 0) return;
    const hasAgendaForSelection = regionId
      ? state.regionalAgendas.some((agenda) => agenda.regionId === regionId)
      : false;
    if (!hasAgendaForSelection) {
      onSelectRegion(state.regionalAgendas[0].regionId);
    }
  }, [showRegionalPage, regionId, state.regionalAgendas, onSelectRegion]);

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
        <RadarAgendaPanel state={state} embedded onViewed={onRadarViewed} />
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

  if (layout === 'page' && pageMode) {
    const nationalNextStep =
      state.regionalAgendas.length > 0
        ? 'Sonraki adım: Bölgesel gündemler →'
        : state.subAgendas.length > 0
          ? 'Sonraki adım: Alt gündemler →'
          : 'Sonraki adım: Operasyonlar →';

    const regionalNextStep =
      state.subAgendas.length > 0
        ? 'Sonraki adım: Alt gündemler →'
        : 'Sonraki adım: Operasyonlar →';

    const handleRegionalContinue = () => {
      if (onGoToSub) {
        onGoToSub();
        return;
      }
      onNavigate?.('campaign-national');
    };

    const subNextStep = 'Sonraki adım: Operasyonlar →';

    const handleSubContinue = () => {
      if (onGoToCampaign) {
        onGoToCampaign();
        return;
      }
      onNavigate?.('campaign-national');
    };

    const compactPageModes: AgendaPageMode[] = ['national', 'regional', 'sub'];

    return (
      <div className={`agenda-hub-page agenda-hub-page--${pageMode}`}>
        <div className="agenda-hub-page-header agenda-hub-page-header--solo agenda-hub-page-header--compact">
          <div className="agenda-hub-page-heading">
            <span className="agenda-hub-page-kicker">
              Hafta {state.campaignWeek} · {PAGE_MODE_TITLES[pageMode]}
            </span>
            {!compactPageModes.includes(pageMode) ? (
              <p className="agenda-hub-page-subtitle">{PAGE_MODE_HINTS[pageMode]}</p>
            ) : null}
          </div>
        </div>

        {pageMode === 'national' ? (
          <AgendaWeekFlowStrip
            state={state}
            activeStepId="response"
            onNavigate={onNavigate}
          />
        ) : null}

        {pageMode === 'regional' ? (
          <AgendaWeekFlowStrip
            state={state}
            activeStepId="regional"
            onNavigate={onNavigate}
          />
        ) : null}

        {pageMode === 'sub' ? (
          <AgendaWeekFlowStrip
            state={state}
            activeStepId="sub-agenda"
            onNavigate={onNavigate}
          />
        ) : null}

        <div className="agenda-hub-content agenda-hub-content--page">
          {pageMode === 'national' ? (
            <>
              <WeeklyAgendaPanel
                event={state.currentWeeklyEvent}
                availableActions={availableActions}
                selectedResponseId={selectedResponseId}
                onSelectResponse={onSelectResponse}
                state={state}
                layout={layout}
                focusAgendaId={focusAgendaId}
                onFocusApplied={onFocusApplied}
                onGoToRegional={onGoToRegional}
                nextStepLabel={nationalNextStep}
              />
              {radarCount > 0 ? (
                <details className="agenda-radar-collapsible">
                  <summary className="agenda-radar-collapsible-summary">
                    Radar gündemler ({radarCount}) — henüz ulusal değil
                  </summary>
                  <RadarAgendaPanel state={state} embedded onViewed={onRadarViewed} />
                </details>
              ) : null}
            </>
          ) : null}

          {pageMode === 'sub' ? (
            <SubAgendaPanel
              state={state}
              onSelectResponse={onSelectSubAgendaResponse}
              onClearResponse={onClearSubAgendaResponse}
              embedded
              layout={layout}
              onContinue={handleSubContinue}
              nextStepLabel={subNextStep}
            />
          ) : null}

          {pageMode === 'regional' && onSelectRegionalResponse && onClearRegionalResponse ? (
            <RegionalAgendasPanel
              state={state}
              onSelectResponse={onSelectRegionalResponse}
              onClearResponse={onClearRegionalResponse}
              embedded
              layout={layout}
              focusAgendaId={focusAgendaId}
              onFocusApplied={onFocusApplied}
              onGoToSub={handleRegionalContinue}
              nextStepLabel={regionalNextStep}
            />
          ) : null}
        </div>
      </div>
    );
  }

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
