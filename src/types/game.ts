/** Domain tipleri — oyun state'i ve aksiyon modelleri */

import type { PoliticalSegmentId } from './politicalSegments';

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

export type PartyColorId =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'black'
  | 'white';

export type PartySymbolId =
  | 'sun'
  | 'star'
  | 'tree'
  | 'olive'
  | 'scales'
  | 'torch'
  | 'pen'
  | 'gear'
  | 'hand'
  | 'bridge'
  | 'wave'
  | 'shield';

export type IdeologyId =
  | 'centrist-reform'
  | 'populist-social'
  | 'nationalist-security'
  | 'libertarian-democrat'
  | 'conservative-democrat'
  | 'liberal-economist'
  | 'green-localist'
  | 'populist-radical';

export type LeadershipStyleId =
  | 'charismatic'
  | 'organizer'
  | 'technocrat'
  | 'populist'
  | 'conciliator'
  | 'ideological'
  | 'digital'
  | 'local';

export type RegionId =
  | 'marmara'
  | 'ege'
  | 'ic-anadolu'
  | 'akdeniz'
  | 'karadeniz'
  | 'dogu-anadolu'
  | 'guneydogu-anadolu';

export type SegmentId =
  | 'youth'
  | 'workers'
  | 'merchants'
  | 'retirees'
  | 'civilServants'
  | 'farmers'
  | 'tourism'
  | 'fisherfolk'
  | 'industry';

/** Politika eksenleri — mesaj tutarlılığı ve ideolojik profil */
export type PolicyTopicId =
  | 'economy'
  | 'labor'
  | 'security'
  | 'transparency'
  | 'environment'
  | 'socialWelfare'
  | 'localGovernance'
  | 'mediaPolitics';

export type ResponseTone = 'bold' | 'measured' | 'passive';

export type ReactionAxis = 'socioeconomic' | 'political' | 'mixed';

export interface PoliticalSegmentEffect {
  segmentId: PoliticalSegmentId;
  delta: number;
  reason?: string;
}

export interface PoliticalSegmentReaction {
  segmentId: PoliticalSegmentId;
  delta: number;
  message: string;
}

export interface PartyProfile {
  name: string;
  leaderName: string;
  homeRegionId: RegionId;
  profile: string;
  colorId: PartyColorId;
  symbolId: PartySymbolId;
  ideologyId: IdeologyId;
  leadershipStyleId: LeadershipStyleId;
}

export interface SetupChoices {
  partyName: string;
  leaderName: string;
  regionId: RegionId;
  colorId: PartyColorId;
  symbolId: PartySymbolId;
  ideologyId: IdeologyId;
  leadershipStyleId: LeadershipStyleId;
}

export interface RegionStartingMetrics {
  nationalRecognition: number;
  mediaPower: number;
  leaderTrust: number;
  partyTrust: number;
  economyTrust: number;
  youthReach: number;
  campaignVisibility: number;
  crisisManagement: number;
  localOrganization: number;
  localCandidateTrust: number;
}

export interface CampaignAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  cost: Partial<Record<ResourceKey, number>>;
  /** Haftalık örgüt kapasitesi yükü (tahsis; kapasite değerini kalıcı düşürmez) */
  organizationLoad?: number;
  effects: Partial<Record<MetricKey, number>>;
  gains?: Partial<Record<ResourceKey, number>>;
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

export type WeeklyEventType = 'opportunity' | 'crisis' | 'agenda';

export type EventResponseLevel = 'success' | 'partial' | 'ignored';

export interface WeeklyEventOutcomeEffects {
  metrics?: Partial<Record<MetricKey, number>>;
  resources?: Partial<Record<ResourceKey, number>>;
}

export interface WeeklyEventOutcomeDefinition {
  title: string;
  description: string;
  effects: WeeklyEventOutcomeEffects;
}

export interface WeeklyEventOutcomes {
  success: WeeklyEventOutcomeDefinition;
  partial: WeeklyEventOutcomeDefinition;
  ignored: WeeklyEventOutcomeDefinition;
}

/** Oyuncunun olaya verdiği açık siyasi tepki */
export interface EventResponseOption {
  id: string;
  label: string;
  description: string;
  outcomeTitle: string;
  outcomeDescription: string;
  responseLevel: EventResponseLevel;
  tone: ResponseTone;
  /** -2 (sol/temkinli) … +2 (sağ/agresif) — olayın policyTopic'i üzerinde */
  stanceValue: number;
  segmentEffects: Partial<Record<SegmentId, number>>;
  effects?: WeeklyEventOutcomeEffects;
  politicalSegmentEffects?: PoliticalSegmentEffect[];
}

export interface StanceHistoryEntry {
  week: number;
  topic: PolicyTopicId;
  stanceValue: number;
  responseLabel: string;
}

