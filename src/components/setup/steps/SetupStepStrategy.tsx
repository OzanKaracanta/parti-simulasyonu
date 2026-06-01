import { ideologyOptions, leadershipOptions } from '../../../data/setupOptions';
import { SetupSelectionDetail } from '../SetupSelectionDetail';
import type { SetupFormState } from '../setupWizard';

interface SetupStepStrategyProps {
  form: SetupFormState;
  onChange: (patch: Partial<SetupFormState>) => void;
}

export function SetupStepStrategy({ form, onChange }: SetupStepStrategyProps) {
  const selectedIdeology = ideologyOptions.find((item) => item.id === form.ideologyId);
  const selectedLeadership = leadershipOptions.find((item) => item.id === form.leadershipStyleId);

  return (
    <div className="setup-step setup-step--compact">
      <section className="setup-panel setup-panel--compact">
        <div className="setup-compact-block">
          <h3 className="setup-compact-label">İdeolojik çizgi</h3>
          <div className="setup-choice-grid" role="radiogroup" aria-label="İdeolojik çizgi">
            {ideologyOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                role="radio"
                aria-checked={form.ideologyId === option.id}
                className={
                  form.ideologyId === option.id ? 'setup-choice-row selected' : 'setup-choice-row'
                }
                onClick={() => onChange({ ideologyId: option.id })}
              >
                {option.name}
              </button>
            ))}
          </div>
          {selectedIdeology ? (
            <SetupSelectionDetail>{selectedIdeology.playStyle}</SetupSelectionDetail>
          ) : null}
        </div>

        <div className="setup-compact-block">
          <h3 className="setup-compact-label">Liderlik tarzı</h3>
          <div className="setup-choice-grid" role="radiogroup" aria-label="Liderlik tarzı">
            {leadershipOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                role="radio"
                aria-checked={form.leadershipStyleId === option.id}
                className={
                  form.leadershipStyleId === option.id
                    ? 'setup-choice-row selected'
                    : 'setup-choice-row'
                }
                onClick={() => onChange({ leadershipStyleId: option.id })}
              >
                {option.name}
              </button>
            ))}
          </div>
          {selectedLeadership ? (
            <SetupSelectionDetail>{selectedLeadership.bonusSummary}</SetupSelectionDetail>
          ) : null}
        </div>
      </section>
    </div>
  );
}
