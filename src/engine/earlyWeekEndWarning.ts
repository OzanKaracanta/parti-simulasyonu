/** 6–10. hafta — hafta bitirmeden önce eksik aktivite uyarısı (öğretici turları 1–5 hariç) */

import type { GameState } from '../types/game';

export const EARLY_WEEK_END_WARNING_MIN_WEEK = 6;
export const EARLY_WEEK_END_WARNING_MAX_WEEK = 10;

export type EarlyWeekMissingActivityId = 'sub_agenda' | 'field_ops' | 'organization';

export interface EarlyWeekMissingActivity {
  id: EarlyWeekMissingActivityId;
  label: string;
}

const MISSING_ACTIVITY_LABELS: Record<EarlyWeekMissingActivityId, string> = {
  sub_agenda: "Alt Gündemler'e cevap verilmedi.",
  field_ops: 'Herhangi bir saha operasyonu yürütülmedi.',
  organization: 'Herhangi bir teşkilat kurulmadı ya da yükseltilmedi.',
};

export function isEarlyWeekEndWarningActive(state: GameState): boolean {
  return (
    state.status === 'playing' &&
    state.campaignWeek >= EARLY_WEEK_END_WARNING_MIN_WEEK &&
    state.campaignWeek <= EARLY_WEEK_END_WARNING_MAX_WEEK
  );
}

export function getEarlyWeekMissingActivities(state: GameState): EarlyWeekMissingActivity[] {
  if (!isEarlyWeekEndWarningActive(state)) return [];

  const missing: EarlyWeekMissingActivity[] = [];

  if (state.subAgendas.length > 0 && state.selectedSubAgendaSelections.length === 0) {
    missing.push({ id: 'sub_agenda', label: MISSING_ACTIVITY_LABELS.sub_agenda });
  }

  if (state.selectedActionIds.length === 0) {
    missing.push({ id: 'field_ops', label: MISSING_ACTIVITY_LABELS.field_ops });
  }

  if (!state.weekOrganizationChanged) {
    missing.push({ id: 'organization', label: MISSING_ACTIVITY_LABELS.organization });
  }

  return missing;
}

export function shouldShowEarlyWeekEndWarning(state: GameState): boolean {
  return getEarlyWeekMissingActivities(state).length > 0;
}

export function markWeekOrganizationChanged(state: GameState): GameState {
  if (state.weekOrganizationChanged) return state;
  return { ...state, weekOrganizationChanged: true };
}
