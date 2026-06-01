/** Olay türüne göre tepki seçenekleri üretimi */

import type {
  ActionCategory,
  EventResponseOption,
  SegmentId,
  WeeklyEventType,
} from '../types/game';
import { CATEGORY_DEFAULT_SEGMENTS } from './segments';

function segmentBoost(
  segments: SegmentId[],
  amount: number,
): Partial<Record<SegmentId, number>> {
  const effects: Partial<Record<SegmentId, number>> = {};
  for (const segmentId of segments) {
    effects[segmentId] = amount;
  }
  return effects;
}

function segmentPenalty(
  segments: SegmentId[],
  amount: number,
): Partial<Record<SegmentId, number>> {
  return segmentBoost(segments, -Math.abs(amount));
}

function oppositeSegments(primary: SegmentId[]): SegmentId[] {
  const all: SegmentId[] = [
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
  return all.filter((id) => !primary.includes(id)).slice(0, 3);
}

function crisisResponses(
  eventTitle: string,
  segments: SegmentId[],
): EventResponseOption[] {
  return [
    {
      id: 'crisis-bold',
      label: 'Güçlü Yanıt Ver',
      description: 'Lider olarak kamuoyu önünde net ve kararlı bir açıklama yap.',
      outcomeTitle: 'Kararlı Durdu',
      outcomeDescription: `"${eventTitle}" gündeminde liderlik gösterdin; taban seninle.`,
      responseLevel: 'success',
      tone: 'bold',
      stanceValue: 1,
      segmentEffects: {
        ...segmentBoost(segments, 3),
        ...segmentPenalty(oppositeSegments(segments), 1),
      },
      effects: {
        metrics: { leaderTrust: 2, crisisManagement: 3 },
        resources: { energy: -8 },
      },
    },
    {
      id: 'crisis-measured',
      label: 'Ölçülü Açıklama',
      description: 'Detaylı ama sakin bir mesajla güven tesis etmeye çalış.',
      outcomeTitle: 'Dengeli Tepki',
      outcomeDescription: `"${eventTitle}" gündeminde ölçülü kaldın; geniş kitleler kararsız.`,
      responseLevel: 'partial',
      tone: 'measured',
      stanceValue: 0,
      segmentEffects: segmentBoost(segments, 1),
      effects: {
        metrics: { crisisManagement: 1, leaderTrust: 1 },
        resources: { energy: -4 },
      },
    },
    {
      id: 'crisis-silent',
      label: 'Sessiz Kal',
      description: 'Resmi açıklama yapmadan sürecin yatışmasını bekle.',
      outcomeTitle: 'Sessizlik',
      outcomeDescription: `"${eventTitle}" gündeminde görünmedin; algı senin aleyhine döndü.`,
      responseLevel: 'ignored',
      tone: 'passive',
      stanceValue: -1,
      segmentEffects: {
        ...segmentPenalty(segments, 2),
        retirees: -2,
        civilServants: -1,
      },
      effects: {
        metrics: { leaderTrust: -2, crisisManagement: -3, campaignVisibility: -2 },
        resources: { reputation: -2 },
      },
    },
  ];
}

function opportunityResponses(
  eventTitle: string,
  segments: SegmentId[],
): EventResponseOption[] {
  return [
    {
      id: 'opportunity-seize',
      label: 'Fırsatı Yakala',
      description: 'Gündemi sahiplen; ilgili gruplara doğrudan mesaj ver.',
      outcomeTitle: 'Fırsat Değerlendirildi',
      outcomeDescription: `"${eventTitle}" penceresini iyi kullandın; ilgili gruplarda ivme var.`,
      responseLevel: 'success',
      tone: 'bold',
      stanceValue: 1,
      segmentEffects: segmentBoost(segments, 4),
      effects: {
        metrics: { campaignVisibility: 3, socialGroupReach: 2 },
        resources: { energy: -6 },
      },
    },
    {
      id: 'opportunity-limited',
      label: 'Sınırlı Katılım',
      description: 'Kaynakları koruyarak temkinli bir hamle yap.',
      outcomeTitle: 'Sınırlı Karşılık',
      outcomeDescription: `"${eventTitle}" fırsatına kısmen yanıt verdin; tam etki yakalanamadı.`,
      responseLevel: 'partial',
      tone: 'measured',
      stanceValue: 0,
      segmentEffects: segmentBoost(segments, 1),
      effects: {
        metrics: { campaignVisibility: 1 },
        resources: { energy: -3 },
      },
    },
    {
      id: 'opportunity-skip',
      label: 'Mesafe Koru',
      description: 'Bu gündeme girmeden mevcut planına devam et.',
      outcomeTitle: 'Kaçırılan Fırsat',
      outcomeDescription: `"${eventTitle}" penceresi değerlendirilemedi; rakipler alan kaptı.`,
      responseLevel: 'ignored',
      tone: 'passive',
      stanceValue: -1,
      segmentEffects: segmentPenalty(segments, 2),
      effects: {
        metrics: { campaignVisibility: -2, leaderTrust: -1 },
      },
    },
  ];
}

function agendaResponses(
  eventTitle: string,
  segments: SegmentId[],
): EventResponseOption[] {
  return [
    {
      id: 'agenda-bold',
      label: 'Net Duruş Al',
      description: 'Konuda açık ve hat çizen bir politika mesajı ver.',
      outcomeTitle: 'Net Mesaj',
      outcomeDescription: `"${eventTitle}" gündeminde net konuştun; bazı gruplar coştu, bazıları geriledi.`,
      responseLevel: 'success',
      tone: 'bold',
      stanceValue: 2,
      segmentEffects: {
        ...segmentBoost(segments, 3),
        ...segmentPenalty(oppositeSegments(segments), 2),
      },
      effects: {
        metrics: { policyCredibility: 2, campaignVisibility: 2 },
        resources: { energy: -5 },
      },
    },
    {
      id: 'agenda-balanced',
      label: 'Dengeli Mesaj',
      description: 'Farklı kesimleri kırmadan geniş kitleye hitap et.',
      outcomeTitle: 'Dengeli Yaklaşım',
      outcomeDescription: `"${eventTitle}" gündeminde uzlaşmacı bir çizgi izledin; geniş taban korundu.`,
      responseLevel: 'partial',
      tone: 'measured',
      stanceValue: 0,
      segmentEffects: segmentBoost(segments, 1),
      effects: {
        metrics: { policyCredibility: 1, leaderTrust: 1 },
      },
    },
    {
      id: 'agenda-ignore',
      label: 'Konuyu Geç',
      description: 'Bu gündeme girmeden başka mesajlara odaklan.',
      outcomeTitle: 'Gündemden Kopukluk',
      outcomeDescription: `"${eventTitle}" gündeminde sessiz kaldın; mesajın dağıldı.`,
      responseLevel: 'ignored',
      tone: 'passive',
      stanceValue: -1,
      segmentEffects: {
        ...segmentPenalty(segments, 2),
        youth: -1,
      },
      effects: {
        metrics: { campaignVisibility: -2, policyCredibility: -2, leaderTrust: -1 },
      },
    },
  ];
}

export function createEventResponseOptions(
  type: WeeklyEventType,
  eventTitle: string,
  affectedCategory: ActionCategory,
  customSegments?: SegmentId[],
): EventResponseOption[] {
  const segments = customSegments?.length
    ? customSegments
    : CATEGORY_DEFAULT_SEGMENTS[affectedCategory];

  switch (type) {
    case 'crisis':
      return crisisResponses(eventTitle, segments);
    case 'opportunity':
      return opportunityResponses(eventTitle, segments);
    case 'agenda':
      return agendaResponses(eventTitle, segments);
  }
}

export function getEventResponseById(
  options: EventResponseOption[],
  responseId: string,
): EventResponseOption | undefined {
  return options.find((option) => option.id === responseId);
}
