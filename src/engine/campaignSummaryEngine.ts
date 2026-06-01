/** Kampanya sonu analizi — bölgesel, segment ve stratejik özet */

import { segmentLabels } from '../data/segments';
import type {
  FinalResult,
  GameState,
  RegionalResultItem,
  RivalComparisonItem,
  SegmentId,
  SegmentResultItem,
  WeeklyHistoryItem,
} from '../types/game';

function gradeFromConsistency(consistency: number): FinalResult['consistencyGrade'] {
  if (consistency >= 80) return 'A';
  if (consistency >= 65) return 'B';
  if (consistency >= 50) return 'C';
  return 'D';
}

function buildRegionalResults(state: GameState): RegionalResultItem[] {
  return [...state.regions]
    .map((region) => ({
      regionId: region.id,
      name: region.name,
      support: Math.round(region.support * 10) / 10,
      isHomeRegion: region.id === state.party.homeRegionId,
    }))
    .sort((a, b) => b.support - a.support);
}

function buildSegmentResults(state: GameState): SegmentResultItem[] {
  return (Object.entries(state.segmentSupport) as [SegmentId, number][])
    .map(([segmentId, support]) => ({
      segmentId,
      label: segmentLabels[segmentId],
      support: Math.round(support * 10) / 10,
    }))
    .sort((a, b) => b.support - a.support);
}

function regionalBalanceBonus(regions: RegionalResultItem[]): number {
  if (regions.length <= 1) return 0;
  const values = regions.map((region) => region.support);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.round(12 - stdDev * 0.8));
}

function segmentBreadthBonus(segments: SegmentResultItem[]): number {
  if (segments.length === 0) return 0;
  const average = segments.reduce((sum, item) => sum + item.support, 0) / segments.length;
  const aboveAverage = segments.filter((item) => item.support >= average).length;
  return Math.round((aboveAverage / segments.length) * 15);
}

function findBestAndWorstWeeks(history: WeeklyHistoryItem[]): {
  bestWeek: number;
  worstWeek: number;
  averageWeeklySupportChange: number;
} {
  if (history.length === 0) {
    return { bestWeek: 0, worstWeek: 0, averageWeeklySupportChange: 0 };
  }

  let best = history[0];
  let worst = history[0];

  for (const item of history) {
    if (item.supportChange > best.supportChange) best = item;
    if (item.supportChange < worst.supportChange) worst = item;
  }

  const averageWeeklySupportChange =
    history.reduce((sum, item) => sum + item.supportChange, 0) / history.length;

  return {
    bestWeek: best.week,
    worstWeek: worst.week,
    averageWeeklySupportChange: Math.round(averageWeeklySupportChange * 10) / 10,
  };
}

function buildCampaignHighlights(state: GameState, history: WeeklyHistoryItem[]): string[] {
  const highlights: string[] = [];
  const { bestWeek, worstWeek, averageWeeklySupportChange } = findBestAndWorstWeeks(history);

  if (bestWeek > 0) {
    const best = history.find((item) => item.week === bestWeek);
    if (best && best.supportChange > 0) {
      highlights.push(
        `Hafta ${bestWeek}: En güçlü hafta (+${best.supportChange.toFixed(1)} puan)${best.eventTitle ? ` — ${best.eventTitle}` : ''}`,
      );
    }
  }

  if (worstWeek > 0) {
    const worst = history.find((item) => item.week === worstWeek);
    if (worst && worst.supportChange < 0) {
      highlights.push(
        `Hafta ${worstWeek}: En zor hafta (${worst.supportChange.toFixed(1)} puan)${worst.eventTitle ? ` — ${worst.eventTitle}` : ''}`,
      );
    }
  }

  const crisisWeeks = history.filter((item) => item.eventType === 'crisis').length;
  const opportunityWeeks = history.filter((item) => item.eventType === 'opportunity').length;

  if (crisisWeeks > 0) {
    highlights.push(`${crisisWeeks} kriz haftasını yönettin.`);
  }

  if (opportunityWeeks > 0) {
    highlights.push(`${opportunityWeeks} fırsat haftasında sahaya indin.`);
  }

  if (state.messageConsistency >= 75) {
    highlights.push(`Mesaj tutarlılığın yüksek kaldı (${Math.round(state.messageConsistency)}).`);
  } else if (state.messageConsistency < 55) {
    highlights.push(`Tutarsız mesajlar kampanyayı zayıflattı (${Math.round(state.messageConsistency)}).`);
  }

  const synergyWeeks = history.filter((item) => (item.actionSynergyLines?.length ?? 0) > 0).length;
  if (synergyWeeks >= 3) {
    highlights.push(`${synergyWeeks} haftada tepki–aksiyon sinerjisi yakaladın.`);
  }

  if (averageWeeklySupportChange > 0.3) {
    highlights.push('Kampanya boyunca istikrarlı bir yükseliş trendi oluştu.');
  } else if (averageWeeklySupportChange < -0.2) {
    highlights.push('Haftalık destek kaybı birikimli etki yarattı.');
  }

  return highlights.slice(0, 6);
}

