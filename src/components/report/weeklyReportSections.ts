import type { WeeklyHistoryItem } from '../../types/game';

export function countEnvironmentSections(report: WeeklyHistoryItem): number {
  let count = 0;
  if (report.radarEffectLines.length > 0) count += 1;
  if (report.rivalMoves.length > 0) count += 1;
  if (report.opinionEchoes.length > 0) count += 1;
  if (report.weekBacklash) count += 1;
  if (report.upcomingStoryHint) count += 1;
  if (report.actionSynergyLines.length > 0) count += 1;
  if (report.organizationSegmentLines.length > 0) count += 1;
  if (report.organizationProductionLines.length > 0) count += 1;
  if (report.sympathizerDonation > 0) count += 1;
  return count;
}

export function hasEnvironmentSections(report: WeeklyHistoryItem): boolean {
  return countEnvironmentSections(report) > 0;
}
