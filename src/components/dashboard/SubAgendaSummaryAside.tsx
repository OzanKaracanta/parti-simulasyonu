import { SUB_AGENDA_MAX_SLOTS } from '../../data/subAgendaConfig';
import type { GameState } from '../../types/game';
import './SubAgendaPanel.css';
import './agenda/weeklyAgenda.css';

interface SubAgendaSummaryAsideProps {
  state: GameState;
  slotsUsed: number;
  maxSlots: number;
  bonusSlots: number;
}

export function SubAgendaSummaryAside({
  state,
  slotsUsed,
  maxSlots,
  bonusSlots,
}: SubAgendaSummaryAsideProps) {
  const selections = state.selectedSubAgendaSelections;

  return (
    <aside className="sub-agenda-page-aside">
      <section className="agenda-outcome-panel sub-agenda-aside-panel">
        <h5 className="agenda-section-title">Mesaj slotu</h5>
        <p className="sub-agenda-aside-slots">
          <strong>{slotsUsed}</strong> / {maxSlots} kullanıldı
        </p>
        {bonusSlots > 0 ? (
          <p className="sub-agenda-aside-bonus">+{bonusSlots} radar bonusu dahil</p>
        ) : null}
        <p className="agenda-outcome-empty sub-agenda-aside-note">
          İsteğe bağlı — seçmezsen alt gündemlerde hedef kitlelerde hafif kayıp oluşur.
        </p>
      </section>

      <section className="agenda-outcome-panel sub-agenda-aside-panel">
        <h5 className="agenda-section-title">Kayıtlı mesajlar</h5>
        {selections.length === 0 ? (
          <p className="agenda-outcome-empty">Henüz alt gündem mesajı seçilmedi.</p>
        ) : (
          <ul className="sub-agenda-aside-list">
            {selections.map((selection) => {
              const agenda = state.subAgendas.find((item) => item.id === selection.agendaId);
              if (!agenda) return null;
              const option = agenda.responseOptions.find((item) => item.id === selection.responseId);

              return (
                <li key={selection.agendaId}>
                  <span className="sub-agenda-aside-topic">{agenda.title}</span>
                  <span className="sub-agenda-aside-label">{option?.label ?? 'Mesaj'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="agenda-outcome-panel sub-agenda-aside-panel">
        <h5 className="agenda-section-title">Enerji notu</h5>
        <p className="agenda-outcome-empty sub-agenda-aside-note">
          Temel {SUB_AGENDA_MAX_SLOTS} slot
          {bonusSlots > 0 ? ` + ${bonusSlots} bonus` : ''}. Her mesaj seçildiğinde enerji hemen
          düşer; sert mesajlar medyada gürültü yaratabilir.
        </p>
      </section>
    </aside>
  );
}
