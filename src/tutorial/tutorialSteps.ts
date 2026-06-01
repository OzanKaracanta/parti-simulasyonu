/** İlk 5 hafta — öğretici müfredat */

import type { TutorialWeekPlan } from './tutorialTypes';

export const TUTORIAL_LAST_WEEK = 5;

export const TUTORIAL_WEEK_PLANS: TutorialWeekPlan[] = [
  {
    week: 1,
    theme: 'Haftalık döngü',
    intro:
      'Her turda önce ulusal gündeme tepki verirsin, sonra istersen sahada operasyon seçersin ve turu bitirirsin. Kaynaklar bu tur için harcanır.',
    weekEndTip:
      'Tur bitti: Ana gündem söylemini belirledin; sonuçlar segment desteğine yansır. Gelecek turda yeni gündem kartları gelir.',
    steps: [
      {
        id: 'main_agenda',
        title: 'Ana gündeme tepki ver',
        description: 'Ulusal gündemde bir yanıt seç — turu bitirmek için zorunlu.',
        targetView: 'agenda-national',
        required: true,
      },
    ],
  },
  {
    week: 2,
    theme: 'Alt gündem ve slot',
    intro:
      'Alt gündemler segment odaklı ek konulardır. Her turda sınırlı sayıda slota mesaj verebilirsin; hepsine en iyi cevabı veremezsin.',
    weekEndTip:
      'Slot kullanmadığın alt gündemler sessiz kalır; rakip veya pasif etki hafta sonu raporunda görünebilir.',
    steps: [
      {
        id: 'sub_agenda',
        title: 'Bir alt gündeme mesaj ver',
        description: 'Alt Gündemler sayfasında en az bir karta tepki seç.',
        targetView: 'agenda-sub',
        required: true,
      },
    ],
  },
  {
    week: 3,
    theme: 'Radar gündem',
    intro:
      'Radar konuları henüz ulusal ana gündem değil. Bu tur doğrudan yanıt veremezsin; izlersin. Aynı eksende alt gündemle dolaylı yanıt verebilirsin.',
    weekEndTip:
      'Radar sessiz kalırsa rakip mesaj üretebilir veya konu önümüzdeki turda ana gündeme yükselir.',
    steps: [
      {
        id: 'radar_viewed',
        title: 'Radar kartlarını incele',
        description:
          'Ulusal Gündem sayfasında radar bölümünü oku — bu tur tepki butonu yoktur.',
        targetView: 'agenda-national',
        required: true,
      },
    ],
  },
  {
    week: 4,
    theme: 'Kampanya operasyonları',
    intro:
      'Gündem = söylem (seçimde enerji). Kampanya = para, enerji, gönüllü + koordinasyon kotası. Hafta sonu +22 ⚡ yenilenme.',
    weekEndTip:
      'Operasyonlar metrikleri ve bölgesel etkiyi doğrudan artırır; ana gündem tepkisiyle birlikte düşün.',
    steps: [
      {
        id: 'campaign_action',
        title: 'En az bir operasyon seç',
        description: 'Ulusal veya bölgesel kampanyadan bir kart seç ve planına ekle.',
        targetView: 'campaign-national',
        required: true,
      },
    ],
  },
  {
    week: 5,
    theme: 'Örgüt araçları',
    intro:
      'Merkez bölgenizde Genel Merkez ve İl Bürosu, iki komşuda da İl Bürosu kurulu; şimdi teşkilatı derinleştirirsin.',
    weekEndTip:
      'Kurulum maliyeti bu tur harcanır; bakım her tur devam eder. Dördüncü il bürosunu açmak seçime yeterlilik için kalan adımdır.',
    steps: [
      {
        id: 'org_investment',
        title: 'Teşkilatı genişlet',
        description:
          'Ev bölgende veya başka bir bölgede yeni araç kur ya da mevcut aracı yükselt (ör. Gönüllü Ağı 2. seviye, Mahalle Örgütü veya İl Bürosu).',
        targetView: 'organization-regional',
        required: true,
      },
    ],
  },
];

export function getTutorialWeekPlan(week: number): TutorialWeekPlan | null {
  return TUTORIAL_WEEK_PLANS.find((plan) => plan.week === week) ?? null;
}
