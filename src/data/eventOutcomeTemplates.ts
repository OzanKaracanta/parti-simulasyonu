/** Haftalık event outcome şablonları — türe göre success / partial / ignored */

import type { WeeklyEventOutcomes, WeeklyEventType } from '../types/game';

export function createWeeklyEventOutcomes(
  type: WeeklyEventType,
  eventTitle: string,
): WeeklyEventOutcomes {
  switch (type) {
    case 'opportunity':
      return {
        success: {
          title: 'Fırsat Değerlendirildi',
          description: `"${eventTitle}" gündemine güçlü yanıt verdin; ivme seninle.`,
          effects: {
            metrics: { campaignVisibility: 3, leaderTrust: 2, regionalInfluence: 2 },
          },
        },
        partial: {
          title: 'Sınırlı Karşılık',
          description: `"${eventTitle}" gündemine kısmen uyum sağlandı; tam etki yakalanamadı.`,
          effects: {
            metrics: { campaignVisibility: 1 },
          },
        },
        ignored: {
          title: 'Kaçırılan Fırsat',
          description: `"${eventTitle}" penceresi değerlendirilemedi; rakipler alan kaptı.`,
          effects: {
            metrics: { campaignVisibility: -2, leaderTrust: -1 },
          },
        },
      };

    case 'crisis':
      return {
        success: {
          title: 'Kriz Yönetildi',
          description: `"${eventTitle}" gündeminde doğru hamle yaptın; güven korundu.`,
          effects: {
            metrics: { crisisManagement: 3, leaderTrust: 2 },
            resources: { reputation: 1 },
          },
        },
        partial: {
          title: 'Geç Kalınan Tepki',
          description: `"${eventTitle}" gündemine kısmi yanıt verildi; algı tam oturmadı.`,
          effects: {
            metrics: { crisisManagement: 1, leaderTrust: -1 },
          },
        },
        ignored: {
          title: 'Kriz Derinleşti',
          description: `"${eventTitle}" gündemine yanıt yok; güven ve itibar zayıfladı.`,
          effects: {
            metrics: { crisisManagement: -3, leaderTrust: -2 },
            resources: { reputation: -2 },
          },
        },
      };

    case 'agenda':
      return {
        success: {
          title: 'Gündeme Uyum',
          description: `"${eventTitle}" doğrultusunda hareket ettin; mesajın yankı buldu.`,
          effects: {
            metrics: { policyCredibility: 2, campaignVisibility: 2, socialGroupReach: 2 },
          },
        },
        partial: {
          title: 'Yarım Mesaj',
          description: `"${eventTitle}" gündemiyle kısmen uyumluydu; önerilen hamleler eksik kaldı.`,
          effects: {
            metrics: { campaignVisibility: 1, policyCredibility: -1 },
          },
        },
        ignored: {
          title: 'Gündemden Kopukluk',
          description: `"${eventTitle}" gündeminde sessiz kaldın; etki hızla dağıldı.`,
          effects: {
            metrics: { campaignVisibility: -2, policyCredibility: -2, leaderTrust: -1 },
          },
        },
      };
  }
}