export interface ResponseAlignmentFeedback {
  ideologyMatch: 'strong' | 'moderate' | 'weak' | 'clash';
  leadershipMatch: 'strong' | 'moderate' | 'weak';
  consistencyImpact: number;
  summary: string;
}

export interface SegmentReaction {
  segmentId: SegmentId;
  delta: number;
  message: string;
}

export interface ScheduledStoryEvent {
  eventId: string;
  triggerWeek: number;
  reason: string;
}

export interface ScheduledRegionalStoryEvent {
  regionalEventId: string;
  regionId: RegionId;
  triggerWeek: number;
  reason: string;
}

export interface RivalPartyState {
  id: string;
  name: string;
  shortName: string;
  leaderName: string;
  ideologyId: IdeologyId;
  nationalSupport: number;
  colorHex: string;
  /** Ulusal iktidar partisi — rakip saldırı olaylarında varsayılan hedef */
  isRulingParty: boolean;
}

export interface RivalWeeklyMove {
  rivalId: string;
  rivalName: string;
  headline: string;
  impactSummary: string;
  segmentEffects: Partial<Record<SegmentId, number>>;
  politicalSegmentEffects?: PoliticalSegmentEffect[];
  regionId?: RegionId;
  regionSupportDelta?: number;
}

export type OpinionTone = 'positive' | 'mixed' | 'critical' | 'neutral';

export interface OpinionEchoItem {
  id: string;
  week: number;
  headline: string;
  body: string;
  tone: OpinionTone;
  segmentEffects?: Partial<Record<SegmentId, number>>;
}

export interface PendingOpinionEcho {
  id: string;
  triggerWeek: number;
  headline: string;
  body: string;
  tone: OpinionTone;
  segmentEffects: Partial<Record<SegmentId, number>>;
}

/** Hafta açılışında gösterilen gölge yankı (gecikmeli olumsuz yankı) */
export interface WeekBacklashItem {
  id: string;
  week: number;
  definitionId: string;
  headline: string;
  body: string;
  effectSummary: string;
  segmentEffects: Partial<Record<SegmentId, number>>;
  politicalSegmentEffects?: PoliticalSegmentEffect[];
  metricEffects?: Partial<Record<MetricKey, number>>;
}

export interface PendingWeekBacklash {
  id: string;
  triggerWeek: number;
  definitionId: string;
  headline: string;
  body: string;
  effectSummary: string;
  segmentEffects: Partial<Record<SegmentId, number>>;
  politicalSegmentEffects?: PoliticalSegmentEffect[];
  metricEffects?: Partial<Record<MetricKey, number>>;
}

/** @deprecated Faz A — SubAgendaItem kullan */
export interface BackgroundAgendaItem {
  id: string;
  title: string;
  description: string;
  salience: number;
  type: WeeklyEventType;
  policyTopic: PolicyTopicId;
}

export type SubAgendaEnergyCostLabel = 'düşük' | 'orta' | 'yüksek';

/** Alt gündem tepkisi — segment odaklı, doğru cevap yok */
export interface SubAgendaResponseOption {
  id: string;
  label: string;
  description: string;
  tone: ResponseTone;
  /** Tutarlılık hesabı — -2 … +2 */
  stanceValue: number;
  outcomeTitle: string;
  outcomeDescription: string;
  energyCost: number;
  energyCostLabel: SubAgendaEnergyCostLabel;
  segmentEffects: Partial<Record<SegmentId, number>>;
  /** Anlatı katmanı — GameState'e uygulanmaz */
  politicalSegmentEffects?: PoliticalSegmentEffect[];
}

export interface SubAgendaSelection {
  agendaId: string;
  responseId: string;
}

export interface SubAgendaItem {
  id: string;
  sourceEventId: string;
  title: string;
  description: string;
  type: WeeklyEventType;
  policyTopic: PolicyTopicId;
  primarySegments: SegmentId[];
  tensionSegments: SegmentId[];
  primaryPoliticalSegments: PoliticalSegmentId[];
  tensionPoliticalSegments: PoliticalSegmentId[];
  reactionAxis: ReactionAxis;
  tensionRationale?: string;
  politicalRationale?: string;
  responseOptions: SubAgendaResponseOption[];
}

/** Radar gündem — tepki yok; hafta sonu slot veya rakip/zincir tetikler */
export interface RadarAgendaItem {
  id: string;
  sourceEventId: string;
  title: string;
  description: string;
  type: WeeklyEventType;
  policyTopic: PolicyTopicId;
  salience: number;
  primarySegments: SegmentId[];
  effectHint: string;
}

