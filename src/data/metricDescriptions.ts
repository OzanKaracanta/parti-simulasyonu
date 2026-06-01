/** Metrik ve kaynak kısa açıklamaları — İstatistikler ekranı */

import type { MetricKey, ResourceKey } from '../types/game';

export const metricDescriptions: Record<MetricKey, string> = {
  mediaPower: 'Basın, sosyal medya ve gündemde görünürlük.',
  campaignVisibility: 'Seçmenin partiden haberdar olma düzeyi.',
  youthReach: 'Genç ve ilk kez oy kullanan seçmenlere erişim.',
  localOrganization: 'Mahalle, ilçe ve gönüllü ağı gücü.',
  crisisManagement: 'Skandal ve krizlere verilen tepkinin kalitesi.',
  leaderTrust: 'Liderin ciddi ve yönetebilir görülmesi.',
  policyCredibility: 'Vaatlerin uygulanabilir ve tutarlı görünmesi.',
  socialGroupReach: 'Farklı toplumsal seçmen bloklarına temas.',
  financialSustainability: 'Kampanya boyunca para üretme kapasitesi.',
  regionalInfluence: 'Bölgelerde kök salma ve kalıcı destek gücü.',
};

export const resourceDescriptions: Record<ResourceKey, string> = {
  money: 'Operasyonların ana maliyeti; reklam ve saha harcamaları.',
  energy: 'Lider ve ekibin haftalık çalışma kapasitesi.',
  volunteers: 'Saha çalışması için tahsis edilen gönüllü havuzu.',
  reputation: 'Kamuoyundaki güvenilirlik; riskli hamleler düşürebilir.',
  organizationCapacity: 'Aynı hafta koordine edilebilen operasyon tavanı.',
};

export const METRIC_DISPLAY_ORDER: MetricKey[] = [
  'leaderTrust',
  'policyCredibility',
  'mediaPower',
  'campaignVisibility',
  'youthReach',
  'localOrganization',
  'socialGroupReach',
  'crisisManagement',
  'financialSustainability',
  'regionalInfluence',
];

export const RESOURCE_DISPLAY_ORDER: ResourceKey[] = [
  'money',
  'energy',
  'volunteers',
  'reputation',
  'organizationCapacity',
];
