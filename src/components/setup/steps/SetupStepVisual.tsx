import { colorOptions, symbolOptions } from '../../../data/setupOptions';
import { PartySymbolIcon } from '../PartySymbolIcon';
import { SetupSelectionDetail } from '../SetupSelectionDetail';
import type { SetupFormState } from '../setupWizard';

interface SetupStepVisualProps {
  form: SetupFormState;
  onChange: (patch: Partial<SetupFormState>) => void;
}

export function SetupStepVisual({ form, onChange }: SetupStepVisualProps) {
  const selectedColor = colorOptions.find((item) => item.id === form.colorId);
  const selectedSymbol = symbolOptions.find((item) => item.id === form.symbolId);

  return (
    <div className="setup-step setup-step--compact">
      <section className="setup-panel setup-panel--compact">
        <div className="setup-compact-block">
          <h3 className="setup-compact-label">Parti rengi</h3>
          <div className="setup-color-row" role="radiogroup" aria-label="Parti rengi">
            {colorOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                role="radio"
                aria-checked={form.colorId === option.id}
                className={
                  form.colorId === option.id ? 'setup-color-chip selected' : 'setup-color-chip'
                }
                onClick={() => onChange({ colorId: option.id })}
              >
                <span className="setup-color-chip__swatch" style={{ background: option.hex }} />
                <span className="setup-color-chip__name">{option.name}</span>
              </button>
            ))}
          </div>
          {selectedColor ? (
            <SetupSelectionDetail>{selectedColor.effectSummary}</SetupSelectionDetail>
          ) : null}
        </div>

        <div className="setup-compact-block">
          <h3 className="setup-compact-label">Parti sembolü</h3>
          <div className="setup-symbol-row" role="radiogroup" aria-label="Parti sembolü">
            {symbolOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                role="radio"
                aria-checked={form.symbolId === option.id}
                className={
                  form.symbolId === option.id
                    ? 'setup-symbol-chip selected'
                    : 'setup-symbol-chip'
                }
                onClick={() => onChange({ symbolId: option.id })}
                title={option.name}
              >
                <PartySymbolIcon symbolId={option.id} size={22} />
                <span className="setup-symbol-chip__name">{option.name}</span>
              </button>
            ))}
          </div>
          {selectedSymbol ? (
            <SetupSelectionDetail>{selectedSymbol.bonusSummary}</SetupSelectionDetail>
          ) : null}
        </div>
      </section>
    </div>
  );
}
