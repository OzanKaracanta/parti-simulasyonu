/** Faz 6 — 10 headless kampanya senaryosu */

import type { IdeologyId, LeadershipStyleId, RegionId } from '../types/game';
import type { BotStrategyId } from './campaignBot';

export interface BalanceScenario {
  id: string;
  label: string;
  strategy: BotStrategyId;
  ideologyId: IdeologyId;
  regionId: RegionId;
  leadershipStyleId: LeadershipStyleId;
  seed: number;
}

export const BALANCE_SCENARIOS: BalanceScenario[] = [
  {
    id: 'sim-01',
    label: 'Popülist sosyal / dengeli / Marmara',
    strategy: 'balanced',
    ideologyId: 'populist-social',
    regionId: 'marmara',
    leadershipStyleId: 'charismatic',
    seed: 1001,
  },
  {
    id: 'sim-02',
    label: 'Milliyetçi güvenlik / agresif / İç Anadolu',
    strategy: 'aggressive',
    ideologyId: 'nationalist-security',
    regionId: 'ic-anadolu',
    leadershipStyleId: 'ideological',
    seed: 1002,
  },
  {
    id: 'sim-03',
    label: 'Liberal ekonomist / pasif / Ege',
    strategy: 'passive',
    ideologyId: 'liberal-economist',
    regionId: 'ege',
    leadershipStyleId: 'technocrat',
    seed: 1003,
  },
  {
    id: 'sim-04',
    label: 'Muhafazakâr demokrat / dengeli / Karadeniz',
    strategy: 'balanced',
    ideologyId: 'conservative-democrat',
    regionId: 'karadeniz',
    leadershipStyleId: 'local',
    seed: 1004,
  },
  {
    id: 'sim-05',
    label: 'Yeşil yerelci / fırsatçı / Akdeniz',
    strategy: 'opportunist',
    ideologyId: 'green-localist',
    regionId: 'akdeniz',
    leadershipStyleId: 'digital',
    seed: 1005,
  },
  {
    id: 'sim-06',
    label: 'Popülist radikal / agresif / Güneydoğu',
    strategy: 'aggressive',
    ideologyId: 'populist-radical',
    regionId: 'guneydogu-anadolu',
    leadershipStyleId: 'populist',
    seed: 1006,
  },
  {
    id: 'sim-07',
    label: 'Merkez reform / pasif / Doğu Anadolu',
    strategy: 'passive',
    ideologyId: 'centrist-reform',
    regionId: 'dogu-anadolu',
    leadershipStyleId: 'technocrat',
    seed: 1007,
  },
  {
    id: 'sim-08',
    label: 'Libertarian / fırsatçı / Marmara',
    strategy: 'opportunist',
    ideologyId: 'libertarian-democrat',
    regionId: 'marmara',
    leadershipStyleId: 'charismatic',
    seed: 1008,
  },
  {
    id: 'sim-09',
    label: 'Popülist sosyal / rastgele / Ege',
    strategy: 'random',
    ideologyId: 'populist-social',
    regionId: 'ege',
    leadershipStyleId: 'digital',
    seed: 1009,
  },
  {
    id: 'sim-10',
    label: 'Milliyetçi güvenlik / rastgele / Marmara',
    strategy: 'random',
    ideologyId: 'nationalist-security',
    regionId: 'marmara',
    leadershipStyleId: 'ideological',
    seed: 1010,
  },
];
