import { Panel } from '../ui/Panel';
import { getOrganizationToolsSummaryGroups } from '../../systems/organizationSystem';
import type { GameState } from '../../types/game';
import './organization.css';

interface OrganizationToolsSummaryPanelProps {
  state: GameState;
}

function formatToolLevel(level: number, levelTitle: string | null, maxLevel: number): string {
  const base = levelTitle ?? `Seviye ${level}`;
  if (level >= maxLevel) return `${base} (maks.)`;
  return base;
}

export function OrganizationToolsSummaryPanel({ state }: OrganizationToolsSummaryPanelProps) {
  const groups = getOrganizationToolsSummaryGroups(state);
  const activeCount = groups.reduce((sum, group) => sum + group.tools.length, 0);

  return (
    <Panel
      title="Örgüt Araçları Özeti"
      headerExtra={<span className="org-tool-count">{activeCount} araç</span>}
      className="org-tools-summary-panel"
    >
      {activeCount === 0 ? (
        <p className="org-empty">Henüz kurulu örgüt aracı yok.</p>
      ) : (
        <div className="org-tools-summary-groups">
          {groups.map((group) => (
            <section key={group.scope} className="org-tools-summary-group" aria-label={group.scopeLabel}>
              <h3 className="org-tools-summary-scope">{group.scopeLabel}</h3>
              <ul className="org-tools-summary-list">
                {group.tools.map((tool) => (
                  <li key={`${group.scope}-${tool.toolId}`} className="org-tools-summary-item">
                    <span className="org-tools-summary-name">{tool.toolName}</span>
                    <span className="org-tools-summary-level">
                      {formatToolLevel(tool.level, tool.levelTitle, tool.maxLevel)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Panel>
  );
}
