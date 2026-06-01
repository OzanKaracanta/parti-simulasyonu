/** Haftalık olay havuzu — docs/10_EVENT_CONTENT_MASTER.md (Bölüm 1) + zincir uyumlu legacy */

import { createWeeklyEventOutcomes } from './eventOutcomeTemplates';
import { createEventResponseOptions } from './eventResponseFactory';
import { getCustomEventResponses } from './customEventResponses';
import { CATEGORY_DEFAULT_POLICY_TOPIC } from './politicalIdentity';
import { CATEGORY_DEFAULT_SEGMENTS } from './segments';
import type { PolicyTopicId, SegmentId, WeeklyEvent } from '../types/game';

function defineEvent(
  event: Omit<WeeklyEvent, 'outcomes' | 'responseOptions' | 'affectedSegments' | 'policyTopic'> & {
    affectedSegments?: SegmentId[];
    policyTopic?: PolicyTopicId;
  },
): WeeklyEvent {
  const affectedSegments =
    event.affectedSegments ?? CATEGORY_DEFAULT_SEGMENTS[event.affectedCategory];
  const policyTopic =
    event.policyTopic ?? CATEGORY_DEFAULT_POLICY_TOPIC[event.affectedCategory];

  const responseOptions =
    getCustomEventResponses(event.id) ??
    createEventResponseOptions(
      event.type,
      event.title,
      event.affectedCategory,
      affectedSegments,
    );

  return {
    ...event,
    affectedSegments,
    policyTopic,
    responseOptions,
    outcomes: createWeeklyEventOutcomes(event.type, event.title),
  };
}

