/** Kampanya ekranı — kompakt bölge seçici */

import type { GameState, RegionId } from '../../types/game';
import { Panel } from '../ui/Panel';
import './RegionSelectorBar.css';

interface RegionSelectorBarProps {
  regions: GameState['regions'];
  homeRegionId: RegionId;
  selectedRegionId: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
  /** Örgüt sayfası — iç içe panel yerine düz şerit */
  variant?: 'panel' | 'embedded';
}

export function RegionSelectorBar({
  regions,
  homeRegionId,
  selectedRegionId,
  onSelectRegion,
  variant = 'panel',
}: RegionSelectorBarProps) {
  const chips = (
    <div className="region-selector-chips">
      {regions.map((region) => (
        <button
          key={region.id}
          type="button"
          className={`region-selector-chip ${selectedRegionId === region.id ? 'selected' : ''} ${region.id === homeRegionId ? 'home' : ''}`}
          onClick={() => onSelectRegion(region.id as RegionId)}
        >
          {region.name}
          {region.id === homeRegionId ? ' ★' : ''}
        </button>
      ))}
    </div>
  );

  if (variant === 'embedded') {
    return (
      <section className="region-selector-embedded" aria-label="Bölge seç">
        <h3 className="region-selector-embedded-label">Bölge Seç</h3>
        {chips}
      </section>
    );
  }

  return (
    <Panel title="Bölge Seç" compact className="region-selector-bar">
      {chips}
    </Panel>
  );
}