export interface SubAgendaWeekOutcome {
  agendaId: string;
  title: string;
  responseLabel: string;
  outcomeTitle: string;
  outcomeDescription: string;
  segmentReactions: SegmentReaction[];
  politicalSegmentReactions?: PoliticalSegmentReaction[];
  politicalReactionText?: string;
  energyCost: number;
  crossRuleNote?: string;
}

/** Bölgeye özel haftalık gündem kartı */
export interface RegionalAgendaItem {
  id: string;
  sourceEventId: string;
  regionId: RegionId;
  title: string;
  description: string;
  type: WeeklyEventType;
  policyTopic: PolicyTopicId;
  primarySegments: SegmentId[];
  tensionSegments: SegmentId[];
  primaryPoliticalSegments: PoliticalSegmentId[];
  tensionPoliticalSegments: PoliticalSegmentId[];
  reactionAxis: ReactionAxis;
  tensionRationale?: string;
  politicalRationale?: string;
  responseOptions: SubAgendaResponseOption[];
  /** Zincir olay — neden bu hafta çıktı */
  storyHint?: string;
}

export interface RegionalAgendaWeekOutcome {
  agendaId: string;
  regionId: RegionId;
  regionName: string;
  title: string;
  responseLabel: string;
  outcomeTitle: string;
  outcomeDescription: string;
  supportDelta: number;
  segmentReactions: SegmentReaction[];
  energyCost: number;
}

export interface WeeklyEvent {
  id: string;
  title: string;
  description: string;
  type: WeeklyEventType;
  affectedCategory: ActionCategory;
  affectedSegments: SegmentId[];
  policyTopic: PolicyTopicId;
  recommendedActionIds: string[];
  responseOptions: EventResponseOption[];
  /** Eski aksiyon-tabanlı değerlendirme — geriye dönük uyumluluk */
  outcomes: WeeklyEventOutcomes;
  reactionAxis?: ReactionAxis;
  primarySegments?: SegmentId[];
  tensionSegments?: SegmentId[];
  primaryPoliticalSegments?: PoliticalSegmentId[];
  tensionPoliticalSegments?: PoliticalSegmentId[];
  tensionRationale?: string;
  politicalRationale?: string;
  /** Rakip partiye yönelik saldırı/kritik — hedef ideoloji tabanında gerilim yaratır */
  attacksRival?: boolean;
  /** Belirli rakip hedefi; yoksa iktidar partisi kullanılır */
  targetRivalId?: string;
}

export interface WeeklyHistoryItem {
  week: number;
  selectedActions: string[];
  resourceChanges: Partial<Record<ResourceKey, number>>;
  metricChanges: Partial<Record<MetricKey, number>>;
  supportBefore: number;
  supportAfter: number;
  supportChange: number;
  summary: string;
  insight: string;
  eventTitle: string;
  eventType: WeeklyEventType | null;
  eventResponseLevel: EventResponseLevel | null;
  eventOutcomeTitle: string;
  eventOutcomeDescription: string;
  eventOutcomeEffects: WeeklyEventOutcomeEffects;
  organizationProductionLines: string[];
  actionSynergyLines: string[];
  organizationSegmentLines: string[];
  sympathizerDonation: number;
  sympathizerLeaderTrust: number;
  selectedResponseLabel: string;
  segmentChanges: Partial<Record<SegmentId, number>>;
  segmentReactions: SegmentReaction[];
  politicalSegmentChanges?: Partial<Record<PoliticalSegmentId, number>>;
  politicalSegmentReactions?: PoliticalSegmentReaction[];
  mainEventPoliticalReactionText?: string;
  mainEventPoliticalReactions?: PoliticalSegmentReaction[];
  alignmentFeedback: ResponseAlignmentFeedback | null;
  consistencyBefore: number;
  consistencyAfter: number;
  rivalMoves: RivalWeeklyMove[];
  opinionEchoes: OpinionEchoItem[];
  backgroundAgendaTitles: string[];
  subAgendaOutcomes: SubAgendaWeekOutcome[];
  subAgendaCrossRuleLines: string[];
  subAgendaSlotsUsed: number;
  subAgendaSlotsMax: number;
  subAgendaBonusSlots: number;
  radarAgendaTitles: string[];
  radarEffectLines: string[];
  regionalAgendaOutcomes: RegionalAgendaWeekOutcome[];
  upcomingStoryHint: string;
  /** Biten haftanın ardından yeni hafta açılışında tetiklenen gölge yankı */
  weekBacklash: WeekBacklashItem | null;
}

export interface RegionalResultItem {
  regionId: string;
  name: string;
  support: number;
  isHomeRegion: boolean;
}

export interface SegmentResultItem {
  segmentId: SegmentId;
  label: string;
  support: number;
}

export interface RivalComparisonItem {
  name: string;
  support: number;
  delta: number;
}

