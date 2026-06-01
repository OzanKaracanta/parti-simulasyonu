/** Öğretici turlar — öngörülebilir ana gündem */

import { getWeeklyEventById } from '../data/weeklyEvents';
import type { WeeklyEvent } from '../types/game';

const TUTORIAL_PRIMARY_EVENT_IDS: Record<number, string> = {
  1: 'pazar-fiyatlari-krizi',
  2: 'asgari-ucret-beklentisi',
};

export function getTutorialPrimaryEvent(week: number): WeeklyEvent | null {
  const id = TUTORIAL_PRIMARY_EVENT_IDS[week];
  if (!id) return null;
  return getWeeklyEventById(id) ?? null;
}

/** Tur 3 öğreticisinde radar örneği garanti */
export function shouldGuaranteeTutorialRadar(week: number): boolean {
  return week === 3;
}
