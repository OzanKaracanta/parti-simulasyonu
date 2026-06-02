import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { colorOptions } from '../../data/setupOptions';
import { resourceLabels, WEEKLY_BUDGET_RESOURCE_KEYS } from '../../data/labels';
import { canFinishWeek } from '../../engine/eventEvaluation';
import type { GameState, ResourceKey } from '../../types/game';
import { WeeklyCashFlowPanel } from './WeeklyCashFlowPanel';
import { WeeklyEnergyBudgetPanel } from './WeeklyEnergyBudgetPanel';
import { WeeklyVolunteerBudgetPanel } from './WeeklyVolunteerBudgetPanel';
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

type BudgetResourceKey = (typeof WEEKLY_BUDGET_RESOURCE_KEYS)[number];

function ResourceDropdownPanel({
  resourceKey,
  state,
}: {
  resourceKey: BudgetResourceKey;
  state: GameState;
}) {
  if (resourceKey === 'money') {
    return <WeeklyCashFlowPanel state={state} embedded />;
  }
  if (resourceKey === 'energy') {
    return <WeeklyEnergyBudgetPanel state={state} embedded />;
  }
  return <WeeklyVolunteerBudgetPanel state={state} embedded />;
}

export function TopBar({ state, onEndWeek, finishCheck: finishCheckProp }: TopBarProps) {
  const partyColor = colorOptions.find((c) => c.id === state.party.colorId)?.hex ?? '#3498db';
  const weeksLeft = state.maxWeeks - state.campaignWeek;
  const progressPct = ((state.campaignWeek - 1) / (state.maxWeeks - 1)) * 100;
  const finishCheck = finishCheckProp ?? canFinishWeek(state);
  const endWeekTitle = finishCheck.reason;

  const [openResource, setOpenResource] = useState<BudgetResourceKey | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const toggleResource = (key: BudgetResourceKey) => {
    setOpenResource((current) => (current === key ? null : key));
  };

  useEffect(() => {
    if (!openResource) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!stackRef.current?.contains(event.target as Node)) {
        setOpenResource(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenResource(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openResource]);

  return (
    <div className="topbar-stack" ref={stackRef}>
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
          <div className="topbar-resources" aria-label="Kaynaklar">
            <div className="topbar-resources-chips" role="group" aria-label="Haftalık bütçe">
              {WEEKLY_BUDGET_RESOURCE_KEYS.map((key) => {
                const value = state.resources[key];
                const isOpen = openResource === key;
                const panelId = `${dropdownId}-${key}`;

                return (
                  <button
                    type="button"
                    key={key}
                    className={`resource-chip resource-chip--toggle ${isOpen ? 'is-open' : ''}`}
                    onClick={() => toggleResource(key)}
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? panelId : undefined}
                    title={`${resourceLabels[key]} — haftalık bütçe detayı`}
                  >
                    <span className="resource-icon">{resourceIcons[key]}</span>
                    <div className="resource-detail">
                      <span className="resource-name">{resourceLabels[key]}</span>
                      <span className="resource-value">{value}</span>
                    </div>
                  </button>
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
          >
            Haftayı Bitir »
          </button>
        </div>
      </header>

      {openResource ? (
        <div
          id={`${dropdownId}-${openResource}`}
          className="topbar-resource-dropdown"
          role="region"
          aria-label={`${resourceLabels[openResource]} haftalık bütçe`}
        >
          <ResourceDropdownPanel resourceKey={openResource} state={state} />
        </div>
      ) : null}
    </div>
  );
}
