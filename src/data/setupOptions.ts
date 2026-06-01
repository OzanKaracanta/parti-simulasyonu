/** Setup ekranı seçenekleri — parti, renk, sembol, ideoloji, liderlik */

import type {
  IdeologyId,
  LeadershipStyleId,
  MetricKey,
  PartyColorId,
  PartySymbolId,
  ResourceKey,
} from '../types/game';

export interface SetupOptionEffects {
  metrics?: Partial<Record<MetricKey, number>>;
  resources?: Partial<Record<ResourceKey, number>>;
}

export interface PartyNameOption {
  id: string;
  name: string;
}

export interface ColorOption {
  id: PartyColorId;
  name: string;
  hex: string;
  perception: string;
  effectSummary: string;
  effects: SetupOptionEffects;
}

export interface SymbolOption {
  id: PartySymbolId;
  name: string;
  theme: string;
  bonusSummary: string;
  effects: SetupOptionEffects;
}

export interface IdeologyOption {
  id: IdeologyId;
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  playStyle: string;
  effects: SetupOptionEffects;
}

export interface LeadershipOption {
  id: LeadershipStyleId;
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  bonusSummary: string;
  effects: SetupOptionEffects;
}

export const partyNameOptions: PartyNameOption[] = [
  { id: 'halkin-sesi', name: 'Halkın Sesi Partisi' },
  { id: 'yeni-yol', name: 'Yeni Yol Hareketi' },
  { id: 'cumhuriyetci-birlik', name: 'Cumhuriyetçi Birlik Partisi' },
  { id: 'adalet-kalkinma', name: 'Adalet ve Kalkınma Hareketi' },
  { id: 'ozgur-gelecek', name: 'Özgür Gelecek Partisi' },
  { id: 'milli-birlik', name: 'Milli Birlik Partisi' },
  { id: 'demokrat-turkiye', name: 'Demokrat Türkiye Partisi' },
  { id: 'emek-halk', name: 'Emek ve Halk Partisi' },
  { id: 'yeniden-dogus', name: 'Yeniden Doğuş Partisi' },
  { id: 'merkez-turkiye', name: 'Merkez Türkiye Partisi' },
  { id: 'vatan-reform', name: 'Vatan ve Reform Partisi' },
  { id: 'toplumcu-adalet', name: 'Toplumcu Adalet Partisi' },
];

export const colorOptions: ColorOption[] = [
  {
    id: 'red',
    name: 'Kırmızı',
    hex: '#dc2626',
    perception: 'Mücadele, halkçılık, milliyetçilik, enerji',
    effectSummary: 'Miting ve saha kampanyalarında görünürlük bonusu',
    effects: { metrics: { campaignVisibility: 3, localOrganization: 2 } },
  },
  {
    id: 'blue',
    name: 'Mavi',
    hex: '#2563eb',
    perception: 'Güven, devlet ciddiyeti, merkez siyaset, istikrar',
    effectSummary: 'Güven ve merkez seçmene erişim bonusu',
    effects: { metrics: { leaderTrust: 3, policyCredibility: 2 } },
  },
  {
    id: 'green',
    name: 'Yeşil',
    hex: '#16a34a',
    perception: 'Çevre, yerel kalkınma, muhafazakâr/ekolojik çizgi',
    effectSummary: 'Yerel hareketler ve çevre politikalarında bonus',
    effects: { metrics: { localOrganization: 3, financialSustainability: 2 } },
  },
  {
    id: 'yellow',
    name: 'Sarı / Altın',
    hex: '#ca8a04',
    perception: 'Refah, kalkınma, umut, ekonomik büyüme',
    effectSummary: 'Bağış toplama ve iş dünyası ilişkilerinde bonus',
    effects: { metrics: { financialSustainability: 3 }, resources: { money: 12 } },
  },
  {
    id: 'purple',
    name: 'Mor',
    hex: '#9333ea',
    perception: 'Özgürlükçülük, kadın hakları, gençlik, yeni siyaset',
    effectSummary: 'Genç ve şehirli seçmende bonus',
    effects: { metrics: { youthReach: 3, socialGroupReach: 2 } },
  },
  {
    id: 'orange',
    name: 'Turuncu',
    hex: '#ea580c',
    perception: 'Değişim, dinamizm, girişimcilik',
    effectSummary: 'Sosyal medya ve kampanya enerjisinde bonus',
    effects: { metrics: { mediaPower: 3 }, resources: { energy: 8 } },
  },
  {
    id: 'black',
    name: 'Siyah',
    hex: '#374151',
    perception: 'Sert muhalefet, sistem karşıtlığı, disiplin, radikal değişim',
    effectSummary: 'Protest seçmende bonus, merkez seçmende güven dezavantajı',
    effects: { metrics: { campaignVisibility: 3, leaderTrust: -2 } },
  },
  {
    id: 'white',
    name: 'Beyaz',
    hex: '#e5e7eb',
    perception: 'Temizlik, şeffaflık, yeni başlangıç',
    effectSummary: 'Yolsuzluk karşıtı söylemlerde güven bonusu',
    effects: { metrics: { leaderTrust: 3, policyCredibility: 2 } },
  },
];

