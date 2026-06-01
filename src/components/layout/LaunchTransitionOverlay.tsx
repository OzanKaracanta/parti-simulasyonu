import type { CSSProperties } from 'react';
import { getRegionById } from '../../data/regions';
import { colorOptions, symbolOptions } from '../../data/setupOptions';
import type { SetupChoices } from '../../types/game';
import { PartySymbolIcon } from '../setup/PartySymbolIcon';
import { LAUNCH_OVERLAY_REVEAL_MS, type LaunchPhase } from './launchTransition';
import './LaunchTransitionOverlay.css';

interface LaunchTransitionOverlayProps {
  choices: SetupChoices;
  phase: Extract<LaunchPhase, 'held' | 'reveal'>;
}

export function LaunchTransitionOverlay({ choices, phase }: LaunchTransitionOverlayProps) {
  const color = colorOptions.find((item) => item.id === choices.colorId);
  const symbol = symbolOptions.find((item) => item.id === choices.symbolId);
  const region = getRegionById(choices.regionId);

  const style = {
    '--launch-reveal-duration': `${LAUNCH_OVERLAY_REVEAL_MS}ms`,
    ...(color ? { '--launch-party-color': color.hex } : {}),
  } as CSSProperties;

  return (
    <div
      className={[
        'launch-overlay',
        phase === 'held' ? 'launch-overlay--in' : '',
        phase === 'reveal' ? 'launch-overlay--out' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy={phase === 'held'}
    >
      <div className="launch-overlay__glow" aria-hidden />
      <div className="launch-overlay__content">
        <div className="launch-overlay__emblem">
          {symbol ? <PartySymbolIcon symbolId={symbol.id} size={40} /> : null}
        </div>
        <p className="launch-overlay__eyebrow">Kampanya başlıyor</p>
        <h2 className="launch-overlay__party">{choices.partyName}</h2>
        <p className="launch-overlay__meta">
          {choices.leaderName} · {region.name}
        </p>
        <div className="launch-overlay__progress" aria-hidden>
          <span className="launch-overlay__progress-bar" />
        </div>
        <p className="launch-overlay__caption">52 haftalık seçim yolculuğu</p>
      </div>
    </div>
  );
}
