/** Haftalık enerji akışı — tahmin ve döküm (UI) */

import { MAX_WEEKLY_AGENDA_ENERGY_SPEND, WEEKLY_ENERGY_REGEN } from '../data/campaignConfig';
import { sumCommittedAgendaEnergy } from './agendaEnergyEngine';
import { resolveActionWithWeeklyEvent } from './eventEngine';
import { applyActionEffects } from './gameEngine';
import { evaluateAndApplyEventResponse } from './eventEvaluation';
import { evaluateAndApplySubAgendaResponses } from './subAgendaEvaluation';
import { evaluateAndApplyRegionalAgendaResponses } from './regionalAgendaEvaluation';
import type { GameState } from '../types/game';

export interface EnergyFlowLineItem {
  label: string;
  amount: number;
}

export interface WeeklyEnergyPreview {
  currentEnergy: number;
  weekStartEnergy: number;
  alreadySpentOnActions: number;
  alreadySpentOnAgendas: number;
  pendingAgendaEnergy: number;
  regenAmount: number;
  incomeLines: EnergyFlowLineItem[];
  expenseLines: EnergyFlowLineItem[];
  totalIncome: number;
  totalExpenses: number;
  projectedEndEnergy: number;
  netChangeFromWeekStart: number;
  endWeekSummary: string;
  warning: string | null;
}

function sumSelectedActionEnergyCosts(state: GameState): number {
  let total = 0;

  for (const actionId of state.selectedActionIds) {
    const action = state.availableActions.find((item) => item.id === actionId);
    if (!action) continue;

    const { resolved } = resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action);
    total += resolved.cost.energy ?? 0;
  }

  return total;
}

/** Hafta bitince enerji durumunu simüle eder (finishWeek ile aynı sıra, örgüt hariç). */
export function simulateWeekEndEnergy(state: GameState): number {
  const selectedActions = state.availableActions.filter((action) =>
    state.selectedActionIds.includes(action.id),
  );

  let simulated = applyActionEffects(state, selectedActions).state;
  simulated = evaluateAndApplyEventResponse(simulated).state;
  simulated = evaluateAndApplySubAgendaResponses(simulated).state;
  simulated = evaluateAndApplyRegionalAgendaResponses(simulated).state;

  return Math.min(100, Math.max(0, Math.round(simulated.resources.energy)));
}

export function computeWeeklyEnergyPreview(state: GameState): WeeklyEnergyPreview {
  const alreadySpentOnActions = sumSelectedActionEnergyCosts(state);
  const alreadySpentOnAgendas = sumCommittedAgendaEnergy(state);
  const weekStartEnergy = state.resources.energy + alreadySpentOnActions + alreadySpentOnAgendas;
  const regenAmount = WEEKLY_ENERGY_REGEN;
  const projectedEndEnergy = simulateWeekEndEnergy(state);
  const netChangeFromWeekStart = projectedEndEnergy - weekStartEnergy;
  const pendingAgendaEnergy = 0;

  const incomeLines: EnergyFlowLineItem[] = [
    { label: 'Haftalık dinlenme (hafta sonu)', amount: regenAmount },
  ];

  const expenseLines: EnergyFlowLineItem[] = [];

  if (alreadySpentOnActions > 0) {
    expenseLines.push({
      label: 'Operasyonlar (seçimde düştü)',
      amount: alreadySpentOnActions,
    });
  }

  if (alreadySpentOnAgendas > 0) {
    expenseLines.push({
      label: 'Gündem tepkileri (seçimde düştü)',
      amount: alreadySpentOnAgendas,
    });
  }

  const totalIncome = incomeLines.reduce((sum, line) => sum + line.amount, 0);
  const totalExpenses = alreadySpentOnActions + alreadySpentOnAgendas;

  let warning: string | null = null;

  if (projectedEndEnergy < 15) {
    warning =
      'Tahmini enerji çok düşük; önümüzdeki hafta operasyon ve gündem seçimlerinde seçici olun.';
  } else if (totalExpenses > regenAmount + 20) {
    warning = 'Bu haftanın toplam harcaması yenilenmeyi belirgin şekilde aşıyor.';
  } else if (alreadySpentOnAgendas >= MAX_WEEKLY_AGENDA_ENERGY_SPEND - 2) {
    warning = `Gündem enerjisi tavanına yaklaşıldı (en fazla ${MAX_WEEKLY_AGENDA_ENERGY_SPEND} ⚡/hafta).`;
  }

  const agendaCommitted = sumCommittedAgendaEnergy(state);
  if (agendaCommitted > MAX_WEEKLY_AGENDA_ENERGY_SPEND && !warning) {
    warning = `Gündem enerjisi haftalık tavanı aştı (${agendaCommitted} ⚡).`;
  }

  const endWeekSummary = `Enerji: ${state.resources.energy} → ~${projectedEndEnergy}`;

  return {
    currentEnergy: state.resources.energy,
    weekStartEnergy,
    alreadySpentOnActions,
    alreadySpentOnAgendas,
    pendingAgendaEnergy,
    regenAmount,
    incomeLines,
    expenseLines,
    totalIncome,
    totalExpenses,
    projectedEndEnergy,
    netChangeFromWeekStart,
    endWeekSummary,
    warning,
  };
}
