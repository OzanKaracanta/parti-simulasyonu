import type { CSSProperties } from 'react';
import { getRegionById } from '../../data/regions';
import {
  colorOptions,
  ideologyOptions,
  leadershipOptions,
  symbolOptions,
} from '../../data/setupOptions';
import { PartySymbolIcon } from './PartySymbolIcon';
import type { SetupFormState, SetupStepId } from './setupWizard';
import './SetupPartyPreview.css';

interface SetupPartyPreviewProps {
  form: SetupFormState;
  step: SetupStepId;
}

export function SetupPartyPreview({ form, step }: SetupPartyPreviewProps) {
  const region = getRegionById(form.regionId);
  const color = colorOptions.find((item) => item.id === form.colorId);
  const symbol = symbolOptions.find((item) => item.id === form.symbolId);
  const ideology = ideologyOptions.find((item) => item.id === form.ideologyId);
  const leadership = leadershipOptions.find((item) => item.id === form.leadershipStyleId);

  const partyLabel = form.partyName.trim() || 'Parti Adı';
  const leaderLabel = form.leaderName.trim() || 'Lider Adı';

  const stepHint =
    step === 2 && color && symbol
      ? `${color.effectSummary} · ${symbol.bonusSummary}`
      : step === 3 && ideology && leadership
        ? `${ideology.playStyle} · ${leadership.bonusSummary}`
        : 'Seçimlerin kampanya başlangıç metriklerini ve oyun tarzını etkiler.';

  return (
    <aside className="setup-preview" aria-label="Parti önizlemesi">
      <p className="setup-preview__eyebrow">Önizleme</p>
      <div
        className="setup-preview__card"
        style={
          color
            ? ({ '--setup-party-color': color.hex } as CSSProperties)
            : undefined
        }
      >
        <div className="setup-preview__banner" />
        <div className="setup-preview__body">
          <div className="setup-preview__emblem">
            {symbol ? (
              <PartySymbolIcon symbolId={symbol.id} size={32} className="setup-preview__symbol-icon" />
            ) : (
              <span className="setup-preview__symbol">—</span>
            )}
          </div>
          <div className="setup-preview__info">
            <h3 className="setup-preview__name">{partyLabel}</h3>
            <p className="setup-preview__leader">{leaderLabel}</p>
            <p className="setup-preview__region">{region.name} bölgesi</p>
          </div>
        </div>
        <ul className="setup-preview__tags">
          {color ? <li>{color.name}</li> : null}
          {symbol ? <li>{symbol.name}</li> : null}
          {step >= 3 && ideology ? <li>{ideology.name}</li> : null}
          {step >= 3 && leadership ? <li>{leadership.name}</li> : null}
        </ul>
      </div>
      <p className="setup-preview__hint">{stepHint}</p>
    </aside>
  );
}
