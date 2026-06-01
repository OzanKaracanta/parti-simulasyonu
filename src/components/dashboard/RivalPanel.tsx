/** Rakip parti paneli — ulusal destek ve son hamleler */

import { getIdeologyById } from '../../data/setupOptions';
import type { GameState, RivalWeeklyMove } from '../../types/game';
import { Panel } from '../ui/Panel';
import './RivalPanel.css';

interface RivalPanelProps {
  rivals: GameState['rivalParties'];
  latestMoves?: RivalWeeklyMove[];
  playerSupport: number;
  playerPartyName?: string;
  compact?: boolean;
  /** list: kart satırları; table: ana sayfa tablosu */
  variant?: 'list' | 'table';
}

export function RivalPanel({
  rivals,
  latestMoves = [],
  playerSupport,
  playerPartyName = 'Sen',
  compact = false,
  variant = 'list',
}: RivalPanelProps) {
  const sorted = [...rivals].sort((a, b) => {
    if (a.isRulingParty !== b.isRulingParty) {
      return a.isRulingParty ? -1 : 1;
    }
    return b.nationalSupport - a.nationalSupport;
  });

  if (variant === 'table') {
    return (
      <Panel title="Rakip Partiler" compact={compact} className="rival-panel rival-panel-table">
        <table className="fm-table rival-table">
          <thead>
            <tr>
              <th>Parti</th>
              <th>Lider</th>
              <th>İdeoloji</th>
              <th>Ulusal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="rival-table-player">
              <td>
                <strong>{playerPartyName}</strong>
                <span className="rival-table-you">Sen</span>
              </td>
              <td colSpan={2}>Oyuncu partisi</td>
              <td className="num">{playerSupport.toFixed(1)}%</td>
            </tr>
            {sorted.map((rival) => (
              <tr
                key={rival.id}
                className={rival.isRulingParty ? 'rival-table-ruling' : undefined}
              >
                <td>
                  <span className="rival-table-emblem" style={{ backgroundColor: rival.colorHex }}>
                    {rival.shortName}
                  </span>
                  {rival.name}
                  {rival.isRulingParty ? (
                    <span className="rival-ruling-badge">İktidar</span>
                  ) : null}
                </td>
                <td>{rival.leaderName}</td>
                <td>{getIdeologyById(rival.ideologyId).name}</td>
                <td className="num">{rival.nationalSupport.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    );
  }

  return (
    <Panel title="Rakip Partiler" compact={compact} className="rival-panel">
      <div className="rival-player-row">
        <span className="rival-player-label">Sen</span>
        <span className="rival-player-value">{playerSupport.toFixed(1)}%</span>
      </div>

      <ul className="rival-list">
        {sorted.map((rival) => (
          <li
            key={rival.id}
            className={`rival-row${rival.isRulingParty ? ' rival-row-ruling' : ''}`}
          >
            <div className="rival-emblem" style={{ backgroundColor: rival.colorHex }}>
              {rival.shortName}
            </div>
            <div className="rival-info">
              <span className="rival-name">
                {rival.name}
                {rival.isRulingParty ? (
                  <span className="rival-ruling-badge">İktidar</span>
                ) : null}
              </span>
              <span className="rival-leader">
                {rival.leaderName} · {getIdeologyById(rival.ideologyId).name}
              </span>
            </div>
            <span className="rival-support">{rival.nationalSupport.toFixed(1)}%</span>
          </li>
        ))}
      </ul>

      {!compact && latestMoves.length > 0 ? (
        <div className="rival-moves">
          <span className="rival-moves-title">Son Hamleler</span>
          <ul>
            {latestMoves.map((move) => (
              <li key={`${move.rivalId}-${move.headline}`}>
                <strong>{move.rivalName}:</strong> {move.impactSummary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
