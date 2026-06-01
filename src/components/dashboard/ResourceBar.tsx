import { resourceLabels, WEEKLY_BUDGET_RESOURCE_KEYS } from '../../data/labels';
import { Panel } from '../ui/Panel';
import { StatBar } from '../ui/StatBar';
import type { GameState, ResourceKey } from '../../types/game';
import { CoordinationMeter } from './CoordinationMeter';
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
  organizationState?: GameState;
}

export function ResourceBar({ resources, resourceChanges, organizationState }: ResourceBarProps) {
  return (
    <Panel title="Kaynak Durumu" compact>
      <p className="resource-bar-section-label">Haftalık bütçe</p>
      {WEEKLY_BUDGET_RESOURCE_KEYS.map((key) => (
        <StatBar
          key={key}
          label={resourceLabels[key]}
          value={resources[key]}
          max={resourceMax[key] ?? 100}
          delta={resourceChanges?.[key]}
          variant="party"
        />
      ))}

      <p className="resource-bar-section-label resource-bar-section-label--spaced">
        Parti durumu
      </p>
      <StatBar
        label={resourceLabels.reputation}
        value={resources.reputation}
        max={resourceMax.reputation ?? 100}
        delta={resourceChanges?.reputation}
        variant="party"
      />

      {organizationState ? (
        <>
          <p className="resource-bar-section-label resource-bar-section-label--spaced">
            Operasyon planı
          </p>
          <CoordinationMeter state={organizationState} />
        </>
      ) : null}
    </Panel>
  );
}

interface ResourceTableProps {
  resources: GameState['resources'];
  organizationLoadUsed?: number;
}

export function ResourceTable({ resources, organizationLoadUsed }: ResourceTableProps) {
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
          {WEEKLY_BUDGET_RESOURCE_KEYS.map((key) => {
            const max = resourceMax[key] ?? 100;
            const value = resources[key];
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
          <tr>
            <td>{resourceLabels.reputation}</td>
            <td className="num">{resources.reputation}</td>
            <td className="num">{resourceMax.reputation}</td>
            <td>{Math.round((resources.reputation / (resourceMax.reputation ?? 100)) * 100)}%</td>
          </tr>
          {organizationLoadUsed !== undefined ? (
            <tr>
              <td>Koordinasyon yükü (bu hafta)</td>
              <td className="num">{organizationLoadUsed}</td>
              <td className="num">{resources.organizationCapacity}</td>
              <td>
                {resources.organizationCapacity > 0
                  ? `${Math.round((organizationLoadUsed / resources.organizationCapacity) * 100)}%`
                  : '—'}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Panel>
  );
}
