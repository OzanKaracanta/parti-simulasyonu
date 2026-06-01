/**
 * Bölgeye özel gündem havuzu — Faz 1: bölge başına 3 exclusive olay.
 * Master dokümandaki bölgesel notlardan türetildi.
 */

import { CATEGORY_DEFAULT_POLICY_TOPIC } from './politicalIdentity';
import { CATEGORY_DEFAULT_SEGMENTS } from './segments';
import type {
  ActionCategory,
  PolicyTopicId,
  RegionId,
  SegmentId,
  WeeklyEventType,
} from '../types/game';

export interface RegionalEventDefinition {
  id: string;
  title: string;
  description: string;
  type: WeeklyEventType;
  affectedCategory: ActionCategory;
  affectedSegments?: SegmentId[];
  policyTopic?: PolicyTopicId;
  regionIds: RegionId[];
  recommendedActionIds?: string[];
  regionalCopy?: Partial<Record<RegionId, { title: string; description: string }>>;
}

function defineRegionalEvent(
  event: Omit<RegionalEventDefinition, 'affectedSegments' | 'policyTopic'> & {
    affectedSegments?: SegmentId[];
    policyTopic?: PolicyTopicId;
  },
): RegionalEventDefinition {
  return {
    ...event,
    affectedSegments:
      event.affectedSegments ?? CATEGORY_DEFAULT_SEGMENTS[event.affectedCategory],
    policyTopic: event.policyTopic ?? CATEGORY_DEFAULT_POLICY_TOPIC[event.affectedCategory],
  };
}

