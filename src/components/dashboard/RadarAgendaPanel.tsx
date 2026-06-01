/** Radar gündem — izleme only, hafta sonu etkileri */

import { policyTopicLabels, weeklyEventTypeLabels } from '../../data/labels';
import { segmentLabels } from '../../data/segments';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './RadarAgendaPanel.css';

interface RadarAgendaPanelProps {
  state: GameState;
  embedded?: boolean;
}

export function RadarAgendaPanel({ state, embedded = false }: RadarAgendaPanelProps) {
  const { radarAgendas } = state;

  if (radarAgendas.length === 0) {
    return embedded ? (
      <p className="radar-agenda-empty">Bu hafta radar gündem yok.</p>
    ) : null;
  }

  const content = (
    <>
      <p className="radar-agenda-intro">
        {embedded
          ? 'Henüz ulusal gündem değil — alt gündemle dolaylı yanıt verebilir veya sessiz kalabilirsin.'
          : 'Bu konular henüz ulusal gündem değil; bu hafta doğrudan mesaj veremezsin. Aynı politika ekseninde alt gündem seçersen dolaylı yanıt sayılır. Sessiz kalırsan rakipler veya önümüzdeki hafta etkileri devreye girer.'}
      </p>
      <ul className="radar-agenda-list">
        {radarAgendas.map((radar) => (
          <li key={radar.id} className={`radar-agenda-item ${radar.type}`}>
            <div className="radar-item-header">
              <span className={`fm-badge ${radar.type}`}>
                {weeklyEventTypeLabels[radar.type]}
              </span>
              <span className="radar-salience">Güç: {radar.salience}</span>
            </div>
            <h4 className="radar-item-title">{radar.title}</h4>
            <p className="radar-item-desc">{radar.description}</p>
            <div className="radar-item-meta">
              <span>{policyTopicLabels[radar.policyTopic]}</span>
              <span>
                İzlenen kesim:{' '}
                {radar.primarySegments.map((id) => segmentLabels[id]).join(', ')}
              </span>
            </div>
            <p className="radar-effect-hint">{radar.effectHint}</p>
          </li>
        ))}
      </ul>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Panel title="Radar Gündem" className="radar-agenda-panel">
      {content}
    </Panel>
  );
}
