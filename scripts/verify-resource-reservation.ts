/** Anlık kaynak düşümü / iade davranışını doğrular — `npx tsx scripts/verify-resource-reservation.ts` */

import { WEEKLY_ENERGY_REGEN, WEEKLY_VOLUNTEER_REGEN } from '../src/data/campaignConfig';
import { campaignActions } from '../src/data/campaignActions';
import {
  clamp,
  finishWeek,
  selectAction,
  unselectAction,
} from '../src/engine/gameEngine';
import { buildGameStateFromSetup } from '../src/engine/setupEngine';
import { gameReducer } from '../src/store/gameReducer';
import type { GameState, ResourceKey } from '../src/types/game';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createTestState(): GameState {
  return {
    ...buildGameStateFromSetup({
      partyName: 'Test Parti',
      leaderName: 'Test Lider',
      regionId: 'ege',
      colorId: 'blue',
      symbolId: 'sun',
      ideologyId: 'centrist-reform',
      leadershipStyleId: 'charismatic',
    }),
    currentWeeklyEvent: null,
  };
}

function getAction(id: string) {
  const action = campaignActions.find((item) => item.id === id);
  if (!action) throw new Error(`Aksiyon bulunamadı: ${id}`);
  return action;
}

function testImmediateDeductionOnSelect(): void {
  const state = createTestState();
  const action = getAction('local-meeting');
  const before = { ...state.resources };

  const next = selectAction(state, action.id);
  assert(next !== null, 'local-meeting seçilebilmeli');
  assert(
    next!.resources.energy === before.energy - (action.cost.energy ?? 0),
    'Enerji seçim anında düşmeli',
  );
  assert(
    next!.resources.money === before.money - (action.cost.money ?? 0),
    'Para seçim anında düşmeli',
  );
  assert(
    next!.resources.organizationCapacity === before.organizationCapacity,
    'Örgüt kapasitesi seçimde tüketilmemeli (yük modeli)',
  );
}

function testRefundOnUnselect(): void {
  const state = createTestState();
  const before = { ...state.resources };
  const selected = selectAction(state, 'local-meeting');
  assert(selected !== null, 'Aksiyon seçilmeli');

  const restored = unselectAction(selected!, 'local-meeting');
  assert(
    restored.resources.energy === before.energy,
    'Enerji iptalde geri gelmeli',
  );
  assert(restored.resources.money === before.money, 'Para iptalde geri gelmeli');
  assert(
    restored.resources.organizationCapacity === before.organizationCapacity,
    'Örgüt kapasitesi iptalde geri gelmeli',
  );
  assert(restored.selectedActionIds.length === 0, 'Seçim listesi boşalmalı');
}

function testAllResourceTypes(): void {
  const cases: Array<{ actionId: string; keys: ResourceKey[] }> = [
    { actionId: 'crisis-statement', keys: ['energy', 'reputation'] },
    { actionId: 'local-meeting', keys: ['money', 'energy', 'volunteers'] },
    { actionId: 'supporter-dinner', keys: ['money', 'energy', 'reputation'] },
  ];

  for (const { actionId, keys } of cases) {
    const state = createTestState();
    const action = getAction(actionId);
    const before = { ...state.resources };

    const selected = selectAction(state, actionId);
    assert(selected !== null, `${actionId} seçilebilmeli`);

    for (const key of keys) {
      const cost = action.cost[key] ?? 0;
      assert(
        selected!.resources[key] === before[key] - cost,
        `${actionId}: ${key} anında ${cost} düşmeli (${before[key]} -> ${selected!.resources[key]})`,
      );
    }

    const restored = unselectAction(selected!, actionId);
    for (const key of keys) {
      assert(
        restored.resources[key] === before[key],
        `${actionId}: ${key} iptalde ${before[key]} değerine dönmeli`,
      );
    }
  }
}

function testCumulativeSelectionUsesLiveBalance(): void {
  const state = createTestState();
  const first = selectAction(state, 'agenda-commentary');
  assert(first !== null, 'İlk aksiyon seçilmeli');
  assert(first!.resources.energy === state.resources.energy - 8, 'İlk aksiyon enerjiyi düşürmeli');

  const duplicate = selectAction(first!, 'agenda-commentary');
  assert(
    duplicate!.selectedActionIds.length === 1,
    'Aynı aksiyon iki kez seçilememeli',
  );

  const secondAction = selectAction(first!, 'small-donation-drive');
  assert(secondAction !== null, 'Kalan enerjiyle ikinci aksiyon seçilebilmeli');
  assert(
    secondAction!.resources.energy === state.resources.energy - 16,
    'İkinci aksiyon kalan enerjiden düşmeli',
  );
}

