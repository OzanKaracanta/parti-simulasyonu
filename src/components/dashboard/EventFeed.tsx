import type { OpinionEchoItem, WeeklyHistoryItem } from '../../types/game';
import { weeklyEventTypeLabels } from '../../data/labels';
import './dashboard.css';

interface EventFeedProps {
  history: WeeklyHistoryItem[];
  opinionFeed: OpinionEchoItem[];
  currentEventTitle: string | null;
}

function eventDotClass(type: WeeklyHistoryItem['eventType']): string {
  if (type === 'crisis') return 'feed-dot crisis';
  if (type === 'opportunity') return 'feed-dot opportunity';
  if (type === 'agenda') return 'feed-dot agenda';
  return 'feed-dot neutral';
}

function opinionDotClass(tone: OpinionEchoItem['tone']): string {
  return `feed-dot opinion-${tone}`;
}

export function EventFeed({ history, opinionFeed, currentEventTitle }: EventFeedProps) {
  const historyItems = [...history].reverse().slice(0, 6);
  const opinionItems = [...opinionFeed].reverse().slice(0, 4);

  return (
    <footer className="event-feed">
      <div className="event-feed-header">
        <span className="event-feed-title">Olay Akışı</span>
        {currentEventTitle ? (
          <span className="event-feed-live">
            <span className="feed-dot live" /> Aktif: {currentEventTitle}
          </span>
        ) : null}
      </div>
      <div className="event-feed-scroll">
        {opinionItems.length > 0 ? (
          <>
            {opinionItems.map((item) => (
              <div className="event-feed-item opinion" key={item.id}>
                <span className={opinionDotClass(item.tone)} />
                <span className="event-feed-week">H{item.week}</span>
                <span className="event-feed-text">
                  <span className="event-feed-type">Yankı</span>
                  {item.headline}: {item.body}
                </span>
              </div>
            ))}
          </>
        ) : null}

        {historyItems.length === 0 && opinionItems.length === 0 ? (
          <span className="event-feed-empty">Henüz olay kaydı yok.</span>
        ) : (
          historyItems.map((item) => (
            <div className="event-feed-item" key={item.week}>
              <span className={eventDotClass(item.eventType)} />
              <span className="event-feed-week">H{item.week}</span>
              <span className="event-feed-text">
                {item.eventType ? (
                  <span className="event-feed-type">{weeklyEventTypeLabels[item.eventType]}</span>
                ) : null}
                {item.summary}
              </span>
              <span
                className={
                  item.supportChange > 0
                    ? 'event-feed-delta positive'
                    : item.supportChange < 0
                      ? 'event-feed-delta negative'
                      : 'event-feed-delta'
                }
              >
                {item.supportChange > 0 ? '+' : ''}
                {item.supportChange.toFixed(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </footer>
  );
}
