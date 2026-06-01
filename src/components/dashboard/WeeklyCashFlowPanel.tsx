import { useMemo } from 'react';
import { computeWeeklyCashFlowPreview } from '../../engine/weeklyCashFlow';
import type { CashFlowLineItem } from '../../engine/weeklyCashFlow';
import { formatDelta } from '../../engine/weeklyReport';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeeklyCashFlowPanel.css';

interface WeeklyCashFlowPanelProps {
  state: GameState;
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('tr-TR')} ₺`;
}

function formatSignedMoney(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return '0 ₺';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toLocaleString('tr-TR')} ₺`;
}

function netTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function FlowLines({ lines, kind }: { lines: CashFlowLineItem[]; kind: 'income' | 'expense' }) {
  if (lines.length === 0) return null;

  return (
    <ul className={`budget-lines budget-lines--${kind}`}>
      {lines.map((line) => (
        <li key={line.label}>
          <span className="budget-line-label">{line.label}</span>
          <span className="budget-line-amount">
            {kind === 'income' ? '+' : '−'}
            {Math.round(line.amount).toLocaleString('tr-TR')} ₺
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WeeklyCashFlowPanel({ state }: WeeklyCashFlowPanelProps) {
  const preview = useMemo(() => computeWeeklyCashFlowPreview(state), [state]);

  const detailCount = preview.incomeLines.length + preview.expenseLines.length;
  const weekNet = preview.totalIncome - preview.totalExpenses;
  const weekNetTone = netTone(weekNet);
  const closingTone = netTone(preview.netChangeFromWeekStart);

  return (
    <Panel
      title="Ulusal Haftalık Bütçe"
      variant="command"
      compact
      className="weekly-budget-panel"
      headerExtra={
        <span className={`fm-badge ${closingTone === 'negative' ? 'crisis' : closingTone === 'positive' ? 'opportunity' : 'category'}`}>
          {formatDelta(preview.netChangeFromWeekStart)} ₺
        </span>
      }
    >
      <div className="budget-hero">
        <div className="budget-hero-primary">
          <span className="budget-hero-label">Kasa</span>
          <span className="budget-hero-value">{formatMoney(preview.currentMoney)}</span>
        </div>
        <div className="budget-hero-arrow" aria-hidden>
          →
        </div>
        <div className="budget-hero-secondary">
          <span className="budget-hero-label">Hafta sonu tahmini</span>
          <span className={`budget-hero-value budget-hero-value--${closingTone}`}>
            {formatMoney(preview.projectedEndMoney)}
          </span>
        </div>
      </div>

      {preview.alreadySpentOnActions > 0 ? (
        <p className="budget-footnote">
          Hafta başı {formatMoney(preview.weekStartMoney)} · plana{' '}
          <strong>−{preview.alreadySpentOnActions.toLocaleString('tr-TR')} ₺</strong> ayrıldı
        </p>
      ) : null}

      <div className="budget-summary" role="list">
        <div className="budget-summary-row" role="listitem">
          <span className="budget-summary-label">Gelir</span>
          <span className="budget-summary-value positive">
            {preview.totalIncome > 0 ? formatSignedMoney(preview.totalIncome) : '—'}
          </span>
        </div>
        <div className="budget-summary-row" role="listitem">
          <span className="budget-summary-label">Gider</span>
          <span className="budget-summary-value negative">
            {preview.totalExpenses > 0 ? formatSignedMoney(-preview.totalExpenses) : '—'}
          </span>
        </div>
        <div className={`budget-summary-row budget-summary-row--net is-${weekNetTone}`} role="listitem">
          <span className="budget-summary-label">Haftalık net</span>
          <span className={`budget-summary-value ${weekNetTone}`}>
            {weekNet === 0 ? '0 ₺' : formatSignedMoney(weekNet)}
          </span>
        </div>
      </div>

      {detailCount > 0 ? (
        <details className="budget-details">
          <summary>
            Kalemler
            <span className="budget-details-count">{detailCount}</span>
          </summary>
          <div className="budget-details-body">
            {preview.incomeLines.length > 0 ? (
              <div className="budget-details-group">
                <span className="budget-details-heading">Gelir</span>
                <FlowLines lines={preview.incomeLines} kind="income" />
              </div>
            ) : null}
            {preview.expenseLines.length > 0 ? (
              <div className="budget-details-group">
                <span className="budget-details-heading">Gider</span>
                <FlowLines lines={preview.expenseLines} kind="expense" />
              </div>
            ) : null}
          </div>
        </details>
      ) : (
        <p className="budget-empty">Bu hafta para hareketi tahmini yok.</p>
      )}

      {preview.warning ? <p className="budget-warning">{preview.warning}</p> : null}
    </Panel>
  );
}
