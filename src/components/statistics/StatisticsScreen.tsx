/** İstatistikler — kaynak, metrik ve kampanya durumu takibi */

import { useMemo } from 'react';
import {
  METRIC_DISPLAY_ORDER,
  metricDescriptions,
  RESOURCE_DISPLAY_ORDER,
  resourceDescriptions,
} from '../../data/metricDescriptions';
import { metricLabels, resourceLabels } from '../../data/labels';
import { formatOrganizationLoadUsage, getSelectedOrganizationLoad } from '../../engine/organizationLoadEngine';
import { formatDelta } from '../../engine/weeklyReport';
import type { GameState, MetricKey, ResourceKey } from '../../types/game';
import { RegionPanel } from '../dashboard/RegionPanel';
import { SidebarSegmentSupport } from '../dashboard/SidebarSegmentSupport';
import { SidebarPoliticalSegmentSupport } from '../dashboard/SidebarPoliticalSegmentSupport';
import { ensurePoliticalSegmentSupport } from '../../engine/politicalSegmentEngine';
import { OrganizationToolsSummaryPanel } from '../organization/OrganizationToolsSummaryPanel';
import { Panel } from '../ui/Panel';
import { StatBar } from '../ui/StatBar';
import './StatisticsScreen.css';

interface StatisticsScreenProps {
  state: GameState;
}

function statusLabel(value: number): { text: string; className: string } {
  if (value >= 65) return { text: 'Güçlü', className: 'positive' };
  if (value >= 40) return { text: 'Orta', className: '' };
  return { text: 'Zayıf', className: 'negative' };
}

function formatMetricDelta(value: number | undefined): string {
  if (value === undefined || value === 0) return '—';
  return formatDelta(value);
}

