/** Parti Kur sihirbazı — adım tanımları ve form durumu */

import type { SetupChoices } from '../../types/game';

export const SETUP_STEPS = [
  { id: 1, label: 'Kimlik', title: 'Parti ve bölge' },
  { id: 2, label: 'Görünüm', title: 'Renk ve sembol' },
  { id: 3, label: 'Strateji', title: 'Çizgi ve liderlik' },
] as const;

export type SetupStepId = (typeof SETUP_STEPS)[number]['id'];

export const SETUP_STEP_SUBTITLES: Record<SetupStepId, string> = {
  1: 'Parti adını, liderini ve başlangıç bölgeni belirle.',
  2: 'Renk ve sembol seç; ayrıntılar seçince görünür.',
  3: 'Çizgi ve liderlik tarzını seç; ardından kampanyaya başla.',
};

export interface SetupFormState {
  partyName: string;
  leaderName: string;
  regionId: SetupChoices['regionId'];
  colorId: SetupChoices['colorId'];
  symbolId: SetupChoices['symbolId'];
  ideologyId: SetupChoices['ideologyId'];
  leadershipStyleId: SetupChoices['leadershipStyleId'];
}

export function isStep1Valid(form: SetupFormState): boolean {
  return form.partyName.trim().length > 0 && form.leaderName.trim().length >= 2;
}

export function canAdvanceFromStep(step: SetupStepId, form: SetupFormState): boolean {
  if (step === 1) return isStep1Valid(form);
  return true;
}

export function formToChoices(form: SetupFormState): SetupChoices {
  return {
    partyName: form.partyName.trim(),
    leaderName: form.leaderName.trim(),
    regionId: form.regionId,
    colorId: form.colorId,
    symbolId: form.symbolId,
    ideologyId: form.ideologyId,
    leadershipStyleId: form.leadershipStyleId,
  };
}
