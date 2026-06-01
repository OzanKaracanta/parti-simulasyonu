/** Tutorial — adım tamamlanma ve tur bitirme kuralları */

import { canFinishWeek } from '../engine/eventEvaluation';
import type { GameState } from '../types/game';
import { isTutorialMarkerViewed, markTutorialMarkerViewed } from './tutorialStorage';
import { getTutorialWeekPlan, TUTORIAL_LAST_WEEK } from './tutorialSteps';
import type {
  TutorialProgressSnapshot,
  TutorialStepId,
  TutorialStepProgress,
} from './tutorialTypes';

const RADAR_MARKER = 'radar';

export function isTutorialActive(state: GameState, skipped: boolean): boolean {
  if (skipped || state.status !== 'playing') return false;
  return state.campaignWeek <= TUTORIAL_LAST_WEEK;
}

function hasHomeRegionOrgProgress(state: GameState): boolean {
  const homeId = state.party.homeRegionId;
  const levels = state.organizationToolLevelsByRegion[homeId] ?? {};

  for (const [toolId, level] of Object.entries(levels)) {
    if (toolId === 'volunteer_network' && level >= 2) return true;
    if (toolId !== 'volunteer_network' && level >= 1) return true;
  }

  return false;
}

function isRadarViewed(state: GameState): boolean {
  if (state.radarAgendas.length === 0) return true;
  return isTutorialMarkerViewed(
    state.party.name,
    state.campaignWeek,
    RADAR_MARKER,
  );
}

export function isTutorialStepComplete(
  stepId: TutorialStepId,
  state: GameState,
): boolean {
  switch (stepId) {
    case 'main_agenda':
      return Boolean(state.selectedEventResponseId);
    case 'sub_agenda':
      return state.selectedSubAgendaSelections.length >= 1;
    case 'radar_viewed':
      return isRadarViewed(state);
    case 'campaign_action':
      return state.selectedActionIds.length >= 1;
    case 'org_investment':
      return hasHomeRegionOrgProgress(state);
    default:
      return true;
  }
}

export function getTutorialProgress(
  state: GameState,
  skipped: boolean,
): TutorialProgressSnapshot | null {
  if (!isTutorialActive(state, skipped)) return null;

  const plan = getTutorialWeekPlan(state.campaignWeek);
  if (!plan) return null;

  const steps: TutorialStepProgress[] = plan.steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    targetView: step.targetView,
    required: step.required,
    done: isTutorialStepComplete(step.id, state),
  }));

  const requiredSteps = steps.filter((step) => step.required);
  const allRequiredDone = requiredSteps.every((step) => step.done);
  const nextStep = steps.find((step) => step.required && !step.done) ?? null;

  return {
    active: true,
    week: plan.week,
    theme: plan.theme,
    intro: plan.intro,
    steps,
    requiredDone: allRequiredDone,
    allRequiredDone,
    nextStep,
  };
}

export function getTutorialWeekEndTip(week: number): string | null {
  return getTutorialWeekPlan(week)?.weekEndTip ?? null;
}

export function canEndWeekStrict(
  state: GameState,
  skipped: boolean,
): { ok: boolean; reason?: string } {
  const base = canFinishWeek(state);
  if (!base.ok) return base;

  const progress = getTutorialProgress(state, skipped);
  if (!progress || progress.allRequiredDone) {
    return { ok: true };
  }

  const next = progress.nextStep;
  if (!next) return { ok: true };

  return {
    ok: false,
    reason: `Öğretici: önce “${next.title}” adımını tamamla.`,
  };
}

export function markRadarTutorialViewed(state: GameState): void {
  markTutorialMarkerViewed(state.party.name, state.campaignWeek, RADAR_MARKER);
}
