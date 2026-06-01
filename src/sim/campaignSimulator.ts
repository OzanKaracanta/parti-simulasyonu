/** Tam kampanya headless simülasyonu */

import { CAMPAIGN_MAX_WEEKS } from '../data/campaignConfig';
import { buildGameStateFromSetup } from '../engine/setupEngine';
import type { GameState, SetupChoices } from '../types/game';
import type { BalanceScenario } from './balanceScenarios';
import { playBotWeek, type BotStrategyId } from './campaignBot';
import { computePoliticalSimMetrics } from './politicalSimMetrics';
import { createSeededRng } from './seededRandom';

export const SUPPORT_BAND_MIN = 15;
export const SUPPORT_BAND_MAX = 55;
/** Segment revizyonu (Faz 3–5) sonrası pasif botlarda 11 backlash kabul edilebilir */
export const BACKLASH_TARGET_MIN = 11;
export const BACKLASH_TARGET_MAX = 16;

/** Faz 6 — politik yankının en az bu kadar haftada görünmesi beklenir (52 haftalık kampanya) */
export const POLITICAL_ACTIVITY_WEEKS_MIN = 24;

export interface CampaignSimResult {
  scenarioId: string;
  label: string;
  strategy: BotStrategyId;
  ideologyId: SetupChoices['ideologyId'];
  regionId: SetupChoices['regionId'];
  seed: number;
  startSupport: number;
  finalSupport: number;
  minSupport: number;
  maxSupport: number;
  supportRange: number;
  avgWeeklyAbsDelta: number;
  maxWeeklyAbsDelta: number;
  backlashCount: number;
  finalConsistency: number;
  weeksPlayed: number;
  outsideBandWeeks: number;
  weeklySupport: number[];
  weeksWithPoliticalActivity: number;
  avgWeeklyPoliticalAbsDelta: number;
  netPlayerBasePoliticalDelta: number;
  finalPlayerBasePoliticalSupport: number;
}

function buildSetupFromScenario(scenario: BalanceScenario): SetupChoices {
  return {
    partyName: `Sim ${scenario.id}`,
    leaderName: 'Test Lider',
    regionId: scenario.regionId,
    colorId: 'red',
    symbolId: 'star',
    ideologyId: scenario.ideologyId,
    leadershipStyleId: scenario.leadershipStyleId,
  };
}

function countBacklashes(state: GameState): number {
  return state.history.filter((item) => item.weekBacklash !== null).length;
}

export function runCampaignSimulation(scenario: BalanceScenario): CampaignSimResult {
  const rng = createSeededRng(scenario.seed);
  let state = buildGameStateFromSetup(buildSetupFromScenario(scenario));

  const weeklySupport: number[] = [state.nationalSupport];
  const weeklyDeltas: number[] = [];
  let minSupport = state.nationalSupport;
  let maxSupport = state.nationalSupport;
  let outsideBandWeeks = 0;

  for (let week = 0; week < CAMPAIGN_MAX_WEEKS; week += 1) {
    if (state.status === 'finished') break;

    const before = state.nationalSupport;
    state = playBotWeek(state, scenario.strategy, rng);

    const after = state.nationalSupport;
    weeklySupport.push(after);
    weeklyDeltas.push(Math.abs(after - before));
    minSupport = Math.min(minSupport, after);
    maxSupport = Math.max(maxSupport, after);

    if (after < SUPPORT_BAND_MIN || after > SUPPORT_BAND_MAX) {
      outsideBandWeeks += 1;
    }
  }

  const avgWeeklyAbsDelta =
    weeklyDeltas.length > 0
      ? Math.round((weeklyDeltas.reduce((sum, value) => sum + value, 0) / weeklyDeltas.length) * 10) /
        10
      : 0;
  const maxWeeklyAbsDelta =
    weeklyDeltas.length > 0 ? Math.round(Math.max(...weeklyDeltas) * 10) / 10 : 0;

  const political = computePoliticalSimMetrics(
    state.history,
    state.politicalSegmentSupport,
    scenario.ideologyId,
  );

  return {
    scenarioId: scenario.id,
    label: scenario.label,
    strategy: scenario.strategy,
    ideologyId: scenario.ideologyId,
    regionId: scenario.regionId,
    seed: scenario.seed,
    startSupport: weeklySupport[0] ?? 0,
    finalSupport: state.nationalSupport,
    minSupport: Math.round(minSupport * 10) / 10,
    maxSupport: Math.round(maxSupport * 10) / 10,
    supportRange: Math.round((maxSupport - minSupport) * 10) / 10,
    avgWeeklyAbsDelta,
    maxWeeklyAbsDelta,
    backlashCount: countBacklashes(state),
    finalConsistency: state.messageConsistency,
    weeksPlayed: state.history.length,
    outsideBandWeeks,
    weeklySupport: weeklySupport.map((value) => Math.round(value * 10) / 10),
    weeksWithPoliticalActivity: political.weeksWithPoliticalActivity,
    avgWeeklyPoliticalAbsDelta: political.avgWeeklyPoliticalAbsDelta,
    netPlayerBasePoliticalDelta: political.netPlayerBasePoliticalDelta,
    finalPlayerBasePoliticalSupport: political.finalPlayerBasePoliticalSupport,
  };
}

