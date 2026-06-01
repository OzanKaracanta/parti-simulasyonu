/** 7 coğrafi bölge — başlangıç metrik profilleri ve oyun kartı bilgileri */

import type { RegionId, RegionStartingMetrics } from '../types/game';

export interface RegionDefinition {
  id: RegionId;
  name: string;
  difficulty: string;
  potential: string;
  playStyle: string;
  risk: string;
  advantage: string;
  challenge: string;
  dominantGroups: string[];
  metrics: RegionStartingMetrics;
}

export const regionDefinitions: RegionDefinition[] = [
  {
    id: 'marmara',
    name: 'Marmara',
    difficulty: 'Yüksek',
    potential: 'Çok yüksek',
    playStyle: 'Medya, genç seçmen, ekonomi, kentli kampanya',
    risk: 'Krizler hızlı büyür, maliyetler yüksektir.',
    advantage: 'Medya ve genç seçmen gücü sayesinde hızlı görünürlük.',
    challenge: 'Rekabet yüksek; yerel örgüt kurmak maliyetli.',
    dominantGroups: ['gençler', 'çalışanlar', 'esnaf'],
    metrics: {
      nationalRecognition: 60,
      mediaPower: 70,
      leaderTrust: 45,
      partyTrust: 45,
      economyTrust: 55,
      youthReach: 65,
      campaignVisibility: 60,
      crisisManagement: 50,
      localOrganization: 45,
      localCandidateTrust: 45,
    },
  },
  {
    id: 'ege',
    name: 'Ege',
    difficulty: 'Orta',
    potential: 'Orta-yüksek',
    playStyle: 'Yerel aday, çevre, turizm, kentli seçmen',
    risk: 'Hızlı büyüme zor, güçlü aday gerekir.',
    advantage: 'Dengeli metrikler; yerel aday güveni yüksek.',
    challenge: 'Radikal söylemler ters tepebilir.',
    dominantGroups: ['gençler', 'emekliler', 'esnaf'],
    metrics: {
      nationalRecognition: 50,
      mediaPower: 55,
      leaderTrust: 50,
      partyTrust: 50,
      economyTrust: 55,
      youthReach: 55,
      campaignVisibility: 50,
      crisisManagement: 50,
      localOrganization: 50,
      localCandidateTrust: 55,
    },
  },
  {
    id: 'ic-anadolu',
    name: 'İç Anadolu',
    difficulty: 'Orta',
    potential: 'Yüksek',
    playStyle: 'Güven, teşkilat, ekonomi, liderlik',
    risk: 'Sosyal medya tek başına zayıf kalır.',
    advantage: 'Yerel örgüt ve lider güveni güçlü başlangıç.',
    challenge: 'Genç seçmen erişimi sınırlı.',
    dominantGroups: ['emekliler', 'esnaf', 'memurlar'],
    metrics: {
      nationalRecognition: 40,
      mediaPower: 40,
      leaderTrust: 55,
      partyTrust: 55,
      economyTrust: 50,
      youthReach: 35,
      campaignVisibility: 40,
      crisisManagement: 55,
      localOrganization: 60,
      localCandidateTrust: 55,
    },
  },
  {
    id: 'akdeniz',
    name: 'Akdeniz',
    difficulty: 'Orta',
    potential: 'Yüksek',
    playStyle: 'Turizm, tarım, göç, gençlik, yerel kampanya',
    risk: 'Tek mesaj her şehirde çalışmaz.',
    advantage: 'Çeşitli seçmen gruplarına ulaşma imkânı.',
    challenge: 'Heterojen yapı; dikkatli gündem yönetimi gerekir.',
    dominantGroups: ['gençler', 'tarım', 'turizm'],
    metrics: {
      nationalRecognition: 45,
      mediaPower: 50,
      leaderTrust: 45,
      partyTrust: 45,
      economyTrust: 50,
      youthReach: 50,
      campaignVisibility: 50,
      crisisManagement: 45,
      localOrganization: 45,
      localCandidateTrust: 50,
    },
  },
  {
    id: 'karadeniz',
    name: 'Karadeniz',
    difficulty: 'Orta-yüksek',
    potential: 'Orta',
    playStyle: 'Yerel aday, kırsal temas, afet yönetimi, tarım',
    risk: 'Medya gücü zayıf; güven inşası zaman alır.',
    advantage: 'Yerel aday güveni ve örgüt ağları güçlü.',
    challenge: 'Genç seçmen ve medya üzerinden hızlı büyüme zor.',
    dominantGroups: ['emekliler', 'çiftçiler', 'balıkçılar'],
    metrics: {
      nationalRecognition: 35,
      mediaPower: 35,
      leaderTrust: 55,
      partyTrust: 50,
      economyTrust: 45,
      youthReach: 30,
      campaignVisibility: 35,
      crisisManagement: 50,
      localOrganization: 55,
      localCandidateTrust: 60,
    },
  },
  {
    id: 'dogu-anadolu',
    name: 'Doğu Anadolu',
    difficulty: 'Yüksek',
    potential: 'Orta',
    playStyle: 'Yerel örgüt, aday güveni, kalkınma, kırsal politika',
    risk: 'Görünürlük düşük, coğrafi kampanya maliyeti yüksek.',
    advantage: 'Doğru aday ve örgüt ile sadık taban kurulabilir.',
    challenge: 'Medya kampanyası tek başına zayıf kalır.',
    dominantGroups: ['çiftçiler', 'gençler', 'esnaf'],
    metrics: {
      nationalRecognition: 25,
      mediaPower: 25,
      leaderTrust: 45,
      partyTrust: 40,
      economyTrust: 35,
      youthReach: 35,
      campaignVisibility: 25,
      crisisManagement: 45,
      localOrganization: 50,
      localCandidateTrust: 55,
    },
  },
  {
    id: 'guneydogu-anadolu',
    name: 'Güneydoğu Anadolu',
    difficulty: 'Yüksek',
    potential: 'Yüksek',
    playStyle: 'Genç seçmen, yerel örgüt, kalkınma, temsil',
    risk: 'Yanlış kriz dili veya aday ciddi hasar yaratır.',
    advantage: 'Genç nüfus ve yerel örgüt potansiyeli yüksek.',
    challenge: 'Güven inşası ve dikkatli söylem şart.',
    dominantGroups: ['gençler', 'tarım', 'sanayi'],
    metrics: {
      nationalRecognition: 35,
      mediaPower: 35,
      leaderTrust: 45,
      partyTrust: 40,
      economyTrust: 40,
      youthReach: 55,
      campaignVisibility: 35,
      crisisManagement: 45,
      localOrganization: 55,
      localCandidateTrust: 50,
    },
  },
];

export function getRegionById(id: RegionId): RegionDefinition {
  const region = regionDefinitions.find((item) => item.id === id);
  if (!region) throw new Error(`Bölge bulunamadı: ${id}`);
  return region;
}
