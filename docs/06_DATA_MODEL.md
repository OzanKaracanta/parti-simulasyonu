# 06 — Data Model

## Temel tipler

```ts
export type ResourceKey = 'money' | 'energy' | 'volunteers' | 'reputation' | 'organizationCapacity';

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
```

## GameState örneği

```ts
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
  finalResult: FinalResult | null;
}
```

## Aksiyon modeli

```ts
export interface CampaignAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  cost: Partial<Record<ResourceKey, number>>;
  effects: Partial<Record<MetricKey, number>>;
  risks?: ActionRisk[];
  maxUsesPerCampaign?: number;
  cooldownWeeks?: number;
}
```

## Bölge modeli

```ts
export interface RegionState {
  id: string;
  name: string;
  support: number;
  organization: number;
  mediaReach: number;
  dominantGroups: string[];
}
```

## Haftalık geçmiş

```ts
export interface WeeklyHistoryItem {
  week: number;
  selectedActions: string[];
  resourceChanges: Partial<Record<ResourceKey, number>>;
  metricChanges: Partial<Record<MetricKey, number>>;
  supportChange: number;
  summary: string;
}
```

## Değer aralıkları

- Metrikler: 0–100
- İtibar: 0–100
- Bölgesel destek: 0–100
- Ulusal oy tahmini: 0–100

## Clamp kuralı

Her metrik ve destek değeri 0 ile 100 arasında sınırlandırılmalı.
