/** Haftalık gündem UI — mevcut oyun verisinden türetilen görünüm tipleri */

export type AgendaStance = 'decisive' | 'measured' | 'passive';

export type AgendaEffectType = 'positive' | 'negative' | 'neutral';

export type AgendaPressure = 'low' | 'medium' | 'high';

export type AgendaStatus = 'response_required' | 'optional';

export interface AgendaEffectLine {
  label: string;
  value?: number;
  type: AgendaEffectType;
}

export interface AgendaResponseDisplay {
  id: string;
  stance: AgendaStance;
  stanceLabel: string;
  title: string;
  description: string;
  effects: AgendaEffectLine[];
  risk: string;
  cost?: {
    money?: number;
    energy?: number;
  };
}
