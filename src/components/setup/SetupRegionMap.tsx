/** Kurulum ekranı — tıklanabilir Türkiye bölge haritası */

import { useCallback, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { getRegionById } from '../../data/regions';
import { TURKEY_MAP_VIEWBOX, turkeyProvinces } from '../../data/turkeyProvinceMap';
import type { RegionId } from '../../types/game';
import '../dashboard/TurkeySvgMap.css';
import './SetupRegionMap.css';

interface SetupRegionMapProps {
  selectedRegionId: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
  accentColor?: string;
}

export function SetupRegionMap({
  selectedRegionId,
  onSelectRegion,
  accentColor,
}: SetupRegionMapProps) {
  const [hoveredId, setHoveredId] = useState<RegionId | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleWrapLeave = useCallback(() => setHoveredId(null), []);

  const handleWrapMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    setCursorPos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleProvinceClick = useCallback(
    (event: MouseEvent, regionId: RegionId) => {
      event.stopPropagation();
      onSelectRegion(regionId);
    },
    [onSelectRegion],
  );

  const hoverDef = hoveredId ? getRegionById(hoveredId) : null;
  const activeId = hoveredId ?? selectedRegionId;

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

  const wrapStyle = accentColor
    ? ({ '--party-color': accentColor } as CSSProperties)
    : undefined;

  return (
    <div
      className="setup-region-map turkey-svg-map-wrap"
      style={wrapStyle}
      onMouseMove={handleWrapMouseMove}
      onMouseLeave={handleWrapLeave}
    >
      <svg
        viewBox={TURKEY_MAP_VIEWBOX}
        className="turkey-svg-map setup-region-map__svg"
        role="img"
        aria-label="Türkiye bölge haritası — başlangıç bölgesi seç"
      >
        <g className="turkey-map-regions">
          {orderedProvinces.map((province) => {
            const isHovered = hoveredId === province.regionId;
            const isSelected = selectedRegionId === province.regionId;
            const isHome = province.regionId === selectedRegionId;
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
                onMouseEnter={() => setHoveredId(province.regionId)}
                onClick={(event) => handleProvinceClick(event, province.regionId)}
              />
            );
          })}
        </g>
      </svg>

      {hoverDef
        ? createPortal(
            <div
              className="turkey-map-tooltip setup-region-map__tooltip"
              style={{ left: cursorPos.x, top: cursorPos.y, transform: tooltipTransform }}
              role="tooltip"
            >
              <div className="turkey-map-tooltip-head">
                <strong>{hoverDef.name}</strong>
                <span className="turkey-map-tooltip-stats">
                  Zorluk: {hoverDef.difficulty} · Potansiyel: {hoverDef.potential}
                </span>
              </div>
              <p className="turkey-map-tooltip-body">{hoverDef.playStyle}</p>
              {activeId === selectedRegionId ? (
                <div className="turkey-map-tooltip-tags">
                  <span className="turkey-map-tag home">Başlangıç bölgesi</span>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}

      <p className="setup-region-map__hint">Haritadan bölge seç veya alttaki kısayollara tıkla.</p>
    </div>
  );
}
