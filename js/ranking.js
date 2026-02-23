(function () {
  // ── STANDINGS ────────────────────────────────────────────────────────────────
  function buildStandings(matches) {
    const map = {};
    matches.forEach(m => {
      m.players.forEach((name, i) => {
        if (!map[name]) map[name] = { name, wins: 0, losses: 0 };
        if (m.winner === i) map[name].wins++;
        else                map[name].losses++;
      });
    });
    return Object.values(map).sort((a, b) =>
      b.wins - a.wins || a.losses - b.losses
    );
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR') + ' ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── RENDER STANDINGS ─────────────────────────────────────────────────────────
  function renderStandings() {
    const matches   = getMatches();
    const standings = buildStandings(matches);
    const tbody     = document.getElementById('standings-body');

    if (!standings.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">Sin partidas. <a href="index.html">Crear una</a></td></tr>';
      return;
    }

    tbody.innerHTML = standings.map((p, i) => {
      const total = p.wins + p.losses;
      const pct   = total > 0 ? Math.round(p.wins / total * 100) : 0;
      return `<tr>
        <td class="rank">${i + 1}</td>
        <td class="pname">${p.name}</td>
        <td class="wl"><span class="win">${p.wins}W</span> — <span class="loss">${p.losses}L</span></td>
        <td class="pct">${pct}%</td>
      </tr>`;
    }).join('');
  }

  // ── RENDER HISTORY ───────────────────────────────────────────────────────────
  function renderHistory() {
    const matches = getMatches();
    const tbody   = document.getElementById('history-body');

    if (!matches.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">Sin partidas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = matches.map(m => {
      const winner  = m.players[m.winner];
      const loser   = m.players[m.winner === 0 ? 1 : 0];
      // Support both old format (maps.map1/map2/decider) and new format (maps array)
      let mapsStr;
      if (Array.isArray(m.maps)) {
        mapsStr = m.maps.map(mp => mp.name).filter(Boolean).join(' · ');
      } else {
        mapsStr = [m.maps?.map1?.name, m.maps?.map2?.name, m.maps?.decider]
          .filter(Boolean).join(' · ');
      }
      return `<tr>
        <td class="date">${formatDate(m.date)}</td>
        <td class="match"><span class="winner-name">${winner}</span> <span class="vs-sm">vs</span> ${loser}</td>
        <td class="score">${m.score}</td>
        <td class="maps-cell">${mapsStr}</td>
      </tr>`;
    }).join('');
  }

  // ── EXPOSED GLOBALS ──────────────────────────────────────────────────────────
  window.clearData = function () {
    if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      clearMatches();
      renderStandings();
      renderHistory();
    }
  };

  // ── INIT ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    renderStandings();
    renderHistory();
  });
})();
