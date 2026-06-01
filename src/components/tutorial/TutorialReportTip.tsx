/** Haftalık raporda öğretici özet */

import { getTutorialWeekEndTip } from '../../tutorial/tutorialEngine';
import { TUTORIAL_LAST_WEEK } from '../../tutorial/tutorialSteps';

interface TutorialReportTipProps {
  week: number;
  tutorialSkipped: boolean;
}

export function TutorialReportTip({ week, tutorialSkipped }: TutorialReportTipProps) {
  if (tutorialSkipped || week > TUTORIAL_LAST_WEEK) return null;

  const tip = getTutorialWeekEndTip(week);
  if (!tip) return null;

  return (
    <div className="tutorial-report-tip" role="note">
      <span className="tutorial-report-tip-label">Öğretici not</span>
      <p>{tip}</p>
    </div>
  );
}
