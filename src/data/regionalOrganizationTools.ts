/**
 * Bölgeye özel örgütlenme araçları — 6 araç, hiyerarşik kilit zinciri.
 *
 * Gönüllü Ağı → Mahalle Örgütlenmesi → İl Parti Bürosu → İlçe Parti Bürosu
 * → Yerel Basın Ağı (+ İl Bürosu sonrası Küçük Bağış Kampanyası, merkez kasaya)
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

export const REGIONAL_ORGANIZATION_TOOL_IDS = [
  'volunteer_network',
  'neighborhood_organization',
  'il_party_office',
  'district_party_office',
  'local_press_network',
  'small_donation_campaign',
] as const;

export type RegionalOrganizationToolId = (typeof REGIONAL_ORGANIZATION_TOOL_IDS)[number];

/** Bağış geliri merkez partiye gider */
export const CENTRAL_TREASURY_TOOL_IDS = new Set<string>(['small_donation_campaign']);

export const regionalOrganizationToolDefinitions: OrganizationToolDefinition[] = [
  tool({
    id: 'volunteer_network',
    name: 'Gönüllü Ağı',
    category: 'localOrganization',
    description: 'Bölgede saha gücü ve gönüllü üretimi sağlar.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Dağınık Gönüllü Grubu',
        buildCost: { money: 18, volunteers: 2 },
        weeklyMaintenance: { money: 4 },
        instantEffects: { resources: { volunteers: 2 } },
        weeklyEffects: {
          resources: { volunteers: 1, organizationCapacity: 2 },
        },
        requirements: {},
        unlockToolIds: ['neighborhood_organization'],
        risks: [],
        maintenanceFailureEffects: { resources: { volunteers: -1 } },
      }),
      level({
        level: 2,
        title: 'Düzenli Gönüllü Ağı',
        buildCost: { money: 18 },
        weeklyMaintenance: { money: 6 },
        instantEffects: { resources: { volunteers: 2 } },
        weeklyEffects: {
          resources: { volunteers: 2, organizationCapacity: 4 },
          metrics: { localOrganization: 2 },
        },
        requirements: { resources: { volunteers: 8 } },
        risks: [],
        maintenanceFailureEffects: { resources: { volunteers: -2 } },
      }),
    ],
  }),

  tool({
    id: 'neighborhood_organization',
    name: 'Mahalle Örgütlenmesi',
    category: 'localOrganization',
    description: 'Mahalle düzeyinde yüz yüze temas ve yerel güven inşa eder.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Mahalle Temsilciliği',
        buildCost: { money: 14, volunteers: 3 },
        weeklyMaintenance: { money: 5 },
        instantEffects: {
          metrics: { localOrganization: 4, leaderTrust: 2 },
        },
        weeklyEffects: {
          metrics: { localOrganization: 2, regionalInfluence: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'volunteer_network', minLevel: 1 }] },
        unlockToolIds: ['il_party_office'],
        unlockActionIds: ['local-meeting'],
        risks: [],
        maintenanceFailureEffects: { metrics: { leaderTrust: -2 } },
      }),
      level({
        level: 2,
        title: 'Mahalle Örgüt Ağı',
        buildCost: { money: 22, volunteers: 2 },
        weeklyMaintenance: { money: 8 },
        instantEffects: {
          metrics: { localOrganization: 5, leaderTrust: 3 },
        },
        weeklyEffects: {
          metrics: { localOrganization: 3, regionalInfluence: 3, leaderTrust: 1 },
        },
        requirements: {
          requiredTools: [{ toolId: 'neighborhood_organization', minLevel: 1 }],
          metrics: { localOrganization: 10 },
        },
        unlockActionIds: ['local-meeting'],
        risks: [],
        maintenanceFailureEffects: { metrics: { localOrganization: -2 } },
      }),
    ],
  }),

  tool({
    id: 'il_party_office',
    name: 'İl Parti Bürosu',
    category: 'localOrganization',
    description: 'Bölgede kurumsal parti varlığı; seçime yeterlilik için gereklidir.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Geçici İl Bürosu',
        buildCost: { money: 40, volunteers: 3 },
        weeklyMaintenance: { money: 10 },
        instantEffects: {
          metrics: { campaignVisibility: 8, leaderTrust: 3, localOrganization: 5 },
        },
        weeklyEffects: {
          resources: { organizationCapacity: 4, volunteers: 1 },
          metrics: { campaignVisibility: 3, localOrganization: 2 },
        },
        requirements: { requiredTools: [{ toolId: 'neighborhood_organization', minLevel: 1 }] },
        unlockToolIds: ['district_party_office', 'small_donation_campaign'],
        unlockActionIds: ['merchant-visit'],
        risks: ['Haftalık gider ödenemezse Yerel Güven -4'],
        maintenanceFailureEffects: { metrics: { leaderTrust: -4, campaignVisibility: -2 } },
      }),
      level({
        level: 2,
        title: 'Düzenli İl Bürosu',
        buildCost: { money: 35, volunteers: 2 },
        weeklyMaintenance: { money: 16 },
        instantEffects: {
          metrics: { leaderTrust: 6, campaignVisibility: 8, localOrganization: 5 },
        },
        weeklyEffects: {
          resources: { organizationCapacity: 8, volunteers: 2 },
          metrics: { campaignVisibility: 4, leaderTrust: 2 },
        },
        requirements: {
          requiredTools: [{ toolId: 'il_party_office', minLevel: 1 }],
          metrics: { campaignVisibility: 15, leaderTrust: 10 },
        },
        unlockActionIds: ['volunteer-training'],
        risks: [],
        maintenanceFailureEffects: { metrics: { leaderTrust: -3 } },
      }),
    ],
  }),

  tool({
    id: 'district_party_office',
    name: 'İlçe Parti Bürosu',
    category: 'localOrganization',
    description: 'İlçe düzeyinde teşkilat ve saha koordinasyonu sağlar.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'İlçe İrtibat Bürosu',
        buildCost: { money: 28, volunteers: 2 },
        weeklyMaintenance: { money: 7 },
        instantEffects: {
          metrics: { localOrganization: 4, regionalInfluence: 3 },
        },
        weeklyEffects: {
          metrics: { localOrganization: 2, regionalInfluence: 2 },
          resources: { organizationCapacity: 3 },
        },
        requirements: { requiredTools: [{ toolId: 'il_party_office', minLevel: 1 }] },
        unlockToolIds: ['local_press_network'],
        unlockActionIds: ['regional-tour'],
        risks: [],
        maintenanceFailureEffects: { metrics: { regionalInfluence: -2 } },
      }),
      level({
        level: 2,
        title: 'İlçe Teşkilatı',
        buildCost: { money: 32, volunteers: 3 },
        weeklyMaintenance: { money: 12 },
        instantEffects: {
          metrics: { localOrganization: 5, regionalInfluence: 4, leaderTrust: 2 },
        },
        weeklyEffects: {
          metrics: { localOrganization: 3, regionalInfluence: 3 },
          resources: { organizationCapacity: 5 },
        },
        requirements: {
          requiredTools: [{ toolId: 'district_party_office', minLevel: 1 }],
          metrics: { localOrganization: 20 },
        },
        unlockActionIds: ['regional-tour'],
        risks: [],
        maintenanceFailureEffects: { metrics: { localOrganization: -2 } },
      }),
    ],
  }),

  tool({
    id: 'local_press_network',
    name: 'Yerel Basın Ağı',
    category: 'mediaCommunication',
    description: 'Bölgede yerel medya ilişkileri ve görünürlük sağlar.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Yerel Basın Teması',
        buildCost: { money: 40 },
        weeklyMaintenance: { money: 10 },
        instantEffects: { metrics: { mediaPower: 10, campaignVisibility: 6 } },
        weeklyEffects: {
          metrics: { mediaPower: 5, campaignVisibility: 3 },
        },
        requirements: { requiredTools: [{ toolId: 'district_party_office', minLevel: 1 }] },
        unlockActionIds: ['local-press-visit'],
        risks: [],
        maintenanceFailureEffects: { metrics: { mediaPower: -3 } },
      }),
      level({
        level: 2,
        title: 'Düzenli Basın İlişkileri',
        buildCost: { money: 45 },
        weeklyMaintenance: { money: 18 },
        instantEffects: { metrics: { mediaPower: 8, campaignVisibility: 5 } },
        weeklyEffects: {
          metrics: { mediaPower: 8, campaignVisibility: 5, regionalInfluence: 2 },
        },
        requirements: {
          requiredTools: [{ toolId: 'local_press_network', minLevel: 1 }],
          metrics: { mediaPower: 20 },
        },
        unlockActionIds: ['local-press-visit'],
        risks: [],
        maintenanceFailureEffects: { metrics: { mediaPower: -4 } },
      }),
    ],
  }),

  tool({
    id: 'small_donation_campaign',
    name: 'Küçük Bağış Kampanyası',
    category: 'fundraising',
    description: 'Bölgede bağış toplar; gelir merkez parti kasasına aktarılır.',
    maxLevel: 2,
    levels: [
      level({
        level: 1,
        title: 'Destekçi Bağışları',
        buildCost: { money: 15, volunteers: 1 },
        weeklyMaintenance: { money: 2 },
        instantEffects: {},
        weeklyEffects: {
          resources: { money: 8, reputation: 1 },
        },
        requirements: {
          requiredTools: [{ toolId: 'il_party_office', minLevel: 1 }],
          metrics: { leaderTrust: 5 },
        },
        unlockActionIds: ['small-donation-drive'],
        risks: ['Güven düşerse gelir azalır'],
        maintenanceFailureEffects: { resources: { reputation: -1 } },
      }),
      level({
        level: 2,
        title: 'Düzenli Bağış Sistemi',
        buildCost: { money: 18 },
        weeklyMaintenance: { money: 5 },
        instantEffects: { resources: { reputation: 1 } },
        weeklyEffects: {
          resources: { money: 16, reputation: 2 },
        },
        requirements: {
          requiredTools: [{ toolId: 'small_donation_campaign', minLevel: 1 }],
          metrics: { leaderTrust: 12 },
        },
        unlockActionIds: ['small-donation-drive'],
        risks: [],
        maintenanceFailureEffects: { resources: { money: -4 } },
      }),
    ],
  }),
];

export function getRegionalOrganizationToolById(
  id: string,
): OrganizationToolDefinition | undefined {
  return regionalOrganizationToolDefinitions.find((t) => t.id === id);
}
