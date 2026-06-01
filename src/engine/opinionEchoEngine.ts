/** Gecikmeli medya yankısı ve hikâye zinciri planlama */

import { findMatchingStoryChains } from '../data/eventChains';
import type {
  EventResponseLevel,
  GameState,
  OpinionEchoItem,
  OpinionTone,
  PendingOpinionEcho,
  ResponseTone,
  ScheduledStoryEvent,
  WeeklyEvent,
} from '../types/game';
import { applySegmentEffects } from './segmentEngine';

let echoCounter = 0;

function nextEchoId(): string {
  echoCounter += 1;
  return `echo-${echoCounter}`;
}

function toneFromResponseLevel(level: EventResponseLevel): OpinionTone {
  switch (level) {
    case 'success':
      return 'positive';
    case 'partial':
      return 'mixed';
    case 'ignored':
      return 'critical';
  }
}

function delayedTone(base: OpinionTone, weekOffset: number): OpinionTone {
  if (weekOffset === 0) return base;
  if (base === 'positive' && weekOffset >= 2) return 'mixed';
  if (base === 'critical' && weekOffset >= 1) return 'mixed';
  return base;
}

export function createOpinionEchoesFromResponse(
  state: GameState,
  event: WeeklyEvent,
  responseLabel: string,
  responseLevel: EventResponseLevel,
  tone: ResponseTone,
): PendingOpinionEcho[] {
  const echoes: PendingOpinionEcho[] = [];
  const week = state.campaignWeek;
  const baseTone = toneFromResponseLevel(responseLevel);

  echoes.push({
    id: nextEchoId(),
    triggerWeek: week + 1,
    headline: 'İlk Yansımalar',
    body: `"${event.title}" gündemindeki "${responseLabel}" hamlesi medyada yankı bulmaya başladı.`,
    tone: delayedTone(baseTone, 0),
    segmentEffects: responseLevel === 'success' ? { youth: 1, workers: 1 } : {},
  });

  if (responseLevel === 'ignored' || tone === 'passive') {
    echoes.push({
      id: nextEchoId(),
      triggerWeek: week + 2,
      headline: 'Eleştirel Manşetler',
      body: `Sessiz kaldığın "${event.title}" gündemi haftalar sonra hâlâ konuşuluyor; rakipler alan kullanıyor.`,
      tone: 'critical',
      segmentEffects: { civilServants: -1, retirees: -1 },
    });
  } else if (responseLevel === 'success' && tone === 'bold') {
    echoes.push({
      id: nextEchoId(),
      triggerWeek: week + 2,
      headline: 'Kutuplaşan Yorumlar',
      body: `"${responseLabel}" kararlı duruşun destekçilerde coşku yarattı; muhalif kesimler sert tepki gösterdi.`,
      tone: 'mixed',
      segmentEffects: { youth: 1, retirees: -1 },
    });
  } else if (responseLevel === 'partial') {
    echoes.push({
      id: nextEchoId(),
      triggerWeek: week + 2,
      headline: 'Kararsız Tablo',
      body: `"${event.title}" gündemine verdiğin ölçülü yanıt geniş kitlelerde kararsızlık bıraktı.`,
      tone: 'neutral',
      segmentEffects: {},
    });
  }

  return echoes;
}

export function scheduleStoryFollowUps(
  state: GameState,
  eventId: string,
  responseId: string,
): ScheduledStoryEvent[] {
  const chains = findMatchingStoryChains(eventId, responseId);

  return chains
    .filter((chain) => !state.storyFlags[chain.storyFlag])
    .map((chain) => ({
      eventId: chain.followUpEventId,
      triggerWeek: state.campaignWeek + chain.delayWeeks,
      reason: chain.reason,
    }));
}

export function updateStoryFlags(
  flags: Record<string, boolean>,
  eventId: string,
  responseId: string,
): Record<string, boolean> {
  const chains = findMatchingStoryChains(eventId, responseId);
  const next = { ...flags };

  for (const chain of chains) {
    next[chain.storyFlag] = true;
  }

  return next;
}

export function processDueOpinionEchoes(
  state: GameState,
  targetWeek: number,
): {
  state: GameState;
  newEchoes: OpinionEchoItem[];
} {
  const due = state.pendingOpinionEchoes.filter((echo) => echo.triggerWeek <= targetWeek);
  const remaining = state.pendingOpinionEchoes.filter((echo) => echo.triggerWeek > targetWeek);

  if (due.length === 0) {
    return { state, newEchoes: [] };
  }

  let segmentSupport = { ...state.segmentSupport };
  const newEchoes: OpinionEchoItem[] = [];

  for (const pending of due) {
    segmentSupport = applySegmentEffects(segmentSupport, pending.segmentEffects);
    newEchoes.push({
      id: pending.id,
      week: targetWeek,
      headline: pending.headline,
      body: pending.body,
      tone: pending.tone,
      segmentEffects: pending.segmentEffects,
    });
  }

  const opinionFeed = [...state.opinionFeed, ...newEchoes].slice(-24);

  return {
    state: {
      ...state,
      segmentSupport,
      pendingOpinionEchoes: remaining,
      opinionFeed,
    },
    newEchoes,
  };
}

export function appendPendingEchoes(
  state: GameState,
  echoes: PendingOpinionEcho[],
): GameState {
  return {
    ...state,
    pendingOpinionEchoes: [...state.pendingOpinionEchoes, ...echoes],
  };
}

export function appendScheduledEvents(
  state: GameState,
  events: ScheduledStoryEvent[],
): GameState {
  if (events.length === 0) return state;

  return {
    ...state,
    scheduledStoryEvents: [...state.scheduledStoryEvents, ...events],
  };
}

export function getUpcomingStoryHint(state: GameState): string {
  const next = state.scheduledStoryEvents
    .filter((item) => item.triggerWeek > state.campaignWeek)
    .sort((a, b) => a.triggerWeek - b.triggerWeek)[0];

  return next ? next.reason : '';
}