function testReducerMatchesEngine(): void {
  const state = createTestState();
  const before = state.resources.energy;

  const viaReducer = gameReducer(state, { type: 'SELECT_ACTION', actionId: 'agenda-commentary' });
  const viaEngine = selectAction(state, 'agenda-commentary');

  assert(viaReducer.resources.energy === viaEngine!.resources.energy, 'Reducer ve engine aynı enerjiyi göstermeli');
  assert(viaReducer.resources.energy === before - 8, 'Reducer seçimde enerjiyi düşmeli');

  const unselected = gameReducer(viaReducer, { type: 'UNSELECT_ACTION', actionId: 'agenda-commentary' });
  assert(unselected.resources.energy === before, 'Reducer iptalde enerjiyi geri koymalı');
}

function testFinishWeekDoesNotDoubleCharge(): void {
  const state = createTestState();
  const beforeWeek = { ...state.resources };

  const current = selectAction(state, 'agenda-commentary');
  assert(current !== null, 'Aksiyon seçilmeli');
  const afterSelect = { ...current!.resources };

  assert(afterSelect.energy === beforeWeek.energy - 8, 'Seçim sonrası enerji düşük olmalı');

  const finished = finishWeek(current!);
  assert(
    finished.resources.energy !== afterSelect.energy - 8,
    'Hafta bitince enerji bir kez daha aksiyon maliyeti kadar düşmemeli',
  );
  assert(
    finished.resources.energy === clamp(afterSelect.energy + WEEKLY_ENERGY_REGEN, 0, 100),
    `Hafta bitince yalnızca haftalık +${WEEKLY_ENERGY_REGEN} enerji yenilenmesi uygulanmalı`,
  );
}

function testFinishWeekReleasesCampaignVolunteers(): void {
  const state = createTestState();
  const action = getAction('local-meeting');
  const volunteerCost = action.cost.volunteers ?? 0;
  const before = state.resources.volunteers;

  const selected = selectAction(state, 'local-meeting');
  assert(selected !== null, 'Mahalle toplantısı seçilmeli');
  assert(
    selected!.resources.volunteers === before - volunteerCost,
    'Planlama sırasında gönüllü tahsis edilmeli',
  );

  const finished = finishWeek(selected!);
  assert(
    finished.resources.volunteers ===
      clamp(before + WEEKLY_VOLUNTEER_REGEN, 0, 100),
    `Hafta sonunda tahsis serbest kalmalı; yalnızca +${WEEKLY_VOLUNTEER_REGEN} haftalık yenileme eklenmeli`,
  );
}

function testOrganizationLoadBlocksOverCapacity(): void {
  const state = {
    ...createTestState(),
    resources: { ...createTestState().resources, organizationCapacity: 12 },
  };

  const first = selectAction(state, 'local-meeting');
  assert(first !== null, 'İlk aksiyon seçilmeli');
  assert(
    first!.resources.organizationCapacity === state.resources.organizationCapacity,
    'Kapasite değeri sabit kalmalı',
  );

  const second = selectAction(first!, 'regional-tour');
  assert(second === null, 'Toplam yük (3+10) kapasiteyi (12) aşan ikinci aksiyon seçilememeli');
}

function testFinishWeekPreservesOrganizationCapacity(): void {
  const state = createTestState();
  const before = state.resources.organizationCapacity;

  const selected = selectAction(state, 'local-meeting');
  assert(selected !== null, 'Aksiyon seçilmeli');

  const finished = finishWeek(selected!);
  assert(
    finished.resources.organizationCapacity === before,
    'Hafta sonunda örgüt kapasitesi yük nedeniyle düşmemeli',
  );
}

function testFinishWeekAppliesGainsWithoutDoubleCost(): void {
  const state = createTestState();
  const beforeMoney = state.resources.money;

  const selected = selectAction(state, 'small-donation-drive');
  assert(selected !== null, 'Bağış kampanyası seçilmeli');
  assert(selected!.resources.money === beforeMoney, 'Para maliyeti yok; para seçimde değişmemeli');

  const finished = finishWeek(selected!);
  assert(
    finished.resources.money >= beforeMoney + 14,
    'Hafta sonu para kazancı uygulanmalı',
  );
}

function runAllTests(): void {
  testImmediateDeductionOnSelect();
  testRefundOnUnselect();
  testAllResourceTypes();
  testCumulativeSelectionUsesLiveBalance();
  testReducerMatchesEngine();
  testFinishWeekDoesNotDoubleCharge();
  testFinishWeekReleasesCampaignVolunteers();
  testOrganizationLoadBlocksOverCapacity();
  testFinishWeekPreservesOrganizationCapacity();
  testFinishWeekAppliesGainsWithoutDoubleCost();
  console.log('Tüm kaynak rezervasyon testleri geçti.');
}

runAllTests();