export interface FinalResult {
  nationalVoteShare: number;
  score: number;
  summary: string;
  strategicVerdict: string;
  consistencyGrade: 'A' | 'B' | 'C' | 'D';
  messageConsistency: number;
  regionalResults: RegionalResultItem[];
  strongRegions: string[];
  weakRegions: string[];
  strongSegments: SegmentResultItem[];
  weakSegments: SegmentResultItem[];
  campaignHighlights: string[];
  rivalComparison: RivalComparisonItem[];
  totalWeeksPlayed: number;
  averageWeeklySupportChange: number;
  bestWeek: number;
  worstWeek: number;
}

/** Bu hafta yapılan kurulum/yükseltme — geri alınabilir */
export interface OrganizationRevertEntry {
  scope: 'regional' | 'national';
  regionId?: RegionId;
  toolId: string;
  previousLevel: number;
  paidCost: Partial<Record<ResourceKey, number>>;
  instantEffects: {
    resources?: Partial<Record<ResourceKey, number>>;
    metrics?: Partial<Record<MetricKey, number>>;
  };
  /** Bölgesel anlık destek/örgüt artışı (geri alınırken düşülür) */
  regionalInstantDelta?: { organization: number; support: number };
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
  /** Bölgesel aksiyonların hedef bölgesi (actionId → regionId) */
  selectedActionTargets: Partial<Record<string, RegionId>>;
  /** Bölge başına örgütlenme aracı seviyeleri — 0 = kurulmamış */
  organizationToolLevelsByRegion: Record<RegionId, Record<string, number>>;
  /** Ulusal örgütlenme aracı seviyeleri — 0 = kurulmamış */
  nationalOrganizationToolLevels: Record<string, number>;
  /** Bu hafta geri alınabilir kurulum/yükseltme kayıtları */
  organizationRevertStack: OrganizationRevertEntry[];
  currentWeeklyEvent: WeeklyEvent | null;
  /** Bu hafta seçilen gündem tepkisi */
  selectedEventResponseId: string | null;
  /** Segment bazlı seçmen desteği (0–100) */
  segmentSupport: Record<SegmentId, number>;
  /** Ideolojik blok desteği — ulusal oy ince ayarı */
  politicalSegmentSupport: Record<PoliticalSegmentId, number>;
  /** Politika eksenlerinde birikmiş duruş (-50 … +50) */
  partyStances: Record<PolicyTopicId, number>;
  /** Mesaj tutarlılığı (0–100) */
  messageConsistency: number;
  /** Konu başına son tepki geçmişi */
  stanceHistory: StanceHistoryEntry[];
  /** Rakip partiler */
  rivalParties: RivalPartyState[];
  /** Bu haftanın alt gündem maddeleri (Faz C: 6 aktif) */
  subAgendas: SubAgendaItem[];
  /** Radar gündem — 0–2, tepki verilemez */
  radarAgendas: RadarAgendaItem[];
  /** Önceki haftadan kalan ek mesaj slotu (fırsat radarı) */
  bonusSubAgendaSlots: number;
  /** Seçilen alt gündem tepkileri */
  selectedSubAgendaSelections: SubAgendaSelection[];
  /** Bu haftanın bölgesel gündem kartları (Faz 1: ana bölge) */
  regionalAgendas: RegionalAgendaItem[];
  /** Seçilen bölgesel gündem tepkileri */
  selectedRegionalAgendaSelections: SubAgendaSelection[];
  /** Önceki haftanın bölgesel gündem bölgeleri — tekrar ağırlığını düşürür */
  regionalAgendaRecentRegionIds: RegionId[];
  /** Medya / kamuoyu yankı akışı */
  opinionFeed: OpinionEchoItem[];
  /** Gecikmeli yansıyacak yankılar */
  pendingOpinionEchoes: PendingOpinionEcho[];
  /** Zincir olaylar — belirli haftada tetiklenir */
  scheduledStoryEvents: ScheduledStoryEvent[];
  /** Bölgesel zincir olaylar — belirli hafta ve bölgede tetiklenir */
  scheduledRegionalStoryEvents: ScheduledRegionalStoryEvent[];
  /** Hikâye zinciri bayrakları */
  storyFlags: Record<string, boolean>;
  /** Sonraki hafta açılışında uygulanacak gölge yankı */
  pendingWeekBacklash: PendingWeekBacklash | null;
  /** Yeni hafta pop-up — DISMISS_WEEK_BACKLASH ile kapanır */
  activeWeekBacklash: WeekBacklashItem | null;
  /** Son gölge yankının kampanya haftası (cooldown) */
  lastBacklashWeek: number;
  /** Tek seferlik gölge yankı bayrakları */
  backlashStoryFlags: Record<string, boolean>;
  history: WeeklyHistoryItem[];
  status: 'setup' | 'playing' | 'finished';
  nationalSupport: number;
  finalResult: FinalResult | null;
}