export const regionalEventDefinitions: RegionalEventDefinition[] = [
  // —— Marmara ——
  defineRegionalEvent({
    id: 'reg-marmara-deprem-alani',
    title: 'Deprem Toplanma Alanı Tartışması',
    description:
      'Marmara\'da bir ilçede deprem toplanma alanının ticari projeye açıldığı iddiası tepki çekti. Uzmanlar afet hazırlığının gündemde kalması gerektiğini söylüyor.',
    type: 'crisis',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'environment',
    affectedSegments: ['youth', 'workers', 'retirees'],
    regionIds: ['marmara'],
    recommendedActionIds: ['local-press-visit', 'video-address'],
  }),
  defineRegionalEvent({
    id: 'reg-marmara-kanal-trafik',
    title: 'Büyükşehir Trafik ve Ulaşım Krizi',
    description:
      'İstanbul ve çevresinde toplu taşıma zamları ve trafik sıkışıklığı gündeme damgasını vurdu. Gençler ve işçiler ulaşım maliyetinden şikâyet ederken esnaf teslimat gecikmelerinden etkileniyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'localGovernance',
    affectedSegments: ['workers', 'youth', 'merchants'],
    regionIds: ['marmara'],
    recommendedActionIds: ['local-meeting', 'social-media-campaign'],
  }),
  defineRegionalEvent({
    id: 'reg-marmara-gocmen-entegrasyon',
    title: 'Kent Göçü ve Konut Baskısı',
    description:
      'Marmara\'ya yoğun göç devam ederken kira ve konut arzı tartışması büyüdü. Kentli seçmen çözüm beklerken, mahalle düzeyinde gerilim hissediliyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['workers', 'youth', 'merchants'],
    regionIds: ['marmara'],
    recommendedActionIds: ['local-meeting', 'merchant-visit'],
  }),

  // —— Ege ——
  defineRegionalEvent({
    id: 'reg-ege-turizm-sezonu',
    title: 'Turizm Sezonu Başlangıcı',
    description:
      'Ege kıyılarında sezon erken ve güçlü açıldı. Otelciler ve esnaf memnun; sezonluk çalışanlar ise ücret ve barınma koşullarının da konuşulmasını istiyor.',
    type: 'opportunity',
    affectedCategory: 'fundraising',
    policyTopic: 'economy',
    affectedSegments: ['tourism', 'merchants', 'workers'],
    regionIds: ['ege'],
    recommendedActionIds: ['merchant-visit', 'local-press-visit'],
  }),
  defineRegionalEvent({
    id: 'reg-ege-balikci-limani',
    title: 'Balıkçı Limanı Bakım Sorunu',
    description:
      'Ege\'de bir kıyı ilçesinde balıkçılar liman bakımının ihmal edildiğini söylüyor. Turizm işletmeleri alanın düzenlenmesi gerektiğini savunuyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'economy',
    affectedSegments: ['fisherfolk', 'merchants', 'tourism'],
    regionIds: ['ege'],
    recommendedActionIds: ['local-meeting', 'local-press-visit'],
  }),
  defineRegionalEvent({
    id: 'reg-ege-cevre-imar',
    title: 'Kıyı İmar Planı Tartışması',
    description:
      'Ege\'de bir sahil kasabasında imar planı değişikliği tartışma yarattı. Çevre grupları ve yerel esnaf farklı öncelikler savunuyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'environment',
    affectedSegments: ['youth', 'merchants', 'tourism'],
    regionIds: ['ege'],
    recommendedActionIds: ['local-press-visit', 'video-address'],
  }),

  // —— İç Anadolu ——
  defineRegionalEvent({
    id: 'reg-ic-anadolu-kuraklik',
    title: 'Kuraklık Alarmı',
    description:
      'İç Anadolu\'da kuraklık verileri tarımsal üretim için risk sinyali verdi. Çiftçiler destek isterken uzmanlar su politikası çağrısı yapıyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'workers', 'industry'],
    regionIds: ['ic-anadolu'],
    recommendedActionIds: ['local-meeting', 'merchant-visit'],
  }),
  defineRegionalEvent({
    id: 'reg-ic-anadolu-sanayi-kesinti',
    title: 'Sanayi Bölgesi Elektrik Kesintisi',
    description:
      'Organize sanayi bölgesinde uzun elektrik kesintileri üretimi aksattı. Sanayiciler altyapı yatırımı isterken işçiler vardiya kaybından şikâyet ediyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['workers', 'industry', 'merchants'],
    regionIds: ['ic-anadolu'],
    recommendedActionIds: ['local-meeting', 'volunteer-training'],
  }),
  defineRegionalEvent({
    id: 'reg-ic-anadolu-koy-yolu',
    title: 'Kırsal Yol ve Market Erişimi',
    description:
      'İç Anadolu\'da birkaç köyün ana yola bağlantısının kötüleşmesi gündem oldu. Emekliler ve çiftçiler temel hizmetlere erişimden yakınıyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['farmers', 'retirees'],
    regionIds: ['ic-anadolu'],
    recommendedActionIds: ['local-meeting', 'regional-tour'],
  }),

  // —— Akdeniz ——
  defineRegionalEvent({
    id: 'reg-akdeniz-turizm-firsati',
    title: 'Erken Turizm Sezonu',
    description:
      'Akdeniz\'de otel doluluk oranları beklentinin üzerinde. Esnaf sezonu verimli geçirmek istiyor; sezonluk işçiler hak taleplerini öne çıkarıyor.',
    type: 'opportunity',
    affectedCategory: 'fundraising',
    policyTopic: 'economy',
    affectedSegments: ['tourism', 'merchants', 'workers'],
    regionIds: ['akdeniz'],
    recommendedActionIds: ['merchant-visit', 'small-donation-drive'],
  }),
  defineRegionalEvent({
    id: 'reg-akdeniz-sera-uretim',
    title: 'Sera Üreticisi Maliyet Baskısı',
    description:
      'Akdeniz\'de sera üreticileri enerji ve gübre maliyetlerinin kârlılığı zorladığını söylüyor. Tüccarlar fiyat dengesini korumak istiyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'merchants'],
    regionIds: ['akdeniz'],
    recommendedActionIds: ['merchant-visit', 'local-meeting'],
  }),
  defineRegionalEvent({
    id: 'reg-akdeniz-gocmen-tarim',
    title: 'Mevsimlik Tarım İşçiliği',
    description:
      'Akdeniz\'de hasat döneminde mevsimlik işçi koşulları tartışmaya açıldı. Üreticiler iş gücü sıkıntısını, sendikalar hakları savunuyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'labor',
    affectedSegments: ['farmers', 'workers'],
    regionIds: ['akdeniz'],
    recommendedActionIds: ['local-meeting', 'volunteer-training'],
  }),

  // —— Karadeniz ——
  defineRegionalEvent({
    id: 'reg-karadeniz-findik',
    title: 'Fındık Alım Fiyatı Tepkisi',
    description:
      'Karadeniz\'de üreticiler açıklanan alım fiyatının maliyetleri karşılamadığını savunuyor. Tüccarlar piyasa dengesinin bozulmaması gerektiğini belirtiyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'merchants'],
    regionIds: ['karadeniz'],
    recommendedActionIds: ['local-meeting', 'local-press-visit'],
  }),
  defineRegionalEvent({
    id: 'reg-karadeniz-heyelan',
    title: 'Heyelan ve Altyapı Hasarı',
    description:
      'Karadeniz\'de şiddetli yağış sonrası heyelan bir köy yolunu kapattı. Yerel halk hızlı müdahale ve kalıcı altyapı çözümü bekliyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'environment',
    affectedSegments: ['farmers', 'retirees', 'workers'],
    regionIds: ['karadeniz'],
    recommendedActionIds: ['local-meeting', 'regional-tour'],
  }),
  defineRegionalEvent({
    id: 'reg-karadeniz-balikci',
    title: 'Balıkçı Kooperatifi Sorunu',
    description:
      'Karadeniz\'de balıkçı kooperatifleri av yasağı döneminde gelir kaybı yaşadıklarını söylüyor. Kıyı esnafı destek paketi talep ediyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'economy',
    affectedSegments: ['fisherfolk', 'merchants'],
    regionIds: ['karadeniz'],
    recommendedActionIds: ['local-meeting', 'merchant-visit'],
  }),

  // —— Doğu Anadolu ——
  defineRegionalEvent({
    id: 'reg-dogu-kis-ulastirma',
    title: 'Kış Koşullarında Ulaşım Krizi',
    description:
      'Doğu Anadolu\'da kar yağışı birçok ilçeyi yollarla bağlantısız bıraktı. Vatandaşlar temel ihtiyaç ve sağlık erişiminden endişe duyuyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'environment',
    affectedSegments: ['farmers', 'retirees', 'workers'],
    regionIds: ['dogu-anadolu'],
    recommendedActionIds: ['regional-tour', 'local-meeting'],
  }),
  defineRegionalEvent({
    id: 'reg-dogu-goc-geridonus',
    title: 'Kırsal Göç ve Boşalan Köyler',
    description:
      'Doğu Anadolu\'da genç nüfusun kentlere göçü hız kesmiyor. Köy muhtarları tarım desteği ve istihdam projeleri talep ediyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['youth', 'farmers', 'retirees'],
    regionIds: ['dogu-anadolu'],
    recommendedActionIds: ['local-meeting', 'volunteer-training'],
  }),
  defineRegionalEvent({
    id: 'reg-dogu-hayvancilik',
    title: 'Hayvancılık Destekleri',
    description:
      'Doğu Anadolu\'da besiciler yem maliyetlerinin sürdürülebilir olmadığını söylüyor. Yerel esnaf ve kooperatifler destek çağrısı yapıyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'merchants'],
    regionIds: ['dogu-anadolu'],
    recommendedActionIds: ['merchant-visit', 'local-meeting'],
  }),

  // —— Güneydoğu Anadolu ——
  defineRegionalEvent({
    id: 'reg-guneydogu-sulama',
    title: 'Sulama Projesi Gecikmesi',
    description:
      'Güneydoğu Anadolu\'da bir sulama projesinin gecikmesi çiftçileri endişelendirdi. Tarım arazilerinde verim kaybı riski konuşuluyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'workers'],
    regionIds: ['guneydogu-anadolu'],
    recommendedActionIds: ['local-meeting', 'regional-tour'],
  }),
  defineRegionalEvent({
    id: 'reg-guneydogu-genc-is',
    title: 'Genç İstihdam Buluşması Talebi',
    description:
      'Güneydoğu Anadolu\'da gençler iş ve staj fırsatlarının yetersiz kaldığını söylüyor. Üniversite öğrencileri yerel yatırım çağrısı yapıyor.',
    type: 'opportunity',
    affectedCategory: 'socialGroups',
    policyTopic: 'labor',
    affectedSegments: ['youth', 'workers'],
    regionIds: ['guneydogu-anadolu'],
    recommendedActionIds: ['volunteer-training', 'local-meeting'],
  }),
  defineRegionalEvent({
    id: 'reg-guneydogu-kultur-etkinlik',
    title: 'Kültürel Etkinlik ve Güvenlik Tartışması',
    description:
      'Güneydoğu Anadolu\'da bir kültür festivalinin güvenlik gerekçesiyle sınırlandırılması tartışma yarattı. Gençler katılım hakkını savunuyor.',
    type: 'agenda',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'socialWelfare',
    affectedSegments: ['youth', 'tourism', 'merchants'],
    regionIds: ['guneydogu-anadolu'],
    recommendedActionIds: ['local-press-visit', 'video-address'],
  }),
];

export function getRegionalEventsForRegion(regionId: RegionId): RegionalEventDefinition[] {
  return regionalEventDefinitions.filter((event) => event.regionIds.includes(regionId));
}

export function getRegionalEventById(id: string): RegionalEventDefinition | undefined {
  return regionalEventDefinitions.find((event) => event.id === id);
}
