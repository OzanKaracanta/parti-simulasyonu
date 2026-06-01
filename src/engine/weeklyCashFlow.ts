/** Haftalık para akışı — tahmin ve döküm (UI + rapor) */

import { resolveActionWithWeeklyEvent } from './eventEngine';
import { applyActionEffects, clampResource } from './gameEngine';
import { evaluateAndApplyEventResponse } from './eventEvaluation';
import { calculateSympathizerDonation } from './sympathizerDonation';
import { resolveOrganizationWeekEffects } from '../systems/weekResolutionSystem';
import type { GameState } from '../types/game';

export interface CashFlowLineItem {
  label: string;
  amount: number;
}

export interface WeeklyCashFlowPreview {
  currentMoney: number;
  weekStartMoney: number;
  alreadySpentOnActions: number;
  incomeLines: CashFlowLineItem[];
  expenseLines: CashFlowLineItem[];
  totalIncome: number;
  totalExpenses: number;
  projectedEndMoney: number;
  netChangeFromWeekStart: number;
  leaderTrust: number;
  sympathizerDonation: number;
  warning: string | null;
}

function sumSelectedActionMoneyCosts(state: GameState): number {
  let total = 0;

  for (const actionId of state.selectedActionIds) {
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;

    const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
    total += resolved.cost.money ?? 0;
  }

  return total;
}

function sumSelectedActionMoneyGains(state: GameState): number {
  let total = 0;

  for (const actionId of state.selectedActionIds) {
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;

    const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
    total += resolved.gains?.money ?? 0;
  }

  return total;
}

/** Hafta bitince para durumunu simüle eder (finishWeek ile aynı sıra). */
export function simulateWeekEndMoney(state: GameState): number {
  const selectedActions = state.availableActions.filter((action) =>
    state.selectedActionIds.includes(action.id),
  );
  const sympathizerDonation = calculateSympathizerDonation(state.metrics.leaderTrust);

  let simulated = applyActionEffects(state, selectedActions).state;
  simulated = evaluateAndApplyEventResponse(simulated).state;
  simulated = resolveOrganizationWeekEffects(simulated).state;
  simulated = {
    ...simulated,
    resources: {
      ...simulated.resources,
      money: clampResource(simulated.resources.money + sympathizerDonation, 'money'),
    },
  };

  return Math.min(999, Math.max(0, Math.round(simulated.resources.money)));
}

export function computeWeeklyCashFlowPreview(state: GameState): WeeklyCashFlowPreview {
  const alreadySpentOnActions = sumSelectedActionMoneyCosts(state);
  const weekStartMoney = state.resources.money + alreadySpentOnActions;
  const leaderTrust = state.metrics.leaderTrust;
  const sympathizerDonation = calculateSympathizerDonation(leaderTrust);

  let simulated = applyActionEffects(
    state,
    state.availableActions.filter((action) => state.selectedActionIds.includes(action.id)),
  ).state;
  simulated = evaluateAndApplyEventResponse(simulated).state;

  const actionMoneyGains = sumSelectedActionMoneyGains(state);
  const actionOnlyState = applyActionEffects(
    state,
    state.availableActions.filter((action) => state.selectedActionIds.includes(action.id)),
  ).state;
  const eventMoneyEffect =
    simulated.resources.money - actionOnlyState.resources.money;

  const beforeOrgMoney = simulated.resources.money;
  simulated = resolveOrganizationWeekEffects(simulated).state;
  const orgMoneyDelta = simulated.resources.money - beforeOrgMoney;

  const projectedEndMoney = simulateWeekEndMoney(state);
  const netChangeFromWeekStart = projectedEndMoney - weekStartMoney;

  const incomeLines: CashFlowLineItem[] = [];
  const expenseLines: CashFlowLineItem[] = [];

  if (sympathizerDonation > 0) {
    incomeLines.push({
      label: `Sempatizan Bağışı (Lider Güveni ${Math.round(leaderTrust)})`,
      amount: sympathizerDonation,
    });
  }

  if (actionMoneyGains > 0) {
    incomeLines.push({
      label: 'Aksiyon kazançları',
      amount: actionMoneyGains,
    });
  }

  if (orgMoneyDelta > 0) {
    incomeLines.push({
      label: 'Örgüt üretimi',
      amount: orgMoneyDelta,
    });
  }

  if (eventMoneyEffect > 0) {
    incomeLines.push({
      label: 'Gündem etkisi',
      amount: eventMoneyEffect,
    });
  }

  if (orgMoneyDelta < 0) {
    expenseLines.push({
      label: 'Örgüt bakımı',
      amount: Math.abs(orgMoneyDelta),
    });
  }

  if (eventMoneyEffect < 0) {
    expenseLines.push({
      label: 'Gündem etkisi',
      amount: Math.abs(eventMoneyEffect),
    });
  }

  const totalIncome = incomeLines.reduce((sum, line) => sum + line.amount, 0);
  const totalExpenses = expenseLines.reduce((sum, line) => sum + line.amount, 0);

  let warning: string | null = null;

  if (projectedEndMoney < 15) {
    warning = 'Tahmini kapanış çok düşük; örgüt bakımı ve aksiyonlar risk altında.';
  } else if (projectedEndMoney < totalExpenses + 10 && totalExpenses > 0) {
    warning = 'Hafta sonu giderleri bütçeyi zorlayabilir; gelir kalemlerini gözden geçir.';
  } else if (orgMoneyDelta < 0 && orgMoneyDelta + sympathizerDonation + actionMoneyGains < 0) {
    warning = 'Bakım gideri geliri aşıyor; bazı örgüt araçları üretim yapamayabilir.';
  }

  return {
    currentMoney: state.resources.money,
    weekStartMoney,
    alreadySpentOnActions,
    incomeLines,
    expenseLines,
    totalIncome,
    totalExpenses,
    projectedEndMoney,
    netChangeFromWeekStart,
    leaderTrust,
    sympathizerDonation,
    warning,
  };
}
