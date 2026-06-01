/**
 * Örgütlenme araçları — bölgesel + ulusal tanımlar.
 */

export {
  REGIONAL_ORGANIZATION_TOOL_IDS,
  CENTRAL_TREASURY_TOOL_IDS,
  regionalOrganizationToolDefinitions,
  getRegionalOrganizationToolById,
  type RegionalOrganizationToolId,
} from './regionalOrganizationTools';

export {
  NATIONAL_ORGANIZATION_TOOL_IDS,
  nationalOrganizationToolDefinitions,
  getNationalOrganizationToolById,
  isNationalOrganizationTool,
  createInitialNationalOrganizationToolLevels,
  type NationalOrganizationToolId,
} from './nationalOrganizationTools';

import { regionalOrganizationToolDefinitions } from './regionalOrganizationTools';
import {
  getNationalOrganizationToolById,
  nationalOrganizationToolDefinitions,
} from './nationalOrganizationTools';
import type { OrganizationToolLevels } from '../types/organization';

/** @deprecated regionalOrganizationToolDefinitions kullanın */
export const organizationToolDefinitions = regionalOrganizationToolDefinitions;

export function getOrganizationToolById(id: string) {
  return (
    regionalOrganizationToolDefinitions.find((t) => t.id === id) ??
    getNationalOrganizationToolById(id)
  );
}

export function getAllOrganizationToolDefinitions() {
  return [...regionalOrganizationToolDefinitions, ...nationalOrganizationToolDefinitions];
}

export function createInitialOrganizationToolLevels(): OrganizationToolLevels {
  return Object.fromEntries(regionalOrganizationToolDefinitions.map((t) => [t.id, 0]));
}
