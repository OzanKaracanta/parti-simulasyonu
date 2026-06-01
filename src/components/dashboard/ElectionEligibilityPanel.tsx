import { getElectionEligibility } from '../../engine/electionEligibilityEngine';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './dashboard.css';

interface ElectionEligibilityPanelProps {
  state: GameState;
  compact?: boolean;
}

export function ElectionEligibilityPanel({ state, compact = false }: ElectionEligibilityPanelProps) {
  const eligibility = getElectionEligibility(state);

  return (
    <Panel title="Seçime Yeterlilik" compact={compact} className="eligibility-panel">
      <div className="eligibility-grid">
        <div className={`eligibility-item ${eligibility.meetsRegionalRequirement ? 'met' : ''}`}>
          <span className="eligibility-label">İl Parti Bürosu</span>
          <span className="eligibility-value">
            {eligibility.regionsWithOffice}/{eligibility.requiredRegions} bölge
          </span>
        </div>
        <div className={`eligibility-item ${eligibility.meetsSupportRequirement ? 'met' : ''}`}>
          <span className="eligibility-label">Ulusal Destek</span>
          <span className="eligibility-value">
            %{eligibility.nationalSupport.toFixed(1)} / %{eligibility.requiredSupport}
          </span>
        </div>
      </div>
      {eligibility.isEligible ? (
        <p className="eligibility-status met">Yeterlilik sağlandı — seçime girebilirsiniz.</p>
      ) : (
        <p className="eligibility-status pending">
          Her iki koşul da sağlandığında seçime girebilirsiniz.
        </p>
      )}
    </Panel>
  );
}
