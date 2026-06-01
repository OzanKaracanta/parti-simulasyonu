/** Radar gündem — hafta sonu slot, zincir ve rapor satırları */

import { RADAR_OPPORTUNITY_BONUS_SLOTS } from '../data/subAgendaConfig';
import { appendScheduledEvents } from './opinionEchoEngine';
import type {
  GameState,
  RadarAgendaItem,
  ScheduledStoryEvent,
  SubAgendaItem,
  SubAgendaSelection,
} from '../types/game';

export interface RadarWeekResult {
  state: GameState;
  effectLines: string[];
  bonusSlotsNextWeek: number;
}

function wasPolicyTopicAddressed(
  selections: SubAgendaSelection[],
  subAgendas: SubAgendaItem[],
  topic: RadarAgendaItem['policyTopic'],
): boolean {
  return selections.some((sel) => {
    const sub = subAgendas.find((item) => item.id === sel.agendaId);
    return sub?.policyTopic === topic;
  });
}

function scheduleRadarEscalation(
  radar: RadarAgendaItem,
  triggerWeek: number,
): ScheduledStoryEvent {
  return {
    eventId: radar.sourceEventId,
    triggerWeek,
    reason: `"${radar.title}" radar gündemi ulusal çizgiye yükseldi.`,
  };
}

export function resolveRadarAgendaWeek(
  state: GameState,
  selections: SubAgendaSelection[],
): RadarWeekResult {
  const effectLines: string[] = [];
  let bonusSlotsNextWeek = 0;
  let nextState = state;
  const nextWeek = state.campaignWeek + 1;

  for (const radar of state.radarAgendas) {
    const addressed = wasPolicyTopicAddressed(
      selections,
      state.subAgendas,
      radar.policyTopic,
    );

    if (radar.type === 'opportunity' && !addressed) {
      bonusSlotsNextWeek += RADAR_OPPORTUNITY_BONUS_SLOTS;
      effectLines.push(
        `"${radar.title}" fırsatını takip ettin; önümüzdeki hafta +${RADAR_OPPORTUNITY_BONUS_SLOTS} mesaj slotu.`,
      );
      continue;
    }

    if (addressed) {
      effectLines.push(
        `"${radar.title}" ekseninde alt gündemle dolaylı yanıt verdin; yükseliş baskısı yumuşadı.`,
      );
      continue;
    }

    if (radar.type === 'crisis' || radar.type === 'agenda') {
      nextState = appendScheduledEvents(nextState, [
        scheduleRadarEscalation(radar, nextWeek),
      ]);
      effectLines.push(
        `"${radar.title}" radarında sessiz kaldın; konu önümüzdeki hafta ulusal gündeme taşınabilir.`,
      );
    } else {
      effectLines.push(`"${radar.title}" radarı bu hafta düşük etkiyle geçti.`);
    }
  }

  return {
    state: nextState,
    effectLines,
    bonusSlotsNextWeek,
  };
}
