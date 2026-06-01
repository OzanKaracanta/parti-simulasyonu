/** Gönüllü tükenmesi — headless senaryo simülasyonu */

import { WEEKLY_VOLUNTEER_REGEN } from '../src/data/campaignConfig';
import { campaignActions } from '../src/data/campaignActions';
import { canAffordAction, finishWeek, selectAction } from '../src/engine/gameEngine';
import { resolveActionWithWeeklyEvent } from '../src/engine/eventEngine';
import { buildGameStateFromSetup } from '../src/engine/setupEngine';
import { buildNationalTool } from '../src/systems/nationalOrganizationSystem';
import type { CampaignAction, GameState } from '../types/game';

function createBaseState(): GameState {
  return buildGameStateFromSetup({
    partyName: 'Sim Parti',
    leaderName: 'Sim Lider',
    regionId: 'ege',
    colorId: 'blue',
    symbolId: 'sun',
    ideologyId: 'centrist-reform',
    leadershipStyleId: 'charismatic',
  });
}

function getResolvedVolunteerCost(state: GameState, action: CampaignAction): number {
  return resolveActionWithWeeklyEvent(state.currentWeeklyEvent, action).resolved.cost.volunteers ?? 0;
}

function listVolunteerActions(): Array<{ action: CampaignAction; cost: number }> {
  const state = createBaseState();
  return campaignActions
    .map((action) => ({ action, cost: getResolvedVolunteerCost(state, action) }))
    .filter((item) => item.cost > 0)
    .sort((a, b) => b.cost - a.cost);
}

/** Tek hafta — yalnızca gönüllü limiti (örgüt yükü sınırsız varsayımı yok; gerçek seçim sırası). */
function simulateMaxSingleWeekSpend(): void {
  runGreedyVolunteerWeek('normal', createBaseState());
}

function runGreedyVolunteerWeek(label: string, initial: GameState): void {
  const state = initial;
  const start = state.resources.volunteers;
  let current = state;
  const picked: string[] = [];

  const byCost = listVolunteerActions();

  for (const { action, cost } of byCost) {
    if (!canAffordAction(current, action)) continue;
    const next = selectAction(current, action.id);
    if (!next) continue;
    current = next;
    picked.push(`${action.name} (−${cost})`);
  }

  const minDuringWeek = current.resources.volunteers;
  const finished = finishWeek(current);
  const afterWeek = finished.resources.volunteers;

  console.log(`=== Tek hafta — maksimum gönüllü harcama (${label}) ===`);
  console.log(`Başlangıç: ${start} | Planlama sonu: ${minDuringWeek} | Hafta bitişi: ${afterWeek}`);
  console.log(`Seçilen (${picked.length}): ${picked.join(' → ') || 'yok'}`);
  console.log(
    minDuringWeek === 0
      ? '✓ Planlama sırasında gönüllü 0’a indi.'
      : minDuringWeek <= 5
        ? `△ Çok düşük (${minDuringWeek}) ama sıfıra inmedi.`
        : `✗ Tek haftada 0’a inilemedi (kalan ${minDuringWeek}).`,
  );
  console.log('');
}

/** Gönüllü kazandırmayan operasyonlarla çok hafta. */
function withMainEventResponse(state: GameState): GameState {
  const first = state.currentWeeklyEvent?.responseOptions[0]?.id;
  if (!first || state.selectedEventResponseId) return state;
  return { ...state, selectedEventResponseId: first };
}

