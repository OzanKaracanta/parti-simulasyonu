/** Haftalık danışman brifingi — rapordan oyuncu özeti üretir */

import { CAMPAIGN_ADVISOR } from '../data/advisor';
import { resourceLabels } from '../data/labels';
import { segmentLabels } from '../data/segments';
import { formatDelta } from './weeklyReport';
import type {
  AdvisorBriefingBullet,
  AdvisorBriefingItem,
  AdvisorBriefingTextSegment,
  AdvisorBriefingTone,
  GameState,
  ResourceKey,
  SegmentId,
  WeeklyHistoryItem,
} from '../types/game';

const MAX_OVERVIEW_BULLETS = 4;
const POLITICAL_BULLET_KINDS = ['support', 'rivals'] as const;

interface BuildAdvisorBriefingOptions {
  isFinalWeek: boolean;
}

function seg(text: string, tone: AdvisorBriefingTone = 'neutral'): AdvisorBriefingTextSegment {
  return { text, tone };
}

function deltaTone(value: number): AdvisorBriefingTone {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function deltaSeg(value: number, suffix = ''): AdvisorBriefingTextSegment {
  return { text: `${formatDelta(value)}${suffix}`, tone: deltaTone(value) };
}

function joinSegments(segments: AdvisorBriefingTextSegment[]): string {
  return segments.map((item) => item.text).join('');
}

function supportSeverity(change: number): AdvisorBriefingBullet['severity'] {
  if (change > 0.5) return 'positive';
  if (change < -0.5) return 'warning';
  return 'neutral';
}

function buildOpeningLine(completedWeek: number, isFinalWeek: boolean): string {
  if (isFinalWeek) {
    return 'Son tur tamamlandı. Masamdaki son brifingi paylaşıyorum — kampanyanın genel tablosu için Raporlar sekmesine de bakın.';
  }
  if (completedWeek === 1) {
    return 'İlk turunuz bitti. Kısa tutacağım; yeni tura geçmeden bilmeniz gerekenler şunlar.';
  }
  return `${completedWeek}. tur kapandı. Yeni tura geçmeden önce masamdaki notları okuyun.`;
}

function buildHeadline(completedWeek: number, isFinalWeek: boolean): string {
  if (isFinalWeek) return `Tur ${completedWeek} — Kampanya brifingi`;
  return `Tur ${completedWeek} özeti`;
}

function buildClosingLine(isFinalWeek: boolean): string {
  if (isFinalWeek) {
    return 'Brifing tamam. Seçim sonuçlarını görmek için devam edin.';
  }
  return 'Detaylı rapor Raporlar sekmesinde. Yeni tura hazırsanız devam edin.';
}

function buildSupportBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet {
  const direction =
    report.supportChange > 0
      ? 'yükseldi'
      : report.supportChange < 0
        ? 'geriledi'
        : 'değişmedi';
  const changeTone = deltaTone(report.supportChange);

  const segments: AdvisorBriefingTextSegment[] = [
    seg('Tahmini oy oranı '),
    seg(`${report.supportBefore.toFixed(1)}%`),
    seg(' → '),
    seg(`${report.supportAfter.toFixed(1)}%`, changeTone),
    seg(` ${direction} (`),
    deltaSeg(report.supportChange, ' puan'),
    seg(').'),
  ];

  return {
    kind: 'support',
    label: 'Oy trendi',
    text: joinSegments(segments),
    segments,
    severity: supportSeverity(report.supportChange),
  };
}

function buildAgendaBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet | null {
  if (!report.eventTitle) return null;

  const responseNote = report.selectedResponseLabel
    ? `"${report.selectedResponseLabel}" tepkisi verdiniz.`
    : 'Ana gündeme henüz tepki verilmedi.';

  const outcomeNote = report.eventOutcomeTitle
    ? ` Sonuç: ${report.eventOutcomeTitle}.`
    : '';

  const text = `${report.eventTitle} — ${responseNote}${outcomeNote}`;

  return {
    kind: 'agenda',
    label: 'Ana gündem',
    text,
    segments: [seg(text)],
    severity: 'neutral',
  };
}

function buildSegmentBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet | null {
  const topGain = Object.entries(report.segmentChanges)
    .filter(([, value]) => (value ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0] as [SegmentId, number] | undefined;

  const topLoss = Object.entries(report.segmentChanges)
    .filter(([, value]) => (value ?? 0) < 0)
    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0] as [SegmentId, number] | undefined;

  if (!topGain && !topLoss) return null;

  const segments: AdvisorBriefingTextSegment[] = [];

  if (topGain) {
    if (segments.length > 0) segments.push(seg('; '));
    segments.push(seg(`${segmentLabels[topGain[0]]} segmentinde `));
    segments.push(deltaSeg(topGain[1], ' puan'));
  }

  if (topLoss) {
    if (segments.length > 0) segments.push(seg('; '));
    segments.push(seg(`${segmentLabels[topLoss[0]]} segmentinde `));
    segments.push(deltaSeg(topLoss[1], ' puan'));
  }

  segments.push(seg('.'));

  return {
    kind: 'segments',
    label: 'Segment hareketi',
    text: joinSegments(segments),
    segments,
    severity: topLoss && !topGain ? 'warning' : topGain ? 'positive' : 'neutral',
  };
}

function buildResourcesBullet(
  report: WeeklyHistoryItem,
  nextState: GameState,
): AdvisorBriefingBullet | null {
  const segments: AdvisorBriefingTextSegment[] = [];
  let severity: AdvisorBriefingBullet['severity'] = 'neutral';

  const resourceKeys: ResourceKey[] = ['energy', 'money', 'reputation', 'volunteers'];
  for (const key of resourceKeys) {
    const delta = report.resourceChanges[key];
    if (delta && delta !== 0) {
      if (segments.length > 0) segments.push(seg('. '));
      segments.push(seg(`${resourceLabels[key]} `));
      segments.push(deltaSeg(delta));
    }
  }

  if (nextState.resources.energy < 25) {
    if (segments.length > 0) segments.push(seg('. '));
    segments.push(seg(`Enerji ${nextState.resources.energy} — önümüzdeki turda seçici olun`));
    severity = 'warning';
  }

  if (nextState.resources.money < 40) {
    if (segments.length > 0) segments.push(seg('. '));
    segments.push(seg(`Para ${nextState.resources.money} — finansman baskısı artıyor`));
    severity = 'warning';
  }

  if ((report.resourceChanges.reputation ?? 0) < 0) {
    severity = 'warning';
  }

  if (segments.length === 0) return null;

  segments.push(seg('.'));

  return {
    kind: 'resources',
    label: 'Kaynaklar',
    text: joinSegments(segments),
    segments,
    severity,
  };
}

function buildRivalsBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet | null {
  if (report.rivalMoves.length === 0) return null;

  const segments: AdvisorBriefingTextSegment[] = report.rivalMoves.slice(0, 2).flatMap((move, index) => {
    const prefix = index > 0 ? [seg(' ')] : [];
    return [...prefix, seg(`${move.rivalName}: ${move.headline}`)];
  });

  return {
    kind: 'rivals',
    label: 'Rakip hareketleri',
    text: joinSegments(segments),
    segments,
    severity: 'warning',
  };
}

function buildOutlookBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet | null {
  if (!report.upcomingStoryHint.trim()) return null;

  return {
    kind: 'outlook',
    label: 'Önümüzdeki tur',
    text: report.upcomingStoryHint,
    segments: [seg(report.upcomingStoryHint)],
    severity: 'neutral',
  };
}

function buildInsightBullet(report: WeeklyHistoryItem): AdvisorBriefingBullet | null {
  const insight = report.insight.trim();
  if (!insight) return null;

  const firstSentence = insight.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!firstSentence) return null;

  return {
    kind: 'insight',
    label: 'Değerlendirme',
    text: firstSentence,
    segments: [seg(firstSentence)],
    severity:
      insight.includes('baskı') || insight.includes('risk') || insight.includes('düşük')
        ? 'warning'
        : insight.includes('güçlü') || insight.includes('ivme')
          ? 'positive'
          : 'neutral',
  };
}

