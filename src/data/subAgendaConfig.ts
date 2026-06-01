/** Alt gündem — Faz C sabitleri */

export const SUB_AGENDA_COUNT = 6;
export const SUB_AGENDA_MAX_SLOTS = 3;

export const RADAR_AGENDA_MAX = 2;
/** Fırsat tipi radar — yanıt verilmezse önümüzdeki hafta ek slot */
export const RADAR_OPPORTUNITY_BONUS_SLOTS = 1;

/** Mesaj verilmeyen alt gündemlerde hedef segmente küçük pasif kayıp */
export const SUB_AGENDA_SILENT_PRIMARY_PENALTY = 1;

/** Haftalık en fazla kaç sessiz alt gündem pasif ceza alır (52 hafta birikimini sınırlar) */
export const SUB_AGENDA_MAX_SILENT_PENALTIES_PER_WEEK = 1;

/** Aynı gerilim segmentine ikinci sert mesaj — ceza çarpanı */
export const SUB_AGENDA_DOUBLE_TARGET_MULTIPLIER = 1.25;

/** Jenerik alt gündem tonları — seçim anında enerji (ana gündem ölçeğiyle uyumlu) */
export const SUB_AGENDA_TONE_ENERGY = {
  bold: 4,
  measured: 2,
  passive: 1,
} as const;
