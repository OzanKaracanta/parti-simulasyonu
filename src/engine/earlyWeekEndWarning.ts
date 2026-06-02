/** Tur sonu — eksik aktivite tespiti (danışman brifingi) */

import type { GameState } from '../types/game';

export type MissedTurnActivityId =
  | 'sub_agenda'
  | 'regional_agenda'
  | 'field_ops'
  | 'organization';

const ADVISOR_ADVICE_BY_ACTIVITY: Record<MissedTurnActivityId, string> = {
  field_ops:
    'Önceki turda saha operasyonu seçmediniz — önümüzdeki turda kampanyaya en az bir hareket eklemenizi öneririm.',
  sub_agenda:
    'Alt gündemlere yanıt vermediniz — segment mesajınız boş kaldı; önümüzdeki turda en az bir slota mesaj düşünün.',
  regional_agenda:
    'Bölgesel gündem sorularına cevap vermediniz — yerel taban için Gündemler → Bölgesel sayfasına bakmanızı öneririm.',
  organization:
    'Teşkilatta kurulum veya yükseltme yapmadınız — önümüzdeki turda Teşkilatını yönet adımından bir yatırım planlayın.',
};

/** Biten turda yapılmayan isteğe bağlı / önemli aktiviteler */
export function getMissedTurnActivities(state: GameState): MissedTurnActivityId[] {
  const missing: MissedTurnActivityId[] = [];

  if (state.subAgendas.length > 0 && state.selectedSubAgendaSelections.length === 0) {
    missing.push('sub_agenda');
  }

  if (
    state.regionalAgendas.length > 0 &&
    state.selectedRegionalAgendaSelections.length === 0
  ) {
    missing.push('regional_agenda');
  }

  if (state.selectedActionIds.length === 0) {
    missing.push('field_ops');
  }

  if (!state.weekOrganizationChanged) {
    missing.push('organization');
  }

  return missing;
}

export function buildAdvisorAdviceNotes(state: GameState): string[] {
  return getMissedTurnActivities(state).map((id) => ADVISOR_ADVICE_BY_ACTIVITY[id]);
}

export function markWeekOrganizationChanged(state: GameState): GameState {
  if (state.weekOrganizationChanged) return state;
  return { ...state, weekOrganizationChanged: true };
}
