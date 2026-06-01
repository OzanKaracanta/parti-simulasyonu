import { useMemo } from 'react';
import type { GameState } from '../../../types/game';
import { NationalAgendaNewsCard } from './NationalAgendaNewsCard';
import { RegionalAgendaNewsCard } from './RegionalAgendaNewsCard';
import { buildWeeklyAgendaNewsSectionModel } from './weeklyAgendaNewsSelectors';
import './WeeklyAgendaNewsSection.css';

interface WeeklyAgendaNewsSectionProps {
  state: GameState;
  onOpenNationalAgenda: (agendaId: string) => void;
  onOpenRegionalAgenda: (agendaId: string, regionId: string) => void;
  onViewAllRegionalAgendas: () => void;
}

export function WeeklyAgendaNewsSection({
  state,
  onOpenNationalAgenda,
  onOpenRegionalAgenda,
  onViewAllRegionalAgendas,
}: WeeklyAgendaNewsSectionProps) {
  const model = useMemo(() => buildWeeklyAgendaNewsSectionModel(state), [state]);

  if (!model.national && model.regional.length === 0) {
    return null;
  }

  const regionalCount = model.regional.length;
  const rowClass =
    regionalCount === 0
      ? 'cols-national-only'
      : regionalCount === 1
        ? 'cols-one-regional'
        : 'cols-two-regional';

  return (
    <section className="weekly-agenda-news-section" aria-label="Bu haftanın gündemleri">
      <div className={`weekly-agenda-news-row ${rowClass}`}>
        {model.national ? (
          <NationalAgendaNewsCard
            model={model.national}
            onOpen={() => onOpenNationalAgenda(model.national!.agendaId)}
          />
        ) : null}

        {model.regional.map((regionalModel) => (
          <RegionalAgendaNewsCard
            key={regionalModel.agendaId}
            model={regionalModel}
            onOpen={() =>
              onOpenRegionalAgenda(regionalModel.agendaId, regionalModel.regionId)
            }
          />
        ))}

        {model.national && regionalCount === 0 ? (
          <div className="weekly-agenda-news-empty-slot" aria-hidden="true">
            <span>Bu hafta bölgesel gündem yok.</span>
          </div>
        ) : null}
      </div>

      {model.showViewAllRegional ? (
        <div className="weekly-agenda-news-footer">
          <button
            type="button"
            className="weekly-agenda-news-view-all"
            onClick={onViewAllRegionalAgendas}
          >
            Tüm bölgesel gündemleri gör
          </button>
        </div>
      ) : null}
    </section>
  );
}
