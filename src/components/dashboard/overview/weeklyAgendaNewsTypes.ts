/** Ana sayfa haftalık gündem haber kartları — görünüm modelleri */

export type AgendaNewsSignalTone = 'crisis' | 'opportunity' | 'neutral' | 'warning';

export interface AgendaNewsMiniBadge {
  id: string;
  label: string;
  tone?: 'default' | 'risk' | 'positive' | 'info';
}

export interface NationalAgendaNewsCardModel {
  kind: 'national';
  agendaId: string;
  headlineBadge: 'ULUSAL GÜNDEM' | 'SON DAKİKA';
  title: string;
  summary: string;
  segmentLabels: string[];
  signalLabel: string;
  signalTone: AgendaNewsSignalTone;
  responseStatus: 'pending' | 'answered';
  responseStatusLabel: 'YANIT BEKLİYOR' | 'YANITLANDI';
  ctaLabel: 'Yanıt Ver' | 'Gündeme Git';
  miniBadges: AgendaNewsMiniBadge[];
  imageUrl?: string;
  imageAlt?: string;
}

export interface RegionalAgendaNewsCardModel {
  kind: 'regional';
  agendaId: string;
  regionId: string;
  regionName: string;
  title: string;
  summary: string;
  segmentLabels: string[];
  responseStatus: 'pending' | 'answered' | 'locked';
  ctaLabel: 'İncele' | 'Bölgesel Gündeme Git';
  accessWarning: string | null;
  miniBadges: AgendaNewsMiniBadge[];
  imageUrl?: string;
  imageAlt?: string;
}

export interface WeeklyAgendaNewsSectionModel {
  national: NationalAgendaNewsCardModel | null;
  regional: RegionalAgendaNewsCardModel[];
  totalRegionalCount: number;
  showViewAllRegional: boolean;
}
