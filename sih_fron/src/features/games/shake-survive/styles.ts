export const modernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600&display=swap');

  :root {
    --bg-dark: #0f172a;
    --bg-panel: rgba(30, 41, 59, 0.7);
    --primary: #3b82f6;
    --accent: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    --border: rgba(255,255,255,0.1);
  }

  html, body {
    height: 100%; margin: 0;
    background-color: var(--bg-dark);
    background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  /* --- LAYOUT --- */
  .game-wrapper {
    display: grid;
    grid-template-columns: 1fr 320px;
    height: 100vh;
    padding: 20px;
    gap: 20px;
    box-sizing: border-box;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* --- MAIN GAME AREA --- */
  .viewport-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    border-radius: 16px;
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  }

  /* --- SIDEBAR --- */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .panel {
    background: var(--bg-panel);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .panel-header {
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-muted);
    letter-spacing: 1px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* --- METERS --- */
  .meter-group { margin-bottom: 12px; }
  .meter-label { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; color: var(--text-muted); font-weight: 600; }
  .meter-track {
    height: 12px;
    background: rgba(0,0,0,0.3);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
  }
  .meter-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .meter-fill::after {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
    background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
    background-size: 1rem 1rem;
    animation: move-stripes 1s linear infinite;
  }
  @keyframes move-stripes { from { background-position: 0 0; } to { background-position: 1rem 0; } }

  .bg-health { background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981); }
  .bg-panic { background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
  .bg-hold { background: linear-gradient(90deg, #10b981, #34d399); }

  /* --- STATS GRID --- */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-box { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; text-align: center; }
  .stat-val { font-family: 'Rajdhani', sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 1; }
  .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }

  /* --- CONTROLS --- */
  .btn-primary {
    width: 100%;
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    font-family: 'Rajdhani', sans-serif;
    letter-spacing: 1px;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  }
  .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.4); }
  .btn-primary:active { transform: translateY(1px); }

  .btn-secondary {
    background: transparent; border: 1px solid var(--border); color: var(--text-main);
    padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted); }

  select, input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--border);
    color: white;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-family: inherit;
  }

  /* --- LEADERBOARD --- */
  .leaderboard-list {
    list-style: none; padding: 0; margin: 0;
    max-height: 200px; overflow-y: auto;
  }
  .leaderboard-item {
    display: flex; justify-content: space-between;
    padding: 8px; border-bottom: 1px dashed var(--border);
    font-size: 0.9rem;
  }
  .leaderboard-item:last-child { border-bottom: none; }
  .rank-badge { color: var(--accent); font-weight: bold; margin-right: 8px; font-family: 'Rajdhani'; }

  /* --- OVERLAYS --- */
  .game-overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 10;
    animation: fadeIn 0.3s ease;
  }

  .overlay-content {
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid var(--border);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
    max-width: 400px;
    width: 90%;
  }

  .big-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .countdown {
    font-size: 8rem; font-weight: 800; font-family: 'Rajdhani';
    color: var(--danger);
    text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
    animation: pulse 1s infinite;
  }

  .shake-warning {
    position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(239, 68, 68, 0.9); color: white;
    padding: 10px 30px; border-radius: 50px;
    font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    animation: shake 0.5s infinite;
    pointer-events: none;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
  @keyframes shake { 0%, 100% { transform: translateX(-50%); } 25% { transform: translateX(calc(-50% - 5px)); } 75% { transform: translateX(calc(-50% + 5px)); } }

  @media(max-width: 900px){
    .game-wrapper { grid-template-columns: 1fr; grid-template-rows: 1fr auto; height: auto; min-height: 100vh; }
    .viewport-container { aspect-ratio: 16/9; }
    .sidebar { display: grid; grid-template-columns: 1fr 1fr; }
  }
  @media(max-width: 600px){
    .sidebar { display: flex; }
    .viewport-container { aspect-ratio: 4/3; }
  }
`;

// ---------- TYPES AND CONFIG ----------
