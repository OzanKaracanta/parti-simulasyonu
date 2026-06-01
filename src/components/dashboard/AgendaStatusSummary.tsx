/** Komuta merkezi — gündem durumu özeti ve yönlendirme */

import { getAgendaStatusSnapshot, getRegionalAgendaSlotSummary } from '../../engine/agendaStatus';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './AgendaStatusSummary.css';

interface AgendaStatusSummaryProps {
  state: GameState;
  onOpenAgendas: () => void;
}

function statusValueClass(pending: boolean): string {
  return pending ? 'agenda-status-value is-pending' : 'agenda-status-value is-done';
}

export function AgendaStatusSummary({ state, onOpenAgendas }: AgendaStatusSummaryProps) {
  const status = getAgendaStatusSnapshot(state);
  const regionalSlots = getRegionalAgendaSlotSummary(state);

  const rows: {
    key: string;
    label: string;
    value: string;
    pending?: boolean;
  }[] = [
    {
      key: 'main',
      label: 'Ana gündem',
      value: status.mainPending
        ? 'Yanıt seçilmedi'
        : (status.mainResponseLabel ?? 'Tamamlandı'),
      pending: status.mainPending,
    },
  ];

  if (status.subCount > 0) {
    rows.push({
      key: 'sub',
      label: 'Alt gündemler',
      value: `${status.subSlotsUsed}/${status.subMaxSlots} slot`,
    });
  }

  if (status.radarCount > 0) {
    rows.push({
      key: 'radar',
      label: 'Radar',
      value: `${status.radarCount} izleniyor`,
    });
  }

  if (status.regionalCount > 0) {
    rows.push({
      key: 'regional',
      label: 'Bölgesel',
      value: `${status.regionalAnswered}/${status.regionalCount} yanıt · slot ${regionalSlots}`,
      pending: status.regionalPending > 0,
    });
  }

  return (
    <Panel
      title="Gündem Durumu"
      variant="command"
      compact
      className="agenda-status-summary"
      headerExtra={
        status.pendingCount > 0 ? (
          <span className="fm-badge crisis">{status.pendingCount} bekliyor</span>
        ) : (
          <span className="fm-badge opportunity">Tamam</span>
        )
      }
    >
      <div className="agenda-status-metrics" role="list">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`agenda-status-metric${row.pending ? ' is-pending' : ''}`}
            role="listitem"
          >
            <span className="agenda-status-label">{row.label}</span>
            <span className={statusValueClass(Boolean(row.pending))}>{row.value}</span>
          </div>
        ))}
      </div>

      <button type="button" className="agenda-status-cta" onClick={onOpenAgendas}>
        Gündemlere git
        {status.pendingCount > 0 ? ` (${status.pendingCount})` : ''}
      </button>
    </Panel>
  );
}
