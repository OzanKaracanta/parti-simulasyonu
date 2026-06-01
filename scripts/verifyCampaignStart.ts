/**
 * Kampanya başlangıç doğrulaması — örgüt footprint (PR-1) + ulusal destek bandı (PR-2)
 * Çalıştır: npm run verify:campaign-start
 */

import {
  CAMPAIGN_START_CONFIG,
  CAMPAIGN_START_NATIONAL_SUPPORT,
  CAMPAIGN_START_TOOL_IDS,
  CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS,
  CAMPAIGN_START_WEEKLY_NET,
} from '../src/data/campaignStartConfig';
import { regionDefinitions } from '../src/data/regions';
import { getRulingParty } from '../src/data/rivals';
import { getElectionEligibility } from '../src/engine/electionEligibilityEngine';
import { buildGameStateFromSetup } from '../src/engine/setupEngine';
import { computeWeeklyCashFlowPreview } from '../src/engine/weeklyCashFlow';
import { countRegionsWithIlPartyOffice } from '../src/engine/electionEligibilityEngine';
import { getRegionOrganizationToolLevel } from '../src/systems/regionOrganization';
import type { IdeologyId, LeadershipStyleId, RegionId, SetupChoices } from '../src/types/game';

const TOOLS = CAMPAIGN_START_TOOL_IDS;
const IDEOLOGIES: IdeologyId[] = [
  'centrist-reform',
  'populist-social',
  'nationalist-security',
  'libertarian-democrat',
  'conservative-democrat',
  'liberal-economist',
  'green-localist',
  'populist-radical',
];

let failures = 0;
let minObservedSupport = Number.POSITIVE_INFINITY;
let maxObservedSupport = 0;

function fail(message: string): void {
  failures += 1;
  console.error(`  ✗ ${message}`);
}

function ok(message: string): void {
  console.log(`  ✓ ${message}`);
}

function verifyOrganization(state: ReturnType<typeof buildGameStateFromSetup>, homeRegionId: RegionId): void {
  const ilOfficeCount = countRegionsWithIlPartyOffice(state);
  const hqLevel = state.nationalOrganizationToolLevels[TOOLS.nationalHeadquarters] ?? 0;
  const homeIl = getRegionOrganizationToolLevel(state, homeRegionId, TOOLS.ilOffice) >= 1;
  const homeVolunteer =
    getRegionOrganizationToolLevel(state, homeRegionId, TOOLS.volunteerNetwork) >= 1;

  if (hqLevel !== CAMPAIGN_START_CONFIG.nationalHeadquartersLevel) {
    fail(`Genel Merkez seviye ${hqLevel}, beklenen ${CAMPAIGN_START_CONFIG.nationalHeadquartersLevel}`);
  } else {
    ok(`Genel Merkez seviye ${hqLevel}`);
  }

  if (ilOfficeCount !== CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS) {
    fail(
      `İl bürosu ${ilOfficeCount} bölgede, beklenen ${CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS} (merkez + 2 komşu)`,
    );
  } else {
    ok(`İl bürosu ${ilOfficeCount} bölgede (merkez + 2 komşu)`);
  }

  if (!homeIl) {
    fail('Merkez bölgede il bürosu olmalı');
  } else {
    ok('Merkez bölgede il bürosu var');
  }

  if (!homeVolunteer) {
    fail('Ev bölgesinde gönüllü ağı seviye 1 bekleniyor');
  } else {
    ok('Ev bölgesinde gönüllü ağı var');
  }

  verifyWeeklyNet(state, 'standart kurulum');
}

function verifyWeeklyNet(
  state: ReturnType<typeof buildGameStateFromSetup>,
  label: string,
): void {
  const cash = computeWeeklyCashFlowPreview(state);
  if (cash.netChangeFromWeekStart < CAMPAIGN_START_WEEKLY_NET.min) {
    fail(
      `${label}: haftalık net ${cash.netChangeFromWeekStart} ₺ (min ${CAMPAIGN_START_WEEKLY_NET.min})`,
    );
  } else if (cash.netChangeFromWeekStart > CAMPAIGN_START_WEEKLY_NET.max) {
    fail(
      `${label}: haftalık net +${cash.netChangeFromWeekStart} ₺ (max ${CAMPAIGN_START_WEEKLY_NET.max})`,
    );
  } else {
    ok(`${label}: haftalık net +${cash.netChangeFromWeekStart} ₺`);
  }
}

