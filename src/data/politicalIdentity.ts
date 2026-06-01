/** İdeoloji ve liderlik tarzı — tepki uyumu verileri */

import type {
  ActionCategory,
  IdeologyId,
  LeadershipStyleId,
  PolicyTopicId,
  ResponseTone,
} from '../types/game';

export const ALL_POLICY_TOPICS: PolicyTopicId[] = [
  'economy',
  'labor',
  'security',
  'transparency',
  'environment',
  'socialWelfare',
  'localGovernance',
  'mediaPolitics',
];

export const policyTopicLabels: Record<PolicyTopicId, string> = {
  economy: 'Ekonomi',
  labor: 'Emek',
  security: 'Güvenlik',
  transparency: 'Şeffaflık',
  environment: 'Çevre',
  socialWelfare: 'Sosyal Refah',
  localGovernance: 'Yerel Yönetim',
  mediaPolitics: 'Medya Siyaseti',
};

export const responseToneLabels: Record<ResponseTone, string> = {
  bold: 'Kararlı',
  measured: 'Ölçülü',
  passive: 'Pasif',
};

/** İdeolojinin konu başına tercih ettiği duruş (-2 … +2) */
export const IDEOLOGY_TOPIC_PREFERENCE: Record<
  IdeologyId,
  Partial<Record<PolicyTopicId, number>>
> = {
  'centrist-reform': {
    economy: 0,
    transparency: 1,
    localGovernance: 0,
    socialWelfare: 0,
  },
  'populist-social': {
    economy: -1,
    labor: 2,
    socialWelfare: 2,
    transparency: 0,
  },
  'nationalist-security': {
    security: 2,
    economy: 0,
    mediaPolitics: 1,
    environment: -1,
  },
  'libertarian-democrat': {
    transparency: 2,
    socialWelfare: 0,
    security: -1,
    environment: 1,
  },
  'conservative-democrat': {
    socialWelfare: 1,
    localGovernance: 1,
    environment: 0,
    labor: 0,
  },
  'liberal-economist': {
    economy: 2,
    labor: -1,
    transparency: 1,
    socialWelfare: -1,
  },
  'green-localist': {
    environment: 2,
    localGovernance: 2,
    economy: -1,
    labor: 0,
  },
  'populist-radical': {
    economy: -2,
    labor: 1,
    mediaPolitics: 2,
    transparency: 1,
  },
};

/** Liderlik tarzının tercih ettiği tepki tonları */
export const LEADERSHIP_TONE_PREFERENCE: Record<
  LeadershipStyleId,
  Partial<Record<ResponseTone, number>>
> = {
  charismatic: { bold: 3, measured: 1, passive: -2 },
  organizer: { measured: 2, bold: 0, passive: 0 },
  technocrat: { measured: 3, bold: -1, passive: 0 },
  populist: { bold: 3, measured: 0, passive: -2 },
  conciliator: { measured: 3, bold: -1, passive: 1 },
  ideological: { bold: 2, measured: 0, passive: -2 },
  digital: { bold: 2, measured: 1, passive: -1 },
  local: { measured: 2, bold: 1, passive: 0 },
};

/** Olay kategorisinden varsayılan politika konusu */
export const CATEGORY_DEFAULT_POLICY_TOPIC: Record<ActionCategory, PolicyTopicId> = {
  localOrganization: 'localGovernance',
  socialGroups: 'socialWelfare',
  mediaCommunication: 'mediaPolitics',
  fundraising: 'economy',
  strategyProfessionalization: 'transparency',
};

/** Başlangıç parti duruşları — ideoloji profilinden */
export function createInitialPartyStances(
  ideologyId: IdeologyId,
): Record<PolicyTopicId, number> {
  const preferences = IDEOLOGY_TOPIC_PREFERENCE[ideologyId];
  const stances = {} as Record<PolicyTopicId, number>;

  for (const topic of ALL_POLICY_TOPICS) {
    const pref = preferences[topic] ?? 0;
    stances[topic] = pref * 8;
  }

  return stances;
}

export function getIdeologyPreferredStance(
  ideologyId: IdeologyId,
  topic: PolicyTopicId,
): number {
  return IDEOLOGY_TOPIC_PREFERENCE[ideologyId][topic] ?? 0;
}

export function getLeadershipToneBonus(
  leadershipStyleId: LeadershipStyleId,
  tone: ResponseTone,
): number {
  return LEADERSHIP_TONE_PREFERENCE[leadershipStyleId][tone] ?? 0;
}