export const symbolOptions: SymbolOption[] = [
  {
    id: 'sun',
    name: 'Güneş',
    theme: 'Yeni başlangıç, umut, değişim',
    bonusSummary: 'Yeni seçmenlere ulaşım ve kampanya morali',
    effects: { metrics: { youthReach: 3, campaignVisibility: 2 } },
  },
  {
    id: 'star',
    name: 'Yıldız',
    theme: 'Ulusal hedef, liderlik, yükseliş',
    bonusSummary: 'Milliyetçi ve merkez seçmende hafif görünürlük',
    effects: { metrics: { campaignVisibility: 2, leaderTrust: 2 } },
  },
  {
    id: 'tree',
    name: 'Ağaç',
    theme: 'Kök salma, yerel örgütlenme, sürdürülebilirlik',
    bonusSummary: 'Yerel teşkilat kurma avantajı',
    effects: { metrics: { localOrganization: 4, regionalInfluence: 2 } },
  },
  {
    id: 'olive',
    name: 'Zeytin Dalı',
    theme: 'Barış, uzlaşma, toplumsal sakinlik',
    bonusSummary: 'Kutuplaşma dönemlerinde güven kaybını azaltır',
    effects: { metrics: { crisisManagement: 3, leaderTrust: 2 } },
  },
  {
    id: 'scales',
    name: 'Terazi',
    theme: 'Adalet, hukuk, liyakat',
    bonusSummary: 'Skandal gündemlerinde güven kazanımı',
    effects: { metrics: { policyCredibility: 4, crisisManagement: 2 } },
  },
  {
    id: 'torch',
    name: 'Meşale',
    theme: 'Aydınlanma, hareket, gençlik',
    bonusSummary: 'Gençlik örgütlenmesinde avantaj',
    effects: { metrics: { youthReach: 4, socialGroupReach: 2 } },
  },
  {
    id: 'pen',
    name: 'Kalem',
    theme: 'Eğitim, reform, entelektüel siyaset',
    bonusSummary: 'Eğitim politikalarında ve şehirli seçmende avantaj',
    effects: { metrics: { policyCredibility: 3, socialGroupReach: 2 } },
  },
  {
    id: 'gear',
    name: 'Çark',
    theme: 'Üretim, sanayi, emek',
    bonusSummary: 'İşçi, esnaf ve sanayi bölgelerinde avantaj',
    effects: { metrics: { socialGroupReach: 3, financialSustainability: 2 } },
  },
  {
    id: 'hand',
    name: 'El',
    theme: 'Dayanışma, halkla temas, sosyal yardım',
    bonusSummary: 'Mahalle örgütlenmesi ve düşük gelirli seçmenle temas',
    effects: { metrics: { localOrganization: 3, socialGroupReach: 3 } },
  },
  {
    id: 'bridge',
    name: 'Köprü',
    theme: 'Uzlaşma, merkez siyaset, farklı kesimleri birleştirme',
    bonusSummary: 'İttifak ve koalisyon ilişkilerinde avantaj',
    effects: { metrics: { leaderTrust: 3, policyCredibility: 2 } },
  },
  {
    id: 'wave',
    name: 'Dalga',
    theme: 'Değişim, genç enerji, yükselen hareket',
    bonusSummary: 'Sosyal medya kampanyalarında avantaj',
    effects: { metrics: { mediaPower: 4, youthReach: 2 } },
  },
  {
    id: 'shield',
    name: 'Kalkan',
    theme: 'Güvenlik, devlet, istikrar',
    bonusSummary: 'Kriz ve güvenlik gündemlerinde güven avantajı',
    effects: { metrics: { crisisManagement: 4, leaderTrust: 2 } },
  },
];