export interface BalanceAggregate {
  count: number;
  avgFinalSupport: number;
  avgMinSupport: number;
  avgMaxSupport: number;
  avgBacklashCount: number;
  avgOutsideBandWeeks: number;
  avgWeeklyAbsDelta: number;
  maxWeeklyAbsDelta: number;
  supportBandViolations: number;
  backlashBandViolations: number;
  politicalActivityViolations: number;
  avgWeeksWithPoliticalActivity: number;
  avgPlayerBasePoliticalSupport: number;
}

export function aggregateBalanceResults(results: CampaignSimResult[]): BalanceAggregate {
  const count = results.length;

  if (count === 0) {
    return {
      count: 0,
      avgFinalSupport: 0,
      avgMinSupport: 0,
      avgMaxSupport: 0,
      avgBacklashCount: 0,
      avgOutsideBandWeeks: 0,
      avgWeeklyAbsDelta: 0,
      maxWeeklyAbsDelta: 0,
      supportBandViolations: 0,
      backlashBandViolations: 0,
      politicalActivityViolations: 0,
      avgWeeksWithPoliticalActivity: 0,
      avgPlayerBasePoliticalSupport: 0,
    };
  }

  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

  return {
    count,
    avgFinalSupport: Math.round((sum(results.map((item) => item.finalSupport)) / count) * 10) / 10,
    avgMinSupport: Math.round((sum(results.map((item) => item.minSupport)) / count) * 10) / 10,
    avgMaxSupport: Math.round((sum(results.map((item) => item.maxSupport)) / count) * 10) / 10,
    avgBacklashCount: Math.round((sum(results.map((item) => item.backlashCount)) / count) * 10) / 10,
    avgOutsideBandWeeks:
      Math.round((sum(results.map((item) => item.outsideBandWeeks)) / count) * 10) / 10,
    avgWeeklyAbsDelta:
      Math.round((sum(results.map((item) => item.avgWeeklyAbsDelta)) / count) * 10) / 10,
    maxWeeklyAbsDelta: Math.max(...results.map((item) => item.maxWeeklyAbsDelta)),
    supportBandViolations: results.filter(
      (item) => item.minSupport < SUPPORT_BAND_MIN || item.maxSupport > SUPPORT_BAND_MAX,
    ).length,
    backlashBandViolations: results.filter(
      (item) => item.backlashCount < BACKLASH_TARGET_MIN || item.backlashCount > BACKLASH_TARGET_MAX,
    ).length,
    politicalActivityViolations: results.filter(
      (item) => item.weeksWithPoliticalActivity < POLITICAL_ACTIVITY_WEEKS_MIN,
    ).length,
    avgWeeksWithPoliticalActivity:
      Math.round(
        (sum(results.map((item) => item.weeksWithPoliticalActivity)) / count) * 10,
      ) / 10,
    avgPlayerBasePoliticalSupport:
      Math.round(
        (sum(results.map((item) => item.finalPlayerBasePoliticalSupport)) / count) * 10,
      ) / 10,
  };
}