function parseEffectSegments(effectSummary: string): AdvisorBriefingTextSegment[] {
  const parts = effectSummary.split(/(\+\d+(?:[.,]\d+)?|-\d+(?:[.,]\d+)?)/g);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith('+')) return seg(part, 'positive');
      if (part.startsWith('-')) return seg(part, 'negative');
      return seg(part);
    });
}

function buildBacklashNote(report: WeeklyHistoryItem): AdvisorBriefingItem['backlashNote'] {
  const backlash = report.weekBacklash;
  if (!backlash) return undefined;

  const effectSummary = `Buna göre beklediğim etki: ${backlash.effectSummary}`;

  return {
    headline: backlash.headline,
    body: `Bu sabah masama düşen notu paylaşayım — sizin adınıza konuşuluyor: ${backlash.body}`,
    effectSummary,
    effectSegments: [
      seg('Buna göre beklediğim etki: '),
      ...parseEffectSegments(backlash.effectSummary),
    ],
  };
}

function isPoliticalBullet(bullet: AdvisorBriefingBullet): boolean {
  return (POLITICAL_BULLET_KINDS as readonly string[]).includes(bullet.kind);
}

export function buildAdvisorBriefing(
  report: WeeklyHistoryItem,
  nextState: GameState,
  options: BuildAdvisorBriefingOptions,
): AdvisorBriefingItem {
  const allCandidates = [
    buildSupportBullet(report),
    buildAgendaBullet(report),
    buildSegmentBullet(report),
    buildResourcesBullet(report, nextState),
    buildRivalsBullet(report),
    buildOutlookBullet(report),
    buildInsightBullet(report),
  ].filter((item): item is AdvisorBriefingBullet => item !== null);

  const politicalBullets = POLITICAL_BULLET_KINDS.map((kind) =>
    allCandidates.find((item) => item.kind === kind),
  ).filter((item): item is AdvisorBriefingBullet => item !== undefined);

  const overviewCandidates = allCandidates.filter((item) => !isPoliticalBullet(item));

  const severityRank: Record<NonNullable<AdvisorBriefingBullet['severity']>, number> = {
    critical: 0,
    warning: 1,
    positive: 2,
    neutral: 3,
  };

  const overviewBullets = overviewCandidates
    .sort(
      (a, b) =>
        severityRank[a.severity ?? 'neutral'] - severityRank[b.severity ?? 'neutral'],
    )
    .slice(0, MAX_OVERVIEW_BULLETS);

  const bullets = [...overviewBullets, ...politicalBullets];

  return {
    id: `advisor-briefing-w${report.week}`,
    completedWeek: report.week,
    displayWeek: nextState.campaignWeek,
    advisorName: CAMPAIGN_ADVISOR.name,
    advisorTitle: CAMPAIGN_ADVISOR.title,
    headline: buildHeadline(report.week, options.isFinalWeek),
    openingLine: buildOpeningLine(report.week, options.isFinalWeek),
    bullets,
    backlashNote: buildBacklashNote(report),
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

export function splitAdvisorBriefingBullets(bullets: AdvisorBriefingBullet[]): {
  overviewBullets: AdvisorBriefingBullet[];
  politicalBullets: AdvisorBriefingBullet[];
} {
  const politicalBullets = POLITICAL_BULLET_KINDS.map((kind) =>
    bullets.find((item) => item.kind === kind),
  ).filter((item): item is AdvisorBriefingBullet => item !== undefined);

  const overviewBullets = bullets.filter((item) => !isPoliticalBullet(item));

  return { overviewBullets, politicalBullets };
}
