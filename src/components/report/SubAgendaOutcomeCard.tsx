import type { SubAgendaWeekOutcome } from '../../types/game';
import './SubAgendaOutcomeCard.css';

const MAX_VISIBLE_REACTIONS = 3;

interface SubAgendaOutcomeCardProps {
  outcome: SubAgendaWeekOutcome;
}

export function SubAgendaOutcomeCard({ outcome }: SubAgendaOutcomeCardProps) {
  const visibleReactions = outcome.segmentReactions.slice(0, MAX_VISIBLE_REACTIONS);
  const hiddenCount = outcome.segmentReactions.length - visibleReactions.length;

  return (
    <article className="report-sub-outcome-card">
      <header className="report-sub-outcome-header">
        <h4 className="report-sub-outcome-title">{outcome.title}</h4>
        <span className="report-sub-outcome-response">{outcome.responseLabel}</span>
      </header>

      <p className="report-sub-outcome-text">
        <strong>{outcome.outcomeTitle}</strong>
        <span className="report-sub-outcome-text-desc"> — {outcome.outcomeDescription}</span>
      </p>

      {visibleReactions.length > 0 ? (
        <ul className="report-sub-outcome-reactions">
          {visibleReactions.map((reaction) => (
            <li
              key={reaction.segmentId}
              className={
                reaction.delta > 0 ? 'positive' : reaction.delta < 0 ? 'negative' : ''
              }
            >
              <span className="report-sub-outcome-arrow" aria-hidden>
                {reaction.delta > 0 ? '▲' : reaction.delta < 0 ? '▼' : '·'}
              </span>
              {reaction.message}
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className="report-sub-outcome-more">+{hiddenCount} tepki daha</li>
          ) : null}
        </ul>
      ) : null}

      {outcome.politicalSegmentReactions && outcome.politicalSegmentReactions.length > 0 ? (
        <ul className="report-sub-outcome-reactions political-reactions">
          {outcome.politicalSegmentReactions.map((reaction) => (
            <li
              key={reaction.segmentId}
              className={
                reaction.delta > 0 ? 'positive' : reaction.delta < 0 ? 'negative' : ''
              }
            >
              <span className="report-sub-outcome-arrow" aria-hidden>
                {reaction.delta > 0 ? '▲' : reaction.delta < 0 ? '▼' : '·'}
              </span>
              {reaction.message}
            </li>
          ))}
        </ul>
      ) : null}

      {outcome.politicalReactionText ? (
        <p className="report-sub-outcome-political">{outcome.politicalReactionText}</p>
      ) : null}

      {(outcome.crossRuleNote || outcome.energyCost > 0) && (
        <footer className="report-sub-outcome-footer">
          {outcome.crossRuleNote ? (
            <span className="report-sub-outcome-note">{outcome.crossRuleNote}</span>
          ) : null}
          {outcome.energyCost > 0 ? (
            <span className="report-sub-outcome-energy">−{outcome.energyCost} enerji</span>
          ) : null}
        </footer>
      )}
    </article>
  );
}
