/** Rakip parti haftalık hamleleri */

import { getIdeologyPreferredStance } from '../data/politicalIdentity';
import { getRivalDefinition, rivalDefinitions } from '../data/rivals';
import { politicalSegmentsForIdeology } from './ideologyPoliticalMapping';
import { applySegmentEffects } from './segmentEngine';
import { applyPoliticalSegmentEffects } from './politicalSegmentEngine';
import type {
  EventResponseLevel,
  GameState,
  PoliticalSegmentEffect,
  RivalPartyState,
  RivalWeeklyMove,
  WeeklyEvent,
} from '../types/game';

function pickRivalResponseIndex(
  event: WeeklyEvent,
  ideologyId: RivalPartyState['ideologyId'],
): number {
  const preferred = getIdeologyPreferredStance(ideologyId, event.policyTopic);

  let bestIndex = 0;
  let bestDiff = Infinity;

  event.responseOptions.forEach((option, index) => {
    const diff = Math.abs(option.stanceValue - preferred);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function responseLevelScore(level: EventResponseLevel): number {
  switch (level) {
    case 'success':
      return 3;
    case 'partial':
      return 2;
    case 'ignored':
      return 0;
  }
}

function buildRivalPoliticalPenalty(
  ideologyId: RivalPartyState['ideologyId'],
  narrativeWin: boolean,
): PoliticalSegmentEffect[] {
  if (!narrativeWin) return [];
  return politicalSegmentsForIdeology(ideologyId).map((segmentId) => ({
    segmentId,
    delta: -1,
  }));
}
function buildRivalHeadline(
  rivalName: string,
  leaderName: string,
  eventTitle: string,
  responseLabel: string,
): string {
  return `${rivalName}: ${leaderName}, "${eventTitle}" gündeminde ${responseLabel.toLowerCase()} seçti.`;
}

export function simulateRivalMoves(
  state: GameState,
  event: WeeklyEvent,
  playerResponseLevel: EventResponseLevel,
): { moves: RivalWeeklyMove[]; rivalParties: RivalPartyState[] } {
  const moves: RivalWeeklyMove[] = [];
  const playerScore =
    responseLevelScore(playerResponseLevel) + state.metrics.mediaPower * 0.02;

  const updatedRivals = state.rivalParties.map((rival) => {
    const def = getRivalDefinition(rival.id);
    if (!def) return rival;

    const responseIndex = pickRivalResponseIndex(event, rival.ideologyId);
    const response = event.responseOptions[responseIndex];
    if (!response) return rival;

    const rivalScore = responseLevelScore(response.responseLevel) + rival.nationalSupport * 0.05;
    const narrativeWin = rivalScore > playerScore + 0.5;

    let segmentEffects = { ...response.segmentEffects };

    if (narrativeWin) {
      for (const [key, value] of Object.entries(segmentEffects)) {
        if ((value ?? 0) > 0) {
          segmentEffects[key as keyof typeof segmentEffects] = Math.max(1, Math.round((value ?? 0) * 0.5));
        }
      }
      for (const [key, value] of Object.entries(response.segmentEffects)) {
        if ((value ?? 0) > 0) {
          segmentEffects[key as keyof typeof segmentEffects] =
            -Math.max(1, Math.round((value ?? 0) * 0.4));
        }
      }
    } else {
      segmentEffects = {};
    }

    if (narrativeWin || response.responseLevel === 'success') {
      moves.push({
        rivalId: rival.id,
        rivalName: rival.shortName,
        headline: buildRivalHeadline(rival.name, rival.leaderName, event.title, response.label),
        impactSummary: narrativeWin
          ? `${rival.shortName} gündemde senin önüne geçti.`
          : `${rival.shortName} hamle yaptı ama etkisi sınırlı kaldı.`,
        segmentEffects,
        politicalSegmentEffects: buildRivalPoliticalPenalty(rival.ideologyId, narrativeWin),
      });
    }

    const supportDelta = narrativeWin ? 0.8 : response.responseLevel === 'success' ? 0.3 : -0.2;
    return {
      ...rival,
      nationalSupport: Math.max(5, Math.min(45, Math.round((rival.nationalSupport + supportDelta) * 10) / 10)),
    };
  });

  return { moves, rivalParties: updatedRivals };
}

export function applyRivalMovesToState(
  state: GameState,
  moves: RivalWeeklyMove[],
): GameState {
  let segmentSupport = { ...state.segmentSupport };
  let politicalSegmentSupport = { ...state.politicalSegmentSupport };
  let regions = state.regions;

  for (const move of moves) {
    segmentSupport = applySegmentEffects(segmentSupport, move.segmentEffects);

    if (move.politicalSegmentEffects?.length) {
      politicalSegmentSupport = applyPoliticalSegmentEffects(
        politicalSegmentSupport,
        move.politicalSegmentEffects,
      );
    }

    if (move.regionId && move.regionSupportDelta) {
      regions = regions.map((region) => {
        if (region.id !== move.regionId) return region;
        return {
          ...region,
          support: Math.max(0, Math.min(50, region.support + move.regionSupportDelta!)),
        };
      });
    }
  }

  return { ...state, segmentSupport, politicalSegmentSupport, regions };
}

export function getTotalRivalSupport(rivals: RivalPartyState[]): number {
  return rivals.reduce((sum, rival) => sum + rival.nationalSupport, 0);
}

export function getRivalCount(): number {
  return rivalDefinitions.length;
}
