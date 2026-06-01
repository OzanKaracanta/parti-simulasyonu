/** Raporlar görünümü — haftalık özet ve karşılaştırma */

import { useMemo } from 'react';
import type { GameState } from '../../types/game';
import { PartyIdentityPanel } from '../dashboard/PartyIdentityPanel';
import { SidebarPoliticalSegmentSupport } from '../dashboard/SidebarPoliticalSegmentSupport';
import { SidebarSegmentSupport } from '../dashboard/SidebarSegmentSupport';
import { ensurePoliticalSegmentSupport } from '../../engine/politicalSegmentEngine';
import { ReportSegmentChangesPanel } from './ReportSegmentChangesPanel';
import { ReportWeekCompare } from './ReportWeekCompare';
import { ReportWeekNav } from './ReportWeekNav';
import { ReportsHistoryTable } from './ReportsHistoryTable';
import { useReportWeekSelection } from './useReportWeekSelection';
import { WeeklyReport } from './WeeklyReport';
import './ReportWeekNav.css';
import './ReportsScreen.css';

interface ReportsScreenProps {
  state: GameState;
}

export function ReportsScreen({ state: rawState }: ReportsScreenProps) {
  const state = ensurePoliticalSegmentSupport(rawState);
  const history = state.history;

  const {
    latestWeek,
    weeks,
    activeWeek,
    activeReport,
    previousReport,
    setSelectedWeek,
  } = useReportWeekSelection(history);

  const historyRows = useMemo(() => [...history].reverse(), [history]);

  return (
    <div className="reports-layout">
      <div className="reports-primary">
        {latestWeek !== null && weeks.length > 0 && activeWeek !== null ? (
          <ReportWeekNav
            weeks={weeks}
            selectedWeek={activeWeek}
            latestWeek={latestWeek}
            onSelectWeek={setSelectedWeek}
          />
        ) : null}

        {activeReport ? (
          <ReportWeekCompare current={activeReport} previous={previousReport} />
        ) : null}

        <WeeklyReport report={activeReport} />
      </div>

      <aside className="reports-sidebar" aria-label="Kampanya durumu">
        <PartyIdentityPanel state={state} compact />
        <ReportSegmentChangesPanel
          week={activeReport?.week}
          segmentChanges={activeReport?.segmentChanges}
          politicalSegmentChanges={activeReport?.politicalSegmentChanges}
        />
        <SidebarSegmentSupport
          segmentSupport={state.segmentSupport}
          segmentChanges={activeReport?.segmentChanges}
        />
        <SidebarPoliticalSegmentSupport
          politicalSegmentSupport={state.politicalSegmentSupport}
          politicalSegmentChanges={activeReport?.politicalSegmentChanges}
        />
      </aside>

      <ReportsHistoryTable
        historyRows={historyRows}
        activeWeek={activeWeek}
        latestWeek={latestWeek}
        onSelectWeek={setSelectedWeek}
      />
    </div>
  );
}
