import { useMemo, type CSSProperties } from 'react';
import { colorOptions } from '../../data/setupOptions';
import { resourceLabels, WEEKLY_BUDGET_RESOURCE_KEYS } from '../../data/labels';
import { canFinishWeek } from '../../engine/eventEvaluation';
import { computeWeeklyEnergyPreview } from '../../engine/weeklyEnergyBudget';
import type { GameState, ResourceKey } from '../../types/game';
import './dashboard.css';

interface TopBarProps {
  state: GameState;
  onEndWeek: () => void;
  /** Öğretici veya ek kurallar — verilmezse yalnızca gündem zorunluluğu */
  finishCheck?: { ok: boolean; reason?: string };
}

const resourceIcons: Record<ResourceKey, string> = {
  money: '₺',
  energy: '⚡',
  volunteers: '👥',
  reputation: '★',
  organizationCapacity: '⬡',
};

export function TopBar({ state, onEndWeek, finishCheck: finishCheckProp }: TopBarProps) {
  const partyColor = colorOptions.find((c) => c.id === state.party.colorId)?.hex ?? '#3498db';
  const weeksLeft = state.maxWeeks - state.campaignWeek;
  const progressPct = ((state.campaignWeek - 1) / (state.maxWeeks - 1)) * 100;
  const finishCheck = finishCheckProp ?? canFinishWeek(state);
  const energyPreview = useMemo(() => computeWeeklyEnergyPreview(state), [state]);

  const energySpentThisWeek =
    energyPreview.alreadySpentOnActions + energyPreview.alreadySpentOnAgendas;
  const energyChipHint =
    energySpentThisWeek > 0
      ? `Bu hafta −${energySpentThisWeek} harcandı · ~${energyPreview.projectedEndEnergy} hafta sonu (+${energyPreview.regenAmount} yenilenme)`
      : `~${energyPreview.projectedEndEnergy} hafta sonu (+${energyPreview.regenAmount} yenilenme)`;

  const endWeekTitle = finishCheck.ok
    ? [finishCheck.reason, energyPreview.endWeekSummary].filter(Boolean).join(' · ')
    : finishCheck.reason;

  return (
    <header
      className="dashboard-topbar"
      style={{ '--party-color': partyColor } as CSSProperties}
    >
      <div className="topbar-party">
        <div className="party-emblem" style={{ backgroundColor: partyColor }}>
          {state.party.name.charAt(0)}
        </div>
        <div className="party-info">
          <h1 title={state.party.name}>{state.party.name}</h1>
          <p title={`${state.party.leaderName} · ${state.party.profile}`}>
            {state.party.leaderName} · {state.party.profile}
          </p>
          <p
            className="party-reputation"
            title="Uzun vadeli parti güvenilirliği — haftalık bütçeden ayrı"
          >
            <span className="party-reputation-icon" aria-hidden>
              ★
            </span>
            İtibar {state.resources.reputation}
          </p>
        </div>
      </div>

      <div className="topbar-campaign">
        <div className="campaign-week">
          <span className="week-label">Tur</span>
          <span className="week-value">
            {state.campaignWeek}
            <span className="week-max">/{state.maxWeeks}</span>
          </span>
        </div>
        <div className="election-countdown">
          <div className="countdown-header">
            <span>Seçime {weeksLeft} hafta</span>
          </div>
          <div className="countdown-bar">
            <div className="countdown-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="topbar-support hero-stat">
        <span className="support-label">Destek</span>
        <span className="support-value">{state.nationalSupport.toFixed(1)}%</span>
      </div>

      <div className="topbar-actions">
        <div className="topbar-resources" aria-label="Haftalık bütçe">
          <span className="topbar-resources-kicker">Haftalık bütçe</span>
          <div className="topbar-resources-chips">
            {WEEKLY_BUDGET_RESOURCE_KEYS.map((key) => {
              const value = state.resources[key];
              const isEnergy = key === 'energy';
              const chipTitle = isEnergy ? energyChipHint : resourceLabels[key];

              return (
                <div
                  className={`resource-chip ${isEnergy ? 'resource-chip--energy' : ''}`}
                  key={key}
                  title={chipTitle}
                >
                  <span className="resource-icon">{resourceIcons[key]}</span>
                  <div className="resource-detail">
                    <span className="resource-name">{resourceLabels[key]}</span>
                    <span className="resource-value">{value}</span>
                    {isEnergy && energySpentThisWeek > 0 ? (
                      <span className="resource-pending">−{energySpentThisWeek} bu hafta</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className="ps-btn ps-btn--success end-week-btn"
          onClick={onEndWeek}
          disabled={!finishCheck.ok}
          title={endWeekTitle}
          data-tutorial-nav="end-week"
        >
          <span className="end-week-btn-label">Haftayı Bitir »</span>
          {finishCheck.ok ? (
            <span className="end-week-btn-energy">{energyPreview.endWeekSummary}</span>
          ) : null}
        </button>
      </div>
    </header>
  );
}
