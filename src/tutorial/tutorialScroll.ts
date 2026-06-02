/** Öğretici — sayfa içi bölüme kaydırma */

import type { GameState } from '../types/game';
import { scrollToAgendaFocus } from '../components/dashboard/overview/agendaFocusScroll';

export type TutorialScrollSection =
  | 'main-agenda'
  | 'sub-agenda'
  | 'radar-agenda'
  | 'campaign-operations'
  | 'organization-tools';

export const TUTORIAL_SECTION_IDS: Record<TutorialScrollSection, string> = {
  'main-agenda': 'tutorial-section-main-agenda',
  'sub-agenda': 'tutorial-section-sub-agenda',
  'radar-agenda': 'tutorial-section-radar',
  'campaign-operations': 'tutorial-section-campaign-operations',
  'organization-tools': 'tutorial-section-organization-tools',
};

function highlightElement(element: HTMLElement): void {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.classList.add('agenda-focus-highlight');
  window.setTimeout(() => {
    element.classList.remove('agenda-focus-highlight');
  }, 2000);
}

export function scrollToTutorialSection(
  section: TutorialScrollSection,
  state: GameState,
): void {
  if (section === 'main-agenda' && state.currentWeeklyEvent) {
    scrollToAgendaFocus(state.currentWeeklyEvent.id);
    return;
  }

  const element = document.getElementById(TUTORIAL_SECTION_IDS[section]);
  if (!element) return;
  highlightElement(element);
}
