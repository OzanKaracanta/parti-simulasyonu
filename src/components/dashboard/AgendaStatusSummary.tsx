/** Komuta merkezi — gündem durumu özeti ve yönlendirme */

import { getAgendaStatusSnapshot, getRegionalAgendaSlotSummary } from '../../engine/agendaStatus';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './AgendaStatusSummary.css';

interface AgendaStatusSummaryProps {
  state: GameState;
  onOpenAgendaNational: () => void;
  onOpenAgendaRegional: () => void;
  onOpenAgendaSub: () => void;
}

function statusValueClass(pending: boolean): string {
  return pending ? 'agenda-status-value is-pending' : 'agenda-status-value is-done';
}

export function AgendaStatusSummary({
  state,
  onOpenAgendaNational,
  onOpenAgendaRegional,
  onOpenAgendaSub,
}: AgendaStatusSummaryProps) {
  const status = getAgendaStatusSnapshot(state);
  const regionalSlots = getRegionalAgendaSlotSummary(state);

  const rows: {
    key: string;
    label: string;
    value: string;
    pending?: boolean;
    onOpen: () => void;
  }[] = [
    {
      key: 'main',
      label: 'Ulusal gündem',
      value: status.mainPending
        ? 'Yanıt seçilmedi'
        : (status.mainResponseLabel ?? 'Tamamlandı'),
      pending: status.mainPending,
      onOpen: onOpenAgendaNational,
    },
  ];

  if (status.subCount > 0) {
    rows.push({
      key: 'sub',
      label: 'Alt gündemler',
      value: `${status.subSlotsUsed}/${status.subMaxSlots} slot`,
      onOpen: onOpenAgendaSub,
    });
  }

  if (status.radarCount > 0) {
    rows.push({
      key: 'radar',
      label: 'Radar (ulusal)',
      value: `${status.radarCount} izleniyor`,
      onOpen: onOpenAgendaNational,
    });
  }

  if (status.regionalCount > 0) {
    rows.push({
      key: 'regional',
      label: 'Bölgesel gündem',
      value: `${status.regionalAnswered}/${status.regionalCount} yanıt · slot ${regionalSlots}`,
      pending: status.regionalPending > 0,
      onOpen: onOpenAgendaRegional,
    });
  }

  const primaryOpen =
    status.regionalPending > 0
      ? onOpenAgendaRegional
      : status.mainPending
        ? onOpenAgendaNational
        : status.subCount > 0 && status.subSlotsUsed < status.subMaxSlots
          ? onOpenAgendaSub
          : onOpenAgendaNational;

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
          <button
            key={row.key}
            type="button"
            className={`agenda-status-metric agenda-status-metric-btn${row.pending ? ' is-pending' : ''}`}
            onClick={row.onOpen}
            role="listitem"
          >
            <span className="agenda-status-label">{row.label}</span>
            <span className={statusValueClass(Boolean(row.pending))}>{row.value}</span>
          </button>
        ))}
      </div>

      <button type="button" className="agenda-status-cta" onClick={primaryOpen}>
        Gündemlere git
        {status.pendingCount > 0 ? ` (${status.pendingCount})` : ''}
      </button>
    </Panel>
  );
}
