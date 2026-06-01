/** Coğrafi bölge komşulukları — kampanya başlangıç il büroları için */

import { regionDefinitions } from './regions';
import type { RegionId } from '../types/game';

const REGION_ADJACENCY: Record<RegionId, RegionId[]> = {
  marmara: ['ege', 'ic-anadolu', 'karadeniz'],
  ege: ['marmara', 'ic-anadolu', 'akdeniz'],
  'ic-anadolu': ['marmara', 'ege', 'akdeniz', 'karadeniz', 'dogu-anadolu'],
  akdeniz: ['ege', 'ic-anadolu', 'dogu-anadolu', 'guneydogu-anadolu'],
  karadeniz: ['marmara', 'ic-anadolu', 'dogu-anadolu'],
  'dogu-anadolu': ['karadeniz', 'ic-anadolu', 'akdeniz', 'guneydogu-anadolu'],
  'guneydogu-anadolu': ['dogu-anadolu', 'akdeniz', 'ic-anadolu'],
};

export function getAdjacentRegions(homeRegionId: RegionId): RegionId[] {
  return [...(REGION_ADJACENCY[homeRegionId] ?? [])];
}

/** Merkez bölge hariç, komşulardan `count` kadar il bürosu bölgesi seçer */
export function pickStartingIlOfficeRegions(homeRegionId: RegionId, count: number): RegionId[] {
  const neighbors = getAdjacentRegions(homeRegionId).filter((id) => id !== homeRegionId);

  if (neighbors.length < count) {
    throw new Error(
      `Yetersiz komşu bölge: ${homeRegionId} için ${count} il bürosu gerekli, ${neighbors.length} komşu var`,
    );
  }

  return neighbors.slice(0, count);
}

export function isKnownRegionId(id: string): id is RegionId {
  return regionDefinitions.some((region) => region.id === id);
}
