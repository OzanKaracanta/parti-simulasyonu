import { useMemo } from 'react';
import { MAX_WEEKLY_AGENDA_ENERGY_SPEND } from '../../data/campaignConfig';
import { sumCommittedAgendaEnergy } from '../../engine/agendaEnergyEngine';
import { computeWeeklyEnergyPreview } from '../../engine/weeklyEnergyBudget';
import type { EnergyFlowLineItem } from '../../engine/weeklyEnergyBudget';
import { formatDelta } from '../../engine/weeklyReport';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeeklyEnergyBudgetPanel.css';

interface WeeklyEnergyBudgetPanelProps {
  state: GameState;
}

function netTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function FlowLines({ lines, kind }: { lines: EnergyFlowLineItem[]; kind: 'income' | 'expense' }) {
  if (lines.length === 0) return null;

  return (
    <ul className={`energy-lines energy-lines--${kind}`}>
      {lines.map((line) => (
        <li key={line.label}>
          <span className="energy-line-label">{line.label}</span>
          <span className="energy-line-amount">
            {kind === 'income' ? '+' : '−'}
            {line.amount} ⚡
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WeeklyEnergyBudgetPanel({ state }: WeeklyEnergyBudgetPanelProps) {
  const preview = useMemo(() => computeWeeklyEnergyPreview(state), [state]);

  const detailCount = preview.incomeLines.length + preview.expenseLines.length;
  const weekNet = preview.totalIncome - preview.totalExpenses;
  const weekNetTone = netTone(weekNet);
  const closingTone = netTone(preview.netChangeFromWeekStart);

  return (
    <Panel
      title="Haftalık Enerji Bütçesi"
      variant="command"
      compact
      className="weekly-energy-panel"
      headerExtra={
        <span
          className={`fm-badge ${closingTone === 'negative' ? 'crisis' : closingTone === 'positive' ? 'opportunity' : 'category'}`}
        >
          {formatDelta(preview.netChangeFromWeekStart)} ⚡
        </span>
      }
    >
      <div className="energy-hero">
        <div className="energy-hero-primary">
          <span className="energy-hero-label">Şu an</span>
          <span className="energy-hero-value">{preview.currentEnergy} ⚡</span>
        </div>
        <div className="energy-hero-arrow" aria-hidden>
          →
        </div>
        <div className="energy-hero-secondary">
          <span className="energy-hero-label">Hafta sonu tahmini</span>
          <span className={`energy-hero-value energy-hero-value--${closingTone}`}>
            ~{preview.projectedEndEnergy} ⚡
          </span>
        </div>
      </div>

      {preview.totalExpenses > 0 ? (
        <p className="energy-footnote">
          Hafta başı {preview.weekStartEnergy} ⚡
          {preview.alreadySpentOnActions > 0 ? (
            <>
              {' '}
              · operasyonlar <strong>−{preview.alreadySpentOnActions} ⚡</strong>
            </>
          ) : null}
          {preview.alreadySpentOnAgendas > 0 ? (
            <>
              {' '}
              · gündemler <strong>−{preview.alreadySpentOnAgendas} ⚡</strong>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="energy-summary" role="list">
        <div className="energy-summary-row" role="listitem">
          <span className="energy-summary-label">Yenilenme</span>
          <span className="energy-summary-value positive">+{preview.regenAmount} ⚡</span>
        </div>
        <div className="energy-summary-row" role="listitem">
          <span className="energy-summary-label">Haftalık gider</span>
          <span className="energy-summary-value negative">
            {preview.totalExpenses > 0 ? `−${preview.totalExpenses} ⚡` : '—'}
          </span>
        </div>
        <div
          className={`energy-summary-row energy-summary-row--net is-${weekNetTone}`}
          role="listitem"
        >
          <span className="energy-summary-label">Haftalık net</span>
          <span className={`energy-summary-value ${weekNetTone}`}>
            {weekNet === 0 ? '0 ⚡' : `${weekNet > 0 ? '+' : '−'}${Math.abs(weekNet)} ⚡`}
          </span>
        </div>
      </div>

      {detailCount > 0 ? (
        <details className="energy-details">
          <summary>
            Kalemler
            <span className="energy-details-count">{detailCount}</span>
          </summary>
          <div className="energy-details-body">
            <div className="energy-details-group">
              <span className="energy-details-heading">Gelir</span>
              <FlowLines lines={preview.incomeLines} kind="income" />
            </div>
            {preview.expenseLines.length > 0 ? (
              <div className="energy-details-group">
                <span className="energy-details-heading">Gider</span>
                <FlowLines lines={preview.expenseLines} kind="expense" />
              </div>
            ) : null}
          </div>
        </details>
      ) : (
        <p className="energy-empty">Bu hafta enerji hareketi tahmini yok.</p>
      )}

      <p className="energy-cap-hint">
        Gündem tepkileri (ana + alt + bölgesel) haftalık en fazla{' '}
        {MAX_WEEKLY_AGENDA_ENERGY_SPEND} ⚡ — şu an {sumCommittedAgendaEnergy(state)} ⚡
      </p>

      {preview.warning ? <p className="energy-warning">{preview.warning}</p> : null}
    </Panel>
  );
}
