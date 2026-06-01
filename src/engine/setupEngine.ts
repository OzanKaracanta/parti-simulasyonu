/** Setup seçimlerinden başlangıç GameState üretimi */

import { CAMPAIGN_MAX_WEEKS } from '../data/campaignConfig';
import { campaignActions } from '../data/campaignActions';
import { createInitialOrganizationToolLevelsByRegion } from '../systems/regionOrganization';
import { createInitialNationalOrganizationToolLevels } from '../data/nationalOrganizationTools';
import { getRegionById, regionDefinitions } from '../data/regions';
import {
  colorOptions,
  getIdeologyById,
  getLeadershipById,
  symbolOptions,
} from '../data/setupOptions';
import { calculateNationalSupport, clamp } from './gameEngine';
import { createEmptyPoliticalState, initializeFirstWeekAgenda } from './agendaEngine';
import { createInitialSegmentSupport, syncRegionsWithSegments } from './segmentEngine';
import {
  createInitialPoliticalSegmentSupport,
} from './politicalSegmentEngine';
import { createInitialPartyStances } from '../data/politicalIdentity';
import type {
  GameState,
  MetricKey,
  RegionId,
  RegionStartingMetrics,
  RegionState,
  ResourceKey,
  SetupChoices,
} from '../types/game';
import type { SetupOptionEffects } from '../data/setupOptions';

const BASE_RESOURCES: Record<ResourceKey, number> = {
  money: 100,
  energy: 100,
  volunteers: 45,
  reputation: 65,
  /** Erken oyunda örgüt yükü ~3–4 operasyonu sınırlar; araçlarla büyür */
  organizationCapacity: 22,
};

function applyEffects(
  metrics: Record<MetricKey, number>,
  resources: Record<ResourceKey, number>,
  effects: SetupOptionEffects,
): void {
  if (effects.metrics) {
    for (const [key, value] of Object.entries(effects.metrics)) {
      const metricKey = key as MetricKey;
      metrics[metricKey] = clamp(metrics[metricKey] + (value ?? 0));
    }
  }

  if (effects.resources) {
    for (const [key, value] of Object.entries(effects.resources)) {
      const resourceKey = key as ResourceKey;
      const max = resourceKey === 'money' ? 999 : 100;
      resources[resourceKey] = clamp(resources[resourceKey] + (value ?? 0), 0, max);
    }
  }
}

function mapRegionMetricsToGameMetrics(regionMetrics: RegionStartingMetrics): Record<MetricKey, number> {
  return {
    mediaPower: regionMetrics.mediaPower,
    campaignVisibility: Math.round(
      (regionMetrics.nationalRecognition + regionMetrics.campaignVisibility) / 2,
    ),
    youthReach: regionMetrics.youthReach,
    localOrganization: regionMetrics.localOrganization,
    crisisManagement: regionMetrics.crisisManagement,
    leaderTrust: regionMetrics.leaderTrust,
    policyCredibility: regionMetrics.partyTrust,
    socialGroupReach: Math.round(
      (regionMetrics.youthReach + regionMetrics.localCandidateTrust) / 2,
    ),
    financialSustainability: regionMetrics.economyTrust,
    regionalInfluence: regionMetrics.localCandidateTrust,
  };
}

function calculateRegionalSupport(metrics: RegionStartingMetrics, isHomeRegion: boolean): number {
  const nationalImpact =
    metrics.nationalRecognition * 0.2 +
    metrics.mediaPower * 0.15 +
    metrics.leaderTrust * 0.2 +
    metrics.partyTrust * 0.2 +
    metrics.economyTrust * 0.15 +
    metrics.crisisManagement * 0.1;

  const topicOwnership = (metrics.economyTrust + metrics.partyTrust) / 2;
  const localImpact =
    metrics.localOrganization * 0.35 +
    metrics.localCandidateTrust * 0.3 +
    metrics.campaignVisibility * 0.2 +
    topicOwnership * 0.15;

  const combined = nationalImpact * 0.5 + localImpact * 0.5;
  const scale = isHomeRegion ? 0.14 : 0.08;

  return clamp(combined * scale, 2, 18);
}

function buildRegions(homeRegionId: RegionId): RegionState[] {
  return regionDefinitions.map((region) => {
    const isHome = region.id === homeRegionId;

    return {
      id: region.id,
      name: region.name,
      support: calculateRegionalSupport(region.metrics, isHome),
      organization: region.metrics.localOrganization,
      mediaReach: region.metrics.mediaPower,
      dominantGroups: region.dominantGroups,
    };
  });
}

