import { getRegionById } from '../../data/regions';
import type { GameState } from '../../types/game';
import './RegionalAgendaPanel.css';
import './agenda/weeklyAgenda.css';

interface RegionalAgendaSummaryAsideProps {
  state: GameState;
  slotsUsed: number;
  maxSlots: number;
}

export function RegionalAgendaSummaryAside({
  state,
  slotsUsed,
  maxSlots,
}: RegionalAgendaSummaryAsideProps) {
  const selections = state.selectedRegionalAgendaSelections;

  return (
    <aside className="regional-agenda-page-aside">
      <section className="agenda-outcome-panel regional-agenda-aside-panel">
        <h5 className="agenda-section-title">Mesaj slotu</h5>
        <p className="regional-agenda-aside-slots">
          <strong>{slotsUsed}</strong> / {maxSlots} kullanıldı
        </p>
        <p className="agenda-outcome-empty regional-agenda-aside-note">
          İsteğe bağlı — yanıt vermezsen rakipler yerel gündemi sahiplenebilir.
        </p>
      </section>

      <section className="agenda-outcome-panel regional-agenda-aside-panel">
        <h5 className="agenda-section-title">Kayıtlı mesajlar</h5>
        {selections.length === 0 ? (
          <p className="agenda-outcome-empty">Henüz bölgesel mesaj seçilmedi.</p>
        ) : (
          <ul className="regional-agenda-aside-list">
            {selections.map((selection) => {
              const agenda = state.regionalAgendas.find((item) => item.id === selection.agendaId);
              if (!agenda) return null;
              const option = agenda.responseOptions.find((item) => item.id === selection.responseId);
              const regionName = getRegionById(agenda.regionId).name;

              return (
                <li key={selection.agendaId}>
                  <span className="regional-agenda-aside-region">{regionName}</span>
                  <span className="regional-agenda-aside-label">{option?.label ?? 'Mesaj'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
