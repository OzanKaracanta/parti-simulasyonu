/** UI etiketleri — kaynak, metrik ve aksiyon kategorileri */

import type { ActionCategory, EventResponseLevel, MetricKey, ReactionAxis, ResourceKey, WeeklyEventType } from '../types/game';

export { segmentLabels } from './segments';
export { policyTopicLabels, responseToneLabels } from './politicalIdentity';

export const resourceLabels: Record<ResourceKey, string> = {
  money: 'Para',
  energy: 'Enerji',
  volunteers: 'Gönüllü',
  reputation: 'İtibar',
  organizationCapacity: 'Örgüt Kapasitesi',
};

export const metricLabels: Record<MetricKey, string> = {
  mediaPower: 'Medya Gücü',
  campaignVisibility: 'Kampanya Görünürlüğü',
  youthReach: 'Genç Seçmen Erişimi',
  localOrganization: 'Yerel Örgütlenme',
  crisisManagement: 'Kriz Yönetimi',
  leaderTrust: 'Lider Güveni',
  policyCredibility: 'Politika Güvenilirliği',
  socialGroupReach: 'Toplumsal Grup Erişimi',
  financialSustainability: 'Finansal Sürdürülebilirlik',
  regionalInfluence: 'Bölgesel Nüfuz',
};

export const categoryLabels: Record<ActionCategory, string> = {
  localOrganization: 'Yerel Örgütlenme',
  socialGroups: 'Toplumsal Grup',
  mediaCommunication: 'Medya ve İletişim',
  fundraising: 'Finansman',
  strategyProfessionalization: 'Strateji ve Profesyonelleşme',
};

export const categoryOrder: ActionCategory[] = [
  'localOrganization',
  'socialGroups',
  'mediaCommunication',
  'fundraising',
  'strategyProfessionalization',
];

export const weeklyEventTypeLabels: Record<WeeklyEventType, string> = {
  opportunity: 'Fırsat',
  crisis: 'Kriz',
  agenda: 'Gündem',
};

export const reactionAxisLabels: Record<ReactionAxis, string> = {
  socioeconomic: 'Ekonomik',
  political: 'Politik',
  mixed: 'Karma',
};

export const eventResponseLevelLabels: Record<EventResponseLevel, string> = {
  success: 'Başarılı',
  partial: 'Kısmi',
  ignored: 'Göz ardı',
};

export const subAgendaEnergyCostLabels = {
  düşük: 'Enerji: düşük',
  orta: 'Enerji: orta',
  yüksek: 'Enerji: yüksek',
} as const;

export const organizationToolStatusLabels = {
  available: 'Müsait',
  locked: 'Kilitli',
  active: 'Aktif',
  maxed: 'Maksimum',
  insufficient_resources: 'Yetersiz Kaynak',
} as const;
