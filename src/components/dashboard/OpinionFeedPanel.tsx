/** Medya yankısı akışı */

import type { OpinionEchoItem } from '../../types/game';
import { Panel } from '../ui/Panel';
import './OpinionFeedPanel.css';

interface OpinionFeedPanelProps {
  feed: OpinionEchoItem[];
  compact?: boolean;
}

function toneClass(tone: OpinionEchoItem['tone']): string {
  return `opinion-tone ${tone}`;
}

export function OpinionFeedPanel({ feed, compact = false }: OpinionFeedPanelProps) {
  const items = [...feed].reverse().slice(0, compact ? 4 : 8);

  return (
    <Panel title="Medya Yankısı" compact={compact} className="opinion-feed-panel">
      {items.length === 0 ? (
        <p className="opinion-feed-empty">Henüz yankı yok. Tepkilerin 1–2 hafta içinde yansır.</p>
      ) : (
        <ul className="opinion-feed-list">
          {items.map((item) => (
            <li key={item.id} className="opinion-feed-item">
              <div className="opinion-feed-header">
                <span className={toneClass(item.tone)}>{item.headline}</span>
                <span className="opinion-week">H{item.week}</span>
              </div>
              <p className="opinion-body">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