function simulateMultiWeekDrain(weeks: number): void {
  const drainActionIds = [
    'regional-tour',
    'local-meeting',
    'worker-visit',
    'youth-event',
    'women-platform',
    'retiree-forum',
    'merchant-visit',
  ];

  let state = createBaseState();
  let minEver = state.resources.volunteers;
  const trace: string[] = [];

  for (let week = 1; week <= weeks && state.status !== 'finished'; week += 1) {
    const weekStart = state.resources.volunteers;
    let minWeek = weekStart;

    for (const actionId of drainActionIds) {
      const action = state.availableActions.find((item) => item.id === actionId);
      if (!action) continue;
      if (!canAffordAction(state, action)) continue;
      const next = selectAction(state, action.id);
      if (!next) continue;
      state = next;
      minWeek = Math.min(minWeek, state.resources.volunteers);
    }

    minEver = Math.min(minEver, minWeek);
    const beforeFinish = state.resources.volunteers;
    state = finishWeek(withMainEventResponse(state));
    const afterFinish = state.resources.volunteers;

    trace.push(
      `H${week}: baş ${weekStart} → plan min ${minWeek} → bitiş öncesi ${beforeFinish} → yeni tur ${afterFinish}`,
    );

    if (minWeek === 0) {
      trace.push('  ✓ Bu hafta planlama sırasında 0 gönüllü.');
    }
  }

  console.log(`=== ${weeks} hafta — gönüllü kazancı olmayan operasyonlar ===`);
  for (const line of trace) console.log(line);
  console.log(`En düşük planlama değeri: ${minEver}`);
  console.log(
    minEver === 0
      ? '✓ Çok haftalık senaryoda gönüllü 0 görüldü.'
      : '✗ Çok haftalık senaryoda bile 0’a inilemedi.',
  );
  console.log('');
}

/** Örgüt inşası + operasyon — anlık gönüllü düşümü. */
function simulateOrgBuildDrain(): void {
  let state = createBaseState();
  const start = state.resources.volunteers;

  const afterRegional = state.resources.volunteers;

  const national = buildNationalTool(state, 'social_media_team');
  if (national) state = national;

  console.log('=== Örgüt aracı kurulum maliyetleri ===');
  console.log(`Başlangıç: ${start} (bölgesel ağ zaten kurulu) → ulusal sosyal medya ekibi: ${state.resources.volunteers}`);
  console.log('');
}

/** volunteer-training hafta sonu +8 kazanç — tükenmeyi geri alır mı? */
function simulateTrainingRecovery(): void {
  let state = createBaseState();

  for (let i = 0; i < 4; i += 1) {
    const next = selectAction(state, 'regional-tour');
    if (next) state = next;
  }

  const drained = state.resources.volunteers;
  const finished = finishWeek(withMainEventResponse(state));

  console.log('=== volunteer-training kazancı ===');
  console.log(`4× bölgesel tur sonrası planlama: ${drained}`);

  state = createBaseState();
  for (let i = 0; i < 3; i += 1) {
    const next = selectAction(state, 'regional-tour');
    if (next) state = next;
  }
  const next = selectAction(state, 'volunteer-training');
  if (next) state = next;
  const drainedWithTraining = state.resources.volunteers;
  const finishedWithTraining = finishWeek(withMainEventResponse(state));

  console.log(
    `3× tur + eğitim kampı: planlama ${drainedWithTraining} → hafta sonu ${finishedWithTraining.resources.volunteers} (+8 kazanç + ${WEEKLY_VOLUNTEER_REGEN} yenilenme)`,
  );
  console.log(`Saf tüketim hafta sonu: ${finished.resources.volunteers}`);
  console.log('');
}

function simulateBlockedSelectionAtZero(): void {
  let state = createBaseState();
  const expensive = listVolunteerActions().slice(0, 6);

  for (const { action } of expensive) {
    const next = selectAction(state, action.id);
    if (next) state = next;
  }

  const remaining = state.resources.volunteers;
  const blocked = campaignActions
    .filter((action) => (action.cost.volunteers ?? 0) > remaining)
    .map((action) => action.name);

  console.log('=== Kalan gönüllü ile kilitlenen operasyonlar ===');
  console.log(`Kalan: ${remaining}`);
  console.log(
    blocked.length > 0
      ? `Seçilemeyen örnekler: ${blocked.slice(0, 5).join(', ')}${blocked.length > 5 ? '…' : ''}`
      : 'Hâlâ pahalı operasyon seçilebiliyor.',
  );
  console.log(
    remaining === 0
      ? '✓ 0 gönüllü — yeni gönüllülü operasyon seçilemez.'
      : `△ ${remaining} gönüllü kaldı.`,
  );
  console.log('');
}

