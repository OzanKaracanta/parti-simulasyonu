/** Ana sayfa gündem haber kartları — GameState'ten görünüm modeli */

import { getRegionalAgendaMaxSlots } from '../../../data/regionalAgendaConfig';
import { getRegionById } from '../../../data/regions';
import { policyTopicLabels, weeklyEventTypeLabels } from '../../../data/labels';
import { getSegmentLabel } from '../../../data/segments';
import {
  canRespondToRegionalAgenda,
  getRegionalAgendaAccessReason,
} from '../../../engine/regionalAgendaAccess';
import { resolveEventSegmentsForWeek } from '../../../engine/resolveEventSegments';
import type { GameState, RegionalAgendaItem, SegmentId, WeeklyEvent } from '../../../types/game';
import {
  getAgendaStatus,
  getEventPressure,
  getPressureLabel,
} from '../agenda/agendaDisplayUtils';
import type {
  AgendaNewsMiniBadge,
  AgendaNewsSignalTone,
  NationalAgendaNewsCardModel,
  RegionalAgendaNewsCardModel,
  WeeklyAgendaNewsSectionModel,
} from './weeklyAgendaNewsTypes';

const MAX_OVERVIEW_REGIONAL = 2;
const MAX_SEGMENTS = 2;
const MAX_MINI_BADGES = 3;