export const weeklyEvents: WeeklyEvent[] = [
  /** inspiration: Hayat pahalılığı, gıda enflasyonu, pazar ziyaretleri üzerinden yürüyen siyasal tartışmalar. | gamePurpose: Oyuncuyu emekçi ve emekli seçmen lehine güçlü mesaj vermek ile esnafı ürkütmeyecek ölçülü ekonomi dili kurmak arasında bırakır. | notes: Ana gündem için güçlü aday. */
  defineEvent({
    id: 'pazar-fiyatlari-krizi',
    title: 'Pazar Fiyatları Krizi',
    description:
      'Büyük şehirlerde temel gıda fiyatlarının bir hafta içinde hızla yükselmesi kamuoyunda tepki yarattı. Emekliler ve dar gelirli çalışanlar geçim sıkıntısını daha sert dile getirirken, küçük esnaf da maliyet baskısından şikâyet ediyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['workers', 'retirees', 'merchants'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['workers', 'retirees'],
    tensionSegments: ['merchants', 'industry'],
    tensionRationale:
      'Güçlü ekonomi mesajı üretici ve esnaf çevrelerinde maliyet endişesi yaratabilir.',
    recommendedActionIds: ['merchant-visit', 'policy-workshop', 'social-media-campaign'],
  }),
  /** inspiration: Öğrenci barınma krizi, yüksek kira gündemi, büyükşehirlerde konut baskısı. | gamePurpose: Genç seçmen erişimini artırır; yanlış mesaj verilirse mülk sahibi orta sınıfta tepki üretebilir. | notes: Alt gündem olarak sık kullanılabilir. | policyTopic (master): housing → localGovernance */
  defineEvent({
    id: 'kira-artisi-tartismasi',
    title: 'Kira Artışı Tartışması',
    description:
      'Üniversite şehirleri ve büyükşehirlerde kira artışları yeniden gündeme geldi. Gençler barınma sorununu sosyal medyada görünür kılarken, ev sahipleri maliyet ve vergi yükünden şikâyet ediyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'localGovernance',
    affectedSegments: ['youth', 'workers', 'retirees'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['youth', 'workers'],
    tensionSegments: ['merchants', 'retirees'],
    tensionRationale:
      'Kira baskısına net destek ev sahibi ve yerel esnaf çevrelerinde tepki doğurabilir.',
    recommendedActionIds: ['video-address', 'youth-event', 'local-press-visit'],
  }),
  /** inspiration: Asgari ücret görüşmeleri, sendika açıklamaları, işveren-maliyet tartışması. | gamePurpose: İşçi desteği ile sanayi ve küçük işletme desteği arasında net bir denge kararı yaratır. | notes: Ana gündem için uygun. */
  defineEvent({
    id: 'asgari-ucret-beklentisi',
    title: 'Asgari Ücret Beklentisi',
    description:
      'Yeni ücret dönemi yaklaşırken işçi temsilcileri yüksek zam talep ediyor. Sanayi çevreleri ise üretim maliyetlerinin daha da artacağı uyarısında bulunuyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'labor',
    affectedSegments: ['workers', 'merchants', 'industry'],
    reactionAxis: 'mixed',
    primarySegments: ['workers'],
    tensionSegments: ['industry', 'merchants'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
    politicalRationale:
      'Yüksek ücret talebine destek emek ekseninde güçlenir; piyasa düzenlemesine duyarlı seçmende endişe yaratabilir.',
    recommendedActionIds: ['worker-visit', 'policy-workshop'],
  }),
  /** inspiration: Emekli maaşı, geçim mitingleri, sosyal yardım tartışmaları. | gamePurpose: Emekli seçmene doğrudan erişim sağlar; mali kaynak vaatleri fazla agresif olursa bütçe güvenilirliğini düşürebilir. | notes: Emekliler segmenti için önemli. | policyTopic (master): welfare → socialWelfare */
  defineEvent({
    id: 'emekli-maasi-tepkisi',
    title: 'Emekli Maaşı Tepkisi',
    description:
      'Emekli dernekleri, maaşların temel ihtiyaçları karşılamadığını belirterek şehir meydanlarında basın açıklamaları yaptı. Gündem kısa sürede yerel medyadan ulusal tartışmaya taşındı.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'socialWelfare',
    affectedSegments: ['retirees', 'merchants'],
    reactionAxis: 'mixed',
    primarySegments: ['retirees'],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
    tensionRationale:
      'Agresif maaş vaatleri bütçe disiplini endişesi taşıyan kesimlerde güven kaybına yol açabilir.',
    recommendedActionIds: ['retiree-forum', 'merchant-visit', 'policy-workshop'],
  }),
  /** inspiration: Ek vergi düzenlemeleri, bütçe açığı, kayıt dışılık tartışmaları. | gamePurpose: Oyuncuya popülist vergi karşıtlığı ile mali disiplin söylemi arasında tercih yaptırır. | notes: Merkez-sağ/merkez-sol pozisyonu belirginleştirmek için iyi. */
  defineEvent({
    id: 'vergi-paketi-sizintisi',
    title: 'Vergi Paketi Sızıntısı',
    description:
      'Yeni bir vergi paketi taslağının basına sızması, küçük işletmelerde ve sanayi çevrelerinde rahatsızlık yarattı. Kamuoyu, yükün kimin omzuna bineceğini tartışıyor.',
    type: 'crisis',
    affectedCategory: 'fundraising',
    policyTopic: 'economy',
    affectedSegments: ['merchants', 'industry', 'workers'],
    reactionAxis: 'mixed',
    primarySegments: ['merchants', 'workers'],
    tensionSegments: ['industry'],
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative'],
    tensionRationale:
      'Vergi yükü eleştirisi iş dünyasında savunmacılık; halkçı dil merkez sağda bütçe endişesi yaratabilir.',
    recommendedActionIds: ['agenda-commentary', 'merchant-roundtable', 'social-media-campaign'],
  }),
  /** inspiration: Akaryakıt zamları, üretici maliyetleri, ulaşım fiyatları. | gamePurpose: Kırsal ve kentli seçmeni aynı anda etkileyen geniş tabanlı ekonomik kriz olayıdır. | notes: Güçlü negatif ortam yaratır. */
  defineEvent({
    id: 'akaryakit-zammi-dalgasi',
    title: 'Akaryakıt Zammı Dalgası',
    description:
      'Akaryakıta gelen yeni zamlar ulaşım, tarım ve üretim maliyetlerini artırdı. Nakliyeciler ve çiftçiler tepkili; şehirli seçmen de toplu taşıma ücretlerinin artmasından endişeli.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'merchants', 'industry', 'workers'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['farmers', 'workers'],
    tensionSegments: ['merchants', 'industry'],
    tensionRationale:
      'Akaryakıt maliyeti eleştirisi üretici ve çalışan kesimde destek bulur; iş dünyasında enflasyonist baskı endişesi yaratabilir.',
    recommendedActionIds: ['video-address', 'regional-tour', 'policy-workshop'],
  }),
  /** inspiration: İş kazaları, iş güvenliği ihmalleri, taşeronlaşma tartışmaları. | gamePurpose: İşçi desteği kazandırır; fazla sert mesaj sanayi çevrelerinde gerilim yaratabilir. | notes: Kriz türü için iyi. */
  defineEvent({
    id: 'isci-servisi-kazasi',
    title: 'İşçi Servisi Kazası',
    description:
      'Sanayi bölgesinde meydana gelen işçi servisi kazası, iş güvenliği ve denetim eksikliği tartışmalarını yeniden gündeme taşıdı. Aileler ve sendikalar sorumluların hesap vermesini istiyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'labor',
    affectedSegments: ['workers', 'industry'],
    reactionAxis: 'mixed',
    primarySegments: ['workers'],
    tensionSegments: ['industry'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
    tensionRationale:
      'İş güvenliği mesajı emek tabanında güçlenir; sanayi çevrelerinde aşırı düzenleme endişesi doğabilir.',
    recommendedActionIds: ['worker-visit', 'crisis-statement', 'local-press-visit'],
  }),
  /** inspiration: Enerji arzı, sanayi üretimi, altyapı yetersizliği. | gamePurpose: Ekonomi yönetimi kapasitesini göstermek isteyen oyuncu için teknik politika alanı açar. | notes: Profesyonelleşme metriğini kullanabilir. | policyTopic (master): energy → environment */
  defineEvent({
    id: 'sanayi-elektrik-kesintisi',
    title: 'Sanayi Elektrik Kesintisi',
    description:
      'Organize sanayi bölgesinde yaşanan uzun elektrik kesintileri üretimi aksattı. Sanayiciler altyapı yatırımlarının yetersiz kaldığını söylerken, işçiler vardiya kayıplarından şikâyet ediyor.',
    type: 'crisis',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'environment',
    affectedSegments: ['industry', 'workers', 'merchants'],
    reactionAxis: 'mixed',
    primarySegments: ['industry', 'workers'],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal'],
    politicalRationale:
      'Altyapı yatırımı vurgusu kalkınmacı tabanda destek bulur; maliyet ve vergi endişesi liberal seçmende farklı okunabilir.',
    recommendedActionIds: ['merchant-visit', 'policy-workshop', 'merchant-roundtable'],
  }),
  /** inspiration: Yurt ve barınma protestoları, gençlik hareketleri. | gamePurpose: Genç seçmen erişimini ciddi şekilde artırabilir; güvenlikçi dil gençlerde tepki doğurur. | notes: Ana veya alt gündem olabilir. | policyTopic (master): youth → socialWelfare */
  defineEvent({
    id: 'genclerin-yurt-protestosu',
    title: 'Gençlerin Yurt Protestosu',
    description:
      'Üniversite öğrencileri yurt kapasitesinin yetersizliği ve özel yurt fiyatlarının yüksekliği nedeniyle kampüslerde forumlar düzenledi. Sosyal medyada kısa sürede yaygın bir dayanışma etiketi oluştu.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'socialWelfare',
    affectedSegments: ['youth'],
    reactionAxis: 'mixed',
    primarySegments: ['youth'],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['conservative'],
    tensionRationale:
      'Barınma desteği genç tabanda güçlenir; mülk sahibi ve esnaf çevrelerinde maliyet endişesi doğabilir.',
    recommendedActionIds: ['youth-event', 'social-media-campaign', 'video-address'],
  }),
  /** inspiration: Kampüs etkinlikleri, öğrenci kulüpleri, ifade özgürlüğü tartışmaları. | gamePurpose: Özgürlükçü söylem ile düzen/güvenlik söylemi arasında ideolojik pozisyon aldırır. | notes: Genç seçmen için güçlü. | policyTopic (master): freedom → transparency */
  defineEvent({
    id: 'kampus-yasagi-tartismasi',
    title: 'Kampüs Yasağı Tartışması',
    description:
      'Bir üniversitede kulüp etkinliklerinin izne bağlanması öğrenciler arasında tepki yarattı. Yönetim güvenlik gerekçesi sunarken, öğrenciler ifade özgürlüğünün kısıtlandığını savunuyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Özgürlük vurgusu genç ve liberal tabanda güçlenir; düzen ve güvenlik ekseninde tepki doğabilir.',
    recommendedActionIds: ['youth-event', 'agenda-commentary', 'video-address'],
  }),
  /** inspiration: Sosyal medya yasaları, dezenformasyon tartışmaları, platform denetimi. | gamePurpose: Medya gücü ve genç seçmen metriğini aynı anda etkiler. | notes: Ana gündem için çok uygun. | policyTopic (master): media → mediaPolitics */
  defineEvent({
    id: 'sosyal-medya-duzenlemesi',
    title: 'Sosyal Medya Düzenlemesi',
    description:
      'Meclise sunulacağı konuşulan yeni sosyal medya düzenlemesi, dezenformasyonla mücadele ve ifade özgürlüğü ekseninde tartışılıyor. Genç kullanıcılar düzenlemenin sansüre dönüşmesinden endişeli.',
    type: 'agenda',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    politicalRationale:
      'İfade özgürlüğü vurgusu genç ve liberal tabanda güçlenir; düzen ve güvenlik ekseninde farklı okunabilir.',
    recommendedActionIds: ['social-media-campaign', 'agenda-commentary'],
  }),
  /** inspiration: Basın davaları, medya özgürlüğü, yargı bağımsızlığı tartışmaları. | gamePurpose: Oyuncunun hukuk devleti pozisyonunu görünür kılar; sert çıkış risk ve görünürlük getirir. | notes: Medya iletişimi kategorisinde iyi çalışır. | policyTopic (master): media → mediaPolitics */
  defineEvent({
    id: 'gazeteci-davasi',
    title: 'Gazeteci Davası',
    description:
      'Tanınmış bir yerel gazetecinin yargılandığı dava, basın özgürlüğü tartışmasını yeniden alevlendirdi. Bazı seçmenler davayı hukuk süreci olarak görürken, muhalif çevreler baskı atmosferinden söz ediyor.',
    type: 'crisis',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    politicalRationale:
      'Basın özgürlüğü mesajı hukuk devleti seçmende güçlenir; güvenlik ve düzen vurgusu yapan tabanda farklı okunur.',
    recommendedActionIds: ['agenda-commentary', 'video-address'],
  }),
  /** master id: canli-yayin-tartisma-haftasi | inspiration: Televizyon tartışmaları, lider performansı, kampanya görünürlüğü. | gamePurpose: Oyuncuya lider güveni ve medya gücü kazanma fırsatı verir. | notes: Mevcut sistemdeki ana gündeme benzer; korunabilir. | policyTopic (master): media → mediaPolitics */
  defineEvent({
    id: 'agenda-media-debate',
    title: 'Canlı Yayın Tartışma Haftası',
    description:
      'Ulusal kanallarda seçim tartışmaları yoğunlaştı. Medya görünürlüğü ve lider mesajları kritik hale geldi.',
    type: 'opportunity',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['youth', 'civilServants', 'workers'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['youth', 'workers'],
    tensionSegments: [],
    recommendedActionIds: ['video-address', 'social-media-campaign'],
  }),
  /** inspiration: Yerel medya tarafgirliği, seçim dönemi yayın tartışmaları. | gamePurpose: Yerel örgütlenme ve medya ilişkisi arasında karar baskısı yaratır. | notes: Radar gündem için iyi. | policyTopic (master): media → mediaPolitics */
  defineEvent({
    id: 'yerel-kanal-boykotu',
    title: 'Yerel Kanal Boykotu',
    description:
      'Bir yerel kanalın bazı adaylara eşit süre vermediği iddiası bölgede tartışma yarattı. Kanal yönetimi yayın politikasını savunurken, seçmenler adil temsil bekliyor.',
    type: 'agenda',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['merchants'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative'],
    tensionRationale:
      'Adil temsil vurgusu yerel tabanda güçlenir; medya mensupları savunmacı kalabilir.',
    recommendedActionIds: ['local-press-visit', 'agenda-commentary', 'local-meeting'],
  }),
  /** inspiration: Belediye ihaleleri, nepotizm, yolsuzluk dosyaları. | gamePurpose: Temiz siyaset mesajı için güçlü fırsat; ölçüsüz suçlama güvenilirlik riski yaratır. | notes: Ana gündem için ideal. | policyTopic (master): corruption → transparency */
  defineEvent({
    id: 'belediye-ihale-dosyasi',
    title: 'Belediye İhale Dosyası',
    description:
      'Büyük bir belediye ihalesinde akraba şirketlere avantaj sağlandığı iddiası gündeme geldi. Belgelerin bir kısmı basına yansırken, belediye yönetimi iddiaları reddediyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'transparency',
    affectedSegments: ['merchants'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: [],
    primaryPoliticalSegments: ['socialDemocrat', 'liberal', 'populist'],
    tensionPoliticalSegments: ['conservative'],
    tensionRationale:
      'Yolsuzluk iddiasına net mesaj geniş destek bulabilir; kanıtsız saldırı güven kaybettirebilir.',
    recommendedActionIds: ['crisis-statement', 'local-press-visit', 'legal-team'],
  }),
  /** inspiration: İmar değişiklikleri, kentsel rant, çevre ve kent hakkı tartışmaları. | gamePurpose: Çevreci kent politikası ile büyüme ve yatırım söylemi arasında tercih yaptırır. | notes: Ege/Akdeniz bölgelerinde etkili olabilir. | policyTopic (master): urbanization → localGovernance */
  defineEvent({
    id: 'imar-plani-gerilimi',
    title: 'İmar Planı Gerilimi',
    description:
      'Sahil ilçesinde yeni imar planı, yeşil alanların azalacağı iddiasıyla tepki topladı. Müteahhit çevreleri planın ekonomik canlılık getireceğini savunuyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['merchants', 'retirees', 'youth'],
    reactionAxis: 'mixed',
    primarySegments: ['youth', 'retirees'],
    tensionSegments: ['merchants', 'industry'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Yeşil alan savunusu genç ve yerel tabanda güçlenir; müteahhit ve büyüme yanlısı kesimde gerilim doğabilir.',
    recommendedActionIds: ['local-meeting', 'policy-workshop', 'local-press-visit'],
  }),
  /** inspiration: Kentsel dönüşüm, hak sahipliği, deprem riski ve rant tartışmaları. | gamePurpose: Güvenli konut ihtiyacı ile sosyal adalet mesajını dengeletir. | notes: Ana gündeme de taşınabilir. | policyTopic (master): housing → localGovernance */
  defineEvent({
    id: 'kentsel-donusum-itirazi',
    title: 'Kentsel Dönüşüm İtirazı',
    description:
      'Eski bir mahallede başlatılan dönüşüm projesi, hak sahiplerinin yeterince bilgilendirilmediği iddiasıyla protesto edildi. Deprem güvenliği ile yerinden edilme korkusu karşı karşıya geldi.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['retirees', 'workers', 'merchants'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['retirees', 'workers'],
    tensionSegments: ['merchants'],
    tensionRationale:
      'Hak sahipliği mesajı mahalle sakinlerinde güçlenir; yatırımcı çevrelerde proje gecikmesi endişesi doğabilir.',
    recommendedActionIds: ['local-meeting', 'video-address', 'legal-team'],
  }),
  /** inspiration: Toplu taşıma zamları, belediye bütçesi, öğrenci indirimleri. | gamePurpose: Yerel yönetim eleştirisi üzerinden genç ve çalışan seçmen desteği üretir. | notes: Yerel bölgesel etki için uygun. | policyTopic (master): transportation → localGovernance */
  defineEvent({
    id: 'belediye-ulasim-zammi',
    title: 'Belediye Ulaşım Zammı',
    description:
      'Büyükşehir belediyesinin toplu ulaşıma yaptığı zam, öğrenciler ve düşük gelirli çalışanlar arasında tepki yarattı. Belediye artan maliyetleri gerekçe gösteriyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['youth', 'workers', 'retirees'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['youth', 'workers'],
    tensionSegments: ['retirees'],
    tensionRationale:
      'Ulaşım maliyeti eleştirisi genç ve çalışan kesimde güçlenir; bütçe disiplini vurgusu emekli tabanda farklı okunabilir.',
    recommendedActionIds: ['video-address', 'local-press-visit', 'social-media-campaign'],
  }),
  /** inspiration: Altyapı arızaları, kuraklık, belediye hizmet krizi. | gamePurpose: Yerel hizmet kapasitesi ve kriz yönetimi mesajı için kullanılır. | notes: Kısa vadeli kriz. | policyTopic (master): infrastructure → localGovernance */
  defineEvent({
    id: 'su-kesintisi-haftasi',
    title: 'Su Kesintisi Haftası',
    description:
      'Birkaç ilçede günler süren su kesintileri yurttaşların tepkisine neden oldu. Yetkililer kuraklık ve bakım çalışmalarını gerekçe gösterirken, muhalifler plansızlık eleştirisi yapıyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['workers', 'merchants', 'retirees'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['workers', 'merchants'],
    tensionSegments: ['civilServants'],
    tensionRationale:
      'Hizmet eleştirisi yerel halkta güçlenir; belediye mensupları savunmacı kalabilir.',
    recommendedActionIds: ['local-meeting', 'policy-workshop', 'local-press-visit'],
  }),
  /** inspiration: Kent hakkı protestoları, meydan ve park tartışmaları. | gamePurpose: Özgürlük, çevre, güvenlik ve düzen eksenlerini aynı anda çalıştırır. | notes: Zincirleme olaylara çok uygun. | policyTopic (master): freedom → transparency */
  defineEvent({
    id: 'meydan-duzenlemesi-protestosu',
    title: 'Meydan Düzenlemesi Protestosu',
    description:
      'Şehrin simge meydanındaki düzenleme projesi protestolara yol açtı. Gençler ve çevre grupları kamusal alanın korunmasını isterken, yetkililer projenin şehir estetiği için gerekli olduğunu savunuyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'populist'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Kamusal alan savunusu genç tabanda güçlenir; düzen ve güvenlik vurgusu yapan kesimde farklı okunabilir.',
    recommendedActionIds: ['agenda-commentary', 'local-meeting', 'video-address'],
  }),
  /** master id: miting-cevresinde-gerilim | inspiration: Miting güvenliği, protesto müdahaleleri, kamu düzeni tartışmaları. | gamePurpose: Sertlik ve itidal arasında oyuncuya riskli bir tercih sunar. | notes: Önceki protesto olaylarından sonra follow-up olabilir. */
  defineEvent({
    id: 'crisis-protest-clash',
    title: 'Miting Çevresinde Gerilim',
    description:
      'Parti etkinliği yakınında protesto ve polis müdahalesi yaşandı. Toplumsal gruplar yönetim tarzını tartışırken, güvenlik yanlısı seçmenler sert tedbirleri destekliyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'security',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal', 'populist'],
    politicalRationale:
      'Kamu düzeni söylemi milliyetçi ve muhafazakâr yankıda güçlenir; protesto ve özgürlükçü seçmende gerilim doğabilir.',
    tensionRationale:
      'Genç ve sokak mobilizasyonu sert güvenlik dilinde kırılgan kalır.',
    recommendedActionIds: ['crisis-statement', 'agenda-commentary'],
  }),
  /** inspiration: Sınır güvenliği, dış politika krizleri, operasyon tartışmaları. | gamePurpose: Millî güvenlik söylemi ile diplomasi vurgusu arasında pozisyon aldırır. | notes: Ana gündem olabilir. */
  defineEvent({
    id: 'sinir-otesi-gerilim',
    title: 'Sınır Ötesi Gerilim',
    description:
      'Sınır hattında yaşanan güvenlik olayı sonrası dış politika ve güvenlik tartışmaları yoğunlaştı. Kamuoyu hem güçlü duruş hem de diplomatik akıl bekliyor.',
    type: 'crisis',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'security',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal', 'socialDemocrat'],
    politicalRationale:
      'Güçlü devlet mesajı milliyetçi tabanda güçlenir; diplomasi ve barış vurgusu farklı okunabilir.',
    recommendedActionIds: ['crisis-statement', 'agenda-commentary', 'video-address'],
  }),
  /** inspiration: Göçmen karşıtlığı, mahalle gerilimleri, sosyal uyum tartışmaları. | gamePurpose: Sert popülist mesaj ile kapsayıcı ama riskli sosyal politika dili arasında karar yaratır. | notes: Hassas dil gerektirir. | policyTopic (master): migration → socialWelfare */
  defineEvent({
    id: 'multeci-mahallesi-gerilimi',
    title: 'Göçmen Mahallesi Gerilimi',
    description:
      'Bir mahallede göçmenlerle yerel halk arasında yaşanan tartışma kısa sürede siyasi polemiğe dönüştü. Esnaf güvenlik ve rekabetten, sivil toplum ise ayrımcı dilden endişeli.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'socialWelfare',
    affectedSegments: ['merchants'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionRationale:
      'Sert güvenlik dili milliyetçi tabanda karşılık bulur; kapsayıcı seçmende ayrımcılık algısı oluşturabilir.',
    politicalRationale:
      'Göç konusu ideolojik hatları keskinleştirir; ölçülü dil bile her iki uçta yorum farkı yaratır.',
    recommendedActionIds: ['crisis-statement', 'local-meeting', 'policy-workshop'],
  }),
  /** inspiration: Sel, deprem, afet sonrası yardım koordinasyonu tartışmaları. | gamePurpose: Yerel örgütlenme gücü ve lider güveni artırma fırsatı verir. | notes: Doğru yönetilirse güçlü pozitif sonuç. | policyTopic (master): disaster → environment */
  defineEvent({
    id: 'afet-yardim-organizasyonu',
    title: 'Afet Yardım Organizasyonu',
    description:
      'Sel felaketinden etkilenen ilçelerde yardım organizasyonu ihtiyacı doğdu. Partiler ve sivil toplum sahada görünür olmaya çalışıyor.',
    type: 'opportunity',
    affectedCategory: 'localOrganization',
    policyTopic: 'environment',
    affectedSegments: ['workers', 'retirees', 'farmers'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['workers', 'retirees', 'farmers'],
    tensionSegments: [],
    tensionRationale:
      'Afet yardımı geniş tabanda destek bulur; koordinasyon eksikliği eleştirisi güven kaybettirebilir.',
    recommendedActionIds: ['volunteer-training', 'small-donation-drive', 'local-meeting'],
  }),
  /** inspiration: Deprem riski, toplanma alanları, imar ve afet hazırlığı tartışmaları. | gamePurpose: Teknik uzmanlık, yerel hassasiyet ve güven duygusu üretir. | notes: Marmara bölgesi için güçlü. | policyTopic (master): disaster → environment */
  defineEvent({
    id: 'deprem-toplanma-alani-tartismasi',
    title: 'Toplanma Alanı Tartışması',
    description:
      'Bir ilçede deprem toplanma alanının ticari projeye açıldığı iddiası tepki çekti. Uzmanlar afet hazırlığının seçim gündeminin merkezinde olması gerektiğini söylüyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'environment',
    affectedSegments: ['youth', 'retirees', 'workers'],
    reactionAxis: 'mixed',
    primarySegments: ['youth', 'retirees'],
    tensionSegments: ['merchants', 'industry'],
    primaryPoliticalSegments: ['socialDemocrat', 'liberal'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Afet hazırlığı vurgusu güven arayan tabanda güçlenir; ticari proje yanlısı kesimde gerilim doğabilir.',
    recommendedActionIds: ['policy-workshop', 'local-meeting'],
  }),
  /** inspiration: Fındık fiyatları, alım politikası, üretici-tüccar dengesi. | gamePurpose: Kırsal seçmene erişim sağlar; ticaret çevreleriyle gerilim yaratabilir. | notes: Karadeniz bölgesine özel ağırlık verilebilir. | policyTopic (master): agriculture → economy */
  defineEvent({
    id: 'findik-ureticisi-tepkisi',
    title: 'Fındık Üreticisi Tepkisi',
    description:
      'Karadeniz’de üreticiler açıklanan alım fiyatının maliyetleri karşılamadığını savunuyor. Tüccarlar ise piyasa dengesinin bozulmaması gerektiğini belirtiyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'merchants'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['farmers'],
    tensionSegments: ['merchants'],
    tensionRationale:
      'Üretici desteği tarım kesiminde güçlenir; tüccar çevrelerinde fiyat baskısı endişesi doğabilir.',
    recommendedActionIds: ['regional-tour', 'policy-workshop', 'local-press-visit'],
  }),
  /** inspiration: Kuraklık, su yönetimi, tarımsal üretim krizi. | gamePurpose: Kırsal seçmen ve teknik politika kapasitesini aynı anda etkiler. | notes: İç Anadolu için güçlü. | policyTopic (master): agriculture → economy */
  defineEvent({
    id: 'kuraklik-alarmi',
    title: 'Kuraklık Alarmı',
    description:
      'İç Anadolu’da kuraklık verileri tarımsal üretim için risk sinyali verdi. Çiftçiler destek isterken, uzmanlar uzun vadeli su politikası çağrısı yapıyor.',
    type: 'crisis',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['farmers', 'industry', 'workers'],
    reactionAxis: 'mixed',
    primarySegments: ['farmers'],
    tensionSegments: ['industry'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
    tensionRationale:
      'Tarım desteği kırsal tabanda güçlenir; sanayi ve su paylaşımı tartışmasında gerilim doğabilir.',
    recommendedActionIds: ['policy-workshop', 'regional-tour'],
  }),
  /** inspiration: Kıyı ekonomisi, balıkçı esnafı, turizm-yerel üretim gerilimi. | gamePurpose: Küçük ama bölgesel derinliği olan yerel gündem üretir. | notes: Ege, Marmara, Karadeniz için uygun. | policyTopic (master): localEconomy → economy */
  defineEvent({
    id: 'balikci-limani-sorunu',
    title: 'Balıkçı Limanı Sorunu',
    description:
      'Kıyı ilçesinde balıkçılar liman bakımının ihmal edildiğini ve teknelerin zarar gördüğünü söylüyor. Turizm işletmeleri ise alanın daha düzenli kullanılması gerektiğini savunuyor.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'economy',
    affectedSegments: ['fisherfolk', 'merchants', 'tourism'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['fisherfolk', 'merchants'],
    tensionSegments: ['tourism'],
    tensionRationale:
      'Balıkçı desteği kıyı ekonomisinde güçlenir; turizm yatırımcılarında rekabet endişesi doğabilir.',
    recommendedActionIds: ['regional-tour', 'local-press-visit', 'policy-workshop'],
  }),
  /** inspiration: Turizm sezonu, hizmet sektörü, sezonluk çalışma koşulları. | gamePurpose: Finansman, esnaf desteği ve çalışan hassasiyeti arasında pozitif fırsat yaratır. | notes: Akdeniz/Ege için iyi. | policyTopic (master): tourism → economy */
  defineEvent({
    id: 'turizm-sezonu-firsati',
    title: 'Turizm Sezonu Fırsatı',
    description:
      'Turizm sezonu beklentilerin üzerinde başladı. Otelciler ve esnaf memnun; çalışanlar ise sezonluk emek koşullarının da konuşulmasını istiyor.',
    type: 'opportunity',
    affectedCategory: 'fundraising',
    policyTopic: 'economy',
    affectedSegments: ['tourism', 'merchants', 'workers'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['tourism', 'merchants'],
    tensionSegments: ['workers'],
    tensionRationale:
      'Sezon olumlu mesajı esnaf ve turizmde güçlenir; sezonluk emek koşulları vurgusu çalışan kesimde beklenti yaratır.',
    recommendedActionIds: ['merchant-roundtable', 'local-press-visit'],
  }),
  /** inspiration: OSB yatırımları, istihdam ve çevre dengesi. | gamePurpose: Kalkınma söylemi kurmak isteyen oyuncuya fırsat verir; çevre duyarlılığı ihmal edilirse gençlerde tepki olabilir. | notes: İç Anadolu, Marmara, Güneydoğu için uygun. | policyTopic (master): industry → economy */
  defineEvent({
    id: 'organize-sanayi-acilisi',
    title: 'Organize Sanayi Açılışı',
    description:
      'Yeni organize sanayi alanının açılışı bölgede istihdam umudu yarattı. Ancak çevre grupları altyapı ve denetim konularında uyarıda bulunuyor.',
    type: 'opportunity',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'economy',
    affectedSegments: ['industry', 'workers', 'merchants'],
    reactionAxis: 'mixed',
    primarySegments: ['industry', 'workers'],
    tensionSegments: ['farmers', 'youth'],
    primaryPoliticalSegments: ['nationalist', 'conservative'],
    tensionPoliticalSegments: ['liberal', 'socialDemocrat'],
    politicalRationale:
      'Kalkınma vurgusu milliyetçi ve muhafazakâr tabanda destek bulur; çevre hassasiyeti yüksek seçmende endişe yaratabilir.',
    recommendedActionIds: ['merchant-visit', 'merchant-roundtable', 'policy-workshop'],
  }),
  /** inspiration: Aday listesi krizleri, parti içi hizipler, teşkilat tepkileri. | gamePurpose: Parti disiplini, örgüt morali ve lider güveni üzerinde baskı yaratır. | notes: Oyuncunun iç yönetim becerisini test eder. | policyTopic (master): partyManagement → transparency */
  defineEvent({
    id: 'parti-ici-liste-krizi',
    title: 'Parti İçi Liste Krizi',
    description:
      'Aday listelerinde bazı yerel isimlerin dışarıda bırakılması parti içinde huzursuzluk yarattı. İlçe teşkilatları açıklama bekliyor.',
    type: 'crisis',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['populist', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative'],
    tensionRationale:
      'İç demokrasi mesajı tabanda güven yaratır; liste revizyonu teşkilatta kırılma riski taşır.',
    recommendedActionIds: ['local-meeting', 'crisis-statement'],
  }),
  /** inspiration: Gençlik örgütleri, viral kampanyalar, sosyal medya siyaseti. | gamePurpose: Genç seçmen erişimi ve kampanya görünürlüğü için düşük riskli fırsat sunar. | notes: Pozitif alt gündem için iyi. | policyTopic (master): youth → socialWelfare */
  defineEvent({
    id: 'genclik-kollari-cikisi',
    title: 'Gençlik Kolları Çıkışı',
    description:
      'Partinin gençlik kolları yaratıcı bir kampanyayla sosyal medyada gündem oldu. Ana yönetimin bu enerjiyi sahiplenip sahiplenmeyeceği merak ediliyor.',
    type: 'opportunity',
    affectedCategory: 'socialGroups',
    policyTopic: 'socialWelfare',
    affectedSegments: ['youth'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['youth'],
    tensionSegments: [],
    recommendedActionIds: ['youth-event', 'social-media-campaign', 'video-address'],
  }),
  /** inspiration: Siyasette bağış, adaylık süreçleri, etik tartışmaları. | gamePurpose: Finansman ihtiyacı ile temiz siyaset imajı arasında gerilim kurar. | notes: Parti kimliği metriğini etkileyebilir. | policyTopic (master): ethics → transparency */
  defineEvent({
    id: 'aday-adayi-bagis-tartismasi',
    title: 'Aday Adayı Bağış Tartışması',
    description:
      'Bazı aday adaylarından yüksek bağış beklendiği iddiası parti finansmanı tartışmasını büyüttü. Rakipler durumu fırsata çevirmeye çalışıyor.',
    type: 'crisis',
    affectedCategory: 'fundraising',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['populist'],
    tensionRationale:
      'Şeffaflık vurgusu güven arayan tabanda güçlenir; bağış baskısı iddiası genç ve halkçı seçmende tepki doğurabilir.',
    recommendedActionIds: ['crisis-statement', 'legal-team', 'agenda-commentary'],
  }),
  /** master id: anket-sirketi-indirimi | inspiration: Kampanya döneminde anket ve veri analizi kullanımı. | gamePurpose: Oyuncuya kaynak harcayarak daha bilinçli strateji kurma fırsatı verir. | notes: Radar gündem/fırsat olarak iyi. | policyTopic (master): campaign → mediaPolitics */
  defineEvent({
    id: 'opportunity-poll-window',
    title: 'Anket Şirketi İndirimi',
    description:
      'Bir araştırma firması kısa süreliğine uygun fiyatlı kamuoyu analizi teklifi sunuyor. Stratejik kararlar için yeni veri fırsatı var.',
    type: 'opportunity',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['youth', 'workers', 'merchants', 'retirees'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['civilServants', 'merchants'],
    tensionSegments: [],
    recommendedActionIds: ['poll-commission', 'data-team', 'campaign-consultant'],
  }),
  /** inspiration: Lider gafları, viral siyasi klipler, medya gündemi. | gamePurpose: Oyuncuya saldırgan kampanya ile devlet ciddiyeti arasında tercih yaptırır. | notes: Fırsat ama aşırı kullanım itibar riski yaratır. | policyTopic (master): campaign → mediaPolitics */
  defineEvent({
    id: 'rakip-lider-gaffi',
    title: 'Rakip Lider Gafı',
    description:
      'Rakip parti liderinin canlı yayındaki talihsiz ifadesi sosyal medyada gündem oldu. Seçmenler bu çıkışın ciddiye alınıp alınmayacağını izliyor.',
    type: 'opportunity',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    attacksRival: true,
    targetRivalId: 'rival-republic-union',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['populist', 'liberal'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Rakip eleştirisi medyada ivme kazandırır; aşırı alaycı dil ciddiyet algısını zedeleyebilir.',
    recommendedActionIds: ['social-media-campaign', 'video-address', 'agenda-commentary'],
  }),
  /** inspiration: Belediye usulsüzlükleri, muhalefet fırsatı, yerel hesap verebilirlik. | gamePurpose: Temiz yönetim mesajını güçlendirme fırsatı verir. | notes: Bölgesel rakip zayıflatma etkisi olabilir. | policyTopic (master): corruption → transparency */
  defineEvent({
    id: 'rakip-belediye-skandali',
    title: 'Rakip Belediye Skandalı',
    description:
      'Rakip partinin yönettiği belediyede usulsüz harcama iddiaları basına yansıdı. Yerel halk açıklama bekliyor.',
    type: 'opportunity',
    affectedCategory: 'localOrganization',
    policyTopic: 'transparency',
    attacksRival: true,
    targetRivalId: 'rival-republic-union',
    affectedSegments: ['merchants'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['merchants'],
    primaryPoliticalSegments: ['socialDemocrat', 'liberal', 'populist'],
    tensionPoliticalSegments: [],
    tensionRationale:
      'Yolsuzluk iddiası geniş destek bulabilir; aşırı saldırgan dil rakip tabanda savunmacılık yaratabilir.',
    politicalRationale:
      'Değişim isteyen seçmende karşılık bulurken rakip tabanda savunma refleksi oluşturabilir.',
    recommendedActionIds: ['crisis-statement', 'local-press-visit', 'legal-team'],
  }),
  /** master id: secim-hukuku-sorusturmasi | inspiration: Seçim mevzuatı, kampanya finansmanı, hukuki baskı tartışmaları. | gamePurpose: Oyuncunun kriz iletişimi ve hukuki kapasitesini test eder. | notes: Fazla sert tepki riskli olmalı. | policyTopic (master): electionLaw → transparency */
  defineEvent({
    id: 'crisis-legal-inquiry',
    title: 'Seçim Hukuku Soruşturması',
    description:
      'Seçim kampanyası harcamalarına ilişkin soruşturma haberi basına yansıdı. Hukuki ve iletişim hattı aynı anda doğru yönetilmek zorunda.',
    type: 'crisis',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative', 'nationalist'],
    tensionRationale:
      'Hukuki şeffaflık mesajı güven arayan tabanda güçlenir; sert savunma genç seçmende zayıflama yaratabilir.',
    recommendedActionIds: ['legal-team', 'crisis-statement', 'agenda-commentary'],
  }),
  /** inspiration: Seçmen listeleri, seçim güvenliği, sandık tartışmaları. | gamePurpose: Güvenilirlik, örgüt kapasitesi ve seçmen mobilizasyonu etkiler. | notes: Kullanıcı daha önce sandık gücünü kaldırmıştı; burada operasyon aracı değil gündem olarak kullanılabilir. | policyTopic (master): electionLaw → transparency */
  defineEvent({
    id: 'sandik-guvenligi-tartismasi',
    title: 'Seçim Güvenliği Tartışması',
    description:
      'Bazı bölgelerde seçmen listeleri ve sandık düzenine ilişkin iddialar gündeme geldi. Seçmenler hem güvence hem de panik yaratmayan bir dil bekliyor.',
    type: 'agenda',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: [],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['nationalist', 'conservative'],
    politicalRationale:
      'Seçim güvenliği mesajı hukuk devleti ekseninde güçlenir; güçlü devlet vurgusu yapan tabanda farklı okunabilir.',
    recommendedActionIds: ['legal-team', 'volunteer-training', 'agenda-commentary'],
  }),
  /** inspiration: KPSS, mülakat, liyakat, kamu personel rejimi tartışmaları. | gamePurpose: Gençler ve memurlar arasında güçlü bağ kurabilir. | notes: Sosyal gruplar için iyi. | policyTopic (master): publicSector → socialWelfare */
  defineEvent({
    id: 'kamu-calisani-atama-tepkisi',
    title: 'Kamu Çalışanı Atama Tepkisi',
    description:
      'Kamu atamalarında mülakat ve liyakat tartışması yeniden gündeme geldi. Genç mezunlar adil süreç talep ederken, kamu çalışanları kurumsal itibarın zedelendiğini düşünüyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'socialWelfare',
    affectedSegments: ['civilServants', 'youth'],
    reactionAxis: 'mixed',
    primarySegments: ['youth', 'civilServants'],
    tensionSegments: [],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal', 'conservative'],
    politicalRationale:
      'Liyakat vurgusu genç mezun tabanda güçlenir; mevcut kamu çalışanı kitlesinde farklı okunabilir.',
    recommendedActionIds: ['worker-visit', 'agenda-commentary', 'social-media-campaign'],
  }),
  /** inspiration: Bayramlaşma programları, mahalle siyaseti, yerel temaslar. | gamePurpose: Düşük riskli yerel örgütlenme ve lider güveni fırsatı sağlar. | notes: Haftalık tempo rahatlatıcı fırsat olayı. | policyTopic (master): culture → socialWelfare */
  defineEvent({
    id: 'dini-bayram-ziyaretleri',
    title: 'Bayram Ziyaretleri Haftası',
    description:
      'Bayram haftasında mahalle ziyaretleri ve yerel temaslar seçmenle sıcak ilişki kurmak için fırsat yaratıyor. Fazla politik dil kullanmak ise samimiyet algısını zedeleyebilir.',
    type: 'opportunity',
    affectedCategory: 'localOrganization',
    policyTopic: 'socialWelfare',
    affectedSegments: ['retirees', 'merchants', 'workers'],
    reactionAxis: 'mixed',
    primarySegments: ['retirees', 'merchants'],
    tensionSegments: ['youth'],
    primaryPoliticalSegments: ['conservative', 'nationalist'],
    tensionPoliticalSegments: ['liberal'],
    tensionRationale:
      'Sıcak temas mesajı geleneksel tabanda güçlenir; fazla politik dil samimiyet algısını zedeleyebilir.',
    recommendedActionIds: ['local-meeting', 'local-press-visit'],
  }),
  /** notes: eventChains + customEventResponses — korundu */
  defineEvent({
    id: 'crisis-opponent-attack',
    title: 'Rakip Parti Sert Saldırı',
    description:
      'Rakip lider parti liderinizi televizyon programında hedef aldı. Yanıt hızı ve tonu kamuoyu algısını doğrudan etkileyecek.',
    type: 'crisis',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    attacksRival: true,
    targetRivalId: 'rival-republic-union',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: [],
    primaryPoliticalSegments: [],
    tensionPoliticalSegments: [],
    politicalRationale:
      'Sert yanıt kendi tabanında güçlenir; iktidar (milliyetçi–muhafazakâr) seçmeninde savunmacı refleks oluşur.',
    tensionRationale:
      'Karşı saldırı CB tabanını harekete geçirir; aşırı sert yanıt merkez seçmende güven kaybettirebilir.',
    recommendedActionIds: ['crisis-statement', 'video-address', 'local-press-visit'],
  }),
  /** notes: eventChains + customEventResponses — korundu */
  defineEvent({
    id: 'agenda-inflation',
    title: 'Enflasyon Gündemi Baskın',
    description:
      'Alım gücü ve fiyat artışları ulusal gündemin merkezinde. Ekonomi ve refah mesajları seçmen kararlarını şekillendiriyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'economy',
    affectedSegments: ['workers', 'retirees', 'merchants'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['workers', 'retirees'],
    tensionSegments: ['merchants', 'industry'],
    tensionRationale:
      'Enflasyon eleştirisi emekçi tabanda güçlenir; üretici ve esnaf çevrelerinde maliyet endişesi doğabilir.',
    recommendedActionIds: ['policy-workshop', 'merchant-roundtable', 'worker-visit'],
  }),
  /** notes: eventChains followUp — korundu */
  defineEvent({
    id: 'crisis-donation-scrutiny',
    title: 'Bağış Kaynakları Tartışmada',
    description:
      'Medya, siyasi bağışların şeffaflığını gündeme taşıdı. Mali kaynaklarınızın açıklanması baskı altında.',
    type: 'crisis',
    affectedCategory: 'fundraising',
    policyTopic: 'economy',
    affectedSegments: ['merchants', 'industry', 'civilServants'],
    reactionAxis: 'mixed',
    primarySegments: ['merchants', 'civilServants'],
    tensionSegments: ['industry'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['populist', 'conservative'],
    tensionRationale:
      'Şeffaflık mesajı güven arayan tabanda güçlenir; bağışçı çevrelerde savunmacılık riski doğabilir.',
    recommendedActionIds: ['small-donation-drive', 'donor-network', 'membership-fee-campaign'],
  }),
  /** notes: eventChains followUp — korundu */
  defineEvent({
    id: 'crisis-local-rumor',
    title: 'Yerel Skandal İddiası',
    description:
      'Bir ilçede parti adına konuştuğu iddia edilen kişi hakkında usulsüzlük söylentileri yayılmaya başladı. Yerel güven sarsılıyor.',
    type: 'crisis',
    affectedCategory: 'localOrganization',
    policyTopic: 'localGovernance',
    affectedSegments: ['merchants', 'retirees', 'farmers'],
    reactionAxis: 'mixed',
    primarySegments: ['merchants', 'retirees'],
    tensionSegments: ['farmers'],
    primaryPoliticalSegments: ['liberal', 'socialDemocrat'],
    tensionPoliticalSegments: ['conservative', 'populist'],
    tensionRationale:
      'Hızlı ve net açıklama yerel güveni korur; kararlı dışlama söylemi tabanı bölünürken merkez seçmende endişe yaratabilir.',
    politicalRationale:
      'Hesap verebilirlik vurgusu değişim isteyen seçmende güçlenir; parti savunmacılığı farklı okunabilir.',
    recommendedActionIds: ['local-meeting', 'merchant-visit', 'regional-tour'],
  }),
  /** notes: eventChains followUp — korundu */
  defineEvent({
    id: 'opportunity-media-trend',
    title: 'Sosyal Medyada Gündem Açığı',
    description:
      'Rakip partilerin mesajları zayıf kaldı; kısa ve net bir dijital kampanya dikkat çekebilir.',
    type: 'opportunity',
    affectedCategory: 'mediaCommunication',
    policyTopic: 'mediaPolitics',
    affectedSegments: ['youth', 'civilServants', 'workers'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['youth', 'workers'],
    tensionSegments: [],
    recommendedActionIds: ['social-media-campaign', 'video-address', 'agenda-commentary'],
  }),
  /** notes: eventChains + customEventResponses — korundu */
  defineEvent({
    id: 'agenda-unemployment-youth',
    title: 'Genç İşsizlik Tartışması',
    description:
      'Genç işsizlik verileri kamuoyunda geniş yankı buldu. İstihdam ve gelecek vaatleri ön plana çıkıyor.',
    type: 'agenda',
    affectedCategory: 'socialGroups',
    policyTopic: 'labor',
    affectedSegments: ['youth', 'workers'],
    reactionAxis: 'mixed',
    primarySegments: ['youth', 'workers'],
    tensionSegments: ['industry', 'merchants'],
    primaryPoliticalSegments: ['socialDemocrat', 'populist'],
    tensionPoliticalSegments: ['liberal'],
    tensionRationale:
      'İstihdam vaadi genç tabanda güçlenir; işveren çevrelerinde maliyet endişesi doğabilir.',
    recommendedActionIds: ['youth-event', 'worker-visit', 'policy-workshop'],
  }),
  /** notes: eventChains + customEventResponses — korundu */
  defineEvent({
    id: 'agenda-corruption-debate',
    title: 'Yolsuzluk ve Şeffaflık Tartışması',
    description:
      'Kamuoyu yolsuzlukla mücadele ve liyakat konularına odaklandı. Kurumsal güvenilirlik mesajları öne çıkıyor.',
    type: 'agenda',
    affectedCategory: 'strategyProfessionalization',
    policyTopic: 'transparency',
    affectedSegments: ['youth'],
    reactionAxis: 'political',
    primarySegments: [],
    tensionSegments: [],
    primaryPoliticalSegments: ['socialDemocrat', 'liberal', 'populist'],
    tensionPoliticalSegments: ['conservative'],
    politicalRationale:
      'Temiz yönetim mesajı geniş tabanda destek bulur; partizan saldırı algısı merkez seçmende soğutabilir.',
    recommendedActionIds: ['policy-workshop', 'poll-commission', 'legal-team'],
  }),
  /** notes: eventChains + customEventResponses — korundu */
  defineEvent({
    id: 'agenda-disaster-response',
    title: 'Afet Yönetimi Gündemde',
    description:
      'Bölgesel bir afet haberi gündemi domine ediyor. Yerel temsil ve saha koordinasyonu beklentisi arttı.',
    type: 'agenda',
    affectedCategory: 'localOrganization',
    policyTopic: 'environment',
    affectedSegments: ['farmers', 'retirees', 'fisherfolk'],
    reactionAxis: 'socioeconomic',
    primarySegments: ['farmers', 'retirees'],
    tensionSegments: ['industry'],
    tensionRationale:
      'Afet koordinasyonu vurgusu yerel tabanda güçlenir; sanayi ve altyapı önceliği tartışmasında gerilim doğabilir.',
    recommendedActionIds: ['regional-tour', 'volunteer-training', 'local-meeting'],
  }),
];

export function getWeeklyEventById(id: string): WeeklyEvent | undefined {
  return weeklyEvents.find((event) => event.id === id);
}

export function getWeeklyEventsByType(type: WeeklyEvent['type']): WeeklyEvent[] {
  return weeklyEvents.filter((event) => event.type === type);
}

export function getWeeklyEventsByCategory(category: WeeklyEvent['affectedCategory']): WeeklyEvent[] {
  return weeklyEvents.filter((event) => event.affectedCategory === category);
}
