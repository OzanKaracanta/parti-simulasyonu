export type ResourceKey =
  | 'money'
  | 'energy'
  | 'volunteers'
  | 'reputation'
  | 'organizationCapacity';

export type MetricKey =
  | 'mediaPower'
  | 'campaignVisibility'
  | 'youthReach'
  | 'localOrganization'
  | 'crisisManagement'
  | 'leaderTrust'
  | 'policyCredibility'
  | 'socialGroupReach'
  | 'financialSustainability'
  | 'regionalInfluence';

export type ActionCategory =
  | 'localOrganization'
  | 'socialGroups'
  | 'mediaCommunication'
  | 'fundraising'
  | 'strategyProfessionalization';

export interface PartyProfile {
  name: string;
  leaderName: string;
  homeRegionId: string;
  profile: string;
}

export interface CampaignAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  cost: Partial<Record<ResourceKey, number>>;
  effects: Partial<Record<MetricKey, number>>;
  maxUsesPerCampaign?: number;
  cooldownWeeks?: number;
}

export interface RegionState {
  id: string;
  name: string;
  support: number;
  organization: number;
  mediaReach: number;
  dominantGroups: string[];
}

export interface WeeklyEvent {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'crisis' | 'agenda';
  effects: Partial<Record<MetricKey, number>>;
}

export interface WeeklyHistoryItem {
  week: number;
  selectedActions: string[];
  supportBefore: number;
  supportAfter: number;
  summary: string;
}

export interface FinalResult {
  nationalVoteShare: number;
  score: number;
  summary: string;
}

export interface GameState {
  campaignWeek: number;
  maxWeeks: number;
  party: PartyProfile;
  resources: Record<ResourceKey, number>;
  metrics: Record<MetricKey, number>;
  regions: RegionState[];
  availableActions: CampaignAction[];
  selectedActionIds: string[];
  weeklyEvent: WeeklyEvent | null;
  history: WeeklyHistoryItem[];
  status: 'setup' | 'playing' | 'finished';
  nationalSupport: number;
  finalResult: FinalResult | null;
}