export function StatisticsScreen({ state: rawState }: StatisticsScreenProps) {
  const state = ensurePoliticalSegmentSupport(rawState);
  const lastHistory = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  const metricChanges = lastHistory?.metricChanges;
  const resourceChanges = lastHistory?.resourceChanges;
  const orgLoadUsed = getSelectedOrganizationLoad(state);

  const cumulativeMetricChanges = useMemo(() => {
    const totals = {} as Partial<Record<MetricKey, number>>;
    for (const item of state.history) {
      for (const [key, value] of Object.entries(item.metricChanges) as [MetricKey, number][]) {
        if (value === undefined) continue;
        totals[key] = (totals[key] ?? 0) + value;
      }
    }
    return totals;
  }, [state.history]);

  const cumulativeResourceChanges = useMemo(() => {
    const totals = {} as Partial<Record<ResourceKey, number>>;
    for (const item of state.history) {
      for (const [key, value] of Object.entries(item.resourceChanges) as [ResourceKey, number][]) {
        if (value === undefined) continue;
        totals[key] = (totals[key] ?? 0) + value;
      }
    }
    return totals;
  }, [state.history]);

  const historyRows = useMemo(() => [...state.history].reverse(), [state.history]);

  return (
    <div className="statistics-layout">
      <section className="statistics-hero" aria-label="Kampanya özeti">
        <div className="statistics-hero-card highlight">
          <span className="statistics-hero-label">Ulusal Destek</span>
          <span className="statistics-hero-value">{state.nationalSupport.toFixed(1)}%</span>
          {lastHistory ? (
            <span className="statistics-hero-meta">
              Son hafta {formatDelta(lastHistory.supportChange)}
            </span>
          ) : (
            <span className="statistics-hero-meta">Kampanya başlangıcı</span>
          )}
        </div>
        <div className="statistics-hero-card">
          <span className="statistics-hero-label">Mesaj Tutarlılığı</span>
          <span className="statistics-hero-value">{state.messageConsistency}</span>
          {lastHistory ? (
            <span className="statistics-hero-meta">
              Son hafta{' '}
              {formatDelta(lastHistory.consistencyAfter - lastHistory.consistencyBefore)}
            </span>
          ) : null}
        </div>
        <div className="statistics-hero-card">
          <span className="statistics-hero-label">Tur</span>
          <span className="statistics-hero-value">
            {state.campaignWeek}
            <span className="statistics-hero-max">/{state.maxWeeks}</span>
          </span>
          <span className="statistics-hero-meta">{state.maxWeeks - state.campaignWeek} hafta kaldı</span>
        </div>
        <div className="statistics-hero-card">
          <span className="statistics-hero-label">Örgüt Yükü</span>
          <span className="statistics-hero-value">{formatOrganizationLoadUsage(state)}</span>
          <span className="statistics-hero-meta">Bu hafta seçili operasyonlar</span>
        </div>
      </section>

      <section className="statistics-org-summary" aria-label="Örgüt araçları özeti">
        <OrganizationToolsSummaryPanel state={state} />
      </section>

      <div className="statistics-primary">
        <Panel title="Kampanya Metrikleri">
          <p className="statistics-panel-note">
            Tüm metrikler 0–100 aralığındadır. Son hafta sütunu, tamamlanan son turun değişimini gösterir.
          </p>
          <div className="statistics-metric-bars">
            {METRIC_DISPLAY_ORDER.map((key) => (
              <StatBar
                key={key}
                label={metricLabels[key]}
                value={state.metrics[key]}
                delta={metricChanges?.[key]}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Metrik Detay Tablosu">
          <table className="fm-table statistics-detail-table">
            <thead>
              <tr>
                <th>Metrik</th>
                <th>Değer</th>
                <th>Son Hafta</th>
                <th>Toplam Δ</th>
                <th>Durum</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {METRIC_DISPLAY_ORDER.map((key) => {
                const value = state.metrics[key];
                const lastDelta = metricChanges?.[key];
                const totalDelta = cumulativeMetricChanges[key];
                const status = statusLabel(value);

                return (
                  <tr key={key}>
                    <td>{metricLabels[key]}</td>
                    <td className="num">{value}</td>
                    <td
                      className={`num ${lastDelta && lastDelta > 0 ? 'positive' : lastDelta && lastDelta < 0 ? 'negative' : ''}`}
                    >
                      {formatMetricDelta(lastDelta)}
                    </td>
                    <td
                      className={`num ${totalDelta && totalDelta > 0 ? 'positive' : totalDelta && totalDelta < 0 ? 'negative' : ''}`}
                    >
                      {formatMetricDelta(totalDelta)}
                    </td>
                    <td className={status.className}>{status.text}</td>
                    <td className="statistics-desc">{metricDescriptions[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Haftalık Metrik Değişimleri" className="statistics-history-panel">
          {historyRows.length === 0 ? (
            <p className="statistics-empty">Henüz tamamlanmış hafta yok.</p>
          ) : (
            <div className="statistics-history-scroll">
              <table className="fm-table statistics-history-table">
                <thead>
                  <tr>
                    <th>Hafta</th>
                    <th>Destek</th>
                    {METRIC_DISPLAY_ORDER.map((key) => (
                      <th key={key} title={metricLabels[key]}>
                        {metricLabels[key].split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((item) => (
                    <tr key={item.week}>
                      <td>H{item.week}</td>
                      <td
                        className={`num ${item.supportChange > 0 ? 'positive' : item.supportChange < 0 ? 'negative' : ''}`}
                      >
                        {formatDelta(item.supportChange)}
                      </td>
                      {METRIC_DISPLAY_ORDER.map((key) => {
                        const delta = item.metricChanges[key];
                        return (
                          <td
                            key={key}
                            className={`num ${delta && delta > 0 ? 'positive' : delta && delta < 0 ? 'negative' : ''}`}
                          >
                            {formatMetricDelta(delta)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <RegionPanel regions={state.regions} homeRegionId={state.party.homeRegionId} />
      </div>

      <aside className="statistics-sidebar" aria-label="Kaynaklar ve segmentler">
        <Panel title="Kaynaklar">
          <p className="statistics-panel-note">
            Koordinasyon yükü: {orgLoadUsed}/{state.resources.organizationCapacity} (seçili operasyonlar).
          </p>
          <div className="statistics-resource-bars">
            {RESOURCE_DISPLAY_ORDER.map((key) => (
              <StatBar
                key={key}
                label={resourceLabels[key]}
                value={state.resources[key]}
                delta={resourceChanges?.[key]}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Kaynak Detay Tablosu" compact>
          <table className="fm-table statistics-resource-table">
            <thead>
              <tr>
                <th>Kaynak</th>
                <th>Değer</th>
                <th>Son Hafta</th>
                <th>Toplam Δ</th>
              </tr>
            </thead>
            <tbody>
              {RESOURCE_DISPLAY_ORDER.map((key) => {
                const value = state.resources[key];
                const lastDelta = resourceChanges?.[key];
                const totalDelta = cumulativeResourceChanges[key];

                return (
                  <tr key={key}>
                    <td>
                      <span className="statistics-resource-name">{resourceLabels[key]}</span>
                      <span className="statistics-desc">{resourceDescriptions[key]}</span>
                    </td>
                    <td className="num">{value}</td>
                    <td
                      className={`num ${lastDelta && lastDelta > 0 ? 'positive' : lastDelta && lastDelta < 0 ? 'negative' : ''}`}
                    >
                      {formatMetricDelta(lastDelta)}
                    </td>
                    <td
                      className={`num ${totalDelta && totalDelta > 0 ? 'positive' : totalDelta && totalDelta < 0 ? 'negative' : ''}`}
                    >
                      {formatMetricDelta(totalDelta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <SidebarSegmentSupport
          segmentSupport={state.segmentSupport}
          segmentChanges={lastHistory?.segmentChanges}
        />

        <SidebarPoliticalSegmentSupport
          politicalSegmentSupport={state.politicalSegmentSupport}
          politicalSegmentChanges={lastHistory?.politicalSegmentChanges}
        />
      </aside>
    </div>
  );
}
