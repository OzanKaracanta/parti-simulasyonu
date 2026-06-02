/** Haftalık gönüllü akışı — tahmin ve döküm (UI) */

import { WEEKLY_VOLUNTEER_REGEN } from '../data/campaignConfig';
import { resolveActionWithWeeklyEvent } from './eventEngine';
import { applyActionEffects } from './gameEngine';
import { evaluateAndApplyEventResponse } from './eventEvaluation';
import { evaluateAndApplySubAgendaResponses } from './subAgendaEvaluation';
import { evaluateAndApplyRegionalAgendaResponses } from './regionalAgendaEvaluation';
import type { GameState } from '../types/game';

export interface VolunteerFlowLineItem {
  label: string;
  amount: number;
}

export interface WeeklyVolunteerPreview {
  currentVolunteers: number;
  weekStartVolunteers: number;
  alreadySpentOnActions: number;
  regenAmount: number;
  incomeLines: VolunteerFlowLineItem[];
  expenseLines: VolunteerFlowLineItem[];
  totalIncome: number;
  totalExpenses: number;
  projectedEndVolunteers: number;
  netChangeFromWeekStart: number;
  warning: string | null;
}

function sumSelectedActionVolunteerCosts(state: GameState): number {
  let total = 0;

  for (const actionId of state.selectedActionIds) {
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;

    const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
    total += resolved.cost.volunteers ?? 0;
  }

  return total;
}

export function simulateWeekEndVolunteers(state: GameState): number {
  const selectedActions = state.availableActions.filter((action) =>
    state.selectedActionIds.includes(action.id),
  );

  let simulated = applyActionEffects(state, selectedActions).state;
  simulated = evaluateAndApplyEventResponse(simulated).state;
  simulated = evaluateAndApplySubAgendaResponses(simulated).state;
  simulated = evaluateAndApplyRegionalAgendaResponses(simulated).state;

  return Math.min(100, Math.max(0, Math.round(simulated.resources.volunteers)));
}

export function computeWeeklyVolunteerPreview(state: GameState): WeeklyVolunteerPreview {
  const alreadySpentOnActions = sumSelectedActionVolunteerCosts(state);
  const weekStartVolunteers = state.resources.volunteers + alreadySpentOnActions;
  const regenAmount = WEEKLY_VOLUNTEER_REGEN;
  const projectedEndVolunteers = simulateWeekEndVolunteers(state);
  const netChangeFromWeekStart = projectedEndVolunteers - weekStartVolunteers;

  const incomeLines: VolunteerFlowLineItem[] = [
    { label: 'Haftalık saha toparlanması (hafta sonu)', amount: regenAmount },
  ];

  const expenseLines: VolunteerFlowLineItem[] = [];

  if (alreadySpentOnActions > 0) {
    expenseLines.push({
      label: 'Operasyonlar (seçimde düştü)',
      amount: alreadySpentOnActions,
    });
  }

  const totalIncome = incomeLines.reduce((sum, line) => sum + line.amount, 0);
  const totalExpenses = alreadySpentOnActions;

  let warning: string | null = null;

  if (projectedEndVolunteers < 12) {
    warning =
      'Tahmini gönüllü havuzu çok düşük; yoğun saha operasyonlarından kaçının veya örgüt yatırımı yapın.';
  } else if (totalExpenses > regenAmount + 15) {
    warning = 'Bu haftanın operasyon gönüllü harcaması haftalık toparlanmayı belirgin şekilde aşıyor.';
  }

  return {
    currentVolunteers: state.resources.volunteers,
    weekStartVolunteers,
    alreadySpentOnActions,
    regenAmount,
    incomeLines,
    expenseLines,
    totalIncome,
    totalExpenses,
    projectedEndVolunteers,
    netChangeFromWeekStart,
    warning,
  };
}
