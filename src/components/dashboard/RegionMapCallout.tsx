import { getRegionById } from '../../data/regions';
import type { RegionId } from '../../types/game';
import './RegionMapCallout.css';

export type RegionMapCalloutVariant = 'overview' | 'regions';

interface RegionMapCalloutProps {
  regionId: RegionId;
  variant: RegionMapCalloutVariant;
  hasRegionalAgenda: boolean;
  onGoToAgendas?: () => void;
  onGoToCampaign?: () => void;
  onGoToOrganization?: () => void;
}

export function RegionMapCallout({
  regionId,
  variant,
  hasRegionalAgenda,
  onGoToAgendas,
  onGoToCampaign,
  onGoToOrganization,
}: RegionMapCalloutProps) {
  const showAgenda = hasRegionalAgenda && Boolean(onGoToAgendas);
  const showCampaign = variant === 'regions' && Boolean(onGoToCampaign);
  const showOrganization = variant === 'regions' && Boolean(onGoToOrganization);

  if (variant === 'overview' && !showAgenda) return null;
  if (variant === 'regions' && !showAgenda && !showCampaign && !showOrganization) return null;

  const regionName = getRegionById(regionId).name;

  return (
    <div className="region-map-callout" role="group" aria-label={`${regionName} — hızlı işlemler`}>
      {showAgenda && onGoToAgendas ? (
        <button type="button" className="region-map-callout-btn agenda" onClick={onGoToAgendas}>
          Gündeme Git
        </button>
      ) : null}
      {showCampaign && onGoToCampaign ? (
        <button type="button" className="region-map-callout-btn campaign" onClick={onGoToCampaign}>
          Kampanya Planla
        </button>
      ) : null}
      {showOrganization && onGoToOrganization ? (
        <button
          type="button"
          className="region-map-callout-btn organization"
          onClick={onGoToOrganization}
        >
          Örgüt Araçları
        </button>
      ) : null}
    </div>
  );
}
