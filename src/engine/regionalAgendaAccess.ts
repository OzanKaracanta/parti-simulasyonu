/** Bölgesel gündem — teşkilat kapısı ve erişim */

import {
  REGIONAL_AGENDA_ORG_MIN_LEVEL,
  REGIONAL_AGENDA_ORG_TOOL_ID,
} from '../data/regionalAgendaConfig';
import { getRegionOrganizationToolLevel } from '../systems/regionOrganization';
import type { GameState, RegionId } from '../types/game';

export function canRespondToRegionalAgenda(state: GameState, regionId: RegionId): boolean {
  const volunteerLevel = getRegionOrganizationToolLevel(
    state,
    regionId,
    REGIONAL_AGENDA_ORG_TOOL_ID,
  );
  if (volunteerLevel >= REGIONAL_AGENDA_ORG_MIN_LEVEL) return true;

  const neighborhoodLevel = getRegionOrganizationToolLevel(
    state,
    regionId,
    'neighborhood_organization',
  );
  return neighborhoodLevel >= 1;
}

export function getRegionalAgendaAccessReason(
  state: GameState,
  regionId: RegionId,
): string | null {
  if (canRespondToRegionalAgenda(state, regionId)) return null;
  return 'Bu bölgede Gönüllü Ağı veya Mahalle Örgütlenmesi kurulmalı';
}
