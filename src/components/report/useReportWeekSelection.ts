import { useMemo, useState } from 'react';
import type { WeeklyHistoryItem } from '../../types/game';
import { getPreviousReport } from './reportComparison';

export function useReportWeekSelection(history: WeeklyHistoryItem[]) {
  const latestWeek = history.length > 0 ? history[history.length - 1].week : null;
  const weeks = useMemo(() => history.map((item) => item.week), [history]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [trackedHistoryLength, setTrackedHistoryLength] = useState(history.length);

  if (history.length !== trackedHistoryLength) {
    setTrackedHistoryLength(history.length);
    setSelectedWeek(null);
  }

  const activeWeek =
    selectedWeek ?? latestWeek ?? (weeks.length > 0 ? weeks[weeks.length - 1] : null);

  const activeReport =
    activeWeek !== null ? (history.find((item) => item.week === activeWeek) ?? null) : null;

  const previousReport =
    activeWeek !== null ? getPreviousReport(history, activeWeek) : null;

  return {
    latestWeek,
    weeks,
    activeWeek,
    activeReport,
    previousReport,
    setSelectedWeek,
  };
}
