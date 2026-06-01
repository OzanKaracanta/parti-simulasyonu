import type { KeyboardEvent, MouseEvent } from 'react';
import { resolveAgendaNewsImageUrl } from './agendaNewsImages';
import type { NationalAgendaNewsCardModel } from './weeklyAgendaNewsTypes';
import './WeeklyAgendaNewsSection.css';

interface NationalAgendaNewsCardProps {
  model: NationalAgendaNewsCardModel;
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

export function NationalAgendaNewsCard({ model, onOpen }: NationalAgendaNewsCardProps) {
  const imageSrc = resolveAgendaNewsImageUrl(model.imageUrl, 'national');
  const isBreaking = model.headlineBadge === 'SON DAKİKA';

  return (
    <article
      className={`agenda-news-card agenda-news-card--national agenda-news-card--horizontal signal-${model.signalTone} status-${model.responseStatus}`}
      role="button"
      tabIndex={0}
      onClick={(event) => activateCard(event, onOpen)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${model.headlineBadge}: ${model.title}`}
    >
      <div
        className={`agenda-news-card-thumb${isBreaking ? ' agenda-news-card-thumb--breaking' : ' agenda-news-card-thumb--national'}`}
      >
        <img
          className="agenda-news-card-image"
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
        {isBreaking ? (
          <span className="agenda-news-card-thumb-label">{model.headlineBadge}</span>
        ) : null}
      </div>

      <div className="agenda-news-card-content">
        {!isBreaking ? (
          <p className="agenda-news-card-kicker">{model.headlineBadge}</p>
        ) : null}
        <h3 className="agenda-news-card-title">{model.title}</h3>
        {model.summary ? (
          <p className="agenda-news-card-summary">{model.summary}</p>
        ) : null}
        <button
          type="button"
          className="agenda-news-card-cta"
          onClick={onOpen}
        >
          {model.ctaLabel}
        </button>
      </div>
    </article>
  );
}
