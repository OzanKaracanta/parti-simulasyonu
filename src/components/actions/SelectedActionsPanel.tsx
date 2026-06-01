import { getRegionById } from '../../data/regions';
import { isRegionalAction } from '../../data/regionalActions';
import { resourceLabels } from '../../data/labels';
import { resolveSelectedActions } from '../../engine/eventEngine';
import { formatOrganizationLoadUsage } from '../../engine/organizationLoadEngine';
import { sumSelectedCosts } from '../../utils/actionFormat';
import type { GameState, ResourceKey } from '../../types/game';
import { ActionCostChips } from '../ui/ActionCostChips';
import { Panel } from '../ui/Panel';
import { synergyBadgeClass } from './actionUi';
import './actions.css';

interface SelectedActionsPanelProps {
  state: GameState;
  onRemove: (actionId: string) => void;
}

function formatTotalCost(total: Partial<Record<ResourceKey, number>>): string {
  const parts = Object.entries(total)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => `${value} ${resourceLabels[key as ResourceKey]}`);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function SelectedActionsPanel({ state, onRemove }: SelectedActionsPanelProps) {
  const selectedEntries = resolveSelectedActions(state);
  const totalCost = sumSelectedCosts(selectedEntries.map((entry) => entry.resolved));

  return (
    <Panel
      title="Bu Haftanın Planı"
      variant="command"
      headerExtra={<span className="plan-count">{selectedEntries.length} operasyon</span>}
      compact
      className="plan-panel"
    >
      {selectedEntries.length === 0 ? (
        <p className="plan-empty">Henüz operasyon seçilmedi. Alttaki kartlardan sahaya aksiyon ekle.</p>
      ) : (
        <>
          <ul className="plan-cards">
            {selectedEntries.map(({ resolved, labels }) => {
              const targetRegionId = state.selectedActionTargets[resolved.id];
              const regionLabel =
                targetRegionId && isRegionalAction(resolved.id)
                  ? getRegionById(targetRegionId).name
                  : null;

              return (
              <li key={resolved.id} className="plan-card">
                <div className="plan-card-main">
                  <span className="plan-card-name">
                    {resolved.name}
                    {regionLabel ? <span className="plan-card-region"> · {regionLabel}</span> : null}
                  </span>
                  {labels.length > 0 ? (
                    <div className="plan-card-tags">
                      {labels.map((label) => (
                        <span className={`fm-badge ${synergyBadgeClass(label)}`} key={label}>
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ActionCostChips action={resolved} />
                <button
                  type="button"
                  className="operation-deploy-btn deployed remove plan-remove-btn"
                  onClick={() => onRemove(resolved.id)}
                  aria-label={`${resolved.name} kaldır`}
                >
                  Kaldır
                </button>
              </li>
              );
            })}
          </ul>
          <div className="plan-total">
            Toplam maliyet: <span>{formatTotalCost(totalCost)}</span>
            <span className="plan-load-total"> · örgüt yükü {formatOrganizationLoadUsage(state)}</span>
          </div>
        </>
      )}
    </Panel>
  );
}
