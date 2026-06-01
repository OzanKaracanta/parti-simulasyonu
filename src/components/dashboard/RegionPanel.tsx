import { Panel } from '../ui/Panel';
import { StatBar } from '../ui/StatBar';
import { TurkeySvgMap } from './TurkeySvgMap';
import type { RegionState } from '../../types/game';
import './dashboard.css';

interface RegionPanelProps {
  regions: RegionState[];
  homeRegionId: string;
}

export function RegionPanel({ regions, homeRegionId }: RegionPanelProps) {
  const sorted = [...regions].sort((a, b) => b.support - a.support);

  return (
    <Panel title="Bölgesel Destek Dağılımı">
      <table className="fm-table region-table">
        <thead>
          <tr>
            <th>Bölge</th>
            <th>Destek</th>
            <th>Örgüt</th>
            <th>Medya</th>
            <th>Grup Profili</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((region) => (
            <tr key={region.id} className={region.id === homeRegionId ? 'home-region' : ''}>
              <td>
                {region.name}
                {region.id === homeRegionId ? <span className="home-badge">Ana</span> : null}
              </td>
              <td className="num">{region.support.toFixed(1)}%</td>
              <td className="num">{region.organization}</td>
              <td className="num">{region.mediaReach}</td>
              <td className="region-groups">{region.dominantGroups.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

interface RegionMapProps {
  regions: RegionState[];
  homeRegionId: string;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  hasIlPartyOffice?: (regionId: string) => boolean;
  hasRegionalAgenda?: (regionId: string) => boolean;
}

export function RegionMap({
  regions,
  homeRegionId,
  selectedRegionId,
  onSelectRegion,
  hasIlPartyOffice,
  hasRegionalAgenda,
}: RegionMapProps) {
  return (
    <Panel title="Ülke Genel Durumu" className="region-map-panel">
      <TurkeySvgMap
        regions={regions}
        homeRegionId={homeRegionId}
        selectedRegionId={selectedRegionId}
        onSelectRegion={onSelectRegion}
        hasIlPartyOffice={hasIlPartyOffice}
        hasRegionalAgenda={hasRegionalAgenda}
      />
    </Panel>
  );
}

export function RegionSummary({ regions }: { regions: RegionState[] }) {
  const top3 = [...regions].sort((a, b) => b.support - a.support).slice(0, 3);

  return (
    <Panel title="Güçlü Bölgeler" compact>
      {top3.map((region) => (
        <StatBar key={region.id} label={region.name} value={Math.round(region.support)} max={50} />
      ))}
    </Panel>
  );
}
