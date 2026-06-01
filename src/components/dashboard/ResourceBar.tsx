import { resourceLabels } from '../../data/labels';
import { Panel } from '../ui/Panel';
import { StatBar } from '../ui/StatBar';
import type { GameState, ResourceKey } from '../../types/game';
import './dashboard.css';

const resourceMax: Partial<Record<ResourceKey, number>> = {
  money: 200,
  energy: 100,
  volunteers: 100,
  reputation: 100,
  organizationCapacity: 100,
};

interface ResourceBarProps {
  resources: GameState['resources'];
  resourceChanges?: Partial<Record<ResourceKey, number>>;
}

export function ResourceBar({ resources, resourceChanges }: ResourceBarProps) {
  return (
    <Panel title="Kaynak Durumu" compact>
      {(Object.entries(resources) as [ResourceKey, number][]).map(([key, value]) => (
        <StatBar
          key={key}
          label={resourceLabels[key]}
          value={value}
          max={resourceMax[key] ?? 100}
          delta={resourceChanges?.[key]}
          variant="party"
        />
      ))}
    </Panel>
  );
}

interface ResourceTableProps {
  resources: GameState['resources'];
}

export function ResourceTable({ resources }: ResourceTableProps) {
  return (
    <Panel title="Kaynak Tablosu">
      <table className="fm-table">
        <thead>
          <tr>
            <th>Kaynak</th>
            <th>Mevcut</th>
            <th>Kapasite</th>
            <th>Doluluk</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(resources) as [ResourceKey, number][]).map(([key, value]) => {
            const max = resourceMax[key] ?? 100;
            const pct = Math.round((value / max) * 100);
            return (
              <tr key={key}>
                <td>{resourceLabels[key]}</td>
                <td className="num">{value}</td>
                <td className="num">{max}</td>
                <td className={pct >= 80 ? 'negative' : pct <= 20 ? 'negative' : ''}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
