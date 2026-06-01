import type { Dispatch } from 'react';
import { isRegionalAction } from '../../data/regionalActions';
import {
  getActionSynergyLevel,
  getSynergyLabel,
  resolveActionForState,
} from '../../engine/actionSynergyEngine';
import { getActionDisabledReason } from '../../engine/gameEngine';
import { resolveRegionalActionForDisplay } from '../../engine/regionalActionEngine';
import { formatOrganizationLoadUsage } from '../../engine/organizationLoadEngine';
import { getOrganizationToolViews } from '../../systems/organizationSystem';
import { filterRegionalActionsForRegion } from '../../systems/actionUnlockSystem';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { OperationCard } from '../actions/OperationCard';
import { OrganizationToolCard } from '../organization/OrganizationToolCard';
import { Panel } from '../ui/Panel';
import './dashboard.css';

interface RegionalCommandPanelsProps {
  state: GameState;
  regionId: RegionId;
  dispatch: Dispatch<GameAction>;
}

/** Komuta merkezi — seçili bölge örgüt araçları ve kampanyalar */
export function RegionalCommandPanels({ state, regionId, dispatch }: RegionalCommandPanelsProps) {
  const toolViews = getOrganizationToolViews(state, regionId);
  const activeTools = toolViews.filter((view) => view.level > 0).length;

  const regionalActions = filterRegionalActionsForRegion(
    state,
    state.availableActions.filter((action) => isRegionalAction(action.id)),
    regionId,
  );

  const lockedRegionalActions = state.availableActions.filter(
    (action) =>
      isRegionalAction(action.id) &&
      !regionalActions.some((unlocked) => unlocked.id === action.id),
  );

  return (
    <>
      <Panel
        title="Bölgesel Örgütlenme Araçları"
        headerExtra={<span className="org-tool-count">{activeTools} aktif</span>}
        className="region-tools-panel"
        collapsible
        defaultOpen={false}
      >
        <div className="region-tools-list">
          {toolViews.map((view) => (
            <OrganizationToolCard
              key={view.definition.id}
              view={view}
              onBuild={() =>
                dispatch({ type: 'BUILD_ORGANIZATION_TOOL', toolId: view.definition.id, regionId })
              }
              onUpgrade={() =>
                dispatch({ type: 'UPGRADE_ORGANIZATION_TOOL', toolId: view.definition.id, regionId })
              }
              onRevert={() =>
                dispatch({ type: 'REVERT_ORGANIZATION_TOOL', toolId: view.definition.id, regionId })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel
        title="Bölgesel Kampanyalar"
        variant="operation"
        headerExtra={
          <span className="action-count-badge">
            {state.selectedActionIds.filter((id) => state.selectedActionTargets[id] === regionId).length}{' '}
            seçili · yük {formatOrganizationLoadUsage(state)}
          </span>
        }
        className="region-campaigns-panel"
        collapsible
        defaultOpen={false}
      >
        <div className="operation-cards-grid region-campaigns-grid">
          {regionalActions.length === 0 && lockedRegionalActions.length === 0 ? (
            <p className="operations-empty">Bu bölgede henüz kampanya yok.</p>
          ) : null}

          {regionalActions.map((baseAction) => {
            const { labels } = resolveActionForState(state, baseAction);
            const resolved = resolveRegionalActionForDisplay(state, baseAction, regionId);
            const synergyLabel = getSynergyLabel(getActionSynergyLevel(state, baseAction));
            const selected =
              state.selectedActionIds.includes(baseAction.id) &&
              state.selectedActionTargets[baseAction.id] === regionId;
            const disabledReason = getActionDisabledReason(state, baseAction, regionId);
            const disabled = !selected && disabledReason !== null;
            const displayLabels = synergyLabel ? [...labels, synergyLabel] : labels;

            return (
              <OperationCard
                key={baseAction.id}
                action={resolved}
                displayLabels={displayLabels}
                selected={selected}
                disabled={disabled}
                disabledReason={disabledReason}
                onSelect={() =>
                  dispatch({ type: 'SELECT_ACTION', actionId: baseAction.id, regionId })
                }
                onUnselect={() => dispatch({ type: 'UNSELECT_ACTION', actionId: baseAction.id })}
              />
            );
          })}

          {lockedRegionalActions.map((baseAction) => {
            const resolved = resolveRegionalActionForDisplay(state, baseAction, regionId);
            const disabledReason = getActionDisabledReason(state, baseAction, regionId);

            return (
              <OperationCard
                key={`locked-${baseAction.id}`}
                action={resolved}
                displayLabels={[]}
                selected={false}
                disabled
                disabledReason={disabledReason ?? 'Örgüt aracı gerekli'}
                onSelect={() => undefined}
                onUnselect={() => undefined}
              />
            );
          })}
        </div>
      </Panel>
    </>
  );
}
