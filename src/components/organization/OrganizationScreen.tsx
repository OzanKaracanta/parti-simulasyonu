import { useState, type Dispatch } from 'react';
import { regionDefinitions } from '../../data/regions';
import { getNationalBalanceSummary } from '../../data/nationalBalance';
import { getOrganizationToolViews } from '../../systems/organizationSystem';
import {
  getNationalOrganizationToolViews,
  getNationalToolBalanceHint,
} from '../../systems/nationalOrganizationSystem';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { OrganizationSummaryPanel } from './OrganizationSummaryPanel';
import { OrganizationToolCard } from './OrganizationToolCard';
import { Panel } from '../ui/Panel';
import { TabBar } from '../ui/TabBar';
import './organization.css';

type OrganizationScope = 'national' | RegionId;

interface OrganizationScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function OrganizationScreen({ state, dispatch }: OrganizationScreenProps) {
  const [scope, setScope] = useState<OrganizationScope>(state.party.homeRegionId);

  const isNational = scope === 'national';
  const toolViews = isNational
    ? getNationalOrganizationToolViews(state)
    : getOrganizationToolViews(state, scope);
  const activeCount = toolViews.filter((view) => view.level > 0).length;
  const nationalBalance = isNational ? getNationalBalanceSummary(state) : null;

  const scopeTabs = [
    { id: 'national', label: 'Ulusal Örgüt' },
    ...regionDefinitions.map((region) => ({
      id: region.id,
      label: region.name,
    })),
  ];

  return (
    <div className="view-grid org-page">
      <OrganizationSummaryPanel state={state} />

      <Panel
        title="Örgütlenme Araçları"
        headerExtra={<span className="org-tool-count">{activeCount} aktif</span>}
        className="org-tools-panel"
      >
        <TabBar tabs={scopeTabs} active={scope} onChange={(id) => setScope(id as OrganizationScope)} />

        {isNational && nationalBalance ? (
          <div className="org-national-balance">
            <p className="org-scope-hint">{nationalBalance.campaignPhaseLabel}</p>
            <div className="org-national-balance-stats">
              <span>Ayak izi: {nationalBalance.ilOfficeCount} İl Bürosu</span>
              {nationalBalance.buildDiscountPercent > 0 ? (
                <span>Kurulum −%{nationalBalance.buildDiscountPercent}</span>
              ) : null}
              {nationalBalance.maintenanceSurchargePercent > 0 ? (
                <span>Bakım +%{nationalBalance.maintenanceSurchargePercent}</span>
              ) : null}
              {nationalBalance.bureaucracyOverheadPercent > 0 ? (
                <span>Bürokrasi +%{nationalBalance.bureaucracyOverheadPercent}</span>
              ) : null}
            </div>
            {nationalBalance.affinityLabels.length > 0 ? (
              <p className="org-national-affinity">
                Aktif uyum: {nationalBalance.affinityLabels.slice(0, 2).join(' · ')}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="org-tools-grid">
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
                        regionId: scope,
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
                        regionId: scope,
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
                        regionId: scope,
                      },
                )
              }
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}
