/** Olay zincirleri — tepki sonrası gecikmeli takip olayları (docs/10_EVENT_CONTENT_MASTER.md Bölüm 3 + legacy) */

export interface EventStoryChain {
  id: string;
  sourceEventId: string;
  sourceResponseIds: string[];
  followUpEventId: string;
  delayWeeks: number;
  reason: string;
  storyFlag: string;
}

/** Master slug → weeklyEvents runtime id */
const FOLLOW_UP_EVENT_ID_MAP: Record<string, string> = {
  'miting-cevresinde-gerilim': 'crisis-protest-clash',
};

function mapFollowUpEventId(masterId: string): string {
  return FOLLOW_UP_EVENT_ID_MAP[masterId] ?? masterId;
}

export const eventStoryChains: EventStoryChain[] = [
  {
    id: 'chain-01',
    sourceEventId: 'meydan-duzenlemesi-protestosu',
    sourceResponseIds: ['meydan-protestosu-genclerin-yaninda'],
    followUpEventId: mapFollowUpEventId('miting-cevresinde-gerilim'),
    delayWeeks: 1,
    reason:
      'Meydan protestosunda sert biçimde taraf olman genç kitleleri hareketlendirdi; sonraki miting çevresinde gerilim yükseldi.',
    storyFlag: 'chain-01-meydan-miting-gerilim',
  },
  {
    id: 'chain-02',
    sourceEventId: 'meydan-duzenlemesi-protestosu',
    sourceResponseIds: ['meydan-protestosu-diyalog'],
    followUpEventId: 'yerel-kanal-boykotu',
    delayWeeks: 1,
    reason:
      'Diyalog çağrısı yerelde tartışmayı sürdürdü; medya temsil adaleti yeni gündem haline geldi.',
    storyFlag: 'chain-02-meydan-diyalog-medya',
  },
  {
    id: 'chain-03',
    sourceEventId: 'pazar-fiyatlari-krizi',
    sourceResponseIds: ['pazar-fiyatlari-refah-paketi'],
    followUpEventId: 'vergi-paketi-sizintisi',
    delayWeeks: 2,
    reason:
      'Güçlü refah vaatlerin finansman tartışmasını büyüttü; yeni vergi paketi iddiaları gündeme düştü.',
    storyFlag: 'chain-03-refah-vergi-sizintisi',
  },
  {
    id: 'chain-04',
    sourceEventId: 'asgari-ucret-beklentisi',
    sourceResponseIds: ['asgari-ucret-yuksek-zam'],
    followUpEventId: 'sanayi-elektrik-kesintisi',
    delayWeeks: 1,
    reason:
      'Üretim maliyetleri tartışması sanayi çevrelerinin altyapı ve enerji şikâyetlerini görünür hale getirdi.',
    storyFlag: 'chain-04-asgari-sanayi-enerji',
  },
  {
    id: 'chain-05',
    sourceEventId: 'belediye-ihale-dosyasi',
    sourceResponseIds: ['ihale-dosyasi-sert-yolsuzluk', 'ihale-dosyasi-hukuki-surec'],
    followUpEventId: 'rakip-belediye-skandali',
    delayWeeks: 2,
    reason:
      'Yerel yönetimlerde şeffaflık çıkışın başka belediye dosyalarının da gündeme gelmesini sağladı.',
    storyFlag: 'chain-05-ihale-belediye-skandal',
  },
  {
    id: 'chain-06',
    sourceEventId: 'sosyal-medya-duzenlemesi',
    sourceResponseIds: ['sosyal-medya-ozgurluk-savunusu'],
    followUpEventId: 'gazeteci-davasi',
    delayWeeks: 1,
    reason: 'İfade özgürlüğü çıkışın medya ve yargı tartışmalarını kampanya gündemine taşıdı.',
    storyFlag: 'chain-06-sosyal-medya-gazeteci-dava',
  },
  {
    id: 'chain-07',
    sourceEventId: 'multeci-mahallesi-gerilimi',
    sourceResponseIds: ['gocmen-gerilimi-sert-politika'],
    followUpEventId: mapFollowUpEventId('miting-cevresinde-gerilim'),
    delayWeeks: 1,
    reason:
      'Sert göç politikası mesajın mahallelerde tansiyonu artırdı; saha etkinliklerinde güvenlik hassasiyeti yükseldi.',
    storyFlag: 'chain-07-goc-miting-gerilim',
  },
  {
    id: 'chain-08',
    sourceEventId: 'parti-ici-liste-krizi',
    sourceResponseIds: ['liste-krizi-gormezden-gel'],
    followUpEventId: 'aday-adayi-bagis-tartismasi',
    delayWeeks: 2,
    reason:
      'Liste krizini yönetmemen parti içi memnuniyetsizliği büyüttü; adaylık ve bağış süreçleri sorgulanmaya başladı.',
    storyFlag: 'chain-08-liste-bagis-tartisma',
  },
  {
    id: 'chain-09',
    sourceEventId: 'afet-yardim-organizasyonu',
    sourceResponseIds: ['afet-yardim-sahaya-in', 'afet-yardim-koordinasyon'],
    followUpEventId: 'deprem-toplanma-alani-tartismasi',
    delayWeeks: 2,
    reason:
      'Afet sahasında görünür olman afet hazırlığı ve toplanma alanları konusunu doğal olarak yeni gündeme taşıdı.',
    storyFlag: 'chain-09-afet-toplanma-alani',
  },
  {
    id: 'chain-10',
    sourceEventId: 'rakip-lider-gaffi',
    sourceResponseIds: ['rakip-gaffi-viral-saldiri'],
    followUpEventId: 'sosyal-medya-duzenlemesi',
    delayWeeks: 1,
    reason: 'Viral kampanya sosyal medyada siyasi dil ve dezenformasyon tartışmasını büyüttü.',
    storyFlag: 'chain-10-rakip-gaffi-sosyal-medya',
  },

  // Legacy — özel tepkili eski ana gündemler (customEventResponses)
  {
    id: 'chain-ignored-attack',
    sourceEventId: 'crisis-opponent-attack',
    sourceResponseIds: ['attack-ignore'],
    followUpEventId: 'agenda-media-debate',
    delayWeeks: 2,
    reason: 'Saldırıya zayıf yanıt medya gündemini büyüttü.',
    storyFlag: 'weak-media-response',
  },
  {
    id: 'chain-wage-promise-scrutiny',
    sourceEventId: 'agenda-inflation',
    sourceResponseIds: ['inflation-wage-promise'],
    followUpEventId: 'crisis-donation-scrutiny',
    delayWeeks: 3,
    reason: 'Refah vaadi finansman ve şeffaflık tartışmasını tetikledi.',
    storyFlag: 'wage-promise-backlash',
  },
  {
    id: 'chain-youth-jobs-media',
    sourceEventId: 'agenda-unemployment-youth',
    sourceResponseIds: ['youth-jobs-program'],
    followUpEventId: 'opportunity-media-trend',
    delayWeeks: 2,
    reason: 'Gençlik programı dijital gündeme taşındı.',
    storyFlag: 'youth-program-momentum',
  },
  {
    id: 'chain-corruption-legal',
    sourceEventId: 'agenda-corruption-debate',
    sourceResponseIds: ['corruption-deflect', 'corruption-measured'],
    followUpEventId: 'crisis-legal-inquiry',
    delayWeeks: 2,
    reason: 'Şeffaflık tartışması hukuki soruşturma baskısını artırdı.',
    storyFlag: 'transparency-pressure',
  },
  {
    id: 'chain-disaster-local',
    sourceEventId: 'agenda-disaster-response',
    sourceResponseIds: ['disaster-ignore', 'disaster-aid'],
    followUpEventId: 'crisis-local-rumor',
    delayWeeks: 2,
    reason: 'Afet gündemindeki zayıf liderlik yerel güven sorununu alevlendirdi.',
    storyFlag: 'disaster-fallout',
  },
  {
    id: 'chain-protest-clash',
    sourceEventId: 'crisis-protest-clash',
    sourceResponseIds: ['protest-order'],
    followUpEventId: 'agenda-unemployment-youth',
    delayWeeks: 1,
    reason: 'Gerilim sonrası gençlik ve adalet gündemi öne çıktı.',
    storyFlag: 'protest-aftermath',
  },
];

export function findMatchingStoryChains(
  eventId: string,
  responseId: string,
): EventStoryChain[] {
  return eventStoryChains.filter(
    (chain) =>
      chain.sourceEventId === eventId && chain.sourceResponseIds.includes(responseId),
  );
}
