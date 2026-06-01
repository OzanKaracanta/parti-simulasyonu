/** Tutorial — kalıcı tercihler (localStorage) */

const SKIPPED_KEY = 'parti-sim-tutorial-skipped';
const INTRO_SEEN_KEY = 'parti-sim-tutorial-intro-seen';
const VIEWED_PREFIX = 'parti-sim-tutorial-viewed:';

export function isTutorialSkipped(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SKIPPED_KEY) === '1';
}

export function setTutorialSkipped(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SKIPPED_KEY, '1');
}

export function isTutorialIntroSeen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(INTRO_SEEN_KEY) === '1';
}

export function setTutorialIntroSeen(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INTRO_SEEN_KEY, '1');
}

function viewedKey(partyName: string, week: number, marker: string): string {
  return `${VIEWED_PREFIX}${partyName}:w${week}:${marker}`;
}

export function isTutorialMarkerViewed(
  partyName: string,
  week: number,
  marker: string,
): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(viewedKey(partyName, week, marker)) === '1';
}

export function markTutorialMarkerViewed(
  partyName: string,
  week: number,
  marker: string,
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(viewedKey(partyName, week, marker), '1');
}
