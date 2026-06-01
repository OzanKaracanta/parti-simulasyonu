/** Gölge yankı tanımları — docs/11_BACKLASH_SYSTEM.md */

import type { ActionCategory, MetricKey, PoliticalSegmentEffect, ResponseTone, SegmentId } from '../types/game';

export type BacklashRuleId =
  | 'crisis_measured_no_actions'
  | 'crisis_measured_no_recommended_action'
  | 'crisis_passive_or_ignored'
  | 'opportunity_passive_or_ignored'
  | 'bold_success_rival_win'
  | 'bold_success_identity_clash'
  | 'partial_high_consistency_crisis'
  | 'main_response_inconsistency'
  | 'action_misaligned'
  | 'crisis_pr_heavy_actions'
  | 'bold_success_no_actions'
  | 'sub_many_bold'
  | 'sub_many_silent_crisis'
  | 'high_trust_low_media'
  | 'high_crisis_mgmt_low_visibility';

export interface BacklashContentTrigger {
  sourceEventId: string;
  sourceResponseIds?: string[];
  sourceResponseTones?: ResponseTone[];
  requireNoActions?: boolean;
}

export interface BacklashDefinition {
  id: string;
  kind: 'rule' | 'content';
  rule?: BacklashRuleId;
  content?: BacklashContentTrigger;
  priority: number;
  weight: number;
  cooldownWeeks: number;
  storyFlag?: string;
  headline: string;
  bodyTemplate: string;
  effectSummary: string;
  segmentEffects: Partial<Record<SegmentId, number>>;
  politicalSegmentEffects?: PoliticalSegmentEffect[];
  metricEffects?: Partial<Record<MetricKey, number>>;
  hintTemplate?: string;
}

export const BACKLASH_FIRST_WEEK = 5;
export const BACKLASH_FALLBACK_ROLL = 0.45;

