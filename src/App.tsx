import { useEffect, useReducer, useRef, useState } from 'react';
import { GameShell } from './components/layout/GameShell';
import { LaunchTransitionOverlay } from './components/layout/LaunchTransitionOverlay';
import {
  LAUNCH_OVERLAY_HOLD_MS,
  LAUNCH_OVERLAY_REVEAL_MS,
  LAUNCH_SETUP_EXIT_MS,
  type LaunchPhase,
} from './components/layout/launchTransition';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { FinalResultScreen } from './components/result/FinalResultScreen';
import { SetupScreen } from './components/setup/SetupScreen';
import { createSetupState } from './engine/setupEngine';
import { gameReducer } from './store/gameReducer';
import type { SetupChoices } from './types/game';
import './App.css';

interface LaunchState {
  choices: SetupChoices;
  phase: LaunchPhase;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createSetupState);
  const [launch, setLaunch] = useState<LaunchState | null>(null);
  const launchChoicesRef = useRef<SetupChoices | null>(null);

  function handleStartGame(choices: SetupChoices) {
    if (launch) return;
    launchChoicesRef.current = choices;
    setLaunch({ choices, phase: 'setup-exit' });
  }

  useEffect(() => {
    if (!launch) return;

    if (launch.phase === 'setup-exit') {
      const timer = window.setTimeout(() => {
        const choices = launchChoicesRef.current;
        if (!choices) return;
        dispatch({ type: 'START_GAME', choices });
        setLaunch({ choices, phase: 'held' });
      }, LAUNCH_SETUP_EXIT_MS);
      return () => window.clearTimeout(timer);
    }

    if (launch.phase === 'held') {
      const timer = window.setTimeout(() => {
        setLaunch((current) => (current ? { ...current, phase: 'reveal' } : null));
      }, LAUNCH_OVERLAY_HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (launch.phase === 'reveal') {
      const timer = window.setTimeout(() => {
        setLaunch(null);
        launchChoicesRef.current = null;
      }, LAUNCH_OVERLAY_REVEAL_MS);
      return () => window.clearTimeout(timer);
    }
  }, [launch, dispatch]);

  const isLaunching = launch !== null;
  const showSetup = state.status === 'setup';
  const showDashboard = state.status === 'playing';
  const showOverlay = launch?.phase === 'held' || launch?.phase === 'reveal';

  if (state.status === 'finished') {
    return (
      <GameShell variant="result">
        <FinalResultScreen state={state} onRestart={() => dispatch({ type: 'RESET_GAME' })} />
      </GameShell>
    );
  }

  return (
    <>
      {showSetup ? (
        <GameShell
          variant="setup"
          className={launch?.phase === 'setup-exit' ? 'is-launch-exit' : ''}
        >
          <SetupScreen onStart={handleStartGame} isLaunching={isLaunching} />
        </GameShell>
      ) : null}

      {showDashboard ? (
        <GameShell variant="dashboard" className={isLaunching ? 'is-launch-enter' : ''}>
          <DashboardScreen state={state} dispatch={dispatch} />
        </GameShell>
      ) : null}

      {showOverlay && launch ? (
        <LaunchTransitionOverlay
          choices={launch.choices}
          phase={launch.phase === 'reveal' ? 'reveal' : 'held'}
        />
      ) : null}
    </>
  );
}
