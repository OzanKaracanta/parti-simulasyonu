import type { CampaignAction, FinalResult, GameState, MetricKey, ResourceKey } from '../types/game';

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function canAffordAction(state: GameState, action: CampaignAction): boolean {
  return Object.entries(action.cost).every(([key, cost]) => {
    const resourceKey = key as ResourceKey;
    return state.resources[resourceKey] >= (cost ?? 0);
  });
}

export function calculateNationalSupport(state: GameState): number {
  const m = state.metrics;
  const weightedScore =
    m.campaignVisibility * 0.16 +
    m.mediaPower * 0.12 +
    m.localOrganization * 0.14 +
    m.leaderTrust * 0.14 +
    m.policyCredibility * 0.12 +
    m.socialGroupReach * 0.08 +
    m.regionalInfluence * 0.12 +
    m.crisisManagement * 0.06 +
    m.financialSustainability * 0.06;

  return clamp(2 + weightedScore * 0.42, 0, 60);
}

export function applyActionEffects(state: GameState, actions: CampaignAction[]): GameState {
  const nextResources = { ...state.resources };
  const nextMetrics = { ...state.metrics };

  for (const action of actions) {
    for (const [key, cost] of Object.entries(action.cost)) {
      const resourceKey = key as ResourceKey;
      nextResources[resourceKey] = clamp(nextResources[resourceKey] - (cost ?? 0));
    }

    for (const [key, effect] of Object.entries(action.effects)) {
      const metricKey = key as MetricKey;
      nextMetrics[metricKey] = clamp(nextMetrics[metricKey] + (effect ?? 0));
    }

    if (action.id === 'small-donation-drive') {
      nextResources.money = clamp(nextResources.money + 14, 0, 999);
    }
  }

  return {
    ...state,
    resources: {
      ...nextResources,
      energy: clamp(nextResources.energy + 35),
      volunteers: clamp(nextResources.volunteers + 6),
    },
    metrics: nextMetrics,
  };
}

export function finishWeek(state: GameState): GameState {
  const selectedActions = state.availableActions.filter((action) => state.selectedActionIds.includes(action.id));
  const supportBefore = state.nationalSupport;
  const appliedState = applyActionEffects(state, selectedActions);
  const supportAfter = calculateNationalSupport(appliedState);
  const isFinalWeek = state.campaignWeek >= state.maxWeeks;

  const nextState: GameState = {
    ...appliedState,
    campaignWeek: isFinalWeek ? state.campaignWeek : state.campaignWeek + 1,
    selectedActionIds: [],
    nationalSupport: supportAfter,
    history: [
      ...state.history,
      {
        week: state.campaignWeek,
        selectedActions: selectedActions.map((action) => action.name),
        supportBefore,
        supportAfter,
        summary: `${selectedActions.length} aksiyon uygulandı. Tahmini oy oranı ${supportBefore.toFixed(1)}%'den ${supportAfter.toFixed(1)}%'e geldi.`,
      },
    ],
  };

  if (isFinalWeek) {
    return {
      ...nextState,
      status: 'finished',
      finalResult: calculateFinalResult(nextState),
    };
  }

  return nextState;
}

export function calculateFinalResult(state: GameState): FinalResult {
  const nationalVoteShare = state.nationalSupport;
  const score = Math.round(nationalVoteShare * 10 + state.resources.reputation * 2 + state.metrics.localOrganization);

  return {
    nationalVoteShare,
    score,
    summary: `Kampanya ${nationalVoteShare.toFixed(1)}% tahmini oy oranı ile tamamlandı.`,
  };
}
