/** Haftalık danışman brifingi — kısa tur özeti + eksik aktivite tavsiyesi */

import { CAMPAIGN_ADVISOR } from '../data/advisor';
import { segmentLabels } from '../data/segments';
import { buildAdvisorAdviceNotes } from './earlyWeekEndWarning';
import type {
  AdvisorBriefingItem,
  AdvisorBriefingSegmentMove,
  GameState,
  SegmentId,
  WeeklyHistoryItem,
} from '../types/game';

interface BuildAdvisorBriefingOptions {
  isFinalWeek: boolean;
}

function buildOpeningLine(completedWeek: number, isFinalWeek: boolean): string {
  if (isFinalWeek) {
    return 'Kampanya tamamlandı. Kısa özet aşağıda; ayrıntılar Raporlar sekmesinde.';
  }
  if (completedWeek === 1) {
    return 'İlk turunuz bitti. Ulusal tablo ve bir danışman notu:';
  }
  return `${completedWeek}. tur kapandı. Özet:`;
}

function buildHeadline(completedWeek: number, isFinalWeek: boolean): string {
  if (isFinalWeek) return `Tur ${completedWeek} — Kampanya özeti`;
  return `Tur ${completedWeek} özeti`;
}

function buildClosingLine(isFinalWeek: boolean): string {
  if (isFinalWeek) {
    return 'Seçim sonuçlarına geçebilirsiniz.';
  }
  return 'Detaylı rapor Raporlar sekmesinde.';
}

function findTopSegmentMove(
  changes: Partial<Record<SegmentId, number>>,
  direction: 'gain' | 'loss',
): AdvisorBriefingSegmentMove | null {
  const entries = Object.entries(changes).filter(([, value]) => {
    const delta = value ?? 0;
    return direction === 'gain' ? delta > 0 : delta < 0;
  }) as [SegmentId, number][];

  if (entries.length === 0) return null;

  entries.sort((a, b) =>
    direction === 'gain' ? (b[1] ?? 0) - (a[1] ?? 0) : (a[1] ?? 0) - (b[1] ?? 0),
  );

  const [segmentId, change] = entries[0];
  return {
    segmentId,
    label: segmentLabels[segmentId],
    change,
  };
}

export function buildAdvisorBriefing(
  report: WeeklyHistoryItem,
  completedWeekState: GameState,
  nextState: GameState,
  options: BuildAdvisorBriefingOptions,
): AdvisorBriefingItem {
  const topGain = findTopSegmentMove(report.segmentChanges, 'gain');
  const topLoss = findTopSegmentMove(report.segmentChanges, 'loss');

  return {
    id: `advisor-briefing-w${report.week}`,
    completedWeek: report.week,
    displayWeek: nextState.campaignWeek,
    advisorName: CAMPAIGN_ADVISOR.name,
    advisorTitle: CAMPAIGN_ADVISOR.title,
    headline: buildHeadline(report.week, options.isFinalWeek),
    openingLine: buildOpeningLine(report.week, options.isFinalWeek),
    supportBefore: report.supportBefore,
    supportAfter: report.supportAfter,
    supportChange: report.supportChange,
    topGain,
    topLoss,
    adviceNotes: buildAdvisorAdviceNotes(completedWeekState),
    closingLine: buildClosingLine(options.isFinalWeek),
    isFinalWeek: options.isFinalWeek,
  };
}

export function dismissActiveAdvisorBriefing(state: GameState): GameState {
  const nextState: GameState = {
    ...state,
    activeAdvisorBriefing: null,
    activeWeekBacklash: null,
  };

  if (nextState.finalResult) {
    return { ...nextState, status: 'finished' };
  }

  return nextState;
}
