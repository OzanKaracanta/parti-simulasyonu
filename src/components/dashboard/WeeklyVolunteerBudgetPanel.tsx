import { useMemo } from 'react';
import { computeWeeklyVolunteerPreview } from '../../engine/weeklyVolunteerBudget';
import type { VolunteerFlowLineItem } from '../../engine/weeklyVolunteerBudget';
import { formatDelta } from '../../engine/weeklyReport';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeeklyVolunteerBudgetPanel.css';

interface WeeklyVolunteerBudgetPanelProps {
  state: GameState;
  embedded?: boolean;
}

function netTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function FlowLines({
  lines,
  kind,
}: {
  lines: VolunteerFlowLineItem[];
  kind: 'income' | 'expense';
}) {
  if (lines.length === 0) return null;

  return (
    <ul className={`volunteer-lines volunteer-lines--${kind}`}>
      {lines.map((line) => (
        <li key={line.label}>
          <span className="volunteer-line-label">{line.label}</span>
          <span className="volunteer-line-amount">
            {kind === 'income' ? '+' : '−'}
            {line.amount} 👥
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WeeklyVolunteerBudgetPanel({
  state,
  embedded = false,
}: WeeklyVolunteerBudgetPanelProps) {
  const preview = useMemo(() => computeWeeklyVolunteerPreview(state), [state]);

  const detailCount = preview.incomeLines.length + preview.expenseLines.length;
  const weekNet = preview.totalIncome - preview.totalExpenses;
  const weekNetTone = netTone(weekNet);
  const closingTone = netTone(preview.netChangeFromWeekStart);

  const body = (
    <>
      <div className="volunteer-hero">
        <div className="volunteer-hero-primary">
          <span className="volunteer-hero-label">Şu an</span>
          <span className="volunteer-hero-value">{preview.currentVolunteers} 👥</span>
        </div>
        <div className="volunteer-hero-arrow" aria-hidden>
          →
        </div>
        <div className="volunteer-hero-secondary">
          <span className="volunteer-hero-label">Hafta sonu tahmini</span>
          <span className={`volunteer-hero-value volunteer-hero-value--${closingTone}`}>
            ~{preview.projectedEndVolunteers} 👥
          </span>
        </div>
      </div>

      {preview.alreadySpentOnActions > 0 ? (
        <p className="volunteer-footnote">
          Hafta başı {preview.weekStartVolunteers} 👥 · operasyonlar{' '}
          <strong>−{preview.alreadySpentOnActions} 👥</strong>
        </p>
      ) : null}

      <div className="volunteer-summary" role="list">
        <div className="volunteer-summary-row" role="listitem">
          <span className="volunteer-summary-label">Toparlanma</span>
          <span className="volunteer-summary-value positive">+{preview.regenAmount} 👥</span>
        </div>
        <div className="volunteer-summary-row" role="listitem">
          <span className="volunteer-summary-label">Haftalık gider</span>
          <span className="volunteer-summary-value negative">
            {preview.totalExpenses > 0 ? `−${preview.totalExpenses} 👥` : '—'}
          </span>
        </div>
        <div
          className={`volunteer-summary-row volunteer-summary-row--net is-${weekNetTone}`}
          role="listitem"
        >
          <span className="volunteer-summary-label">Haftalık net</span>
          <span className={`volunteer-summary-value ${weekNetTone}`}>
            {weekNet === 0 ? '0 👥' : `${weekNet > 0 ? '+' : '−'}${Math.abs(weekNet)} 👥`}
          </span>
        </div>
      </div>

      {detailCount > 0 ? (
        <details className="volunteer-details">
          <summary>
            Kalemler
            <span className="volunteer-details-count">{detailCount}</span>
          </summary>
          <div className="volunteer-details-body">
            <div className="volunteer-details-group">
              <span className="volunteer-details-heading">Gelir</span>
              <FlowLines lines={preview.incomeLines} kind="income" />
            </div>
            {preview.expenseLines.length > 0 ? (
              <div className="volunteer-details-group">
                <span className="volunteer-details-heading">Gider</span>
                <FlowLines lines={preview.expenseLines} kind="expense" />
              </div>
            ) : null}
          </div>
        </details>
      ) : (
        <p className="volunteer-empty">Bu hafta gönüllü hareketi tahmini yok.</p>
      )}

      {preview.warning ? <p className="volunteer-warning">{preview.warning}</p> : null}
    </>
  );

  const headerBadge = (
    <span
      className={`fm-badge ${closingTone === 'negative' ? 'crisis' : closingTone === 'positive' ? 'opportunity' : 'category'}`}
    >
      {formatDelta(preview.netChangeFromWeekStart)} 👥
    </span>
  );

  if (embedded) {
    return (
      <div className="weekly-volunteer-panel weekly-volunteer-panel--embedded">
        <div className="topbar-resource-dropdown-header">
          <h2 className="topbar-resource-dropdown-title">Haftalık Gönüllü Bütçesi</h2>
          {headerBadge}
        </div>
        <div className="weekly-volunteer-panel-body">{body}</div>
      </div>
    );
  }

  return (
    <Panel
      title="Haftalık Gönüllü Bütçesi"
      variant="command"
      compact
      className="weekly-volunteer-panel"
      headerExtra={headerBadge}
    >
      {body}
    </Panel>
  );
}