export const ideologyOptions: IdeologyOption[] = [
  {
    id: 'centrist-reform',
    name: 'Merkez Reformcu',
    description: 'Kurumları güçlendirme, yolsuzlukla mücadele, ekonomik istikrar ve ılımlı değişim.',
    advantages: ['Merkez seçmende güven yüksek', 'İttifak kurması kolay', 'Şehirli seçmene erişim iyi'],
    disadvantages: ['Sadık taban oluşturması zor', 'Protest seçmende heyecan yaratmakta zorlanır'],
    playStyle: 'Dengeli büyüme, ittifak siyaseti, yavaş ama güvenli ilerleme',
    effects: {
      metrics: { leaderTrust: 5, policyCredibility: 5, socialGroupReach: -3, campaignVisibility: -2 },
    },
  },
  {
    id: 'populist-social',
    name: 'Halkçı / Sosyal Adaletçi',
    description: 'Gelir adaleti, emek, sosyal yardımlar ve düşük gelirli vatandaşların yaşam koşulları.',
    advantages: ['Düşük gelirli seçmenlerde güçlü', 'Emekli ve öğrenci konularında etkili'],
    disadvantages: ['İş dünyası bağışları düşük', 'Merkez sağ seçmeni ikna etmesi zor'],
    playStyle: 'Saha çalışması, mahalle örgütlenmesi, ekonomik krizlerden fırsat',
    effects: {
      metrics: { socialGroupReach: 6, localOrganization: 3, financialSustainability: -3 },
      resources: { money: -10, volunteers: 8 },
    },
  },
  {
    id: 'nationalist-security',
    name: 'Milliyetçi / Güvenlikçi',
    description: 'Ulusal birlik, sınır güvenliği, güçlü devlet ve dış politikada sert duruş.',
    advantages: ['Güvenlik krizlerinde hızlı destek', 'Milliyetçi seçmende güçlü taban'],
    disadvantages: ['Genç ve şehirli seçmende sınırlı', 'Sert söylem kutuplaşmayı artırabilir'],
    playStyle: 'Kriz yönetimi, güçlü lider imajı, milli meseleler üzerinden büyüme',
    effects: {
      metrics: { crisisManagement: 5, leaderTrust: 4, youthReach: -4, socialGroupReach: -2 },
    },
  },
  {
    id: 'libertarian-democrat',
    name: 'Özgürlükçü / Demokrat',
    description: 'Bireysel özgürlükler, hukuk devleti, kadın hakları, gençlik ve çoğulculuk.',
    advantages: ['Genç ve eğitimli seçmende güçlü', 'Sosyal medyada etkili'],
    disadvantages: ['Kırsal bölgelerde zorlanabilir', 'Geleneksel seçmenle bağ kurması maliyetli'],
    playStyle: 'Medya, sosyal hareketler, gençlik örgütlenmesi, şehir siyaseti',
    effects: {
      metrics: { youthReach: 6, mediaPower: 4, socialGroupReach: 3, leaderTrust: -2 },
    },
  },
  {
    id: 'conservative-democrat',
    name: 'Muhafazakâr Demokrat',
    description: 'Aile, gelenek, inanç özgürlüğü, yerel değerler ve sosyal dayanışma.',
    advantages: ['Anadolu şehirlerinde güçlü', 'Yerel örgütlenmede avantajlı'],
    disadvantages: ['Seküler şehirli seçmende sınırlı', 'Genç seçmen için ek kampanya gerekir'],
    playStyle: 'Yerel örgütlenme, kanaat önderleri, aile ve sosyal yardım politikaları',
    effects: {
      metrics: { localOrganization: 5, regionalInfluence: 4, youthReach: -3, mediaPower: -2 },
    },
  },
  {
    id: 'liberal-economist',
    name: 'Liberal Ekonomici',
    description: 'Serbest piyasa, girişimcilik, düşük vergi, yatırım ve ekonomik büyüme.',
    advantages: ['İş dünyası desteği güçlü', 'Bağış toplama kapasitesi yüksek'],
    disadvantages: ['Düşük gelirli seçmenle bağ kurması zor', 'Ekonomik krizlerde kopuk algısı'],
    playStyle: 'Para gücü, profesyonel kampanya, medya, şehirli merkez seçmen',
    effects: {
      metrics: { financialSustainability: 6, policyCredibility: 3, socialGroupReach: -4 },
      resources: { money: 20, reputation: -3 },
    },
  },
  {
    id: 'green-localist',
    name: 'Yeşil / Yerelci',
    description: 'Çevre, şehir hakkı, yerel demokrasi, sürdürülebilir kalkınma ve tarım.',
    advantages: ['Genç ve çevreci seçmende güçlü', 'Belediye kampanyalarında avantaj'],
    disadvantages: ['Ulusal güvenlik gündeminde zayıf algı', 'Kitle partisine dönüşmesi zor'],
    playStyle: 'Yerel seçim başarısı, çevre ve şehircilik politikaları',
    effects: {
      metrics: { localOrganization: 4, youthReach: 3, mediaPower: -2, crisisManagement: -2 },
    },
  },
  {
    id: 'populist-radical',
    name: 'Popülist Değişimci',
    description: 'Mevcut düzene sert muhalefet, elit karşıtı söylem, hızlı değişim vaadi.',
    advantages: ['Protest seçmende hızlı yükselir', 'Skandal dönemlerinde oy sıçraması'],
    disadvantages: ['Güven düşük başlar', 'Hatalı söylemler büyük kriz yaratabilir'],
    playStyle: 'Agresif muhalefet, medya çıkışları, hızlı büyüme ama yüksek risk',
    effects: {
      metrics: { campaignVisibility: 6, mediaPower: 4, leaderTrust: -6, policyCredibility: -4 },
      resources: { reputation: -8, energy: 10 },
    },
  },
];

