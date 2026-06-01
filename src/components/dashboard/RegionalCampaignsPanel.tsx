import type { Dispatch } from 'react';
import { isRegionalAction } from '../../data/regionalActions';
import {
  getActionSynergyLevel,
  getSynergyLabel,
  resolveActionForState,
} from '../../engine/actionSynergyEngine';
import { getActionDisabledReason } from '../../engine/gameEngine';
import { resolveRegionalActionForDisplay } from '../../engine/regionalActionEngine';
import { CoordinationMeter } from './CoordinationMeter';
import { filterRegionalActionsForRegion } from '../../systems/actionUnlockSystem';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { OperationCard } from '../actions/OperationCard';
import { Panel } from '../ui/Panel';
import './dashboard.css';

interface RegionalCampaignsPanelProps {
  state: GameState;
  regionId: RegionId;
  dispatch: Dispatch<GameAction>;
}

/** Kampanya sayfası — seçili bölge operasyonları (ulusal operasyonların altında) */
export function RegionalCampaignsPanel({ state, regionId, dispatch }: RegionalCampaignsPanelProps) {
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

  const selectedInRegion = state.selectedActionIds.filter(
    (id) => state.selectedActionTargets[id] === regionId,
  ).length;

  const hasContent = regionalActions.length > 0 || lockedRegionalActions.length > 0;

  return (
    <Panel
      title="Bölgesel Kampanyalar"
      variant="operation"
      headerExtra={
        <div className="action-list-header-extra">
          <span className="action-count-badge">{selectedInRegion} bu bölgede seçili</span>
          <CoordinationMeter state={state} compact />
        </div>
      }
      className="region-campaigns-panel"
    >
      <div className="operation-cards-grid region-campaigns-grid">
        {!hasContent ? (
          <p className="operations-empty">
            Bu bölgede henüz kampanya yok. Örgüt sayfasından bölgesel araç kurarak yeni operasyonlar
            açabilirsiniz.
          </p>
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
  );
}
