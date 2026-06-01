import { getRegionById } from '../../data/regions';
import {
  policyTopicLabels,
  weeklyEventTypeLabels,
} from '../../data/labels';
import type { RegionalAgendaItem, SubAgendaSelection } from '../../types/game';
import { AgendaSegmentImpact } from './agenda/AgendaSegmentImpact';
import { ReactionAxisBadge } from './agenda/ReactionAxisBadge';
import { SubAgendaResponseOption } from './SubAgendaResponseOption';
import './RegionalAgendaPanel.css';
import './SubAgendaPanel.css';

interface RegionalAgendaCardProps {
  agenda: RegionalAgendaItem;
  selection: SubAgendaSelection | undefined;
  cardLocked: boolean;
  accessReason: string | null;
  onSelectResponse: (responseId: string) => void;
  onClearResponse: () => void;
}

export function RegionalAgendaCard({
  agenda,
  selection,
  cardLocked,
  accessReason,
  onSelectResponse,
  onClearResponse,
}: RegionalAgendaCardProps) {
  const regionName = getRegionById(agenda.regionId).name;
  const isActive = Boolean(selection);
  const selectedOption = agenda.responseOptions.find(
    (option) => option.id === selection?.responseId,
  );

  const statusLabel = !accessReason
    ? isActive
      ? 'Mesaj seçildi'
      : cardLocked
        ? 'Slot dolu'
        : 'Boş'
    : 'Kilitli';

  const statusClass = !accessReason
    ? isActive
      ? 'answered'
      : cardLocked
        ? 'locked'
        : 'open'
    : 'locked';

  return (
    <article
      className={`regional-agenda-card-module type-${agenda.type} ${isActive ? 'is-active' : ''} ${cardLocked || accessReason ? 'is-locked' : ''}`}
    >
      <header className="regional-agenda-card-top">
        <div className="regional-agenda-card-top-row">
          <div className="regional-agenda-card-badges">
            <span className="regional-agenda-region-pill">{regionName}</span>
            <span className={`regional-agenda-type-pill ${agenda.type}`}>
              {weeklyEventTypeLabels[agenda.type]}
            </span>
            <ReactionAxisBadge axis={agenda.reactionAxis} compact />
            <span className="regional-agenda-topic-pill">
              {policyTopicLabels[agenda.policyTopic]}
            </span>
          </div>
          <span className={`regional-agenda-status ${statusClass}`}>{statusLabel}</span>
        </div>

        <h4 className="regional-agenda-card-title">{agenda.title}</h4>
        <p className="regional-agenda-card-desc">{agenda.description}</p>

        {agenda.storyHint ? (
          <p className="regional-agenda-story-hint">{agenda.storyHint}</p>
        ) : null}

        <AgendaSegmentImpact
          reactionAxis={agenda.reactionAxis}
          primarySegments={agenda.primarySegments}
          tensionSegments={agenda.tensionSegments}
          primaryPoliticalSegments={agenda.primaryPoliticalSegments}
          tensionPoliticalSegments={agenda.tensionPoliticalSegments}
          tensionRationale={agenda.tensionRationale}
          politicalRationale={agenda.politicalRationale}
          variant="sub"
        />
      </header>

      {isActive && selectedOption ? (
        <div className="regional-agenda-selected-banner">
          <span className="regional-agenda-selected-label">Seçilen mesaj</span>
          <strong>{selectedOption.label}</strong>
        </div>
      ) : null}

      {accessReason ? (
        <p className="regional-agenda-access-lock">{accessReason}</p>
      ) : cardLocked ? (
        <p className="regional-agenda-locked-msg">
          Bölgesel mesaj slotu doldu. Başka bir bölgedeki seçimi kaldır veya değiştir.
        </p>
      ) : (
        <div
          className="regional-agenda-responses"
          role="radiogroup"
          aria-label={`${regionName} — ${agenda.title} mesaj seçenekleri`}
        >
          {agenda.responseOptions.map((option) => {
            const isSelected = selection?.responseId === option.id;

            return (
              <SubAgendaResponseOption
                key={option.id}
                option={option}
                selected={isSelected}
                onSelect={() => {
                  if (isSelected) {
                    onClearResponse();
                  } else {
                    onSelectResponse(option.id);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {selection ? (
        <footer className="regional-agenda-card-footer">
          <button type="button" className="regional-agenda-card-clear" onClick={onClearResponse}>
            Seçimi kaldır
          </button>
        </footer>
      ) : null}
    </article>
  );
}