function generateStrategicVerdict(
  nationalVoteShare: number,
  consistency: number,
  strongSegments: SegmentResultItem[],
  weakSegments: SegmentResultItem[],
  homeRegion: RegionalResultItem | undefined,
): string {
  if (nationalVoteShare >= 38) {
    return 'Güçlü bir taban inşa ettin ve seçim gününe rekabetçi bir profille girdin. Mesajın segmentler arasında taşındı.';
  }

  if (nationalVoteShare >= 30) {
    return 'Dengeli bir kampanya yürüttün. Kazanılan segmentler var ama zayıf kalan alanlar da seçim gecesi risk oluşturuyor.';
  }

  if (nationalVoteShare >= 22) {
    return 'Sınırlı bir tabanla mücadele ettin. Doğru haftalarda doğru tepkiler verdin ama genişleme yetersiz kaldı.';
  }

  if (consistency < 55) {
    return 'Tutarsız siyasi mesajlar güven kaybına yol açtı. Segmentler arasında net bir kimlik oluşmadı.';
  }

  if (homeRegion && homeRegion.support < 28) {
    return 'Ana bölgeni koruyamadın; yerel taban erimeden ulusal genişleme zordur.';
  }

  if (strongSegments.length > 0 && weakSegments.length > 0) {
    const strong = strongSegments[0]?.label ?? 'bir grup';
    const weak = weakSegments[weakSegments.length - 1]?.label ?? 'başka bir grup';
    return `${strong} segmentinde güçlü kaldın ama ${weak} tarafında ikna edemedin. Dar tabanlı bir profille seçime girdin.`;
  }

  return 'Kampanya zorlu geçti; segment ve bölgesel denge kurmak için yeterli momentum oluşmadı.';
}

function buildRivalComparison(state: GameState): RivalComparisonItem[] {
  return state.rivalParties
    .map((rival) => ({
      name: rival.name,
      support: Math.round(rival.nationalSupport * 10) / 10,
      delta: Math.round((state.nationalSupport - rival.nationalSupport) * 10) / 10,
    }))
    .sort((a, b) => b.support - a.support);
}

function generateSummary(nationalVoteShare: number, score: number): string {
  if (nationalVoteShare >= 35) {
    return `Kampanya ${nationalVoteShare.toFixed(1)}% tahmini oy oranı ile güçlü bir performansla tamamlandı. Skor: ${score}.`;
  }

  if (nationalVoteShare >= 25) {
    return `Kampanya ${nationalVoteShare.toFixed(1)}% tahmini oy oranı ile rekabetçi bir seviyede tamamlandı. Skor: ${score}.`;
  }

  return `Kampanya ${nationalVoteShare.toFixed(1)}% tahmini oy oranı ile tamamlandı. Skor: ${score}.`;
}

export function calculateFinalResult(state: GameState): FinalResult {
  const nationalVoteShare = state.nationalSupport;
  const regionalResults = buildRegionalResults(state);
  const segmentResults = buildSegmentResults(state);
  const strongSegments = segmentResults.slice(0, 3);
  const weakSegments = [...segmentResults].reverse().slice(0, 3);
  const strongRegions = regionalResults.slice(0, 2).map((region) => region.name);
  const weakRegions = [...regionalResults].reverse().slice(0, 2).map((region) => region.name);
  const homeRegion = regionalResults.find((region) => region.isHomeRegion);
  const { bestWeek, worstWeek, averageWeeklySupportChange } = findBestAndWorstWeeks(state.history);

  const score = Math.round(
    nationalVoteShare * 10 +
      state.resources.reputation * 2 +
      state.metrics.localOrganization +
      state.messageConsistency * 0.5 +
      regionalBalanceBonus(regionalResults) +
      segmentBreadthBonus(segmentResults),
  );

  const strategicVerdict = generateStrategicVerdict(
    nationalVoteShare,
    state.messageConsistency,
    strongSegments,
    weakSegments,
    homeRegion,
  );

  return {
    nationalVoteShare,
    score,
    summary: generateSummary(nationalVoteShare, score),
    strategicVerdict,
    consistencyGrade: gradeFromConsistency(state.messageConsistency),
    messageConsistency: Math.round(state.messageConsistency),
    regionalResults,
    strongRegions,
    weakRegions,
    strongSegments,
    weakSegments,
    campaignHighlights: buildCampaignHighlights(state, state.history),
    rivalComparison: buildRivalComparison(state),
    totalWeeksPlayed: state.history.length,
    averageWeeklySupportChange,
    bestWeek,
    worstWeek,
  };
}
