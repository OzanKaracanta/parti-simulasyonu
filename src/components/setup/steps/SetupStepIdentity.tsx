import { getRegionById, regionDefinitions } from '../../../data/regions';
import { colorOptions, partyNameOptions } from '../../../data/setupOptions';
import type { SetupChoices } from '../../../types/game';
import { SetupRegionMap } from '../SetupRegionMap';
import type { SetupFormState } from '../setupWizard';

interface SetupStepIdentityProps {
  form: SetupFormState;
  onChange: (patch: Partial<SetupFormState>) => void;
}

export function SetupStepIdentity({ form, onChange }: SetupStepIdentityProps) {
  const selectedRegion = getRegionById(form.regionId);
  const accentColor = colorOptions.find((item) => item.id === form.colorId)?.hex;

  return (
    <div className="setup-step setup-step--identity">
      <section className="setup-panel">
        <h2>Parti bilgileri</h2>
        <div className="setup-field">
          <label htmlFor="party-name">Parti adı</label>
          <select
            id="party-name"
            value={form.partyName}
            onChange={(event) => onChange({ partyName: event.target.value })}
          >
            {partyNameOptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="setup-field">
          <label htmlFor="leader-name">Lider adı</label>
          <input
            id="leader-name"
            type="text"
            placeholder="Örn: Ayşe Yılmaz"
            value={form.leaderName}
            onChange={(event) => onChange({ leaderName: event.target.value })}
            autoComplete="name"
          />
        </div>
      </section>

      <section className="setup-panel setup-panel--full">
        <h2>Başlangıç bölgesi</h2>
        <p className="setup-panel__lead">
          Bölge, başlangıç metriklerini ve yerel rekabet zorluğunu belirler.
        </p>

        <div className="setup-region-picker">
          <SetupRegionMap
            selectedRegionId={form.regionId}
            accentColor={accentColor}
            onSelectRegion={(regionId) =>
              onChange({ regionId: regionId as SetupChoices['regionId'] })
            }
          />

          <div className="setup-region-picker__side">
            <div className="setup-region-pills" role="group" aria-label="Bölge kısayolları">
              {regionDefinitions.map((region) => (
                <button
                  type="button"
                  key={region.id}
                  className={
                    form.regionId === region.id ? 'setup-region-pill selected' : 'setup-region-pill'
                  }
                  onClick={() =>
                    onChange({ regionId: region.id as SetupChoices['regionId'] })
                  }
                >
                  {region.name}
                </button>
              ))}
            </div>

            <div className="region-detail-panel">
              <div className="region-detail-panel__head">
                <strong>{selectedRegion.name}</strong>
                <div className="region-tags">
                  <span className="region-tag">Zorluk: {selectedRegion.difficulty}</span>
                  <span className="region-tag region-tag--muted">
                    Potansiyel: {selectedRegion.potential}
                  </span>
                </div>
              </div>
              <p className="region-detail-panel__style">{selectedRegion.playStyle}</p>
              <p>
                <span className="region-card__label">Avantaj</span> {selectedRegion.advantage}
              </p>
              <p>
                <span className="region-card__label">Zorluk</span> {selectedRegion.challenge}
              </p>
              <p className="region-detail-panel__risk">
                <span className="region-card__label">Risk</span> {selectedRegion.risk}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
