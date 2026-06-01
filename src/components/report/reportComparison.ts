import { metricLabels, resourceLabels, segmentLabels } from '../../data/labels';
import { politicalSegmentLabels } from '../../data/politicalSegments';
import { formatDelta } from '../../engine/weeklyReport';
import type { MetricKey, ResourceKey, SegmentId, WeeklyHistoryItem } from '../../types/game';
import type { PoliticalSegmentId } from '../../types/politicalSegments';

export type CompareTone = 'positive' | 'negative' | 'neutral';

export interface WeekCompareRow {
  id: string;
  label: string;
  previousValue: string;
  currentValue: string;
  trendValue: string;
  tone: CompareTone;
}

const COMPARE_METRIC_KEYS: MetricKey[] = [
  'mediaPower',
  'leaderTrust',
  'campaignVisibility',
  'crisisManagement',
];

const COMPARE_RESOURCE_KEYS: ResourceKey[] = ['money', 'energy', 'reputation'];

export function getPreviousReport(
  history: WeeklyHistoryItem[],
  week: number,
): WeeklyHistoryItem | null {
  const index = history.findIndex((item) => item.week === week);
  if (index <= 0) return null;
  return history[index - 1];
}

function toneFromDelta(delta: number): CompareTone {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
}

function formatMetricDelta(value: number | undefined): string {
  if (value === undefined || value === 0) return '—';
  return formatDelta(value);
}

function topSegmentChangeLabel(
  changes: Partial<Record<SegmentId, number>> | undefined,
  labels: Record<SegmentId, string>,
): string | null {
  if (!changes) return null;
  const top = Object.entries(changes)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))[0];
  if (!top) return null;
  const [segmentId, delta] = top;
  return `${labels[segmentId as SegmentId]} ${formatDelta(delta ?? 0)}`;
}

function topPoliticalChangeLabel(
  changes: Partial<Record<PoliticalSegmentId, number>> | undefined,
): string | null {
  if (!changes) return null;
  const top = Object.entries(changes)
    .filter(([, delta]) => delta !== 0)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))[0];
  if (!top) return null;
  const [segmentId, delta] = top;
  return `${politicalSegmentLabels[segmentId as PoliticalSegmentId]} ${formatDelta(delta ?? 0)}`;
}

export function buildWeekCompareRows(
  current: WeeklyHistoryItem,
  previous: WeeklyHistoryItem,
): WeekCompareRow[] {
  const rows: WeekCompareRow[] = [];

  const supportTrend = current.supportAfter - previous.supportAfter;
  rows.push({
    id: 'support',
    label: 'Oy Oranı',
    previousValue: `${previous.supportAfter.toFixed(1)}%`,
    currentValue: `${current.supportAfter.toFixed(1)}%`,
    trendValue: formatDelta(supportTrend),
    tone: toneFromDelta(supportTrend),
  });

  rows.push({
    id: 'consistency',
    label: 'Mesaj Tutarlılığı',
    previousValue: String(previous.consistencyAfter),
    currentValue: String(current.consistencyAfter),
    trendValue: formatDelta(current.consistencyAfter - previous.consistencyAfter),
    tone: toneFromDelta(current.consistencyAfter - previous.consistencyAfter),
  });

  rows.push({
    id: 'actions',
    label: 'Aksiyon Sayısı',
    previousValue: String(previous.selectedActions.length),
    currentValue: String(current.selectedActions.length),
    trendValue: formatDelta(current.selectedActions.length - previous.selectedActions.length),
    tone: toneFromDelta(current.selectedActions.length - previous.selectedActions.length),
  });

  const currentSocioTop = topSegmentChangeLabel(current.segmentChanges, segmentLabels);
  const previousSocioTop = topSegmentChangeLabel(previous.segmentChanges, segmentLabels);
  if (currentSocioTop || previousSocioTop) {
    rows.push({
      id: 'segment-socio',
      label: 'En Güçlü Toplumsal Δ',
      previousValue: previousSocioTop ?? '—',
      currentValue: currentSocioTop ?? '—',
      trendValue: '—',
      tone: toneFromDelta(
        Object.values(current.segmentChanges ?? {}).sort(
          (a, b) => Math.abs(b ?? 0) - Math.abs(a ?? 0),
        )[0] ?? 0,
      ),
    });
  }

  const currentPoliticalTop = topPoliticalChangeLabel(current.politicalSegmentChanges);
  const previousPoliticalTop = topPoliticalChangeLabel(previous.politicalSegmentChanges);
  if (currentPoliticalTop || previousPoliticalTop) {
    rows.push({
      id: 'segment-political',
      label: 'En Güçlü Politik Δ',
      previousValue: previousPoliticalTop ?? '—',
      currentValue: currentPoliticalTop ?? '—',
      trendValue: '—',
      tone: toneFromDelta(
        Object.values(current.politicalSegmentChanges ?? {}).sort(
          (a, b) => Math.abs(b ?? 0) - Math.abs(a ?? 0),
        )[0] ?? 0,
      ),
    });
  }

  for (const key of COMPARE_METRIC_KEYS) {
    const prevDelta = previous.metricChanges[key];
    const curDelta = current.metricChanges[key];
    if (prevDelta === undefined && curDelta === undefined) continue;
    rows.push({
      id: `metric-${key}`,
      label: metricLabels[key],
      previousValue: formatMetricDelta(prevDelta),
      currentValue: formatMetricDelta(curDelta),
      trendValue:
        prevDelta !== undefined && curDelta !== undefined
          ? formatDelta(curDelta - prevDelta)
          : formatMetricDelta(curDelta ?? prevDelta),
      tone: toneFromDelta(curDelta ?? 0),
    });
  }

  for (const key of COMPARE_RESOURCE_KEYS) {
    const prevDelta = previous.resourceChanges[key];
    const curDelta = current.resourceChanges[key];
    if (prevDelta === undefined && curDelta === undefined) continue;
    rows.push({
      id: `resource-${key}`,
      label: resourceLabels[key],
      previousValue: formatMetricDelta(prevDelta),
      currentValue: formatMetricDelta(curDelta),
      trendValue:
        prevDelta !== undefined && curDelta !== undefined
          ? formatDelta(curDelta - prevDelta)
          : formatMetricDelta(curDelta ?? prevDelta),
      tone: toneFromDelta(curDelta ?? 0),
    });
  }

  return rows;
}
