import { useEffect, type Dispatch } from 'react';
import { getNationalBalanceSummary } from '../../data/nationalBalance';
import { getOrganizationToolViews } from '../../systems/organizationSystem';
import {
  getNationalOrganizationToolViews,
  getNationalToolBalanceHint,
} from '../../systems/nationalOrganizationSystem';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { RegionSelectorBar } from '../dashboard/RegionSelectorBar';
import { OrganizationToolCard } from './OrganizationToolCard';
import { Panel } from '../ui/Panel';
import './organization.css';
import './OrganizationScreen.css';

export type OrganizationPageMode = 'national' | 'regional';

const PAGE_TITLES: Record<OrganizationPageMode, string> = {
  national: 'Ulusal Örgüt Araçları',
  regional: 'Bölgesel Örgüt Araçları',
};

const PAGE_HINTS: Record<OrganizationPageMode, string> = {
  national: 'Merkez teşkilat yatırımları ve ulusal altyapı',
  regional: 'Seçili bölgede kurulum, yükseltme ve bakım',
};

interface OrganizationScreenProps {
  mode: OrganizationPageMode;
  state: GameState;
  dispatch: Dispatch<GameAction>;
  selectedRegionId: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
  focusRegionId?: RegionId | null;
  onFocusApplied?: () => void;
}

export function OrganizationScreen({
  mode,
  state,
  dispatch,
  selectedRegionId,
  onSelectRegion,
  focusRegionId,
  onFocusApplied,
}: OrganizationScreenProps) {
  const isNational = mode === 'national';
  const regionId = selectedRegionId;

  useEffect(() => {
    if (mode !== 'regional' || !focusRegionId) return;
    onSelectRegion(focusRegionId);
    onFocusApplied?.();
  }, [mode, focusRegionId, onSelectRegion, onFocusApplied]);

  const toolViews = isNational
    ? getNationalOrganizationToolViews(state)
    : getOrganizationToolViews(state, regionId);
  const activeCount = toolViews.filter((view) => view.level > 0).length;
  const nationalBalance = isNational ? getNationalBalanceSummary(state) : null;

  const hasNationalBalanceExtras =
    nationalBalance &&
    (nationalBalance.campaignPhaseLabel ||
      nationalBalance.buildDiscountPercent > 0 ||
      nationalBalance.maintenanceSurchargePercent > 0 ||
      nationalBalance.bureaucracyOverheadPercent > 0 ||
      nationalBalance.affinityLabels.length > 0);

  return (
    <div className={`view-grid org-page org-page--${mode}`}>
      <header className="org-page-header">
        <div className="org-page-heading">
          <div className="org-page-title-row">
            <h2 className="org-page-title">{PAGE_TITLES[mode]}</h2>
            <span className="org-tool-count org-page-active-count">{activeCount} aktif araç</span>
          </div>
          <p className="org-page-subtitle">{PAGE_HINTS[mode]}</p>
        </div>
        <span className="org-page-kicker">Hafta {state.campaignWeek}</span>
      </header>

      <div className="org-page-layout org-page-layout--full">
        <Panel title={PAGE_TITLES[mode]} className="org-tools-panel org-tools-panel--full">
          {!isNational ? (
            <RegionSelectorBar
              variant="embedded"
              regions={state.regions}
              homeRegionId={state.party.homeRegionId}
              selectedRegionId={regionId}
              onSelectRegion={onSelectRegion}
            />
          ) : null}

          {hasNationalBalanceExtras ? (
            <div className="org-national-balance">
              {nationalBalance?.campaignPhaseLabel ? (
                <p className="org-scope-hint">{nationalBalance.campaignPhaseLabel}</p>
              ) : null}
              <div className="org-national-balance-stats">
                {nationalBalance && nationalBalance.buildDiscountPercent > 0 ? (
                  <span>Kurulum −%{nationalBalance.buildDiscountPercent}</span>
                ) : null}
                {nationalBalance && nationalBalance.maintenanceSurchargePercent > 0 ? (
                  <span>Bakım +%{nationalBalance.maintenanceSurchargePercent}</span>
                ) : null}
                {nationalBalance && nationalBalance.bureaucracyOverheadPercent > 0 ? (
                  <span>Bürokrasi +%{nationalBalance.bureaucracyOverheadPercent}</span>
                ) : null}
              </div>
              {nationalBalance && nationalBalance.affinityLabels.length > 0 ? (
                <p className="org-national-affinity">
                  Aktif uyum: {nationalBalance.affinityLabels.slice(0, 2).join(' · ')}
                </p>
              ) : null}
            </div>
          ) : null}

          <div
            className="org-tools-grid org-tools-grid--quad"
          >
            {toolViews.map((view) => (
              <OrganizationToolCard
                key={view.definition.id}
                view={view}
                balanceHint={
                  isNational ? getNationalToolBalanceHint(state, view.definition.id) : null
                }
                onBuild={() =>
                  dispatch(
                    isNational
                      ? { type: 'BUILD_ORGANIZATION_TOOL', toolId: view.definition.id }
                      : {
                          type: 'BUILD_ORGANIZATION_TOOL',
                          toolId: view.definition.id,
                          regionId,
                        },
                  )
                }
                onUpgrade={() =>
                  dispatch(
                    isNational
                      ? { type: 'UPGRADE_ORGANIZATION_TOOL', toolId: view.definition.id }
                      : {
                          type: 'UPGRADE_ORGANIZATION_TOOL',
                          toolId: view.definition.id,
                          regionId,
                        },
                  )
                }
                onRevert={() =>
                  dispatch(
                    isNational
                      ? { type: 'REVERT_ORGANIZATION_TOOL', toolId: view.definition.id }
                      : {
                          type: 'REVERT_ORGANIZATION_TOOL',
                          toolId: view.definition.id,
                          regionId,
                        },
                  )
                }
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
