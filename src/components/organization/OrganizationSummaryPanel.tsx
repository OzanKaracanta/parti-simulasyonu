import { useState } from 'react';
import { Panel } from '../ui/Panel';
import { getAllActiveOrganizationToolViews, summarizeWeeklyOrganizationEffects } from '../../systems/organizationSystem';
import {
  buildOrganizationCostParts,
  buildOrganizationDeltaParts,
  buildOrganizationGainParts,
} from '../../utils/organizationFormat';
import type { GameState } from '../../types/game';
import { OrganizationValueChips } from './OrganizationValueChips';
import './organization.css';

interface OrganizationSummaryPanelProps {
  state: GameState;
}

export function OrganizationSummaryPanel({ state }: OrganizationSummaryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const summary = summarizeWeeklyOrganizationEffects(state);
  const activeTools = getAllActiveOrganizationToolViews(state);

  const incomeParts = buildOrganizationGainParts({ resources: summary.resourceYield });
  const expenseParts = buildOrganizationCostParts(summary.maintenanceCost);
  const netParts = buildOrganizationDeltaParts(summary.netResourceDelta);

  return (
    <Panel
      title="Kampanya Örgüt Özeti"
      headerExtra={<span className="org-tool-count">{activeTools.length} aktif</span>}
      compact
      className="org-summary-panel"
    >
      {activeTools.length === 0 ? (
        <p className="org-empty">Kurulu araç yok; haftalık örgüt geliri ve gideri oluşmaz.</p>
      ) : (
        <div className="org-summary-stats">
          <div className="org-summary-row">
            <span>Gelir</span>
            <OrganizationValueChips parts={incomeParts} empty="—" />
          </div>
          <div className="org-summary-row">
            <span>Gider</span>
            <OrganizationValueChips parts={expenseParts} empty="—" />
          </div>
          <div className="org-summary-row org-summary-row-net">
            <span>Net</span>
            <OrganizationValueChips parts={netParts} empty="—" />
          </div>
        </div>
      )}

      {activeTools.length > 0 ? (
        <>
          <button
            type="button"
            className="org-accordion-toggle"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
          >
            {expanded ? '▾' : '▸'} Araç dökümü ({activeTools.length})
          </button>

          {expanded ? (
            <ul className="org-active-list org-active-list-compact">
              {activeTools.map((view) => (
                <li key={view.definition.id}>
                  <div className="org-active-list-head">
                    <strong>{view.definition.name}</strong>
                    <span>{view.levelTitle ?? `Sv. ${view.level}`}</span>
                  </div>
                  <OrganizationValueChips
                    parts={[
                      ...buildOrganizationGainParts(view.weeklyEffects),
                      ...buildOrganizationCostParts(view.weeklyMaintenance),
                    ]}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
