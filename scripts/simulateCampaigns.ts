/** Faz 6 — headless kampanya simülasyon CLI */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { BALANCE_SCENARIOS } from '../src/sim/balanceScenarios';
import {
  aggregateBalanceResults,
  BACKLASH_TARGET_MAX,
  BACKLASH_TARGET_MIN,
  POLITICAL_ACTIVITY_WEEKS_MIN,
  runCampaignSimulation,
  SUPPORT_BAND_MAX,
  SUPPORT_BAND_MIN,
} from '../src/sim/campaignSimulator';

const results = BALANCE_SCENARIOS.map((scenario) => runCampaignSimulation(scenario));
const aggregate = aggregateBalanceResults(results);

console.log('=== Faz 6 — Kampanya Denge Simülasyonları ===\n');
console.log(
  `Kabul bandı: destek ${SUPPORT_BAND_MIN}–${SUPPORT_BAND_MAX}%, backlash ${BACKLASH_TARGET_MIN}–${BACKLASH_TARGET_MAX}, politik aktif hafta ≥${POLITICAL_ACTIVITY_WEEKS_MIN}\n`,
);

for (const result of results) {
  const supportOk =
    result.minSupport >= SUPPORT_BAND_MIN && result.maxSupport <= SUPPORT_BAND_MAX ? 'OK' : '!!';
  const backlashOk =
    result.backlashCount >= BACKLASH_TARGET_MIN && result.backlashCount <= BACKLASH_TARGET_MAX
      ? 'OK'
      : '!!';
  const politicalOk =
    result.weeksWithPoliticalActivity >= POLITICAL_ACTIVITY_WEEKS_MIN ? 'OK' : '!!';

  console.log(`${result.scenarioId} | ${result.strategy.padEnd(12)} | ${result.label}`);
  console.log(
    `  destek: ${result.startSupport}% → ${result.finalSupport}% (min ${result.minSupport}, max ${result.maxSupport}) [${supportOk}]`,
  );
  console.log(
    `  haftalık |Δ| ort: ${result.avgWeeklyAbsDelta}, max: ${result.maxWeeklyAbsDelta} | band dışı hafta: ${result.outsideBandWeeks}`,
  );
  console.log(
    `  backlash: ${result.backlashCount} [${backlashOk}] | tutarlılık: ${result.finalConsistency}`,
  );
  console.log(
    `  politik: ${result.weeksWithPoliticalActivity} aktif hafta, taban destek ${result.finalPlayerBasePoliticalSupport}, net Δ ${result.netPlayerBasePoliticalDelta >= 0 ? '+' : ''}${result.netPlayerBasePoliticalDelta} [${politicalOk}]`,
  );
  console.log('');
}

console.log('--- Özet ---');
console.log(`Kampanya sayısı: ${aggregate.count}`);
console.log(`Ort. final destek: ${aggregate.avgFinalSupport}%`);
console.log(`Ort. min/max: ${aggregate.avgMinSupport}% / ${aggregate.avgMaxSupport}%`);
console.log(`Ort. backlash: ${aggregate.avgBacklashCount}`);
console.log(`Ort. band dışı hafta: ${aggregate.avgOutsideBandWeeks}`);
console.log(`Ort. haftalık |Δ|: ${aggregate.avgWeeklyAbsDelta} (en yüksek tek hafta: ${aggregate.maxWeeklyAbsDelta})`);
console.log(`Destek bandı ihlali: ${aggregate.supportBandViolations}/${aggregate.count}`);
console.log(`Backlash bandı ihlali: ${aggregate.backlashBandViolations}/${aggregate.count}`);
console.log(
  `Politik aktif hafta ort: ${aggregate.avgWeeksWithPoliticalActivity} | taban destek ort: ${aggregate.avgPlayerBasePoliticalSupport}`,
);
console.log(
  `Politik aktivite ihlali: ${aggregate.politicalActivityViolations}/${aggregate.count}`,
);

const outputPath = resolve(process.cwd(), 'scripts/balance-sim-results.json');
writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), aggregate, results }, null, 2));
console.log(`\nJSON: ${outputPath}`);