export const leadershipOptions: LeadershipOption[] = [
  {
    id: 'charismatic',
    name: 'Karizmatik Lider',
    description: 'Kitleleri etkileyen, meydanlarda ve kameralar karşısında güçlü bir lider.',
    advantages: ['Miting etkisi artar', 'Medya çıkışları daha etkili', 'Kriz anında tabanı mobilize eder'],
    disadvantages: ['Parti lidere bağımlı', 'Lider skandalı büyük güven kaybı'],
    bonusSummary: 'Medya +10, görünürlük +10, örgüt -5',
    effects: { metrics: { mediaPower: 10, campaignVisibility: 10, localOrganization: -5 } },
  },
  {
    id: 'organizer',
    name: 'Teşkilatçı Lider',
    description: 'Sahada güçlü, örgüt kurmayı bilen, il/ilçe yapılanmasını büyüten lider.',
    advantages: ['Teşkilat maliyeti düşer', 'Gönüllü kazanımı artar', 'Yerel seçim performansı güçlenir'],
    disadvantages: ['Medya görünürlüğü zayıf', 'Ulusal gündem yaratmakta zorlanabilir'],
    bonusSummary: 'Gönüllü +10%, medya -5',
    effects: {
      metrics: { localOrganization: 8, mediaPower: -5 },
      resources: { volunteers: 10, organizationCapacity: 8 },
    },
  },
  {
    id: 'technocrat',
    name: 'Teknokrat Lider',
    description: 'Ekonomi, hukuk, yönetim ve uzmanlık diliyle konuşan ciddi bir lider.',
    advantages: ['Güven yüksek başlar', 'Ekonomi ve kriz yönetiminde ikna gücü yüksek'],
    disadvantages: ['Duygusal mobilizasyon zayıf', 'Genç seçmende heyecan yaratmakta zorlanır'],
    bonusSummary: 'Güven +10, ekonomi gündemi +10, miting -5',
    effects: {
      metrics: { leaderTrust: 10, financialSustainability: 10, campaignVisibility: -5 },
      resources: { reputation: 8 },
    },
  },
  {
    id: 'populist',
    name: 'Popülist Lider',
    description: 'Halkın öfkesini ve değişim arzusunu hızlıca politik güce dönüştüren lider.',
    advantages: ['Skandal dönemlerinde hızlı oy kazanır', 'Protest seçmende güçlü'],
    disadvantages: ['Güven kırılgan', 'Yanlış hamlelerde büyük itibar kaybı'],
    bonusSummary: 'Kriz oy kazanımı +15, protest +10, güven -10',
    effects: {
      metrics: { crisisManagement: 5, campaignVisibility: 8, leaderTrust: -10, policyCredibility: -3 },
    },
  },
  {
    id: 'conciliator',
    name: 'Uzlaşmacı Lider',
    description: 'Farklı kesimleri bir araya getirmeye çalışan, ittifak siyasetinde güçlü lider.',
    advantages: ['İttifak kurmak kolaylaşır', 'Merkez seçmende güven yaratır'],
    disadvantages: ['Sert muhalefet zor', 'Radikal taban heyecanı düşük'],
    bonusSummary: 'Merkez güven +10, protest -5',
    effects: {
      metrics: { leaderTrust: 8, policyCredibility: 6, campaignVisibility: -3 },
    },
  },
  {
    id: 'ideological',
    name: 'İdeolojik Lider',
    description: 'Net çizgisi olan, taviz vermeyen, sadık taban inşa eden lider.',
    advantages: ['Parti tabanı çok sadık', 'Parti içi uyum yüksek'],
    disadvantages: ['Merkez seçmene açılması zor', 'İttifak kurmak maliyetli'],
    bonusSummary: 'Taban sadakati +15, merkez erişim -10',
    effects: {
      metrics: { socialGroupReach: 5, policyCredibility: 4, leaderTrust: -4, regionalInfluence: -3 },
      resources: { volunteers: 6 },
    },
  },
  {
    id: 'digital',
    name: 'Genç / Dijital Lider',
    description: 'Sosyal medya, gençlik hareketleri ve dijital kampanyalarla öne çıkar.',
    advantages: ['Sosyal medya kampanyaları etkili', 'Genç seçmende güçlü'],
    disadvantages: ['Yaşlı seçmende zayıf', 'Ciddiyet algısı düşük başlayabilir'],
    bonusSummary: 'Sosyal medya +15, genç +10, yaşlı güven -5',
    effects: {
      metrics: { mediaPower: 12, youthReach: 10, leaderTrust: -5 },
    },
  },
  {
    id: 'local',
    name: 'Yerel Halk Lideri',
    description: 'Halkla birebir temas, esnaf ziyareti ve mahalle toplantısında çok etkilidir.',
    advantages: ['Yerel seçim için güçlü', 'Küçük şehirlerde hızlı güven kazanır'],
    disadvantages: ['Ulusal kampanyada zorlanabilir', 'Büyükşehirlerde görünürlük sorunu'],
    bonusSummary: 'Yerel güven +15, mahalle +10, ulusal medya -10',
    effects: {
      metrics: { regionalInfluence: 10, localOrganization: 8, mediaPower: -8, campaignVisibility: -4 },
    },
  },
];

export function getIdeologyById(id: IdeologyId): IdeologyOption {
  const option = ideologyOptions.find((item) => item.id === id);
  if (!option) throw new Error(`İdeoloji bulunamadı: ${id}`);
  return option;
}

export function getLeadershipById(id: LeadershipStyleId): LeadershipOption {
  const option = leadershipOptions.find((item) => item.id === id);
  if (!option) throw new Error(`Liderlik tarzı bulunamadı: ${id}`);
  return option;
}
