/** Türkiye 7 bölge — vektörleştirilmiş SVG path verisi */

import generated from './turkeyRegionMapPaths.generated.json';
import type { RegionId } from '../types/game';

export const TURKEY_MAP_VIEWBOX = generated.viewBox;

export interface TurkeyRegionMapShape {
  id: RegionId;
  label: string;
  baseColor: string;
  path: string;
  holes: string[];
  labelX: number;
  labelY: number;
}

const regionLabels: Record<RegionId, string> = {
  marmara: 'Marmara',
  karadeniz: 'Karadeniz',
  ege: 'Ege',
  'ic-anadolu': 'İç Anadolu',
  akdeniz: 'Akdeniz',
  'dogu-anadolu': 'Doğu Anadolu',
  'guneydogu-anadolu': 'Güneydoğu',
};

export const turkeyRegionMapShapes: TurkeyRegionMapShape[] = generated.regions.map((region) => ({
  id: region.id as RegionId,
  label: regionLabels[region.id as RegionId],
  baseColor: region.baseColor,
  path: region.path,
  holes: region.holes ?? [],
  labelX: region.labelX,
  labelY: region.labelY,
}));

export const TURKEY_OUTLINE_PATH = generated.outline;

export function combineRegionPath(shape: TurkeyRegionMapShape): string {
  const mainPath = shape.path.trim();
  if (shape.holes.length === 0) return mainPath;
  return [mainPath, ...shape.holes].join(' ');
}

/** Vektörleştirme artefaktlarını ayıklamak için alt path sayısını doğrular */
export function countPathSubpaths(path: string): number {
  return path.split(/\s(?=M )/).filter(Boolean).length;
}
