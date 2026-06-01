/** Sağ panel — haftalık risk, medya ve rakip özeti */

import { weeklyEventTypeLabels } from '../../data/labels';
import type { GameState } from '../../types/game';
import { canFinishWeek } from '../../engine/eventEvaluation';
import { Panel } from '../ui/Panel';
import './StrategicBriefPanel.css';

interface StrategicBriefPanelProps {
  state: GameState;
}

function eventPressureCopy(state: GameState): { label: string; detail: string; tone: 'crisis' | 'agenda' | 'opportunity' | 'neutral' } {
  const event = state.currentWeeklyEvent;
  if (!event) {
    return { label: 'Gündem yükleniyor', detail: 'Haftalık baskı analizi bekleniyor.', tone: 'neutral' };
  }

  switch (event.type) {
    case 'crisis':
      return {
        label: 'Kriz baskısı',
        detail: 'Maliyetler yükseldi; tepki ve operasyonlar bu hafta kritik.',
        tone: 'crisis',
      };
    case 'opportunity':
      return {
        label: 'Fırsat penceresi',
        detail: 'Doğru aksiyonlarla destek kazanımı mümkün — zamanlama önemli.',
        tone: 'opportunity',
      };
    default:
      return {
        label: 'Gündem önceliği',
        detail: 'Kamuoyu bu konuya odaklı; mesaj tutarlılığı şart.',
        tone: 'agenda',
      };
  }
}

export function StrategicBriefPanel({ state }: StrategicBriefPanelProps) {
  const event = state.currentWeeklyEvent;
  const pressure = eventPressureCopy(state);
  const finishCheck = canFinishWeek(state);
  const latestOpinion = state.opinionFeed[state.opinionFeed.length - 1];
  const topRival = [...state.rivalParties].sort((a, b) => b.nationalSupport - a.nationalSupport)[0];
  const playerGap = topRival ? topRival.nationalSupport - state.nationalSupport : 0;

  return (
    <Panel title="Stratejik Özet" compact className="strategic-brief-panel variant-command">
      <div className={`brief-pressure brief-${pressure.tone}`}>
        <span className="brief-pressure-label">{pressure.label}</span>
        <p>{pressure.detail}</p>
        {event ? (
          <span className={`fm-badge ${event.type}`}>{weeklyEventTypeLabels[event.type]}</span>
        ) : null}
      </div>

      <div className="brief-module">
        <span className="brief-module-title">Hafta sonu</span>
        <p className={finishCheck.ok ? 'brief-ready' : 'brief-pending'}>
          {finishCheck.ok ? 'Gündem tamam — haftayı kapatabilirsin.' : finishCheck.reason}
        </p>
      </div>

      {latestOpinion ? (
        <div className="brief-module">
          <span className="brief-module-title">Medya yankısı</span>
          <p className={`brief-media tone-${latestOpinion.tone}`}>{latestOpinion.headline}</p>
        </div>
      ) : (
        <div className="brief-module">
          <span className="brief-module-title">Medya yankısı</span>
          <p className="brief-muted">Tepkilerin 1–2 hafta içinde yansır.</p>
        </div>
      )}

      {topRival ? (
        <div className="brief-module">
          <span className="brief-module-title">Rakip pozisyon</span>
          <p>
            <strong style={{ color: topRival.colorHex }}>{topRival.shortName}</strong> lider —{' '}
            {playerGap > 0 ? (
              <span className="brief-gap negative">{playerGap.toFixed(1)} puan geridesin</span>
            ) : (
              <span className="brief-gap positive">Öndesin veya başa baş</span>
            )}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
