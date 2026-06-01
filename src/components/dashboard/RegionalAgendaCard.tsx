import { getRegionById } from '../../data/regions';
import {
  policyTopicLabels,
  weeklyEventTypeLabels,
} from '../../data/labels';
import {
  canSelectRegionalAgendaResponse,
  getAgendaEnergyDisabledReason,
  getProjectedAgendaEnergySpend,
} from '../../engine/agendaEnergyEngine';
import type { GameState, RegionalAgendaItem, SubAgendaSelection } from '../../types/game';
import { AgendaSegmentImpact } from './agenda/AgendaSegmentImpact';
import { ReactionAxisBadge } from './agenda/ReactionAxisBadge';
import { SubAgendaResponseOption } from './SubAgendaResponseOption';
import { getAgendaFocusElementId } from './overview/agendaFocusScroll';
import './RegionalAgendaPanel.css';
import './SubAgendaPanel.css';

interface RegionalAgendaCardProps {
  state: GameState;
  agenda: RegionalAgendaItem;
  selection: SubAgendaSelection | undefined;
  cardLocked: boolean;
  accessReason: string | null;
  onSelectResponse: (responseId: string) => void;
  onClearResponse: () => void;
}

export function RegionalAgendaCard({
  state,
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
      id={getAgendaFocusElementId(agenda.id)}
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
            const canAfford =
              isSelected || canSelectRegionalAgendaResponse(state, agenda.id, option.id);
            const existingCost = selection
              ? agenda.responseOptions.find((item) => item.id === selection.responseId)?.energyCost ?? 0
              : 0;
            const projected = getProjectedAgendaEnergySpend(
              state,
              existingCost,
              option.energyCost,
            );
            const disabledReason = canAfford
              ? null
              : getAgendaEnergyDisabledReason(
                  state,
                  option.energyCost - existingCost,
                  projected,
                );

            return (
              <SubAgendaResponseOption
                key={option.id}
                option={option}
                selected={isSelected}
                disabled={!canAfford}
                disabledReason={disabledReason}
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
