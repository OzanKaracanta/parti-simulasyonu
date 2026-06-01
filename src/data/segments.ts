/** Toplumsal segment tanımları — seçmen blokları ve ulusal ağırlıklar */

import type { ActionCategory, SegmentId } from '../types/game';

export const ALL_SEGMENT_IDS: SegmentId[] = [
  'youth',
  'workers',
  'merchants',
  'retirees',
  'civilServants',
  'farmers',
  'tourism',
  'fisherfolk',
  'industry',
];

/** Bölge dominantGroups metinlerinden segment eşlemesi */
export const GROUP_TO_SEGMENT: Record<string, SegmentId> = {
  gençler: 'youth',
  çalışanlar: 'workers',
  esnaf: 'merchants',
  emekliler: 'retirees',
  memurlar: 'civilServants',
  tarım: 'farmers',
  çiftçiler: 'farmers',
  turizm: 'tourism',
  balıkçılar: 'fisherfolk',
  sanayi: 'industry',
};

export const segmentLabels: Record<SegmentId, string> = {
  youth: 'Gençler',
  workers: 'Çalışanlar',
  merchants: 'Esnaf',
  retirees: 'Emekliler',
  civilServants: 'Memurlar',
  farmers: 'Tarım',
  tourism: 'Turizm',
  fisherfolk: 'Balıkçılar',
  industry: 'Sanayi',
};

/** Ulusal seçmen dağılımı — segment desteği oy hesabında kullanılır */
export const NATIONAL_SEGMENT_WEIGHTS: Record<SegmentId, number> = {
  youth: 0.16,
  workers: 0.14,
  merchants: 0.11,
  retirees: 0.15,
  civilServants: 0.09,
  farmers: 0.13,
  tourism: 0.05,
  fisherfolk: 0.04,
  industry: 0.13,
};

/** Aksiyon kategorisinden olayın etkilediği segmentler */
export const CATEGORY_DEFAULT_SEGMENTS: Record<ActionCategory, SegmentId[]> = {
  localOrganization: ['merchants', 'retirees', 'farmers'],
  socialGroups: ['youth', 'workers', 'retirees'],
  mediaCommunication: ['youth', 'civilServants', 'workers'],
  fundraising: ['merchants', 'industry', 'civilServants'],
  strategyProfessionalization: ['civilServants', 'workers', 'industry'],
};

export function mapGroupLabelToSegment(group: string): SegmentId | null {
  return GROUP_TO_SEGMENT[group] ?? null;
}

export function getSegmentLabel(segmentId: SegmentId): string {
  return segmentLabels[segmentId];
}
