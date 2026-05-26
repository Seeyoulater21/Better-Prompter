export function App() {
  return (
    <main className="app-shell">
      <section className="workspace-frame">
        <div className="topbar">
          <strong>Better Prompter</strong>
        </div>
        <div className="workspace-main">
          <div className="left-column">
            <div className="panel">Appearance</div>
            <div className="panel">Teleprompt View</div>
          </div>
          <div className="panel">Text Edit / Blocks</div>
        </div>
        <div className="playback-bar">Play/Pause</div>
      </section>
    </main>
  );
}
