/** Öğretici spotlight — menü hedefleri */

import type { DashboardView } from '../components/dashboard/DashboardScreen';

/** `data-tutorial-nav` attribute değeri */
export type TutorialNavTarget = DashboardView | 'end-week';

export function getTutorialNavTarget(view: DashboardView): TutorialNavTarget {
  return view;
}

export function tutorialNavSelector(target: TutorialNavTarget): string {
  return `[data-tutorial-nav="${target}"]`;
}