function truncateSummary(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function segmentLabelsFromIds(ids: SegmentId[], max = MAX_SEGMENTS): string[] {
  const unique: SegmentId[] = [];
  for (const id of ids) {
    if (!unique.includes(id)) unique.push(id);
    if (unique.length >= max) break;
  }
  return unique.map(getSegmentLabel);
}

function buildMiniBadges(
  input: {
    eventType?: WeeklyEvent['type'];
    policyTopic?: WeeklyEvent['policyTopic'];
    tensionSegmentLabels?: string[];
    primarySegmentLabels?: string[];
    attacksRival?: boolean;
    slotsFull?: boolean;
  },
): AgendaNewsMiniBadge[] {
  const badges: AgendaNewsMiniBadge[] = [];

  if (input.eventType === 'crisis') {
    badges.push({ id: 'crisis', label: 'Kriz Baskısı', tone: 'risk' });
  } else if (input.eventType === 'opportunity') {
    badges.push({ id: 'opportunity', label: 'Fırsat Penceresi', tone: 'positive' });
  }

  if (input.policyTopic === 'mediaPolitics') {
    badges.push({ id: 'media', label: 'Medya Etkisi Yüksek', tone: 'info' });
  }

  for (const label of input.tensionSegmentLabels ?? []) {
    if (badges.length >= MAX_MINI_BADGES) break;
    badges.push({
      id: `tension-${label}`,
      label: `${label} Riski`,
      tone: 'risk',
    });
  }

  for (const label of input.primarySegmentLabels ?? []) {
    if (badges.length >= MAX_MINI_BADGES) break;
    if (badges.some((badge) => badge.label.startsWith(label))) continue;
    badges.push({
      id: `primary-${label}`,
      label: `${label} +`,
      tone: 'positive',
    });
  }

  if (input.attacksRival && badges.length < MAX_MINI_BADGES) {
    badges.push({ id: 'rival', label: 'Rakip Gerilimi', tone: 'info' });
  }

  if (input.slotsFull && badges.length < MAX_MINI_BADGES) {
    badges.push({ id: 'slots', label: 'Operasyonla Desteklenmeli', tone: 'default' });
  }

  return badges.slice(0, MAX_MINI_BADGES);
}

function nationalSignal(
  event: WeeklyEvent,
): { label: string; tone: AgendaNewsSignalTone } {
  const pressure = getEventPressure(event.type);
  if (event.type === 'crisis') {
    return { label: `Risk: ${getPressureLabel(pressure)}`, tone: 'crisis' };
  }
  if (event.type === 'opportunity') {
    return { label: 'Fırsat sinyali', tone: 'opportunity' };
  }
  const status = getAgendaStatus(event.type);
  if (status === 'response_required') {
    return { label: 'Zorunlu yanıt', tone: 'warning' };
  }
  return { label: `Baskı: ${getPressureLabel(pressure)}`, tone: 'neutral' };
}

function buildNationalCard(
  state: GameState,
  event: WeeklyEvent,
): NationalAgendaNewsCardModel {
  const resolved = resolveEventSegmentsForWeek(event, state.rivalParties);
  const answered = Boolean(state.selectedEventResponseId);
  const signal = nationalSignal(event);

  const segmentIds = [
    ...resolved.primarySegments,
    ...resolved.tensionSegments,
    ...event.affectedSegments,
  ];

  return {
    kind: 'national',
    agendaId: event.id,
    headlineBadge: event.type === 'crisis' ? 'SON DAKİKA' : 'ULUSAL GÜNDEM',
    title: event.title,
    summary: truncateSummary(event.description, 95),
    segmentLabels: segmentLabelsFromIds(segmentIds),
    signalLabel: signal.label,
    signalTone: signal.tone,
    responseStatus: answered ? 'answered' : 'pending',
    responseStatusLabel: answered ? 'YANITLANDI' : 'YANIT BEKLİYOR',
    ctaLabel: answered ? 'Gündeme Git' : 'Yanıt Ver',
    miniBadges: buildMiniBadges({
      eventType: event.type,
      policyTopic: event.policyTopic,
      tensionSegmentLabels: segmentLabelsFromIds(resolved.tensionSegments, 1),
      primarySegmentLabels: segmentLabelsFromIds(resolved.primarySegments, 1),
      attacksRival: event.attacksRival,
    }),
    imageAlt: event.title,
  };
}

function buildRegionalCard(
  state: GameState,
  agenda: RegionalAgendaItem,
  slotsFull: boolean,
): RegionalAgendaNewsCardModel {
  const regionName = getRegionById(agenda.regionId).name;
  const answered = state.selectedRegionalAgendaSelections.some(
    (item) => item.agendaId === agenda.id,
  );
  const canRespond = canRespondToRegionalAgenda(state, agenda.regionId);
  const accessReason = getRegionalAgendaAccessReason(state, agenda.regionId);

  const segmentIds = [...agenda.primarySegments, ...agenda.tensionSegments];

  let responseStatus: RegionalAgendaNewsCardModel['responseStatus'] = 'pending';
  if (answered) responseStatus = 'answered';
  else if (!canRespond) responseStatus = 'locked';

  return {
    kind: 'regional',
    agendaId: agenda.id,
    regionId: agenda.regionId,
    regionName,
    title: agenda.title,
    summary: truncateSummary(agenda.description, 110),
    segmentLabels: segmentLabelsFromIds(segmentIds),
    responseStatus,
    ctaLabel: answered ? 'Gündeme Git' : 'İncele',
    accessWarning: accessReason
      ? 'Yanıt için bölgede gönüllü ağı gerekli.'
      : null,
    miniBadges: mergeMiniBadges(
      buildMiniBadges({
        eventType: agenda.type,
        policyTopic: agenda.policyTopic,
        tensionSegmentLabels: segmentLabelsFromIds(agenda.tensionSegments, 1),
        primarySegmentLabels: segmentLabelsFromIds(agenda.primarySegments, 1),
        slotsFull: slotsFull && canRespond && !answered,
      }),
      badgesFromTypeLabel(agenda),
    ),
    imageAlt: `${regionName} — ${agenda.title}`,
  };
}

function mergeMiniBadges(
  primary: AgendaNewsMiniBadge[],
  extra: AgendaNewsMiniBadge[],
): AgendaNewsMiniBadge[] {
  const merged = [...primary];
  for (const badge of extra) {
    if (merged.length >= MAX_MINI_BADGES) break;
    if (merged.some((item) => item.id === badge.id)) continue;
    merged.push(badge);
  }
  return merged.slice(0, MAX_MINI_BADGES);
}

function badgesFromTypeLabel(agenda: RegionalAgendaItem): AgendaNewsMiniBadge[] {
  const typeLabel = weeklyEventTypeLabels[agenda.type];
  if (agenda.type === 'agenda') {
    return [{ id: 'topic', label: policyTopicLabels[agenda.policyTopic], tone: 'info' }];
  }
  return [{ id: 'type', label: typeLabel, tone: agenda.type === 'crisis' ? 'risk' : 'positive' }];
}

export function buildWeeklyAgendaNewsSectionModel(
  state: GameState,
): WeeklyAgendaNewsSectionModel {
  const { currentWeeklyEvent, regionalAgendas } = state;
  const maxSlots = getRegionalAgendaMaxSlots(state.campaignWeek);
  const slotsFull = state.selectedRegionalAgendaSelections.length >= maxSlots;

  const national = currentWeeklyEvent
    ? buildNationalCard(state, currentWeeklyEvent)
    : null;

  const regional = regionalAgendas
    .slice(0, MAX_OVERVIEW_REGIONAL)
    .map((agenda) => buildRegionalCard(state, agenda, slotsFull));

  return {
    national,
    regional,
    totalRegionalCount: regionalAgendas.length,
    showViewAllRegional: regionalAgendas.length > MAX_OVERVIEW_REGIONAL,
  };
}
