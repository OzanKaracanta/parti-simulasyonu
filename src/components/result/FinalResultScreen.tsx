/** Seçim sonu ekranı — bölgesel, segment ve stratejik kampanya özeti */

import { colorOptions } from '../../data/setupOptions';
import type { GameState } from '../../types/game';
import './FinalResultScreen.css';

interface FinalResultScreenProps {
  state: GameState;
  onRestart: () => void;
}

function supportClass(value: number, baseline = 25): string {
  if (value >= baseline + 8) return 'positive';
  if (value <= baseline - 8) return 'negative';
  return 'neutral';
}

export function FinalResultScreen({ state, onRestart }: FinalResultScreenProps) {
  const result = state.finalResult;
  if (!result) return null;

  const partyColor = colorOptions.find((c) => c.id === state.party.colorId)?.hex ?? '#3498db';
  const voteClass = supportClass(result.nationalVoteShare, 28);

  return (
    <div className="final-result-screen">
      <header className="final-result-header" style={{ borderColor: partyColor }}>
        <div className="final-party-emblem" style={{ backgroundColor: partyColor }}>
          {state.party.name.charAt(0)}
        </div>
        <div>
          <h1>Seçim Sonucu</h1>
          <p className="final-party-meta">
            {state.party.name} · {state.party.leaderName} · {result.totalWeeksPlayed} haftalık kampanya
          </p>
        </div>
      </header>

      <section className="final-hero">
        <div className="final-vote-box">
          <span className="final-vote-label">Tahmini Oy Oranı</span>
          <span className={`final-vote-value ${voteClass}`}>
            {result.nationalVoteShare.toFixed(1)}%
          </span>
          <div className="final-vote-bar">
            <div
              className={`final-vote-fill ${voteClass}`}
              style={{ width: `${Math.min(100, result.nationalVoteShare * 2)}%` }}
            />
          </div>
        </div>
        <div className="final-score-box">
          <span className="final-score-label">Kampanya Skoru</span>
          <span className="final-score-value">{result.score}</span>
          <span className="final-consistency-badge">
            Tutarlılık {result.consistencyGrade} ({result.messageConsistency})
          </span>
        </div>
      </section>

      <p className="final-summary">{result.summary}</p>
      <p className="final-verdict">{result.strategicVerdict}</p>

      {result.campaignHighlights.length > 0 ? (
        <section className="final-section">
          <h2>Kampanya Öne Çıkanları</h2>
          <ul className="final-list">
            {result.campaignHighlights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="final-columns">
        <section className="final-section">
          <h2>Bölgesel Sonuçlar</h2>
          <table className="fm-table final-table">
            <thead>
              <tr>
                <th>Bölge</th>
                <th>Destek</th>
              </tr>
            </thead>
            <tbody>
              {result.regionalResults.map((region) => (
                <tr key={region.regionId}>
                  <td>
                    {region.name}
                    {region.isHomeRegion ? <span className="final-home-tag">Ana bölge</span> : null}
                  </td>
                  <td className={`num ${supportClass(region.support)}`}>
                    {region.support.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="final-tags">
            {result.strongRegions.length > 0 ? (
              <span className="final-tag positive">Güçlü: {result.strongRegions.join(', ')}</span>
            ) : null}
            {result.weakRegions.length > 0 ? (
              <span className="final-tag negative">Zayıf: {result.weakRegions.join(', ')}</span>
            ) : null}
          </div>
        </section>

        <section className="final-section">
          <h2>Segment Profili</h2>
          <table className="fm-table final-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Destek</th>
              </tr>
            </thead>
            <tbody>
              {result.strongSegments.map((segment) => (
                <tr key={`strong-${segment.segmentId}`}>
                  <td>{segment.label}</td>
                  <td className="num positive">{segment.support.toFixed(1)}</td>
                </tr>
              ))}
              {result.weakSegments
                .filter(
                  (segment) =>
                    !result.strongSegments.some((strong) => strong.segmentId === segment.segmentId),
                )
                .map((segment) => (
                  <tr key={`weak-${segment.segmentId}`}>
                    <td>{segment.label}</td>
                    <td className="num negative">{segment.support.toFixed(1)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>

      {result.rivalComparison.length > 0 ? (
        <section className="final-section">
          <h2>Rakip Karşılaştırması</h2>
          <table className="fm-table final-table">
            <thead>
              <tr>
                <th>Parti</th>
                <th>Oy</th>
                <th>Fark</th>
              </tr>
            </thead>
            <tbody>
              <tr className="final-player-row">
                <td>
                  <strong>{state.party.name}</strong> (Sen)
                </td>
                <td className="num">{result.nationalVoteShare.toFixed(1)}%</td>
                <td className="num">—</td>
              </tr>
              {result.rivalComparison.map((rival) => (
                <tr key={rival.name}>
                  <td>{rival.name}</td>
                  <td className="num">{rival.support.toFixed(1)}%</td>
                  <td className={`num ${rival.delta >= 0 ? 'positive' : 'negative'}`}>
                    {rival.delta >= 0 ? '+' : ''}
                    {rival.delta.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="final-stats-row">
        <div className="final-stat">
          <span>Ort. haftalık Δ</span>
          <strong className={result.averageWeeklySupportChange >= 0 ? 'positive' : 'negative'}>
            {result.averageWeeklySupportChange >= 0 ? '+' : ''}
            {result.averageWeeklySupportChange.toFixed(1)}
          </strong>
        </div>
        {result.bestWeek > 0 ? (
          <div className="final-stat">
            <span>En iyi hafta</span>
            <strong>H{result.bestWeek}</strong>
          </div>
        ) : null}
        {result.worstWeek > 0 ? (
          <div className="final-stat">
            <span>En zor hafta</span>
            <strong>H{result.worstWeek}</strong>
          </div>
        ) : null}
      </section>

      <button type="button" className="ps-btn ps-btn--primary final-restart-btn" onClick={onRestart}>
        Yeni Kampanya Başlat
      </button>
    </div>
  );
}
