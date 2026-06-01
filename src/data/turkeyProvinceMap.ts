/** turkey_map.svg — il path verisi ve 7 bölge gruplaması */

import generated from './turkeyProvinceMap.generated.json';
import type { RegionId } from '../types/game';

export const TURKEY_MAP_VIEWBOX = generated.viewBox;

export interface TurkeyProvincePath {
  id: string;
  regionId: RegionId;
  path: string;
  cx: number;
  cy: number;
}

export const turkeyProvinces: TurkeyProvincePath[] = generated.provinces.map((province) => ({
  id: province.id,
  regionId: province.regionId as RegionId,
  path: province.path,
  cx: province.cx,
  cy: province.cy,
}));

export const turkeyRegionLabels: Record<RegionId, { labelX: number; labelY: number }> =
  generated.regionLabels as Record<RegionId, { labelX: number; labelY: number }>;

export const REGION_IDS: RegionId[] = [
  'marmara',
  'karadeniz',
  'ege',
  'ic-anadolu',
  'akdeniz',
  'dogu-anadolu',
  'guneydogu-anadolu',
];
