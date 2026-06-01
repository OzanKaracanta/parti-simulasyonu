import { useReducer } from 'react';
import { initialGameState } from './data/initialGameData';
import { gameReducer } from './store/gameReducer';
import { GameShell } from './components/layout/GameShell';
import './App.css';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  if (state.status === 'finished') {
    return (
      <GameShell>
        <section className="panel">
          <h1>Seçim Sonucu</h1>
          <p>Tahmini oy oranı: {state.finalResult?.nationalVoteShare.toFixed(1)}%</p>
          <p>Skor: {state.finalResult?.score}</p>
          <p>{state.finalResult?.summary}</p>
          <button onClick={() => dispatch({ type: 'RESET_GAME' })}>Yeniden Başla</button>
        </section>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <header className="topbar">
        <div>
          <h1>{state.party.name}</h1>
          <p>Hafta {state.campaignWeek} / {state.maxWeeks}</p>
        </div>
        <div className="support">Ulusal Destek: {state.nationalSupport.toFixed(1)}%</div>
        <button onClick={() => dispatch({ type: 'END_WEEK' })}>Haftayı Bitir</button>
      </header>

      <div className="grid">
        <section className="panel">
          <h2>Kaynaklar</h2>
          {Object.entries(state.resources).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </section>

        <section className="panel wide">
          <h2>Aksiyonlar</h2>
          <p>Bu hafta seçilen aksiyon: {state.selectedActionIds.length} / 3</p>
          <div className="actions">
            {state.availableActions.map((action) => {
              const selected = state.selectedActionIds.includes(action.id);
              return (
                <button
                  className={selected ? 'action-card selected' : 'action-card'}
                  key={action.id}
                  onClick={() => dispatch({ type: selected ? 'UNSELECT_ACTION' : 'SELECT_ACTION', actionId: action.id })}
                >
                  <strong>{action.name}</strong>
                  <span>{action.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2>Metrikler</h2>
          {Object.entries(state.metrics).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </section>
      </div>

      <section className="panel">
        <h2>Haftalık Geçmiş</h2>
        {state.history.length === 0 ? <p>Henüz hafta tamamlanmadı.</p> : null}
        {state.history.map((item) => (
          <p key={item.week}>Hafta {item.week}: {item.summary}</p>
        ))}
      </section>
    </GameShell>
  );
}
