import {
  policyTopicLabels,
  weeklyEventTypeLabels,
} from '../../data/labels';
import type { SubAgendaItem, SubAgendaSelection } from '../../types/game';
import { AgendaSegmentImpact } from './agenda/AgendaSegmentImpact';
import { ReactionAxisBadge } from './agenda/ReactionAxisBadge';
import { SubAgendaResponseOption } from './SubAgendaResponseOption';
import './SubAgendaPanel.css';

interface SubAgendaCardProps {
  agenda: SubAgendaItem;
  selection: SubAgendaSelection | undefined;
  cardLocked: boolean;
  onSelectResponse: (responseId: string) => void;
  onClearResponse: () => void;
}

export function SubAgendaCard({
  agenda,
  selection,
  cardLocked,
  onSelectResponse,
  onClearResponse,
}: SubAgendaCardProps) {
  const isActive = Boolean(selection);

  return (
    <article
      className={`sub-agenda-card type-${agenda.type} ${isActive ? 'is-active' : ''} ${cardLocked ? 'is-locked' : ''}`}
    >
      <header className="sub-agenda-card-top">
        <div className="sub-agenda-card-top-row">
          <div className="sub-agenda-card-badges">
            <span className={`sub-agenda-type-pill ${agenda.type}`}>
              {weeklyEventTypeLabels[agenda.type]}
            </span>
            <ReactionAxisBadge axis={agenda.reactionAxis} compact />
            <span className="sub-agenda-topic-pill">
              {policyTopicLabels[agenda.policyTopic]}
            </span>
          </div>
          <span className={`sub-agenda-status ${isActive ? 'answered' : cardLocked ? 'locked' : 'open'}`}>
            {isActive ? 'Mesaj seçildi' : cardLocked ? 'Slot dolu' : 'Boş'}
          </span>
        </div>

        <h4 className="sub-agenda-card-title">{agenda.title}</h4>
        <p className="sub-agenda-card-desc">{agenda.description}</p>

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

      {cardLocked ? (
        <p className="sub-agenda-locked-msg">
          Mesaj slotu doldu. Başka bir karttaki seçimi kaldır veya değiştir.
        </p>
      ) : (
        <div
          className="sub-agenda-responses"
          role="radiogroup"
          aria-label={`${agenda.title} mesaj seçenekleri`}
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
        <footer className="sub-agenda-card-footer">
          <button type="button" className="sub-agenda-card-clear" onClick={onClearResponse}>
            Seçimi kaldır
          </button>
        </footer>
      ) : null}
    </article>
  );
}
