/** Tutorial — haftalık öğrenme hedefleri ve adım kimlikleri */

import type { DashboardView } from '../components/dashboard/DashboardScreen';

export type TutorialStepId =
  | 'main_agenda'
  | 'sub_agenda'
  | 'radar_viewed'
  | 'campaign_action'
  | 'org_investment';

export interface TutorialStepDef {
  id: TutorialStepId;
  title: string;
  description: string;
  targetView: DashboardView;
  required: boolean;
}

export interface TutorialWeekPlan {
  week: number;
  theme: string;
  intro: string;
  weekEndTip: string;
  steps: TutorialStepDef[];
}

export interface TutorialStepProgress {
  id: TutorialStepId;
  title: string;
  description: string;
  targetView: DashboardView;
  required: boolean;
  done: boolean;
}

export interface TutorialProgressSnapshot {
  active: boolean;
  week: number;
  theme: string;
  intro: string;
  steps: TutorialStepProgress[];
  requiredDone: boolean;
  allRequiredDone: boolean;
  nextStep: TutorialStepProgress | null;
}
