/** Bölgesel olay zincirleri — tepki sonrası aynı bölgede gecikmeli takip */

export interface RegionalStoryChain {
  id: string;
  sourceRegionalEventId: string;
  sourceResponseIds: string[];
  followUpRegionalEventId: string;
  delayWeeks: number;
  reason: string;
  storyFlag: string;
}

export const regionalStoryChains: RegionalStoryChain[] = [
  {
    id: 'reg-chain-marmara-deprem-trafik',
    sourceRegionalEventId: 'reg-marmara-deprem-alani',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-marmara-kanal-trafik',
    delayWeeks: 2,
    reason:
      'Deprem alanı tartışmasında net duruşun kent altyapısı ve ulaşım gündemini yeniden alevlendirdi.',
    storyFlag: 'reg-chain-marmara-deprem-trafik',
  },
  {
    id: 'reg-chain-marmara-goc-trafik',
    sourceRegionalEventId: 'reg-marmara-gocmen-entegrasyon',
    sourceResponseIds: ['sub-measured'],
    followUpRegionalEventId: 'reg-marmara-kanal-trafik',
    delayWeeks: 1,
    reason:
      'Konut baskısı mesajın toplu taşıma ve trafik maliyetlerini gündeme taşıdı.',
    storyFlag: 'reg-chain-marmara-goc-trafik',
  },
  {
    id: 'reg-chain-ege-turizm-imar',
    sourceRegionalEventId: 'reg-ege-turizm-sezonu',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-ege-cevre-imar',
    delayWeeks: 2,
    reason:
      'Turizm sezonu çıkışın imar ve çevre tartışmalarını Ege kıyılarında yeniden gündeme getirdi.',
    storyFlag: 'reg-chain-ege-turizm-imar',
  },
  {
    id: 'reg-chain-ege-balikci-imar',
    sourceRegionalEventId: 'reg-ege-balikci-limani',
    sourceResponseIds: ['sub-pass'],
    followUpRegionalEventId: 'reg-ege-cevre-imar',
    delayWeeks: 1,
    reason:
      'Balıkçı limanı gündeminde sessiz kalman çevre ve imar dosyasının rakipler tarafından sahiplenilmesine yol açtı.',
    storyFlag: 'reg-chain-ege-balikci-imar',
  },
  {
    id: 'reg-chain-ic-kuraklik-sanayi',
    sourceRegionalEventId: 'reg-ic-anadolu-kuraklik',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-ic-anadolu-sanayi-kesinti',
    delayWeeks: 1,
    reason:
      'Kuraklık mesajın sanayi ve enerji kesintisi tartışmasını İç Anadolu\'da büyüttü.',
    storyFlag: 'reg-chain-ic-kuraklik-sanayi',
  },
  {
    id: 'reg-chain-ic-yol-kuraklik',
    sourceRegionalEventId: 'reg-ic-anadolu-koy-yolu',
    sourceResponseIds: ['sub-measured'],
    followUpRegionalEventId: 'reg-ic-anadolu-kuraklik',
    delayWeeks: 2,
    reason:
      'Köy yolu vaatlerin su ve tarım gündemini yeniden öne çıkardı.',
    storyFlag: 'reg-chain-ic-yol-kuraklik',
  },
  {
    id: 'reg-chain-karadeniz-findik-balikci',
    sourceRegionalEventId: 'reg-karadeniz-findik',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-karadeniz-balikci',
    delayWeeks: 2,
    reason:
      'Fındık fiyatı çıkışın sahil ve balıkçılık kesimlerinde dayanışma talebini artırdı.',
    storyFlag: 'reg-chain-karadeniz-findik-balikci',
  },
  {
    id: 'reg-chain-karadeniz-heyelan-findik',
    sourceRegionalEventId: 'reg-karadeniz-heyelan',
    sourceResponseIds: ['sub-measured'],
    followUpRegionalEventId: 'reg-karadeniz-findik',
    delayWeeks: 1,
    reason:
      'Heyelan sonrası ölçülü çizgin tarım ve fiyat gündemini yeniden açtı.',
    storyFlag: 'reg-chain-karadeniz-heyelan-findik',
  },
  {
    id: 'reg-chain-dogu-ulastirma-goc',
    sourceRegionalEventId: 'reg-dogu-kis-ulastirma',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-dogu-goc-geridonus',
    delayWeeks: 2,
    reason:
      'Kış ulaşımı mesajın göç ve geri dönüş tartışmasını Doğu Anadolu\'da derinleştirdi.',
    storyFlag: 'reg-chain-dogu-ulastirma-goc',
  },
  {
    id: 'reg-chain-dogu-hayvancilik-ulastirma',
    sourceRegionalEventId: 'reg-dogu-hayvancilik',
    sourceResponseIds: ['sub-pass'],
    followUpRegionalEventId: 'reg-dogu-kis-ulastirma',
    delayWeeks: 1,
    reason:
      'Hayvancılık gündeminde konuşmaman ulaşım ve tedarik sorunlarını görünür kıldı.',
    storyFlag: 'reg-chain-dogu-hayvancilik-ulastirma',
  },
  {
    id: 'reg-chain-akdeniz-turizm-goc',
    sourceRegionalEventId: 'reg-akdeniz-turizm-firsati',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-akdeniz-gocmen-tarim',
    delayWeeks: 2,
    reason:
      'Turizm hamlen tarım işgücü ve göçmen çalışan tartışmasını Akdeniz\'de alevlendirdi.',
    storyFlag: 'reg-chain-akdeniz-turizm-goc',
  },
  {
    id: 'reg-chain-guneydogu-sulama-genc',
    sourceRegionalEventId: 'reg-guneydogu-sulama',
    sourceResponseIds: ['sub-bold'],
    followUpRegionalEventId: 'reg-guneydogu-genc-is',
    delayWeeks: 1,
    reason:
      'Sulama vaatlerin genç işsizlik ve istihdam gündemini Güneydoğu\'da öne çıkardı.',
    storyFlag: 'reg-chain-guneydogu-sulama-genc',
  },
  {
    id: 'reg-chain-guneydogu-kultur-genc',
    sourceRegionalEventId: 'reg-guneydogu-kultur-etkinlik',
    sourceResponseIds: ['sub-measured'],
    followUpRegionalEventId: 'reg-guneydogu-genc-is',
    delayWeeks: 2,
    reason:
      'Kültür festivali tartışması gençlerin ekonomik beklentilerini gündeme taşıdı.',
    storyFlag: 'reg-chain-guneydogu-kultur-genc',
  },
];

export function findMatchingRegionalStoryChains(
  regionalEventId: string,
  responseId: string,
): RegionalStoryChain[] {
  return regionalStoryChains.filter(
    (chain) =>
      chain.sourceRegionalEventId === regionalEventId &&
      chain.sourceResponseIds.includes(responseId),
  );
}
