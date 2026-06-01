import { SETUP_STEPS, type SetupStepId } from './setupWizard';
import './SetupStepIndicator.css';

interface SetupStepIndicatorProps {
  currentStep: SetupStepId;
  maxReachableStep: SetupStepId;
  onStepClick: (step: SetupStepId) => void;
}

export function SetupStepIndicator({
  currentStep,
  maxReachableStep,
  onStepClick,
}: SetupStepIndicatorProps) {
  return (
    <nav className="setup-steps" aria-label="Kurulum adımları">
      <ol className="setup-steps__list">
        {SETUP_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          const isReachable = step.id <= maxReachableStep;
          const showConnector = index < SETUP_STEPS.length - 1;

          return (
            <li key={step.id} className="setup-steps__item">
              <button
                type="button"
                className={[
                  'setup-steps__button',
                  isActive ? 'is-active' : '',
                  isComplete ? 'is-complete' : '',
                  !isReachable ? 'is-disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!isReachable}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onStepClick(step.id)}
              >
                <span className="setup-steps__number">{step.id}</span>
                <span className="setup-steps__text">
                  <span className="setup-steps__label">{step.label}</span>
                  <span className="setup-steps__title">{step.title}</span>
                </span>
              </button>
              {showConnector ? (
                <span
                  className={[
                    'setup-steps__connector',
                    step.id < currentStep ? 'is-complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
