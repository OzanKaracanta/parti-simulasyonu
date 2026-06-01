/** Kampanya ekranı — ulusal veya bölgesel operasyonlar */

import type { Dispatch } from 'react';
import { ActionList } from '../actions/ActionList';
import { RegionalCampaignsPanel } from './RegionalCampaignsPanel';
import { RegionSelectorBar } from './RegionSelectorBar';
import type { GameState, RegionId } from '../../types/game';
import type { GameAction } from '../../store/gameReducer';
import { CoordinationMeter } from './CoordinationMeter';
import './CampaignScreen.css';

export type CampaignPageMode = 'national' | 'regional';

const PAGE_TITLES: Record<CampaignPageMode, string> = {
  national: 'Ulusal Kampanya',
  regional: 'Bölgesel Kampanya',
};

const PAGE_HINTS: Record<CampaignPageMode, string> = {
  national: 'Ülke çapında haftalık operasyonları seçin',
  regional: 'Seçili bölgede yürütülecek kampanya operasyonları',
};

interface CampaignScreenProps {
  mode: CampaignPageMode;
  state: GameState;
  nationalActions: GameState['availableActions'];
  selectedRegionId: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
  onSelectAction: (actionId: string) => void;
  onUnselectAction: (actionId: string) => void;
  dispatch: Dispatch<GameAction>;
  showTutorialCostBreakdown?: boolean;
}

export function CampaignScreen({
  mode,
  state,
  nationalActions,
  selectedRegionId,
  onSelectRegion,
  onSelectAction,
  onUnselectAction,
  dispatch,
  showTutorialCostBreakdown = false,
}: CampaignScreenProps) {
  return (
    <div className={`campaign-page campaign-page--${mode}`}>
      <header className="campaign-page-header">
        <span className="campaign-page-kicker">Hafta {state.campaignWeek}</span>
        <h2 className="campaign-page-title">{PAGE_TITLES[mode]}</h2>
        <p className="campaign-page-subtitle">{PAGE_HINTS[mode]}</p>
        <CoordinationMeter state={state} className="campaign-page-coordination" />
      </header>

      <div className="campaign-layout campaign-layout-single">
        <section className="campaign-operations-column" aria-label={PAGE_TITLES[mode]}>
          {mode === 'national' ? (
            <ActionList
              state={{ ...state, availableActions: nationalActions }}
              onSelect={onSelectAction}
              onUnselect={onUnselectAction}
              showCostBreakdown={showTutorialCostBreakdown}
            />
          ) : (
            <>
              <RegionSelectorBar
                regions={state.regions}
                homeRegionId={state.party.homeRegionId}
                selectedRegionId={selectedRegionId}
                onSelectRegion={onSelectRegion}
              />
              <RegionalCampaignsPanel
                state={state}
                regionId={selectedRegionId}
                dispatch={dispatch}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
