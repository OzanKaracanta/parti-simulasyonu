/** Türkiye 7 bölge — il bazlı SVG harita */

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { getRegionById } from '../../data/regions';
import {
  REGION_IDS,
  TURKEY_MAP_VIEWBOX,
  turkeyProvinces,
  turkeyRegionLabels,
} from '../../data/turkeyProvinceMap';
import type { RegionId, RegionState } from '../../types/game';
import './TurkeySvgMap.css';

interface TurkeySvgMapProps {
  regions: RegionState[];
  homeRegionId: string;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  hasIlPartyOffice?: (regionId: string) => boolean;
  hasRegionalAgenda?: (regionId: string) => boolean;
}

export function TurkeySvgMap({
  regions,
  homeRegionId,
  selectedRegionId,
  onSelectRegion,
  hasIlPartyOffice,
  hasRegionalAgenda,
}: TurkeySvgMapProps) {
  const regionMap = Object.fromEntries(regions.map((region) => [region.id, region]));
  const [hoveredId, setHoveredId] = useState<RegionId | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleProvinceEnter = useCallback((regionId: RegionId) => {
    setHoveredId(regionId);
  }, []);

  const handleWrapLeave = useCallback(() => setHoveredId(null), []);

  const handleWrapMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    setCursorPos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleProvinceClick = useCallback(
    (event: MouseEvent, regionId: RegionId) => {
      event.stopPropagation();
      onSelectRegion?.(regionId);
    },
    [onSelectRegion],
  );

  const hoverRegion = hoveredId ? regionMap[hoveredId] : null;
  const hoverDef = hoveredId ? getRegionById(hoveredId) : null;

  const orderedProvinces = useMemo(() => {
    const isActiveRegion = (id: RegionId) => id === hoveredId || id === selectedRegionId;
    return [...turkeyProvinces].sort((a, b) => {
      const aActive = isActiveRegion(a.regionId);
      const bActive = isActiveRegion(b.regionId);
      if (aActive && !bActive) return 1;
      if (!aActive && bActive) return -1;
      return 0;
    });
  }, [hoveredId, selectedRegionId]);

  const tooltipOffset = 14;
  const tooltipFlipX = cursorPos.x + tooltipOffset + 280 > window.innerWidth;
  const tooltipFlipY = cursorPos.y + tooltipOffset + 120 > window.innerHeight;
  const tooltipTransform = tooltipFlipX
    ? `translate(calc(-100% - ${tooltipOffset}px), ${tooltipFlipY ? `calc(-100% - ${tooltipOffset}px)` : `${tooltipOffset}px`})`
    : tooltipFlipY
      ? `translate(${tooltipOffset}px, calc(-100% - ${tooltipOffset}px))`
      : `translate(${tooltipOffset}px, ${tooltipOffset}px)`;

  return (
    <div
      className="turkey-svg-map-wrap"
      onMouseMove={handleWrapMouseMove}
      onMouseLeave={handleWrapLeave}
    >
      <svg
        viewBox={TURKEY_MAP_VIEWBOX}
        className="turkey-svg-map"
        role="img"
        aria-label="Türkiye bölge haritası"
      >
        <g className="turkey-map-regions">
          {orderedProvinces.map((province) => {
            const isHovered = hoveredId === province.regionId;
            const isSelected = selectedRegionId === province.regionId;
            const isHome = province.regionId === homeRegionId;
            const className = [
              'turkey-province-path',
              isHovered ? 'is-hovered' : '',
              isSelected ? 'is-selected' : '',
              isHome ? 'is-home' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <path
                key={province.id}
                d={province.path}
                className={className}
                data-region={province.regionId}
                shapeRendering="geometricPrecision"
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => handleProvinceEnter(province.regionId)}
                onClick={(event) => handleProvinceClick(event, province.regionId)}
              />
            );
          })}
        </g>

        {REGION_IDS.map((regionId) => {
          const label = turkeyRegionLabels[regionId];
          const showAgenda = hasRegionalAgenda?.(regionId);
          const showOffice = hasIlPartyOffice?.(regionId);
          if (!label || (!showAgenda && !showOffice)) return null;

          return (
            <g key={`${regionId}-markers`} pointerEvents="none">
              {showAgenda ? (
                <g className="turkey-region-agenda-marker">
                  <circle
                    cx={label.labelX - (showOffice ? 26 : 0)}
                    cy={label.labelY}
                    r={4.5}
                    className="turkey-region-agenda-dot"
                  />
                  <text
                    x={label.labelX - (showOffice ? 26 : 0) + 8}
                    y={label.labelY}
                    className="turkey-region-agenda-label"
                  >
                    Gündem
                  </text>
                </g>
              ) : null}
              {showOffice ? (
                <circle
                  cx={label.labelX + (showAgenda ? 30 : 0)}
                  cy={label.labelY}
                  r={4.5}
                  className="turkey-region-office-dot"
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {hoveredId && hoverRegion && hoverDef
        ? createPortal(
            <div
              className="turkey-map-tooltip"
              style={{ left: cursorPos.x, top: cursorPos.y, transform: tooltipTransform }}
              role="tooltip"
            >
              <div className="turkey-map-tooltip-head">
                <strong>{hoverDef.name}</strong>
                <span className="turkey-map-tooltip-stats">
                  Destek %{hoverRegion.support.toFixed(1)} · Örgüt {hoverRegion.organization} · Medya{' '}
                  {hoverRegion.mediaReach}
                </span>
              </div>
              <p className="turkey-map-tooltip-body">{hoverDef.playStyle}</p>
              <div className="turkey-map-tooltip-tags">
                {hoveredId === homeRegionId ? (
                  <span className="turkey-map-tag home">Ana bölge</span>
                ) : null}
                {hasIlPartyOffice?.(hoveredId) ? (
                  <span className="turkey-map-tag office">İl Bürosu</span>
                ) : null}
                {hasRegionalAgenda?.(hoveredId) ? (
                  <span className="turkey-map-tag agenda">Bölgesel gündem</span>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}

      <div className="turkey-map-legend" aria-hidden="true">
        <span>
          <i className="dot agenda" /> Gündem
        </span>
        <span>
          <i className="dot office" /> İl Bürosu
        </span>
      </div>
    </div>
  );
}
