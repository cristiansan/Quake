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
  function renderStandings(matches) {
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

  // ── RENDER HISTORY ────────────────────────────────────────────────────────────
  function renderHistory(matches) {
    const tbody = document.getElementById('history-body');

    if (!matches.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">Sin partidas registradas</td></tr>';
      return;
    }

    // Build screenshots map for the modal
    if (window._screenshotsMap) {
      matches.forEach(m => {
        if (m.screenshots && m.screenshots.length) {
          window._screenshotsMap[m.id] = Array.isArray(m.screenshots)
            ? m.screenshots
            : Object.values(m.screenshots);
        }
      });
    }

    tbody.innerHTML = matches.map(m => {
      const winner = m.players[m.winner];
      const loser  = m.players[m.winner === 0 ? 1 : 0];

      let mapsStr;
      if (Array.isArray(m.maps)) {
        mapsStr = m.maps.map(mp => mp.name).filter(Boolean).join(' · ');
      } else {
        mapsStr = [m.maps?.map1?.name, m.maps?.map2?.name, m.maps?.decider]
          .filter(Boolean).join(' · ');
      }

      const screenshotCount = m.screenshots
        ? (Array.isArray(m.screenshots) ? m.screenshots : Object.values(m.screenshots)).length
        : 0;
      const photosBtn = screenshotCount
        ? `<button class="btn-photos" onclick="window.openScreenshots('${m.id}')">📷 ${screenshotCount}</button>`
        : '';

      return `<tr>
        <td class="date">${formatDate(m.date)}</td>
        <td class="match"><span class="winner-name">${winner}</span> <span class="vs-sm">vs</span> ${loser}${photosBtn}</td>
        <td class="score">${m.score}</td>
        <td class="maps-cell">${mapsStr}</td>
      </tr>`;
    }).join('');
  }

  // ── ADMIN: CLEAR DATA ─────────────────────────────────────────────────────────
  window.clearData = function () {
    if (!confirm('¿Borrar TODOS los datos del ranking? Esta acción no se puede deshacer.')) return;
    const fbAvailable = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length;
    if (fbAvailable) {
      firebase.database().ref('matches').remove()
        .then(function () {
          clearMatches();
          renderStandings([]);
          renderHistory([]);
        })
        .catch(function () {
          alert('No tenés permisos para borrar el ranking.');
        });
    } else {
      clearMatches();
      renderStandings([]);
      renderHistory([]);
    }
  };

  // ── ADMIN CHECK ───────────────────────────────────────────────────────────────
  const ADMIN_EMAIL = 'cristiansan@gmail.com';

  // ── LOAD & RENDER ─────────────────────────────────────────────────────────────
  function loadAndRender() {
    const fbAvailable = typeof firebase !== 'undefined' &&
                        firebase.apps  && firebase.apps.length;

    if (fbAvailable) {
      firebase.database().ref('matches').once('value')
        .then(function (snap) {
          const data    = snap.val() || {};
          const matches = Object.values(data).sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });
          renderStandings(matches);
          renderHistory(matches);
        })
        .catch(function (err) {
          console.error('Error leyendo ranking de Firebase:', err);
          const matches = getMatches();
          renderStandings(matches);
          renderHistory(matches);
        });
    } else {
      const matches = getMatches();
      renderStandings(matches);
      renderHistory(matches);
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', loadAndRender);
})();