function verifyNationalSupport(
  state: ReturnType<typeof buildGameStateFromSetup>,
  label: string,
): void {
  const support = state.nationalSupport;
  minObservedSupport = Math.min(minObservedSupport, support);
  maxObservedSupport = Math.max(maxObservedSupport, support);

  if (support < CAMPAIGN_START_NATIONAL_SUPPORT.min || support > CAMPAIGN_START_NATIONAL_SUPPORT.max) {
    fail(
      `${label}: ulusal destek %${support}, band %${CAMPAIGN_START_NATIONAL_SUPPORT.min}–${CAMPAIGN_START_NATIONAL_SUPPORT.max}`,
    );
  } else {
    ok(`${label}: ulusal destek %${support}`);
  }

  const eligibility = getElectionEligibility(state);
  if (eligibility.isEligible) {
    fail(`${label}: hafta 1 seçime yeterli olmamalı`);
  } else if (
    !eligibility.meetsSupportRequirement &&
    eligibility.regionsWithOffice === CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS
  ) {
    ok(
      `${label}: yeterlilik kapalı (${CAMPAIGN_START_TOTAL_IL_OFFICE_REGIONS}/4 il, destek <%${eligibility.requiredSupport})`,
    );
  }

  const ruling = getRulingParty(state.rivalParties);
  if (ruling && support >= ruling.nationalSupport) {
    fail(
      `${label}: oyuncu (%${support}) iktidardan (%${ruling.nationalSupport}) yüksek veya eşit`,
    );
  } else if (ruling) {
    ok(`${label}: iktidar %${ruling.nationalSupport} > oyuncu %${support}`);
  }
}

for (const { id: homeRegionId } of regionDefinitions) {
  console.log(`\n[${homeRegionId}]`);

  const choices: SetupChoices = {
    partyName: 'Test Parti',
    leaderName: 'Test Lider',
    regionId: homeRegionId,
    colorId: 'blue',
    symbolId: 'sun',
    ideologyId: 'centrist-reform',
    leadershipStyleId: 'charismatic',
  };

  const state = buildGameStateFromSetup(choices);
  verifyOrganization(state, homeRegionId);
  verifyNationalSupport(state, 'centrist-reform');
}

console.log('\n--- İdeoloji matrisi (Ege) ---');

for (const ideologyId of IDEOLOGIES) {
  const state = buildGameStateFromSetup({
    partyName: 'Test Parti',
    leaderName: 'Test Lider',
    regionId: 'ege',
    colorId: 'blue',
    symbolId: 'sun',
    ideologyId,
    leadershipStyleId: 'charismatic',
  });
  verifyNationalSupport(state, ideologyId);
}

console.log(
  `\nGözlemlenen ulusal destek aralığı: %${minObservedSupport} – %${maxObservedSupport}`,
);

console.log('\n--- Zor kurulum (popülist lider × tüm bölgeler) ---');

const HARD_LEADERSHIP: LeadershipStyleId = 'populist';

for (const { id: homeRegionId } of regionDefinitions) {
  const state = buildGameStateFromSetup({
    partyName: 'Test Parti',
    leaderName: 'Test Lider',
    regionId: homeRegionId,
    colorId: 'blue',
    symbolId: 'sun',
    ideologyId: 'centrist-reform',
    leadershipStyleId: HARD_LEADERSHIP,
  });
  verifyWeeklyNet(state, `popülist lider · ${homeRegionId}`);
}

console.log(`\n---\n${failures === 0 ? 'Tüm kontroller geçti.' : `${failures} hata.`}`);
process.exit(failures === 0 ? 0 : 1);
