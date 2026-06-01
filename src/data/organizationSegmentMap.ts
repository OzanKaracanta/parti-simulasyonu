/** Örgüt aracı → segment erişimi (bölge bazlı uygulanır) */

import type { SegmentId } from '../types/game';

export interface OrganizationSegmentReach {
  segments: SegmentId[];
  /** Aktif seviye başına haftalık segment bonusu */
  amountPerLevel: number;
}

export const ORGANIZATION_SEGMENT_REACH: Record<string, OrganizationSegmentReach> = {
  volunteer_network: {
    segments: ['youth', 'workers'],
    amountPerLevel: 1,
  },
  neighborhood_organization: {
    segments: ['retirees', 'farmers'],
    amountPerLevel: 1,
  },
  il_party_office: {
    segments: ['merchants', 'retirees', 'farmers'],
    amountPerLevel: 1,
  },
  district_party_office: {
    segments: ['workers', 'civilServants'],
    amountPerLevel: 1,
  },
  local_press_network: {
    segments: ['retirees', 'merchants', 'civilServants'],
    amountPerLevel: 1,
  },
  small_donation_campaign: {
    segments: ['merchants'],
    amountPerLevel: 1,
  },
  social_media_team: {
    segments: ['youth'],
    amountPerLevel: 1.5,
  },
  membership_fee_system: {
    segments: ['civilServants', 'workers'],
    amountPerLevel: 1,
  },
  polling_center: {
    segments: ['retirees', 'civilServants'],
    amountPerLevel: 1,
  },
};

export function getOrganizationSegmentReach(toolId: string): OrganizationSegmentReach | undefined {
  return ORGANIZATION_SEGMENT_REACH[toolId];
}
