import type { KeyboardEvent, MouseEvent } from 'react';
import { resolveAgendaNewsImageUrl } from './agendaNewsImages';
import type { RegionalAgendaNewsCardModel } from './weeklyAgendaNewsTypes';
import './WeeklyAgendaNewsSection.css';

interface RegionalAgendaNewsCardProps {
  model: RegionalAgendaNewsCardModel;
  onOpen: () => void;
}

function activateCard(
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  onOpen: () => void,
) {
  const target = event.target as HTMLElement;
  if (target.closest('.agenda-news-card-cta')) return;
  onOpen();
}

export function RegionalAgendaNewsCard({ model, onOpen }: RegionalAgendaNewsCardProps) {
  const imageSrc = resolveAgendaNewsImageUrl(model.imageUrl, 'regional');

  return (
    <article
      className={`agenda-news-card agenda-news-card--regional agenda-news-card--horizontal status-${model.responseStatus}`}
      role="button"
      tabIndex={0}
      onClick={(event) => activateCard(event, onOpen)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Bölgesel gündem — ${model.regionName}: ${model.title}`}
    >
      <div className="agenda-news-card-thumb agenda-news-card-thumb--regional">
        <img
          className="agenda-news-card-image"
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
      </div>

      <div className="agenda-news-card-content">
        <p className="agenda-news-card-region">{model.regionName}</p>
        <h3 className="agenda-news-card-title">{model.title}</h3>
        {model.accessWarning ? (
          <p className="agenda-news-card-hint">{model.accessWarning}</p>
        ) : null}
        <button
          type="button"
          className="agenda-news-card-cta agenda-news-card-cta--link"
          onClick={onOpen}
        >
          {model.ctaLabel}
        </button>
      </div>
    </article>
  );
}