export function buildGameStateFromSetup(choices: SetupChoices): GameState {
  const region = getRegionById(choices.regionId);
  const ideology = getIdeologyById(choices.ideologyId);
  const leadership = getLeadershipById(choices.leadershipStyleId);
  const color = colorOptions.find((item) => item.id === choices.colorId);
  const symbol = symbolOptions.find((item) => item.id === choices.symbolId);

  if (!color || !symbol) {
    throw new Error('Geçersiz renk veya sembol seçimi');
  }

  const metrics = mapRegionMetricsToGameMetrics(region.metrics);
  const resources = { ...BASE_RESOURCES };

  applyEffects(metrics, resources, color.effects);
  applyEffects(metrics, resources, symbol.effects);
  applyEffects(metrics, resources, ideology.effects);
  applyEffects(metrics, resources, leadership.effects);

  const regions = buildRegions(choices.regionId);
  const segmentSupport = createInitialSegmentSupport(metrics, choices.ideologyId);
  const politicalSegmentSupport = createInitialPoliticalSegmentSupport(choices.ideologyId);
  const partyStances = createInitialPartyStances(choices.ideologyId);
  const political = createEmptyPoliticalState();

  const organizationToolLevelsByRegion = createInitialOrganizationToolLevelsByRegion();
  organizationToolLevelsByRegion[choices.regionId] = {
    ...organizationToolLevelsByRegion[choices.regionId],
    volunteer_network: 1,
  };

  const syncedRegions = syncRegionsWithSegments(regions, segmentSupport, choices.regionId);
  const firstWeek = initializeFirstWeekAgenda(
    {
      homeRegionId: choices.regionId,
      campaignWeek: 1,
      regions: syncedRegions,
      organizationToolLevelsByRegion,
      recentRegionIds: [],
    },
    political.rivalParties,
  );

  const draftState: GameState = {
    campaignWeek: 1,
    maxWeeks: CAMPAIGN_MAX_WEEKS,
    party: {
      name: choices.partyName,
      leaderName: choices.leaderName,
      homeRegionId: choices.regionId,
      profile: ideology.name,
      colorId: choices.colorId,
      symbolId: choices.symbolId,
      ideologyId: choices.ideologyId,
      leadershipStyleId: choices.leadershipStyleId,
    },
    resources,
    metrics,
    regions: syncedRegions,
    availableActions: campaignActions,
    selectedActionIds: [],
    selectedActionTargets: {},
    organizationToolLevelsByRegion,
    nationalOrganizationToolLevels: createInitialNationalOrganizationToolLevels(),
    organizationRevertStack: [],
    currentWeeklyEvent: firstWeek.currentWeeklyEvent,
    selectedEventResponseId: null,
    segmentSupport,
    politicalSegmentSupport,
    partyStances,
    messageConsistency: 72,
    stanceHistory: [],
    rivalParties: political.rivalParties,
    subAgendas: firstWeek.subAgendas,
    radarAgendas: firstWeek.radarAgendas,
    regionalAgendas: firstWeek.regionalAgendas,
    regionalAgendaRecentRegionIds: firstWeek.regionalAgendaRecentRegionIds,
    bonusSubAgendaSlots: political.bonusSubAgendaSlots,
    selectedSubAgendaSelections: political.selectedSubAgendaSelections,
    selectedRegionalAgendaSelections: [],
    opinionFeed: political.opinionFeed,
    pendingOpinionEchoes: political.pendingOpinionEchoes,
    scheduledStoryEvents: political.scheduledStoryEvents,
    scheduledRegionalStoryEvents: political.scheduledRegionalStoryEvents,
    storyFlags: political.storyFlags,
    pendingWeekBacklash: null,
    activeWeekBacklash: null,
    lastBacklashWeek: 0,
    backlashStoryFlags: {},
    history: [],
    status: 'playing',
    nationalSupport: 0,
    finalResult: null,
  };

  return {
    ...draftState,
    nationalSupport: calculateNationalSupport(draftState),
  };
}

export function createSetupState(): GameState {
  const metrics = mapRegionMetricsToGameMetrics(getRegionById('ege').metrics);
  const segmentSupport = createInitialSegmentSupport(metrics, 'centrist-reform');
  const politicalSegmentSupport = createInitialPoliticalSegmentSupport('centrist-reform');
  const partyStances = createInitialPartyStances('centrist-reform');
  const political = createEmptyPoliticalState();

  return {
    campaignWeek: 1,
    maxWeeks: CAMPAIGN_MAX_WEEKS,
    party: {
      name: '',
      leaderName: '',
      homeRegionId: 'ege',
      profile: '',
      colorId: 'blue',
      symbolId: 'sun',
      ideologyId: 'centrist-reform',
      leadershipStyleId: 'charismatic',
    },
    resources: { ...BASE_RESOURCES },
    metrics,
    regions: syncRegionsWithSegments(buildRegions('ege'), segmentSupport, 'ege'),
    availableActions: campaignActions,
    selectedActionIds: [],
    selectedActionTargets: {},
    organizationToolLevelsByRegion: createInitialOrganizationToolLevelsByRegion(),
    nationalOrganizationToolLevels: createInitialNationalOrganizationToolLevels(),
    organizationRevertStack: [],
    currentWeeklyEvent: null,
    selectedEventResponseId: null,
    segmentSupport,
    politicalSegmentSupport,
    partyStances,
    messageConsistency: 72,
    stanceHistory: [],
    rivalParties: political.rivalParties,
    subAgendas: [],
    radarAgendas: [],
    regionalAgendas: [],
    regionalAgendaRecentRegionIds: [],
    bonusSubAgendaSlots: 0,
    selectedSubAgendaSelections: [],
    selectedRegionalAgendaSelections: [],
    opinionFeed: [],
    pendingOpinionEchoes: [],
    scheduledStoryEvents: [],
    scheduledRegionalStoryEvents: [],
    storyFlags: {},
    pendingWeekBacklash: null,
    activeWeekBacklash: null,
    lastBacklashWeek: 0,
    backlashStoryFlags: {},
    history: [],
    status: 'setup',
    nationalSupport: 0,
    finalResult: null,
  };
}
