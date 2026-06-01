import type { PoliticalSegmentId } from '../types/politicalSegments';

export interface PoliticalSegmentDefinition {
  id: PoliticalSegmentId;
  label: string;
  shortLabel: string;
  description: string;
}

export const POLITICAL_SEGMENTS: Record<PoliticalSegmentId, PoliticalSegmentDefinition> = {
  conservative: {
    id: 'conservative',
    label: 'Muhafazakâr',
    shortLabel: 'Muhafazakâr',
    description: 'Aile, gelenek, dini hassasiyet, düzen ve istikrar ekseni.',
  },
  nationalist: {
    id: 'nationalist',
    label: 'Milliyetçi',
    shortLabel: 'Milliyetçi',
    description: 'Ulusal birlik, güvenlik, sınır politikaları ve güçlü devlet vurgusu.',
  },
  socialDemocrat: {
    id: 'socialDemocrat',
    label: 'Sosyal Demokrat',
    shortLabel: 'Sosyal Demokrat',
    description: 'Emek, gelir adaleti, sosyal devlet ve kamusal hizmetler ekseni.',
  },
  liberal: {
    id: 'liberal',
    label: 'Liberal',
    shortLabel: 'Liberal',
    description: 'Özgürlükler, hukuk devleti, bireysel haklar ve bireysel alan vurgusu.',
  },
  populist: {
    id: 'populist',
    label: 'Halkçı / Tepkisel',
    shortLabel: 'Halkçı',
    description: 'Sistem karşıtı söylem, elit eleştirisi ve doğrudan halk dili.',
  },
};

export const politicalSegmentLabels: Record<PoliticalSegmentId, string> = Object.fromEntries(
  Object.values(POLITICAL_SEGMENTS).map((segment) => [segment.id, segment.label]),
) as Record<PoliticalSegmentId, string>;

/** Ulusal oy ince ayarı — ideolojik blok ağırlıkları (toplam ≈ 1) */
export const NATIONAL_POLITICAL_WEIGHTS: Record<PoliticalSegmentId, number> = {
  conservative: 0.22,
  nationalist: 0.18,
  socialDemocrat: 0.22,
  liberal: 0.2,
  populist: 0.18,
};
