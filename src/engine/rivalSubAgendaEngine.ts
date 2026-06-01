/** Rakip hamleleri — boş bırakılan alt gündem, bölgesel gündem ve radar konuları */

import { REGIONAL_RIVAL_SUPPORT_PENALTY } from '../data/regionalAgendaConfig';
import { getRegionById } from '../data/regions';
import { getRivalDefinition } from '../data/rivals';
import { politicalSegmentsForIdeology } from './ideologyPoliticalMapping';
import type {
  GameState,
  PoliticalSegmentEffect,
  RadarAgendaItem,
  RegionalAgendaItem,
  RivalWeeklyMove,
  SegmentId,
  SubAgendaItem,
  SubAgendaSelection,
} from '../types/game';

function pickLeadingRivals(state: GameState, count: number) {
  return [...state.rivalParties]
    .sort((a, b) => b.nationalSupport - a.nationalSupport)
    .slice(0, count);
}

function invertPoliticalEffects(
  effects: PoliticalSegmentEffect[] | undefined,
  scale = 0.75,
): PoliticalSegmentEffect[] {
  if (!effects?.length) return [];
  return effects
    .filter((effect) => effect.delta > 0)
    .map((effect) => ({
      segmentId: effect.segmentId,
      delta: -Math.max(1, Math.round(effect.delta * scale)),
    }));
}

function invertPositiveEffects(
  effects: Partial<Record<string, number>>,
  scale = 0.45,
): Partial<Record<string, number>> {
  const inverted: Partial<Record<string, number>> = {};
  for (const [key, value] of Object.entries(effects)) {
    if (!value || value <= 0) continue;
    inverted[key as keyof typeof inverted] = -Math.max(1, Math.round(value * scale));
  }
  return inverted;
}

export function simulateRivalSubAgendaMoves(
  state: GameState,
  selections: SubAgendaSelection[],
  subAgendas: SubAgendaItem[],
): RivalWeeklyMove[] {
  const moves: RivalWeeklyMove[] = [];
  const selectedIds = new Set(selections.map((item) => item.agendaId));
  const unaddressed = subAgendas.filter((item) => !selectedIds.has(item.id));

  const rivals = pickLeadingRivals(state, unaddressed.length);
  if (rivals.length === 0 || unaddressed.length === 0) return moves;

  unaddressed.slice(0, rivals.length).forEach((agenda, index) => {
    const rival = rivals[index];
    const def = getRivalDefinition(rival.id);
    if (!def) return;

    const bold =
      agenda.responseOptions.find((option) => option.tone === 'bold') ??
      agenda.responseOptions[0];
    if (!bold) return;

    const segmentEffects = invertPositiveEffects(bold.segmentEffects);
    const politicalSegmentEffects = invertPoliticalEffects(bold.politicalSegmentEffects);

    moves.push({
      rivalId: rival.id,
      rivalName: rival.shortName,
      headline: `${rival.shortName} (alt gündem): "${agenda.title}" konusunda senin yerine konuştu.`,
      impactSummary: `${rival.leaderName}, "${bold.label}" çizgisinde mesaj verdi; tabanda rakip söylem güçlendi.`,
      segmentEffects,
      politicalSegmentEffects,
    });
  });

  return moves;
}

export function simulateRivalRegionalAgendaMoves(
  state: GameState,
  selections: SubAgendaSelection[],
  regionalAgendas: RegionalAgendaItem[],
): RivalWeeklyMove[] {
  const moves: RivalWeeklyMove[] = [];
  const selectedIds = new Set(selections.map((item) => item.agendaId));
  const unaddressed = regionalAgendas.filter((item) => !selectedIds.has(item.id));

  const rivals = pickLeadingRivals(state, unaddressed.length);
  if (rivals.length === 0 || unaddressed.length === 0) return moves;

  unaddressed.slice(0, rivals.length).forEach((agenda, index) => {
    const rival = rivals[index];
    const def = getRivalDefinition(rival.id);
    if (!def) return;

    const bold =
      agenda.responseOptions.find((option) => option.tone === 'bold') ??
      agenda.responseOptions[0];
    if (!bold) return;

    const regionName = getRegionById(agenda.regionId).name;
    const segmentEffects = invertPositiveEffects(bold.segmentEffects);
    const politicalSegmentEffects = invertPoliticalEffects(bold.politicalSegmentEffects);

    moves.push({
      rivalId: rival.id,
      rivalName: rival.shortName,
      headline: `${rival.shortName} (${regionName}): "${agenda.title}" konusunda senin yerine konuştu.`,
      impactSummary: `${rival.leaderName}, ${regionName}'da "${bold.label}" çizgisinde mesaj verdi; bölgesel alanı rakip doldurdu.`,
      segmentEffects,
      politicalSegmentEffects,
      regionId: agenda.regionId,
      regionSupportDelta: -REGIONAL_RIVAL_SUPPORT_PENALTY,
    });
  });

  return moves;
}

export function simulateRivalRadarMoves(
  state: GameState,
  selections: SubAgendaSelection[],
  subAgendas: SubAgendaItem[],
  radarAgendas: RadarAgendaItem[],
): RivalWeeklyMove[] {
  const moves: RivalWeeklyMove[] = [];
  const leading = pickLeadingRivals(state, 1)[0];
  if (!leading) return moves;

  for (const radar of radarAgendas) {
    const addressed = selections.some((sel) => {
      const sub = subAgendas.find((item) => item.id === sel.agendaId);
      return sub?.policyTopic === radar.policyTopic;
    });
    if (addressed) continue;

    const penaltySegments: Partial<Record<SegmentId, number>> = {};
    for (const segmentId of radar.primarySegments) {
      penaltySegments[segmentId] = -2;
    }

    const politicalSegmentEffects = politicalSegmentsForIdeology(leading.ideologyId).map(
      (segmentId) => ({ segmentId, delta: -1 }),
    );

    moves.push({
      rivalId: leading.id,
      rivalName: leading.shortName,
      headline: `${leading.shortName} (radar): "${radar.title}" gündemini sen bırakınca sahiplendi.`,
      impactSummary: `Radar gündeminde sessiz kaldın; ${leading.shortName} mesaj alanını kapttı.`,
      segmentEffects: penaltySegments,
      politicalSegmentEffects,
    });
  }

  return moves;
}
