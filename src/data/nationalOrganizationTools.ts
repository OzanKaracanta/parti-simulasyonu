/**
 * Ulusal örgütlenme araçları — 6 araç, merkez hiyerarşisi.
 *
 * Genel Merkez → (Sosyal Medya | Üyelik/Aidat | Hukuk Birimi)
 * → Anket Merkezi → Kampanya Danışmanlığı
 */

import type {
  OrganizationLevelDefinition,
  OrganizationToolDefinition,
} from '../types/organization';

function level(def: OrganizationLevelDefinition): OrganizationLevelDefinition {
  return def;
}

function tool(def: OrganizationToolDefinition): OrganizationToolDefinition {
  return def;
}

export const NATIONAL_ORGANIZATION_TOOL_IDS = [
  'party_headquarters',
  'social_media_team',
  'membership_fee_system',
  'legal_team_unit',
  'polling_center',
  'campaign_consultancy',
] as const;

export type NationalOrganizationToolId = (typeof NATIONAL_ORGANIZATION_TOOL_IDS)[number];

export const nationalOrganizationToolDefinitions: OrganizationToolDefinition[] = [
  tool({
    id: 'party_headquarters',
    name: 'Genel Merkez',
    category: 'strategyProfessionalization',
    description: 'Ulusal koordinasyon ve kurumsal kimlik; diğer merkez araçların ön koşulu.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Geçici Genel Merkez',
        buildCost: { money: 50, volunteers: 4 },
        /** Kuruluş mirası — sabit kira yok; kurumsal merkez (L2) bakım getirir */
        weeklyMaintenance: {},
        instantEffects: {
          metrics: { policyCredibility: 4, crisisManagement: 2 },
        },
        weeklyEffects: {
          metrics: { policyCredibility: 1, campaignVisibility: 1 },
        },
        requirements: { minRegionsWithIlOffice: 1 },
        unlockToolIds: ['social_media_team', 'membership_fee_system', 'legal_team_unit'],
        risks: ['Her ek İl Bürosu ulusal bakım yükünü artırır'],
        maintenanceFailureEffects: { metrics: { policyCredibility: -2 } },
      }),
      level({
        level: 2,
        title: 'Kurumsal Genel Merkez',
        buildCost: { money: 45, volunteers: 2 },
        weeklyMaintenance: { money: 14 },
        instantEffects: {
          metrics: { policyCredibility: 5, crisisManagement: 3, campaignVisibility: 2 },
        },
        weeklyEffects: {
          metrics: { policyCredibility: 2, campaignVisibility: 2, leaderTrust: 1 },
        },
        requirements: {
          requiredTools: [{ toolId: 'party_headquarters', minLevel: 1 }],
          minRegionsWithIlOffice: 2,
        },
        unlockToolIds: ['polling_center'],
        risks: [],
        maintenanceFailureEffects: { metrics: { campaignVisibility: -2 } },
      }),
    ],
  }),

  tool({
    id: 'social_media_team',
    name: 'Sosyal Medya Ekibi',
    category: 'mediaCommunication',
    description: 'Ulusal dijital görünürlük ve genç seçmen erişimi.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Temel Sosyal Medya Ekibi',
        buildCost: { money: 22, energy: 6 },
        weeklyMaintenance: { money: 8 },
        instantEffects: {
          metrics: { mediaPower: 4, youthReach: 3 },
        },
        weeklyEffects: {
          metrics: { mediaPower: 2, youthReach: 2, campaignVisibility: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'party_headquarters', minLevel: 1 }] },
        unlockActionIds: ['social-media-campaign', 'video-address'],
        risks: [],
        maintenanceFailureEffects: { metrics: { mediaPower: -2 } },
      }),
      level({
        level: 2,
        title: 'Profesyonel İçerik Stüdyosu',
        buildCost: { money: 28, energy: 4 },
        weeklyMaintenance: { money: 12 },
        instantEffects: {
          metrics: { mediaPower: 5, campaignVisibility: 4 },
        },
        weeklyEffects: {
          metrics: { mediaPower: 3, youthReach: 2, campaignVisibility: 3 },
        },
        requirements: { requiredTools: [{ toolId: 'social_media_team', minLevel: 1 }] },
        risks: [],
        maintenanceFailureEffects: { metrics: { campaignVisibility: -2 } },
      }),
    ],
  }),

  tool({
    id: 'membership_fee_system',
    name: 'Üyelik / Aidat Sistemi',
    category: 'fundraising',
    description: 'Düzenli üyelik geliri ve mali sürdürülebilirlik.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Temel Üyelik Sistemi',
        buildCost: { money: 20, volunteers: 3 },
        weeklyMaintenance: { money: 6 },
        instantEffects: {
          metrics: { financialSustainability: 4 },
        },
        weeklyEffects: {
          resources: { money: 14 },
          metrics: { financialSustainability: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'party_headquarters', minLevel: 1 }] },
        unlockActionIds: ['membership-fee-campaign'],
        risks: ['Bakım ödenmezse haftalık aidat geliri durur'],
        maintenanceFailureEffects: { resources: { money: -4 } },
      }),
      level({
        level: 2,
        title: 'Genişletilmiş Bağışçı Ağı',
        buildCost: { money: 26, volunteers: 2 },
        weeklyMaintenance: { money: 10 },
        instantEffects: {
          metrics: { financialSustainability: 6 },
        },
        weeklyEffects: {
          resources: { money: 24 },
          metrics: { financialSustainability: 3 },
        },
        requirements: { requiredTools: [{ toolId: 'membership_fee_system', minLevel: 1 }] },
        unlockActionIds: ['donor-network', 'supporter-dinner'],
        risks: ['Yüksek bakım — en az 2 İl Bürosu ile sürdürülebilir'],
        maintenanceFailureEffects: { resources: { money: -6 } },
      }),
    ],
  }),

  tool({
    id: 'legal_team_unit',
    name: 'Hukuk ve Seçim Hukuku Birimi',
    category: 'strategyProfessionalization',
    description: 'Kriz, skandal ve seçim hukuku savunma kapasitesi.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Temel Hukuk Birimi',
        buildCost: { money: 24, energy: 4 },
        weeklyMaintenance: { money: 9 },
        instantEffects: {
          metrics: { crisisManagement: 5, policyCredibility: 3 },
        },
        weeklyEffects: {
          metrics: { crisisManagement: 2, policyCredibility: 1 },
        },
        requirements: { requiredTools: [{ toolId: 'party_headquarters', minLevel: 1 }] },
        unlockActionIds: ['legal-team'],
        risks: ['Seçim sprintinde (H40+) bakım maliyeti artar'],
        maintenanceFailureEffects: { metrics: { crisisManagement: -3 } },
      }),
      level({
        level: 2,
        title: 'Seçim Hukuku Masası',
        buildCost: { money: 30 },
        weeklyMaintenance: { money: 12 },
        instantEffects: {
          metrics: { crisisManagement: 6, policyCredibility: 4 },
        },
        weeklyEffects: {
          metrics: { crisisManagement: 3, policyCredibility: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'legal_team_unit', minLevel: 1 }] },
        risks: [],
        maintenanceFailureEffects: { metrics: { policyCredibility: -2 } },
      }),
    ],
  }),

  tool({
    id: 'polling_center',
    name: 'Anket Merkezi',
    category: 'strategyProfessionalization',
    description: 'Saha araştırması ve seçmen eğilimi takibi.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Temel Anket Birimi',
        buildCost: { money: 28, energy: 6 },
        weeklyMaintenance: { money: 11 },
        instantEffects: {
          metrics: { policyCredibility: 4, campaignVisibility: 2 },
        },
        weeklyEffects: {
          metrics: { policyCredibility: 2, campaignVisibility: 1 },
        },
        requirements: { requiredTools: [{ toolId: 'party_headquarters', minLevel: 2 }] },
        unlockActionIds: ['poll-commission'],
        unlockToolIds: ['campaign_consultancy'],
        risks: ['Geç oyun yatırımı — erken kurulum maliyeti yüksek'],
        maintenanceFailureEffects: { metrics: { policyCredibility: -2 } },
      }),
      level({
        level: 2,
        title: 'Veri Odaklı Araştırma Merkezi',
        buildCost: { money: 32, energy: 4 },
        weeklyMaintenance: { money: 14 },
        instantEffects: {
          metrics: { policyCredibility: 5, financialSustainability: 2 },
        },
        weeklyEffects: {
          metrics: { policyCredibility: 3, campaignVisibility: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'polling_center', minLevel: 1 }] },
        unlockActionIds: ['data-team'],
        risks: [],
        maintenanceFailureEffects: { metrics: { policyCredibility: -3 } },
      }),
    ],
  }),

  tool({
    id: 'campaign_consultancy',
    name: 'Kampanya Danışmanlığı',
    category: 'strategyProfessionalization',
    description: 'Profesyonel kampanya yönetimi ve strateji koordinasyonu.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Dış Danışman Ekibi',
        buildCost: { money: 34, energy: 4 },
        weeklyMaintenance: { money: 16 },
        instantEffects: {
          metrics: { campaignVisibility: 5, mediaPower: 3 },
        },
        weeklyEffects: {
          metrics: { campaignVisibility: 3, mediaPower: 2 },
        },
        requirements: {
          requiredTools: [
            { toolId: 'party_headquarters', minLevel: 2 },
            { toolId: 'polling_center', minLevel: 1 },
          ],
        },
        unlockActionIds: ['campaign-consultant'],
        risks: ['Aktif ulusal araç sayısı arttıkça bürokrasi yükü biner'],
        maintenanceFailureEffects: { metrics: { campaignVisibility: -3 } },
      }),
      level({
        level: 2,
        title: 'Entegre Kampanya Ofisi',
        buildCost: { money: 38, energy: 6 },
        weeklyMaintenance: { money: 18 },
        instantEffects: {
          metrics: { campaignVisibility: 6, policyCredibility: 4 },
        },
        weeklyEffects: {
          metrics: { campaignVisibility: 4, policyCredibility: 2, leaderTrust: 1 },
        },
        requirements: { requiredTools: [{ toolId: 'campaign_consultancy', minLevel: 1 }] },
        unlockActionIds: ['policy-workshop'],
        risks: [],
        maintenanceFailureEffects: { metrics: { campaignVisibility: -4 } },
      }),
    ],
  }),
];

export function isNationalOrganizationTool(toolId: string): boolean {
  return NATIONAL_ORGANIZATION_TOOL_IDS.includes(toolId as NationalOrganizationToolId);
}

export function getNationalOrganizationToolById(id: string) {
  return nationalOrganizationToolDefinitions.find((t) => t.id === id);
}

export function createInitialNationalOrganizationToolLevels(): Record<string, number> {
  return Object.fromEntries(nationalOrganizationToolDefinitions.map((t) => [t.id, 0]));
}
