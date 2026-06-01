/** Bölgesel gündem — Faz 2 sabitleri ve evre kuralları */

/** Tepki verebilmek için gereken minimum örgüt aracı */
export const REGIONAL_AGENDA_ORG_TOOL_ID = 'volunteer_network';
export const REGIONAL_AGENDA_ORG_MIN_LEVEL = 1;

/** Segment etkisi — ulusal alt gündeme göre daha dar */
export const REGIONAL_SEGMENT_EFFECT_SCALE = 0.7;

/** Bölge desteği — ton başına (0–50 skala) */
export const REGIONAL_SUPPORT_DELTA = {
  bold: 1.0,
  measured: 0.5,
  passive: -0.25,
} as const;

/** Sessiz bırakılan bölgesel gündem — küçük destek kaybı */
export const REGIONAL_AGENDA_SILENT_SUPPORT_PENALTY = 0.35;

/** Rakip bölgesel gündemi sahiplendiğinde bölge desteği kaybı */
export const REGIONAL_RIVAL_SUPPORT_PENALTY = 0.5;

/** Net mesajda bölgesel örgüt bonusu */
export const REGIONAL_ORG_BONUS_ON_BOLD = 0.4;

/** Bölge seçim ağırlıkları */
export const REGIONAL_WEIGHT_HOME = 1.35;
export const REGIONAL_WEIGHT_IL_OFFICE = 1.5;
export const REGIONAL_WEIGHT_LOW_SUPPORT = 1.2;
export const REGIONAL_WEIGHT_LOW_SUPPORT_THRESHOLD = 12;
export const REGIONAL_WEIGHT_RECENT_REPEAT = 0.45;

/** Haftalık listede kaç bölge kartı (farklı bölgeler) */
export function getRegionalAgendaCardCount(campaignWeek: number): number {
  if (campaignWeek <= 16) return 2;
  return 3;
}

/** Haftalık bölgesel mesaj slotu — ulusal alt gündemden ayrı */
export function getRegionalAgendaMaxSlots(campaignWeek: number): number {
  if (campaignWeek <= 16) return 1;
  return 2;
}
