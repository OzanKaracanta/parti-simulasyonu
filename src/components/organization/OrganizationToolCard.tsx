import { campaignActions } from '../../data/actions';
import { organizationToolStatusLabels, segmentLabels } from '../../data/labels';
import { getOrganizationSegmentReach } from '../../data/organizationSegmentMap';
import { getNextLevelDefinition } from '../../systems/organizationSystem';
import {
  buildOrganizationCostParts,
  buildOrganizationGainParts,
  formatLevelRequirements,
  formatOrganizationCategory,
} from '../../utils/organizationFormat';
import type { OrganizationToolView } from '../../types/organization';
import { OrganizationValueChips } from './OrganizationValueChips';
import './organization.css';

function getActionNames(actionIds: string[]): string[] {
  return actionIds.map(
    (id) => campaignActions.find((action) => action.id === id)?.name ?? id,
  );
}

interface OrganizationToolCardProps {
  view: OrganizationToolView;
  balanceHint?: string | null;
  onBuild: () => void;
  onUpgrade: () => void;
  onRevert: () => void;
}

export function OrganizationToolCard({
  view,
  balanceHint,
  onBuild,
  onUpgrade,
  onRevert,
}: OrganizationToolCardProps) {
  const { definition, level, levelTitle, status, canRevert } = view;
  const nextLevelDef = getNextLevelDefinition(definition, level);
  const requirementLines = nextLevelDef ? formatLevelRequirements(nextLevelDef.requirements) : [];
  const actionCost = level === 0 ? view.buildCost : view.upgradeCost;
  const canAct = status === 'available';
  const showUpgrade = level > 0 && level < definition.maxLevel;
  const actionNames = getActionNames(view.unlockActionIds);

  const weeklyYieldParts =
    level > 0
      ? buildOrganizationGainParts(view.weeklyEffects)
      : nextLevelDef
        ? buildOrganizationGainParts(nextLevelDef.weeklyEffects)
        : [];

  const weeklyMaintenanceParts =
    level > 0
      ? buildOrganizationCostParts(view.weeklyMaintenance)
      : nextLevelDef
        ? buildOrganizationCostParts(nextLevelDef.weeklyMaintenance ?? {})
        : [];

  const instantEffectParts =
    nextLevelDef?.instantEffects &&
    (nextLevelDef.instantEffects.resources || nextLevelDef.instantEffects.metrics)
      ? buildOrganizationGainParts(nextLevelDef.instantEffects)
      : [];

  const hasDetails =
    definition.description.length > 0 ||
    requirementLines.length > 0 ||
    instantEffectParts.length > 0 ||
    view.risks.length > 0 ||
    actionNames.length > 0;

  const segmentReach = getOrganizationSegmentReach(definition.id);
  const segmentReachLine =
    level > 0 && segmentReach
      ? `${segmentReach.segments.map((id) => segmentLabels[id]).join(', ')} +${segmentReach.amountPerLevel * level}/hafta`
      : null;

  return (
    <article className={`org-tool-card status-${status}`}>
      <header className="org-tool-card-header">
        <div>
          <h3>{definition.name}</h3>
          <span className="org-tool-category">
            {formatOrganizationCategory(definition.category)}
            {definition.secondaryCategory
              ? ` · ${formatOrganizationCategory(definition.secondaryCategory)}`
              : ''}
          </span>
        </div>
        <span className={`org-status-badge ${status}`}>
          {organizationToolStatusLabels[status]}
        </span>
      </header>

      <div className="org-tool-level">
        <span>
          Seviye {level}/{definition.maxLevel}
        </span>
        {levelTitle ? <span className="org-level-title">{levelTitle}</span> : null}
      </div>

      {balanceHint ? <p className="org-balance-hint">{balanceHint}</p> : null}

      {segmentReachLine ? (
        <p className="org-segment-reach">Segment erişimi: {segmentReachLine}</p>
      ) : null}

      {(weeklyYieldParts.length > 0 || weeklyMaintenanceParts.length > 0) && (
        <div className="org-tool-weekly">
          {weeklyYieldParts.length > 0 ? (
            <div className="org-tool-weekly-group">
              <span className="org-weekly-label">
                {level > 0 ? 'Üretim' : 'Kurulum sonrası'}
              </span>
              <OrganizationValueChips parts={weeklyYieldParts} maxVisible={4} />
            </div>
          ) : null}
          {weeklyMaintenanceParts.length > 0 ? (
            <div className="org-tool-weekly-group">
              <span className="org-weekly-label">Bakım</span>
              <OrganizationValueChips parts={weeklyMaintenanceParts} maxVisible={3} />
            </div>
          ) : null}
        </div>
      )}

      {status === 'locked' && requirementLines.length > 0 ? (
        <p className="org-lock-hint">{requirementLines[0]}</p>
      ) : null}

      {status === 'available' && instantEffectParts.length > 0 ? (
        <div className="org-tool-instant-preview">
          <span className="org-weekly-label">{level === 0 ? 'Anlık' : 'Yükseltme'}</span>
          <OrganizationValueChips parts={instantEffectParts} maxVisible={3} />
        </div>
      ) : null}

      {hasDetails ? (
        <details className="org-tool-details">
          <summary>Detaylar</summary>
          <div className="org-tool-details-body">
            {definition.description ? (
              <p className="org-tool-description">{definition.description}</p>
            ) : null}

            {requirementLines.length > 0 ? (
              <div className="org-detail-block">
                <span className="org-stat-label">Gereksinimler</span>
                <div className="org-chip-row org-requirement-chips">
                  {requirementLines.map((line) => (
                    <span key={line} className="org-chip tone-muted">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {instantEffectParts.length > 0 && status !== 'available' ? (
              <div className="org-detail-block">
                <span className="org-stat-label">
                  {level === 0 ? 'Anlık etki' : 'Yükseltme etkisi'}
                </span>
                <OrganizationValueChips parts={instantEffectParts} />
              </div>
            ) : null}

            {view.risks.length > 0 ? (
              <ul className="org-risks">
                {view.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            ) : null}

            {actionNames.length > 0 ? (
              <div className="org-detail-block">
                <span className="org-stat-label">Açtığı aksiyonlar</span>
                <div className="org-chip-row">
                  {actionNames.slice(0, 2).map((name) => (
                    <span key={name} className="org-chip tone-action">
                      {name}
                    </span>
                  ))}
                  {actionNames.length > 2 ? (
                    <span className="org-chip tone-muted">+{actionNames.length - 2}</span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      <footer className="org-tool-card-footer">
        <div className="org-tool-footer-main">
          {canRevert ? (
            <button type="button" className="org-action-btn revert" onClick={onRevert}>
              Geri Al
            </button>
          ) : null}

          {status === 'maxed' ? (
            <span className="org-max-label">Maksimum seviye</span>
          ) : level === 0 ? (
            <button type="button" className="org-action-btn" disabled={!canAct} onClick={onBuild}>
              Kur
            </button>
          ) : showUpgrade ? (
            <button type="button" className="org-action-btn" disabled={!canAct} onClick={onUpgrade}>
              Yükselt
            </button>
          ) : null}

          {actionCost && Object.keys(actionCost).length > 0 && status !== 'maxed' ? (
            <OrganizationValueChips parts={buildOrganizationCostParts(actionCost)} />
          ) : null}
        </div>

        {canRevert ? (
          <span className="org-hint">
            Bu hafta yapılan işlem geri alınabilir. Kilitlenen aksiyonlar plandan çıkarılır.
          </span>
        ) : null}

        {status === 'insufficient_resources' ? (
          <span className="org-hint">Kaynak yetersiz</span>
        ) : null}
      </footer>
    </article>
  );
}
