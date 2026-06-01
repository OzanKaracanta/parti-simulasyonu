/** Harita tıklaması — bölge segment profili ve destek özeti */

import { useEffect } from 'react';
import { getRegionById } from '../../data/regions';
import {
  getRegionPoliticalSegmentIds,
  getRegionSocioSegmentIds,
} from '../../data/regionSegmentProfiles';
import { segmentLabels } from '../../data/labels';
import { politicalSegmentLabels } from '../../data/politicalSegments';
import type { RegionId, RegionState, SegmentId } from '../../types/game';
import type { PoliticalSegmentId } from '../../types/politicalSegments';
import './RegionMapDetailModal.css';

const SEGMENT_SUPPORT_MIN = 8;
const SEGMENT_SUPPORT_MAX = 72;
const STRONG_THRESHOLD = 42;
const WEAK_THRESHOLD = 28;

interface RegionMapDetailModalProps {
  region: RegionState;
  homeRegionId: string;
  partyName: string;
  segmentSupport: Record<SegmentId, number>;
  politicalSegmentSupport: Record<PoliticalSegmentId, number>;
  hasRegionalAgenda: boolean;
  hasIlPartyOffice: boolean;
  onClose: () => void;
  onGoToAgenda?: () => void;
}

function supportBarWidth(value: number): number {
  const span = SEGMENT_SUPPORT_MAX - SEGMENT_SUPPORT_MIN;
  return Math.round(((value - SEGMENT_SUPPORT_MIN) / span) * 100);
}

function supportTier(value: number): 'strong' | 'mid' | 'weak' {
  if (value >= STRONG_THRESHOLD) return 'strong';
  if (value <= WEAK_THRESHOLD) return 'weak';
  return 'mid';
}

function SegmentSupportRows({
  items,
  variant,
}: {
  items: { id: string; label: string; value: number; tier: 'strong' | 'mid' | 'weak' }[];
  variant: 'socio' | 'political';
}) {
  if (items.length === 0) {
    return <p className="region-map-detail-empty">Profil verisi yok.</p>;
  }

  return (
    <ul className={`region-map-detail-segments region-map-detail-segments--${variant}`}>
      {items.map(({ id, label, value, tier }) => (
        <li key={id} className={`region-map-detail-segment tier-${tier}`}>
          <div className="region-map-detail-segment-top">
            <span className="region-map-detail-segment-name">{label}</span>
            <span className="region-map-detail-segment-value">{Math.round(value)}</span>
          </div>
          <div className="region-map-detail-segment-bar" aria-hidden>
            <div
              className={`region-map-detail-segment-bar-fill region-map-detail-segment-bar-fill--${variant}`}
              style={{ width: `${supportBarWidth(value)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RegionMapDetailModal({
  region,
  homeRegionId,
  partyName,
  segmentSupport,
  politicalSegmentSupport,
  hasRegionalAgenda,
  hasIlPartyOffice,
  onClose,
  onGoToAgenda,
}: RegionMapDetailModalProps) {
  const regionId = region.id as RegionId;
  const regionDef = getRegionById(regionId);
  const isHome = regionId === homeRegionId;

  const socioItems = getRegionSocioSegmentIds(regionId).map((segmentId) => {
    const value = segmentSupport[segmentId];
    return {
      id: segmentId,
      label: segmentLabels[segmentId],
      value,
      tier: supportTier(value),
    };
  });

  const politicalItems = getRegionPoliticalSegmentIds(regionId).map((segmentId) => {
    const value = politicalSegmentSupport[segmentId];
    return {
      id: segmentId,
      label: politicalSegmentLabels[segmentId],
      value,
      tier: supportTier(value),
    };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="region-map-detail-overlay" role="presentation" onClick={onClose}>
      <div
        className="region-map-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-map-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="region-map-detail-header">
          <div className="region-map-detail-header-top">
            <h2 id="region-map-detail-title">{regionDef.name}</h2>
            <button
              type="button"
              className="region-map-detail-close"
              onClick={onClose}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
          <div className="region-map-detail-tags">
            {isHome ? <span className="region-map-detail-tag home">Ana bölge</span> : null}
            {hasIlPartyOffice ? (
              <span className="region-map-detail-tag office">İl bürosu</span>
            ) : null}
            {hasRegionalAgenda ? (
              <span className="region-map-detail-tag agenda">Aktif bölgesel gündem</span>
            ) : null}
          </div>
          <p className="region-map-detail-playstyle">{regionDef.playStyle}</p>
        </header>

        <section className="region-map-detail-support-hero" aria-label="Bölgesel destek">
          <span className="region-map-detail-support-label">{partyName} — bölgesel destek</span>
          <strong className="region-map-detail-support-value">%{region.support.toFixed(1)}</strong>
          <div className="region-map-detail-support-meta">
            <span>Örgüt {region.organization}</span>
            <span>Medya {region.mediaReach}</span>
          </div>
        </section>

        <div className="region-map-detail-body">
          <section className="region-map-detail-section" aria-label="Sosyo-ekonomik segmentler">
            <h3>Sosyo-Ekonomik segmentler</h3>
            <p className="region-map-detail-section-note">
              Bölgede baskın gruplar: {region.dominantGroups.join(', ')}
            </p>
            <SegmentSupportRows items={socioItems} variant="socio" />
          </section>

          <section className="region-map-detail-section" aria-label="İdeolojik segmentler">
            <h3>İdeolojik segmentler</h3>
            <p className="region-map-detail-section-note">
              Bölgedeki tipik ideolojik yankı — ulusal tabanınızın bu bloklardaki gücü.
            </p>
            <SegmentSupportRows items={politicalItems} variant="political" />
          </section>
        </div>

        <footer className="region-map-detail-footer">
          {hasRegionalAgenda && onGoToAgenda ? (
            <button type="button" className="ps-btn ps-btn--primary" onClick={onGoToAgenda}>
              Gündeme Git
            </button>
          ) : null}
          <button type="button" className="ps-btn ps-btn--ghost" onClick={onClose}>
            Kapat
          </button>
        </footer>
      </div>
    </div>
  );
}
