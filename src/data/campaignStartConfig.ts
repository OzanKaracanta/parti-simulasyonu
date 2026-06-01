/** Kampanya başlangıç örgüt ve destek hedefleri */

export const CAMPAIGN_START_NATIONAL_SUPPORT = {
  min: 10,
  max: 13,
} as const;

export const CAMPAIGN_START_CONFIG = {
  /** Merkez (ev) bölgesi hariç komşularda kurulu il bürosu sayısı */
  neighborIlOfficeRegionCount: 2,
  ilOfficeLevel: 1,
  nationalHeadquartersLevel: 1,
  /** İl bürosu zinciri: gönüllü + mahalle + il (buildTool çağrılmadan, sadece seviye) */
  grantFoundingPrerequisites: true,
  /**
   * Kuruluş mirasındaki bölgesel araçların bakım çarpanı (hafta ≤ graceWeeks).
   * Geçici Genel Merkez (L1) ulusal araç verisinde bakımsız.
   * 0,60 — tüm bölgelerde hafta 1 neti ≥0 (popülist liderlik dahil); 0,75 bazı doğuda −2 veriyordu.
   */
  foundingRegionalMaintenanceMultiplier: 0.6,
  /** İlk ~3 ay kuruluş dönemi; sonrası tam bakım */
  foundingMaintenanceGraceWeeks: 12,
  /** Kuruluş döneminde sempatizan bağış tabanı (+₺, haftalık) */
  foundingSympathizerDonationBonus: 2,
} as const;

/** Hafta 1 bütçe hedefi (verify + ince ayar) */
export const CAMPAIGN_START_WEEKLY_NET = {
  min: 0,
  /** Çoğu kurulumda üst sınır; aşırı kolaylaştırmayı önler */
  max: 6,
} as const;

/** Merkez bölge + komşu il büroları */
export const CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS =
  1 + CAMPAIGN_START_CONFIG.neighborIlOfficeRegionCount;

export const CAMPAIGN_START_TOOL_IDS = {
  nationalHeadquarters: 'party_headquarters',
  ilOffice: 'il_party_office',
  volunteerNetwork: 'volunteer_network',
  neighborhoodOrganization: 'neighborhood_organization',
} as const;
