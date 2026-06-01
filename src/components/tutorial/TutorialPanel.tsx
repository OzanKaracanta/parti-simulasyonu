/** Öğretici tur — haftalık checklist ve yönlendirme */

import { useCallback, useEffect, useState } from 'react';
import type { DashboardView } from '../dashboard/DashboardScreen';
import type { GameState } from '../../types/game';
import {
  getTutorialProgress,
  isTutorialActive,
} from '../../tutorial/tutorialEngine';
import { setTutorialSkipped } from '../../tutorial/tutorialStorage';
import { TUTORIAL_LAST_WEEK } from '../../tutorial/tutorialSteps';
import './TutorialPanel.css';

interface TutorialPanelProps {
  state: GameState;
  skipped: boolean;
  onSkipChange: (skipped: boolean) => void;
  onNavigate: (view: DashboardView) => void;
}

export function TutorialPanel({
  state,
  skipped,
  onSkipChange,
  onNavigate,
}: TutorialPanelProps) {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  if (!isTutorialActive(state, skipped)) return null;

  const progress = getTutorialProgress(state, skipped);
  if (!progress) return null;

  const handleSkip = () => {
    setTutorialSkipped();
    onSkipChange(true);
  };

  const handleGoToStep = (view: DashboardView) => {
    onNavigate(view);
    refresh();
  };

  const doneCount = progress.steps.filter((s) => s.done).length;

  return (
    <section className="tutorial-panel" aria-label="Öğretici tur">
      <header className="tutorial-panel-header">
        <div>
          <span className="tutorial-panel-kicker">
            Öğretici · Tur {progress.week}/{TUTORIAL_LAST_WEEK}
          </span>
          <h2 className="tutorial-panel-title">{progress.theme}</h2>
        </div>
        <button type="button" className="tutorial-skip-btn" onClick={handleSkip}>
          Atla
        </button>
      </header>

      <p className="tutorial-panel-intro">{progress.intro}</p>

      <ol className="tutorial-checklist">
        {progress.steps.map((step) => (
          <li
            key={step.id}
            className={`tutorial-checklist-item ${step.done ? 'done' : ''}`}
          >
            <span className="tutorial-check-icon" aria-hidden>
              {step.done ? '✓' : '○'}
            </span>
            <div className="tutorial-check-body">
              <span className="tutorial-check-title">{step.title}</span>
              <span className="tutorial-check-desc">{step.description}</span>
            </div>
            {!step.done ? (
              <button
                type="button"
                className="tutorial-go-btn"
                onClick={() => handleGoToStep(step.targetView)}
              >
                Git →
              </button>
            ) : null}
          </li>
        ))}
      </ol>

      <footer className="tutorial-panel-footer">
        <span className="tutorial-progress-text">
          {doneCount}/{progress.steps.length} adım
          {progress.allRequiredDone ? ' · Turu bitirebilirsin' : ''}
        </span>
        {progress.nextStep ? (
          <button
            type="button"
            className="ps-btn ps-btn--primary tutorial-primary-cta"
            onClick={() => handleGoToStep(progress.nextStep!.targetView)}
          >
            Sıradaki: {progress.nextStep.title}
          </button>
        ) : null}
      </footer>
    </section>
  );
}
