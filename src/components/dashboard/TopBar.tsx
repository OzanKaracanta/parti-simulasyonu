import type { CSSProperties } from 'react';
import { colorOptions } from '../../data/setupOptions';
import { resourceLabels } from '../../data/labels';
import { canFinishWeek } from '../../engine/eventEvaluation';
import type { GameState, ResourceKey } from '../../types/game';
import './dashboard.css';

interface TopBarProps {
  state: GameState;
  onEndWeek: () => void;
}

const resourceIcons: Record<ResourceKey, string> = {
  money: '₺',
  energy: '⚡',
  volunteers: '👥',
  reputation: '★',
  organizationCapacity: '⬡',
};

export function TopBar({ state, onEndWeek }: TopBarProps) {
  const partyColor = colorOptions.find((c) => c.id === state.party.colorId)?.hex ?? '#3498db';
  const weeksLeft = state.maxWeeks - state.campaignWeek;
  const progressPct = ((state.campaignWeek - 1) / (state.maxWeeks - 1)) * 100;
  const finishCheck = canFinishWeek(state);

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
        <div className="topbar-resources">
          {(Object.entries(state.resources) as [ResourceKey, number][]).map(([key, value]) => (
            <div className="resource-chip" key={key} title={resourceLabels[key]}>
              <span className="resource-icon">{resourceIcons[key]}</span>
              <div className="resource-detail">
                <span className="resource-name">{resourceLabels[key]}</span>
                <span className="resource-value">{value}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="ps-btn ps-btn--success end-week-btn"
          onClick={onEndWeek}
          disabled={!finishCheck.ok}
          title={finishCheck.reason}
        >
          Haftayı Bitir »
        </button>
      </div>
    </header>
  );
}
