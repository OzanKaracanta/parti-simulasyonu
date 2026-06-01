import { segmentLabels } from '../../data/labels';
import { getActionTargetSegments } from '../../data/actionSegments';
import {
  getActionCostBreakdownHint,
  getActionCostLines,
  getActionEffectLines,
  getActionGainLines,
} from '../../utils/actionFormat';
import type { CampaignAction } from '../../types/game';
import { ActionCostChips } from '../ui/ActionCostChips';
import { Tooltip } from '../ui/Tooltip';
import { synergyBadgeClass } from './actionUi';
import './actions.css';

interface OperationCardProps {
  action: CampaignAction;
  displayLabels: string[];
  selected: boolean;
  disabled: boolean;
  disabledReason: string | null;
  onSelect: () => void;
  onUnselect: () => void;
  /** Öğretici tur 4 — maliyet sütununda ek açıklama */
  showCostBreakdown?: boolean;
}

function StatColumn({ title, lines, variant }: { title: string; lines: string[]; variant?: 'gain' }) {
  return (
    <div className={`operation-stat-col ${variant ?? ''}`}>
      <span className="operation-stat-title">{title}</span>
      {lines.length === 0 ? (
        <span className="operation-stat-empty">—</span>
      ) : (
        <ul className="operation-stat-list">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OperationCard({
  action,
  displayLabels,
  selected,
  disabled,
  disabledReason,
  onSelect,
  onUnselect,
  showCostBreakdown = false,
}: OperationCardProps) {
  const targetSegments = getActionTargetSegments(action.id);
  const costLines = getActionCostLines(action);
  const effectLines = getActionEffectLines(action);
  const gainLines = getActionGainLines(action);

  return (
    <article
      className={`operation-card-grid ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
    >
      <div className="operation-card-main">
        <div className="operation-card-title-row">
          <span className="operation-card-title">{action.name}</span>
          {selected ? <span className="operation-status selected">Aktif</span> : null}
          {!selected && disabled ? (
            <span className="operation-status disabled">Kilitli</span>
          ) : null}
        </div>
        <span className="operation-card-desc">{action.description}</span>
        {targetSegments.length > 0 ? (
          <span className="action-segment-hint">
            Hedef: {targetSegments.map((id) => segmentLabels[id]).join(', ')}
          </span>
        ) : null}
        {displayLabels.length > 0 ? (
          <div className="operation-card-tags">
            {displayLabels.map((label) => (
              <span className={`fm-badge ${synergyBadgeClass(label)}`} key={label}>
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="operation-card-stats">
        {showCostBreakdown ? (
          <Tooltip content={getActionCostBreakdownHint(action)}>
            <StatColumn title="Maliyet ⓘ" lines={costLines} />
          </Tooltip>
        ) : (
          <StatColumn title="Maliyet" lines={costLines} />
        )}
        <StatColumn title="Etki" lines={effectLines} />
        <StatColumn title="Kazanç" lines={gainLines} variant="gain" />
      </div>

      <div className="operation-card-footer">
        <ActionCostChips action={action} />
        <Tooltip content={disabled ? disabledReason : null}>
          <button
            type="button"
            className={`operation-deploy-btn ${selected ? 'deployed remove' : ''}`}
            disabled={disabled}
            onClick={() => (selected ? onUnselect() : onSelect())}
            aria-label={
              disabled && disabledReason
                ? `${action.name} kilitli: ${disabledReason}`
                : selected
                  ? `${action.name} kaldır`
                  : `${action.name} ekle`
            }
          >
            {selected ? 'Kaldır' : 'Ekle'}
          </button>
        </Tooltip>
      </div>
    </article>
  );
}
