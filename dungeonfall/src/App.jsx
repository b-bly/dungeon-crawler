import { useCallback, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import "./App.css";

const initialHud = {
  hp: 100,
  maxHp: 100,
  floor: 1,
  kills: 0,
  enemies: 0,
  gameOver: false,
};

export default function App() {
  const [hud, setHud] = useState(initialHud);
  const [restartKey, setRestartKey] = useState(0);

  const updateHud = useCallback((data) => {
    setHud(data);
  }, []);

  function restartGame() {
    setHud(initialHud);
    setRestartKey((key) => key + 1);
  }

  const healthPercentage = (hud.hp / hud.maxHp) * 100;

  return (
    <main className="game-page">
      <header className="game-header">
        <div className="brand">
          <span className="brand-icon">⚔</span>
          <div>
            <h1>DUNGEON DEPTHS</h1>
            <p>DESCEND INTO DARKNESS</p>
          </div>
        </div>

        <div className="floor-badge">
          FLOOR <span>{String(hud.floor).padStart(2, "0")}</span>
        </div>
      </header>

      <section className="game-layout">
        <div className="game-panel">
          <div className="game-topbar">
            <div className="player-info">
              <span className="player-avatar">⚔</span>
              <div>
                <strong>Dungeon Explorer</strong>
                <small>Wandering Knight</small>
              </div>
            </div>

            <div className="health-section">
              <div className="health-label">
                <span>HEALTH</span>
                <strong>
                  {hud.hp} / {hud.maxHp}
                </strong>
              </div>
              <div className="health-track">
                <div
                  className="health-fill"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="canvas-wrapper">
            <GameCanvas onHud={updateHud} restartKey={restartKey} />

            {hud.gameOver && (
              <div className="game-over">
                <div className="death-icon">☠</div>
                <h2>YOU HAVE FALLEN</h2>
                <p>Your journey ends in the depths...</p>
                <div className="death-stats">
                  <span>FLOOR REACHED</span>
                  <strong>{hud.floor}</strong>
                  <span>ENEMIES DEFEATED</span>
                  <strong>{hud.kills}</strong>
                </div>
                <button onClick={restartGame}>TRY AGAIN</button>
              </div>
            )}
          </div>

          <div className="game-footer">
            <span>● LIVE DUNGEON</span>
            <span>PERMADEATH ENABLED</span>
          </div>
        </div>

        <aside className="sidebar">
          <div className="side-card">
            <h3>RUN STATISTICS</h3>

            <div className="stat-row">
              <span>Dungeon Floor</span>
              <strong>{hud.floor}</strong>
            </div>

            <div className="stat-row">
              <span>Enemies Slain</span>
              <strong>{hud.kills}</strong>
            </div>

            <div className="stat-row">
              <span>Enemies Remaining</span>
              <strong>{hud.enemies}</strong>
            </div>
          </div>

          <div className="side-card">
            <h3>CONTROLS</h3>

            <div className="control-row">
              <span>MOVEMENT</span>
              <kbd>W A S D</kbd>
            </div>

            <div className="control-row">
              <span>ALTERNATIVE</span>
              <kbd>↑ ↓ ← →</kbd>
            </div>

            <div className="control-row">
              <span>ATTACK</span>
              <kbd>SPACE / J</kbd>
            </div>
          </div>

          <div className="side-card objective-card">
            <h3>OBJECTIVE</h3>
            <p>
              Explore the dungeon, defeat monsters, and find the golden
              staircase to descend deeper.
            </p>
            <div className="objective-icon">♜</div>
            <small>Survive as long as you can.</small>
          </div>

          <button className="restart-button" onClick={restartGame}>
            ↻ RESTART RUN
          </button>
        </aside>
      </section>

      <footer className="page-footer">
        DUNGEON DEPTHS <span>•</span> PROTOTYPE 0.1
        <span>•</span> BUILT WITH REACT + VITE
      </footer>
    </main>
  );
}
