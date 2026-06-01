import type { WeeklyHistoryItem } from '../../types/game';
import { Badge } from '../ui/Badge';
import { Panel } from '../ui/Panel';
import { WeeklyReportAgendaSection } from './WeeklyReportAgendaSection';
import { WeeklyReportEnvironmentSection } from './WeeklyReportEnvironmentSection';
import { WeeklyReportHero } from './WeeklyReportHero';
import { WeeklyReportOperations } from './WeeklyReportOperations';
import { TutorialReportTip } from '../tutorial/TutorialReportTip';
import './SubAgendaOutcomeCard.css';
import './WeeklyReport.css';
import '../tutorial/TutorialPanel.css';

interface WeeklyReportProps {
  report: WeeklyHistoryItem | null;
  tutorialSkipped?: boolean;
}

export function WeeklyReport({ report, tutorialSkipped = false }: WeeklyReportProps) {
  if (!report) {
    return (
      <Panel title="Haftalık Rapor">
        <p className="weekly-report-empty">
          İlk haftayı tamamladığında aksiyonların, kaynakların ve metriklerin etkisini burada
          göreceksin.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Haftalık Rapor"
      headerExtra={<Badge tone="week">Hafta {report.week}</Badge>}
      className="weekly-report"
    >
      <WeeklyReportHero report={report} />
      <TutorialReportTip week={report.week} tutorialSkipped={tutorialSkipped} />
      <WeeklyReportOperations report={report} />
      <div className="weekly-report-details">
        <WeeklyReportAgendaSection report={report} />
        <WeeklyReportEnvironmentSection report={report} />
      </div>
    </Panel>
  );
}
