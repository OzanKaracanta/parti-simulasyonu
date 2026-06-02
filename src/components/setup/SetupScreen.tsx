/** Oyun başlangıç ekranı — 3 adımlı parti kurulum sihirbazı */

import { useState } from 'react';
import { partyNameOptions } from '../../data/setupOptions';
import type { SetupChoices } from '../../types/game';
import { Button } from '../ui/Button';
import { SetupPartyPreview } from './SetupPartyPreview';
import { SetupStepIndicator } from './SetupStepIndicator';
import {
  SETUP_STEP_SUBTITLES,
  canAdvanceFromStep,
  formToChoices,
  isStep1Valid,
  type SetupFormState,
  type SetupStepId,
} from './setupWizard';
import { SetupStepIdentity } from './steps/SetupStepIdentity';
import { SetupStepStrategy } from './steps/SetupStepStrategy';
import { SetupStepVisual } from './steps/SetupStepVisual';
import './SetupPartyPreview.css';
import './SetupScreen.css';
import './SetupStepIndicator.css';

interface SetupScreenProps {
  onStart: (choices: SetupChoices) => void;
  isLaunching?: boolean;
}

type StepDirection = 'forward' | 'back';

const INITIAL_FORM: SetupFormState = {
  partyName: partyNameOptions[1]?.name ?? '',
  leaderName: '',
  regionId: 'ege',
  colorId: 'blue',
  symbolId: 'sun',
  ideologyId: 'centrist-reform',
  leadershipStyleId: 'charismatic',
};

export function SetupScreen({ onStart, isLaunching = false }: SetupScreenProps) {
  const [step, setStep] = useState<SetupStepId>(1);
  const [stepDirection, setStepDirection] = useState<StepDirection>('forward');
  const [maxReachableStep, setMaxReachableStep] = useState<SetupStepId>(1);
  const [form, setForm] = useState<SetupFormState>(INITIAL_FORM);
  const [error, setError] = useState('');

  function updateForm(patch: Partial<SetupFormState>) {
    setForm((current) => {
      const next = { ...current, ...patch };
      if (isStep1Valid(next) && maxReachableStep < 2) {
        setMaxReachableStep(2);
      }
      return next;
    });
    setError('');
  }

  function goToStep(target: SetupStepId) {
    if (target > maxReachableStep) return;
    if (target > step && !canAdvanceFromStep(step, form)) {
      setError('Parti adı ve lider adı (en az 2 karakter) zorunludur.');
      return;
    }
    setError('');
    setStepDirection(target > step ? 'forward' : 'back');
    setStep(target);
  }

  function handleNext() {
    if (!canAdvanceFromStep(step, form)) {
      setError('Parti adı ve lider adı (en az 2 karakter) zorunludur.');
      return;
    }

    setError('');
    if (step < 3) {
      const nextStep = (step + 1) as SetupStepId;
      setStepDirection('forward');
      setStep(nextStep);
      setMaxReachableStep((current) => (nextStep > current ? nextStep : current));
      return;
    }

    onStart(formToChoices(form));
  }

  function handleBack() {
    setError('');
    if (step > 1) {
      setStepDirection('back');
      setStep((step - 1) as SetupStepId);
    }
  }

  return (
    <div className={isLaunching ? 'setup-screen setup-screen--launching' : 'setup-screen'}>
      <header className="setup-header">
        <h1>Parti Kur</h1>
        <p>{SETUP_STEP_SUBTITLES[step]}</p>
      </header>

      <SetupStepIndicator
        currentStep={step}
        maxReachableStep={maxReachableStep}
        onStepClick={isLaunching ? () => {} : goToStep}
      />

      <div className="setup-body">
        <div className="setup-main">
          <div
            key={step}
            className={`setup-step-view setup-step-view--${stepDirection}`}
          >
            {step === 1 ? <SetupStepIdentity form={form} onChange={updateForm} /> : null}
            {step === 2 ? <SetupStepVisual form={form} onChange={updateForm} /> : null}
            {step === 3 ? <SetupStepStrategy form={form} onChange={updateForm} /> : null}
          </div>

          {error ? (
            <p className="setup-error" role="alert">
              {error}
            </p>
          ) : null}

          {step > 1 ? (
            <footer className="setup-footer">
              <Button variant="ghost" onClick={handleBack} disabled={isLaunching}>
                Geri
              </Button>
            </footer>
          ) : null}
        </div>

        <aside className="setup-aside" aria-label="Önizleme ve ilerleme">
          <SetupPartyPreview form={form} step={step} />
          <footer className="setup-aside__footer">
            <Button
              variant={step === 3 ? 'success' : 'primary'}
              onClick={handleNext}
              disabled={isLaunching || (step === 1 && !isStep1Valid(form))}
              block
            >
              {step === 3 ? 'Kampanyaya Başla' : 'İleri'}
            </Button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
