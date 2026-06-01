import { useMemo, useState } from 'react';
import { isRegionalAction } from '../../data/regionalActions';
import { categoryLabels, categoryOrder } from '../../data/labels';
import {
  getActionSynergyLevel,
  getRecommendedActionsForResponse,
  getSynergyLabel,
  resolveActionForState,
} from '../../engine/actionSynergyEngine';
import { getActionDisabledReason } from '../../engine/gameEngine';
import { CoordinationMeter } from '../dashboard/CoordinationMeter';
import type { ActionCategory, CampaignAction, GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import { TabBar } from '../ui/TabBar';
import { OperationCard } from './OperationCard';
import './actions.css';

interface ActionListProps {
  state: GameState;
  onSelect: (actionId: string) => void;
  onUnselect: (actionId: string) => void;
  /** Genel bakışta önerilen sekmesi varsayılan */
  defaultTab?: ActionCategory | 'recommended';
  showCostBreakdown?: boolean;
}

function groupActionsByCategory(actions: CampaignAction[]): Record<string, CampaignAction[]> {
  const groups: Record<string, CampaignAction[]> = {};
  for (const category of categoryOrder) {
    groups[category] = actions.filter((action) => action.category === category);
  }
  return groups;
}

export function ActionList({
  state,
  onSelect,
  onUnselect,
  defaultTab,
  showCostBreakdown = false,
}: ActionListProps) {
  const nationalActions = useMemo(
    () => state.availableActions.filter((action) => !isRegionalAction(action.id)),
    [state.availableActions],
  );

  const grouped = groupActionsByCategory(nationalActions);

  const recommendedIds = useMemo(() => {
    const event = state.currentWeeklyEvent;
    if (!event) return new Set<string>();
    const ids = state.selectedEventResponseId
      ? getRecommendedActionsForResponse(state)
      : event.recommendedActionIds;
    return new Set(ids);
  }, [state]);

  const recommendedActions = useMemo(
    () =>
      [...recommendedIds]
        .map((id) => nationalActions.find((a) => a.id === id))
        .filter((a): a is CampaignAction => Boolean(a)),
    [recommendedIds, nationalActions],
  );

  const hasRecommended = recommendedActions.length > 0;
  const initialTab = defaultTab ?? (hasRecommended ? 'recommended' : 'localOrganization');

  const [activeTab, setActiveTab] = useState<ActionCategory | 'recommended'>(initialTab);

  const tabs = useMemo(() => {
    const items: { id: ActionCategory | 'recommended'; label: string }[] = [];
    if (hasRecommended) {
      items.push({ id: 'recommended', label: `Önerilen (${recommendedActions.length})` });
    }
    for (const cat of categoryOrder) {
      if ((grouped[cat]?.length ?? 0) > 0) {
        items.push({ id: cat, label: categoryLabels[cat] });
      }
    }
    return items;
  }, [grouped, hasRecommended, recommendedActions.length]);

  const safeTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0]?.id ?? 'localOrganization';

  const actions =
    safeTab === 'recommended' ? recommendedActions : (grouped[safeTab] ?? []);

  return (
    <Panel
      title="Operasyonlar"
      variant="operation"
      headerExtra={
        <div className="action-list-header-extra">
          <span className="action-count-badge">{state.selectedActionIds.length} seçili</span>
          <CoordinationMeter state={state} compact />
        </div>
      }
      className="action-list-panel operations-deck-panel"
    >
      <TabBar
        tabs={tabs}
        active={safeTab}
        onChange={(id) => setActiveTab(id as ActionCategory | 'recommended')}
      />
      <div className="operation-cards-grid">
        {actions.length === 0 ? (
          <p className="operations-empty">Bu kategoride aksiyon yok.</p>
        ) : (
          actions.map((baseAction) => {
            const { resolved, labels } = resolveActionForState(state, baseAction);
            const synergyLabel = getSynergyLabel(getActionSynergyLevel(state, baseAction));
            const selected = state.selectedActionIds.includes(baseAction.id);
            const disabledReason = getActionDisabledReason(state, baseAction);
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
                onSelect={() => onSelect(baseAction.id)}
                onUnselect={() => onUnselect(baseAction.id)}
                showCostBreakdown={showCostBreakdown}
              />
            );
          })
        )}
      </div>
    </Panel>
  );
}