function simulateWeekEndAccounting(): void {
  const state = createBaseState();
  const before = state.resources.volunteers;
  const action = campaignActions.find((item) => item.id === 'local-meeting')!;
  const cost = action.cost.volunteers ?? 0;

  const selected = selectAction(state, action.id);
  if (!selected) {
    console.log('=== Hafta sonu muhasebesi ===');
    console.log('local-meeting seçilemedi (kilit veya kaynak).');
    console.log('');
    return;
  }
  const afterSelect = selected.resources.volunteers;
  const withResponse =
    selected.currentWeeklyEvent?.responseOptions[0]
      ? {
          ...selected,
          selectedEventResponseId: selected.currentWeeklyEvent.responseOptions[0].id,
        }
      : selected;
  const finished = finishWeek(withResponse);
  const afterWeek = finished.resources.volunteers;

  console.log('=== Hafta sonu muhasebesi (mahalle toplantısı) ===');
  console.log(`Tur başı: ${before}`);
  console.log(`Seçim sonrası: ${afterSelect} (−${cost})`);
  console.log(
    `Hafta bitişi: ${afterWeek} (beklenen: seçim sonrası +${WEEKLY_VOLUNTEER_REGEN} = ${afterSelect + WEEKLY_VOLUNTEER_REGEN}; tam iade değil)`,
  );
  console.log('');
}

function simulateTheoreticalVolunteerFloor(): void {
  const state = createBaseState();
  let remaining = state.resources.volunteers;
  const picks: string[] = [];

  for (const { action, cost } of listVolunteerActions()) {
    if (cost > remaining) continue;
    remaining -= cost;
    picks.push(`${action.name} (−${cost})`);
  }

  console.log('=== Teorik — yalnızca gönüllü (örgüt/para/enerji yok sayılırsa) ===');
  console.log(`Başlangıç 45 → kalan ${remaining} | ${picks.length} operasyon`);
  console.log(picks.join(' → ') || 'yok');
  console.log(
    remaining === 0 ? '✓ Gönüllü bütçesi teorik olarak sıfırlanabilir.' : `△ Teorik kalan: ${remaining}`,
  );
  console.log('');
}

function simulateUnlimitedOrgLoad(): void {
  const state = createBaseState();
  const boosted: GameState = {
    ...state,
    resources: {
      ...state.resources,
      organizationCapacity: 100,
      energy: 100,
      money: 999,
    },
  };
  runGreedyVolunteerWeek('yüksek örgüt kapasitesi + para/enerji', boosted);
}

function simulateAtOneVolunteer(): void {
  let state = createBaseState();
  state = {
    ...state,
    resources: {
      ...state.resources,
      organizationCapacity: 100,
      energy: 100,
      money: 999,
      volunteers: 1,
    },
  };

  const affordable = listVolunteerActions().filter(({ cost }) => cost <= 1);
  const blocked = listVolunteerActions().filter(({ cost }) => cost > 1);

  console.log('=== 1 gönüllü kaldığında ===');
  console.log(
    affordable.length > 0
      ? `Hâlâ seçilebilir: ${affordable.map((item) => item.action.name).join(', ')}`
      : 'Gönüllülü operasyon kalmadı.',
  );
  console.log(`Bloklu (maliyet >1): ${blocked.length} operasyon`);
  console.log('');
}

simulateWeekEndAccounting();
simulateTheoreticalVolunteerFloor();
simulateMaxSingleWeekSpend();
simulateUnlimitedOrgLoad();
simulateAtOneVolunteer();
simulateBlockedSelectionAtZero();
simulateOrgBuildDrain();
simulateTrainingRecovery();
simulateMultiWeekDrain(8);