export const backlashDefinitions: BacklashDefinition[] = [
  // --- Kurallar ---
  {
    id: 'BL-01',
    kind: 'rule',
    rule: 'crisis_measured_no_actions',
    priority: 90,
    weight: 1,
    cooldownWeeks: 3,
    headline: 'Kriz masasında değil, kulisde',
    bodyTemplate:
      '“{eventTitle}” için verdiğin ölçülü açıklama teknik olarak tutarlı bulundu; ancak o hafta sahada görünür bir hamlen olmadı. Sosyal medyada “parti lideri kriz anında ortalıkta değil” tartışması hızla yayıldı.',
    effectSummary: 'Genç ve emekçi segmentlerde güven kaybı; görünürlük düşer.',
    segmentEffects: { youth: -1, workers: -1 },
    metricEffects: { campaignVisibility: -3, mediaPower: -2 },
    hintTemplate: 'Sahaya taşınmayan ölçülü mesaj merak uyandırıyor.',
  },
  {
    id: 'BL-02',
    kind: 'rule',
    rule: 'crisis_measured_no_recommended_action',
    priority: 75,
    weight: 0.9,
    cooldownWeeks: 3,
    headline: 'Doğru cümle, yanlış sahne',
    bodyTemplate:
      '“{responseLabel}” mesajın dengeli kaldı; fakat önerilen saha veya iletişim adımlarını atladın. Rakip partiler “sadece basın bülteni” diyerek seni pasif konuma çekti.',
    effectSummary: 'Etkilenen segmentlerde −1; medya gücü hafif düşer.',
    segmentEffects: { workers: -1, retirees: -1 },
    metricEffects: { mediaPower: -2 },
    hintTemplate: 'Saha planı boş kaldı; yerel örgüt “merkez konuştu, biz yapmadık” diyor.',
  },
  {
    id: 'BL-03',
    kind: 'rule',
    rule: 'crisis_passive_or_ignored',
    priority: 85,
    weight: 1,
    cooldownWeeks: 2,
    headline: 'Sessizlik manşet oldu',
    bodyTemplate:
      '“{eventTitle}” gündeminde net bir duruş sergilemedin. Sessizlik zayıflık olarak yorumlandı; muhalif taban seni “kaçınan” olarak çerçeveledi.',
    effectSummary: 'Emekli ve kamu çalışanı segmentlerinde −2; muhafazakâr tabanda güven sarsıntısı.',
    segmentEffects: { retirees: -2, civilServants: -2 },
    politicalSegmentEffects: [{ segmentId: 'conservative', delta: -1 }],
    metricEffects: { leaderTrust: -2 },
    hintTemplate: 'Anket odaklarında “parti ne diyor?” sorusu boş kaldı.',
  },
  {
    id: 'BL-04',
    kind: 'rule',
    rule: 'opportunity_passive_or_ignored',
    priority: 80,
    weight: 0.95,
    cooldownWeeks: 3,
    headline: 'Fırsat penceresi kapandı',
    bodyTemplate:
      '“{eventTitle}” senin için olumlu bir gündem penceresiydi; düşük profilli kaldın. Destekçiler “neden konuşmadı?” derken rakipler boş alanı doldurdu.',
    effectSummary: 'Görünürlük −3; momentum kaybı.',
    segmentEffects: { youth: -1 },
    metricEffects: { campaignVisibility: -3 },
    hintTemplate: 'Fırsat haftası kapanmadan medya ilgisi başka isimlere kaydı.',
  },
  {
    id: 'BL-05',
    kind: 'rule',
    rule: 'bold_success_rival_win',
    priority: 88,
    weight: 1,
    cooldownWeeks: 2,
    headline: 'Sen konuştun, o kazandı',
    bodyTemplate:
      '“{responseLabel}” mesajın destekçi tabanda karşılık buldu; ancak rakip aynı gün daha görünür bir karşı anlatı ile gündemi yeniden çerçeveledi. Manşetlerde ikinci plana düştün.',
    effectSummary: 'Geniş kitlede “kaybeden hafta” algısı; rakip tabanında mesafe.',
    segmentEffects: { youth: -1, workers: -1 },
    politicalSegmentEffects: [
      { segmentId: 'nationalist', delta: -1 },
      { segmentId: 'conservative', delta: -1 },
    ],
    hintTemplate: 'Rakip medya turunu aynı gün planlamış görünüyor.',
  },
  {
    id: 'BL-06',
    kind: 'rule',
    rule: 'bold_success_identity_clash',
    priority: 82,
    weight: 0.85,
    cooldownWeeks: 3,
    headline: 'Sert konuştun, inandıramadın',
    bodyTemplate:
      'Cesur duruşun dikkat çekti; fakat parti çizgisi ve liderlik tarzınla uyumsuz bulundu. “Taktiksel sertleşme” yorumları parti içinde ve medyada yayıldı.',
    effectSummary: 'Politika güvenilirliği ve iki segmentte kayıp; muhafazakâr tabanda soğuma.',
    segmentEffects: { civilServants: -1, merchants: -1 },
    politicalSegmentEffects: [
      { segmentId: 'conservative', delta: -1 },
      { segmentId: 'liberal', delta: -1 },
    ],
    metricEffects: { policyCredibility: -2 },
    hintTemplate: 'Genel merkez, mesajın “tek seferlik” olduğunu telkin etmeye çalışıyor.',
  },
  {
    id: 'BL-07',
    kind: 'rule',
    rule: 'partial_high_consistency_crisis',
    priority: 70,
    weight: 0.75,
    cooldownWeeks: 4,
    headline: 'Teknik doğru, siyasi soğuk',
    bodyTemplate:
      'Kriz haftasında ölçülü çizgide kaldın; tutarlılığın yüksek. Kamuoyu bunu “soğuk ve mesafeli yönetim” olarak okudu — özellikle dar gelirli kesimlerde.',
    effectSummary: 'Emekçi ve emekli −1; görünürlük −2.',
    segmentEffects: { workers: -1, retirees: -1 },
    metricEffects: { campaignVisibility: -2, crisisManagement: 1 },
    hintTemplate: '“Çok kontrollü, az insani” yorumları artıyor.',
  },
  {
    id: 'BL-08',
    kind: 'rule',
    rule: 'main_response_inconsistency',
    priority: 78,
    weight: 0.9,
    cooldownWeeks: 3,
    headline: 'Dünkü sen, bugünkü sen',
    bodyTemplate:
      '“{eventTitle}” konusundaki bu haftaki mesajın, önceki haftalardaki duruşunla çelişti. Medya karşılaştırmalı haber formatına geçti; güvenilirlik tartışması açıldı.',
    effectSummary: 'Politika güvenilirliği −3.',
    segmentEffects: { civilServants: -1 },
    metricEffects: { policyCredibility: -3 },
    hintTemplate: 'Arşiv videoların editöryal “montaj” haberine dönüşüyor.',
  },
  {
    id: 'BL-10',
    kind: 'rule',
    rule: 'action_misaligned',
    priority: 86,
    weight: 1,
    cooldownWeeks: 2,
    headline: 'Saha ile söylem ayrıldı',
    bodyTemplate:
      'Verdiğin siyasi mesajla aynı hafta yürüttüğün operasyonlar farklı bir hikâye anlattı. “Parti ne istiyor belli değil” yorumu ulusal basına taşındı.',
    effectSummary: 'Hedef segmentlerde −1; itibar −2.',
    segmentEffects: { youth: -1, workers: -1 },
    metricEffects: { mediaPower: -1 },
    hintTemplate: 'Saha ekipleri, merkez mesajıyla sahayı hizalamakta zorlanıyor.',
  },
  {
    id: 'BL-11',
    kind: 'rule',
    rule: 'crisis_pr_heavy_actions',
    priority: 72,
    weight: 0.7,
    cooldownWeeks: 4,
    headline: 'Kriz PR’ı gibi göründün',
    bodyTemplate:
      'Sosyal ve ekonomik kriz haftasında sahayı ziyaret veya yerel temas yerine ağırlıklı olarak medya veya finansman odaklı operasyon seçtin. “Kriz turizmi” eleştirisi gündeme geldi.',
    effectSummary: 'Sosyal segmentler −1; yerel örgüt −2.',
    segmentEffects: { workers: -1, retirees: -1 },
    metricEffects: { localOrganization: -2 },
    hintTemplate: 'Yerel yöneticiler, “fotoğraf kampanyası” diyalogunu başlattı.',
  },
  {
    id: 'BL-12',
    kind: 'rule',
    rule: 'bold_success_no_actions',
    priority: 84,
    weight: 0.95,
    cooldownWeeks: 3,
    headline: 'Konuştun, yapmadın',
    bodyTemplate:
      '“{responseLabel}” ile güçlü bir söylem kurdun; aynı hafta bunu taşıyacak saha veya iletişim adımı atmadın. Rakipler “boş vaat” narratifini başlattı.',
    effectSummary: 'Genç ve işçi −2; lider güveni −2.',
    segmentEffects: { youth: -2, workers: -2 },
    metricEffects: { leaderTrust: -2 },
    hintTemplate: 'Destekçi taban “sözünü tut” hashtag’lerini deniyor.',
  },
  {
    id: 'BL-20',
    kind: 'rule',
    rule: 'sub_many_bold',
    priority: 76,
    weight: 0.8,
    cooldownWeeks: 3,
    headline: 'Her yere aynı anda bağırdın',
    bodyTemplate:
      'Aynı hafta birden fazla alt gündeme agresif mesaj verdin. Ulusal ana mesajın dağınıklaştı; “parti her konuda kutuplaşıyor” çerçevesi güçlendi.',
    effectSummary: 'Üç segmentte çapraz gerilim; milliyetçi ve muhafazakâr tabanda yorgunluk.',
    segmentEffects: { youth: -1, merchants: -1, civilServants: -1 },
    politicalSegmentEffects: [
      { segmentId: 'nationalist', delta: -1 },
      { segmentId: 'conservative', delta: -1 },
    ],
    hintTemplate: 'Medya analistleri “mesaj disiplini” uyarısı yaptı.',
  },
  {
    id: 'BL-21',
    kind: 'rule',
    rule: 'sub_many_silent_crisis',
    priority: 68,
    weight: 0.65,
    cooldownWeeks: 4,
    headline: 'Alt sesler yükseldi',
    bodyTemplate:
      'Ulusal kriz gündeminde ana mesaj verdin; alt gündemlerin çoğuna ses çıkarmadın. Yerel ve segment bazlı tartışmalar “parti ilgisiz” yorumuna döndü.',
    effectSummary: 'Sessiz alt gündem segmentlerinde −1.',
    segmentEffects: { workers: -1, farmers: -1 },
    hintTemplate: 'Bölgesel basın, “merkez dinlemiyor” klişesini kullanıyor.',
  },
  {
    id: 'BL-30',
    kind: 'rule',
    rule: 'high_trust_low_media',
    priority: 74,
    weight: 0.8,
    cooldownWeeks: 4,
    headline: 'Güvenilir ama ekranda yok',
    bodyTemplate:
      'Lider güvenin yüksek; medya erişimin düşük. Ölçülü haftanın ardından “parti iyi yönetiyor ama anlatamıyor” klişesi sabitlendi — rakipler görünürlük alanını doldurdu.',
    effectSummary: 'Görünürlük −3; genç −1.',
    segmentEffects: { youth: -1 },
    metricEffects: { campaignVisibility: -3 },
    hintTemplate: 'Dijital etkileşim rakiplerin gerisinde kaldı.',
  },
  {
    id: 'BL-31',
    kind: 'rule',
    rule: 'high_crisis_mgmt_low_visibility',
    priority: 71,
    weight: 0.75,
    cooldownWeeks: 4,
    headline: 'İşi yaptın, anlatamadın',
    bodyTemplate:
      'Kriz yönetimi kapasiten yüksek görünüyor; kamuoyuna ise düşük görünürlükle ulaştın. Teknik başarı siyasi kazanıma dönüşmedi.',
    effectSummary: 'Kriz yönetimi içeride +1; görünürlük −3.',
    segmentEffects: {},
    metricEffects: { crisisManagement: 1, campaignVisibility: -3 },
    hintTemplate: 'Uzman yorumları “arka planda kalan lider” diyor.',
  },

  // --- Deterministik içerik ---
  {
    id: 'BL-C01',
    kind: 'content',
    content: {
      sourceEventId: 'pazar-fiyatlari-krizi',
      sourceResponseIds: ['pazar-fiyatlari-denetim-ve-uretim'],
      requireNoActions: true,
    },
    priority: 92,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c01',
    headline: 'Pazar yolu boş kaldı',
    bodyTemplate:
      'Enflasyon krizinde ölçülü ekonomi mesajı seçtin; pazar ve esnaf ziyareti yapılmadı. “Dar gelirliyle empati yok” başlıkları emekli ve esnaf segmentlerinde yankılandı.',
    effectSummary: 'Emekçi, emekli ve esnaf −1.',
    segmentEffects: { workers: -1, retirees: -1, merchants: -1 },
    hintTemplate: 'Pazar ziyareti planlanmadı; yerel örgüt endişeli.',
  },
  {
    id: 'BL-C02',
    kind: 'content',
    content: {
      sourceEventId: 'emekli-maasi-tepkisi',
      sourceResponseTones: ['measured'],
      requireNoActions: true,
    },
    priority: 91,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c02',
    headline: 'Meydan sende değildi',
    bodyTemplate:
      'Emekli tepkisine dengeli bir dil kullandın; sahada görünür destek göstermedin. Dernekler “açıklama yetmez” diyerek medyayı besledi.',
    effectSummary: 'Emekliler −2.',
    segmentEffects: { retirees: -2 },
    hintTemplate: 'Emekli dernekleri saha programı bekliyor.',
  },
  {
    id: 'BL-C03',
    kind: 'content',
    content: {
      sourceEventId: 'belediye-ihale-dosyasi',
      sourceResponseIds: ['ihale-dosyasi-hukuki-surec'],
    },
    priority: 88,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c03',
    headline: 'Şeffaflık süreçte kayboldu',
    bodyTemplate:
      'Yolsuzluk iddiasına “süreç işlesin” çerçevesiyle yanıt verdin. Muhalefet bunu “soruşturmayı geciktirme” olarak yorumladı; güvenilirlik tartışması büyüdü.',
    effectSummary: 'Kamu çalışanı −1; politika güvenilirliği −3; liberal tabanda hayal kırıklığı.',
    segmentEffects: { civilServants: -1 },
    politicalSegmentEffects: [{ segmentId: 'liberal', delta: -1 }],
    metricEffects: { policyCredibility: -3 },
    hintTemplate: 'Hukuki süreç vurgusu medyada “kaçış” olarak okunuyor.',
  },
  {
    id: 'BL-C04',
    kind: 'content',
    content: {
      sourceEventId: 'afet-yardim-organizasyonu',
      sourceResponseIds: ['afet-yardim-koordinasyon'],
      requireNoActions: true,
    },
    priority: 90,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c04',
    headline: 'Koordinasyon masası, saha değil',
    bodyTemplate:
      'Afet gündeminde koordinasyon merkezi vurgusu yaptın; sahaya iniş yapılmadı. “Kriz masası liderliği” eleştirisi viral oldu.',
    effectSummary: 'Saha segmentlerinde −2; lider güveni −2.',
    segmentEffects: { workers: -2, retirees: -2, farmers: -2 },
    metricEffects: { leaderTrust: -2 },
    hintTemplate: 'Yardım koordinasyonu masadan yönetildi; saha bekleniyordu.',
  },
  {
    id: 'BL-C05',
    kind: 'content',
    content: {
      sourceEventId: 'parti-ici-liste-krizi',
      sourceResponseIds: ['liste-krizi-gormezden-gel'],
    },
    priority: 87,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c05',
    headline: 'İç ses dışarı taştı',
    bodyTemplate:
      'Parti içi liste krizine müdahale etmedin. Disiplin krizi medyaya sızdı; “kontrolsüz parti” imajı güçlendi.',
    effectSummary: 'Kamu çalışanı −2; yerel örgüt −3.',
    segmentEffects: { civilServants: -2 },
    metricEffects: { localOrganization: -3 },
    hintTemplate: 'Teşkilat içi memnuniyetsizlik medyaya sızmak üzere.',
  },
  {
    id: 'BL-C06',
    kind: 'content',
    content: {
      sourceEventId: 'rakip-lider-gaffi',
      sourceResponseIds: ['rakip-gaffi-ciddiyet', 'rakip-gaffi-uzak-dur'],
    },
    priority: 86,
    weight: 1,
    cooldownWeeks: 99,
    storyFlag: 'backlash-bl-c06',
    headline: 'Fırsatı ölçülülükle harcadın',
    bodyTemplate:
      'Rakip liderin hatasına düşük profilli veya ölçülü yanıt verdin; destekçilerin “neden saldırmadın?” baskısı, muhaliflerin “zayıf lider” narratifini aynı anda besledi.',
    effectSummary: 'Genç −1; görünürlük −2; halkçı tabanda “fırsat kaçtı” algısı.',
    segmentEffects: { youth: -1 },
    politicalSegmentEffects: [{ segmentId: 'populist', delta: -1 }],
    metricEffects: { campaignVisibility: -2 },
    hintTemplate: 'Rakip gaffi fırsatı tam kullanılmadı.',
  },
];

const PR_HEAVY_CATEGORIES: ActionCategory[] = ['mediaCommunication', 'fundraising'];
const SOCIAL_CATEGORIES: ActionCategory[] = ['socialGroups', 'localOrganization'];

export function isPrHeavyActionCategory(category: ActionCategory): boolean {
  return PR_HEAVY_CATEGORIES.includes(category);
}

export function isSocialEventCategory(category: ActionCategory): boolean {
  return SOCIAL_CATEGORIES.includes(category);
}
