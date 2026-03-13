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
    const d      = new Date(iso);
    const locale = window.i18n ? window.i18n.locale() : 'es-AR';
    return d.toLocaleDateString(locale) + ' ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── RENDER STANDINGS ─────────────────────────────────────────────────────────
  function renderStandings(matches) {
    const standings = buildStandings(matches);
    const tbody     = document.getElementById('standings-body');

    if (!standings.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">${t('no_matches')}</td></tr>`;
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
      tbody.innerHTML = `<tr><td colspan="4" class="empty">${t('no_matches_recorded')}</td></tr>`;
      return;
    }

    // Build screenshots + matches maps for the modal
    if (window._screenshotsMap) {
      matches.forEach(m => {
        if (m.screenshots && m.screenshots.length) {
          window._screenshotsMap[m.id] = Array.isArray(m.screenshots)
            ? m.screenshots
            : Object.values(m.screenshots);
        }
      });
    }
    window._matchesMap = window._matchesMap || {};
    matches.forEach(m => { window._matchesMap[m.id] = m; });

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

      const editBtn = window._isAdmin
        ? `<button class="btn-edit" onclick="window.openEditMatch('${m.id}')">✏️</button>`
        : '';

      return `<tr>
        <td class="date">${formatDate(m.date)}</td>
        <td class="match"><span class="winner-name">${winner}</span> <span class="vs-sm">vs</span> ${loser}${photosBtn}${editBtn}</td>
        <td class="score">${m.score}</td>
        <td class="maps-cell">${mapsStr}</td>
      </tr>`;
    }).join('');
  }

  // ── MATCH COUNTER + STATS MODAL ──────────────────────────────────────────────
  function updateCounter(matches) {
    const el = document.getElementById('match-counter');
    if (el) el.textContent = matches.length;
  }

  function renderMatchStats(matches) {
    const locale = window.i18n ? window.i18n.locale() : 'es-AR';
    const groups = {};
    matches.forEach(m => {
      const d   = new Date(m.date);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!groups[key]) groups[key] = { date: d, list: [] };
      groups[key].list.push(m);
    });

    const sorted  = Object.keys(groups).sort().reverse();
    const bodyEl  = document.getElementById('stats-body');
    if (!bodyEl) return;

    if (!sorted.length) {
      bodyEl.innerHTML = `<p class="empty" style="padding:1.5rem;text-align:center">${t('no_matches_recorded')}</p>`;
      return;
    }

    const monthFmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    bodyEl.innerHTML = sorted.map(key => {
      const g          = groups[key];
      const monthLabel = monthFmt.format(g.date).toUpperCase();
      const pairs      = g.list.map(m =>
        `<li>${m.players[0]} <span class="vs-sm">vs</span> ${m.players[1]}</li>`
      ).join('');
      return `<div class="stats-month">
        <div class="stats-month-hdr">
          <span class="stats-month-name">${monthLabel}</span>
          <span class="stats-month-count">${t('n_matches', { n: g.list.length })}</span>
        </div>
        <ul class="stats-player-list">${pairs}</ul>
      </div>`;
    }).join('');
  }

  window.openMatchStats  = function () {
    document.getElementById('stats-modal').classList.add('open');
  };
  window.closeMatchStats = function () {
    document.getElementById('stats-modal').classList.remove('open');
  };

  // ── ADMIN: CLEAR DATA ─────────────────────────────────────────────────────────
  window.clearData = function () {
    if (!confirm(t('confirm_clear'))) return;
    const fbAvailable = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length;
    if (fbAvailable) {
      firebase.database().ref('matches').remove()
        .then(function () {
          clearMatches();
          renderStandings([]);
          renderHistory([]);
        })
        .catch(function () {
          alert(t('no_permissions'));
        });
    } else {
      clearMatches();
      renderStandings([]);
      renderHistory([]);
    }
  };

  // ── ADMIN: EDIT MATCH ─────────────────────────────────────────────────────────
  window._isAdmin   = false;
  window._matchesMap = {};

  window.openEditMatch = function (matchId) {
    const m = window._matchesMap[matchId];
    if (!m) return;
    window._editMatchId = matchId;

    const modal = document.getElementById('edit-match-modal');
    document.getElementById('edit-p0-label').textContent = m.players[0];
    document.getElementById('edit-p1-label').textContent = m.players[1];
    document.getElementById('edit-winner-0').checked = (m.winner === 0);
    document.getElementById('edit-winner-1').checked = (m.winner === 1);
    document.getElementById('edit-score').value = m.score || '';
    modal.classList.add('open');
  };

  window.closeEditMatch = function () {
    document.getElementById('edit-match-modal').classList.remove('open');
    window._editMatchId = null;
  };

  window.saveEditMatch = function () {
    const matchId = window._editMatchId;
    if (!matchId) return;
    const m = window._matchesMap[matchId];
    if (!m) return;

    const winnerRadio = document.querySelector('input[name="edit-winner"]:checked');
    if (!winnerRadio) { alert('Selecciona un ganador.'); return; }

    const newWinner = parseInt(winnerRadio.value, 10);
    const newScore  = document.getElementById('edit-score').value.trim();
    if (!newScore) { alert('Ingresa el score.'); return; }

    const updated = Object.assign({}, m, { winner: newWinner, score: newScore });

    const fbAvailable = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length;
    if (fbAvailable) {
      firebase.database().ref('matches/' + matchId).update({ winner: newWinner, score: newScore })
        .then(function () {
          window._matchesMap[matchId] = updated;
          window.closeEditMatch();
          location.reload();
        })
        .catch(function (err) {
          alert(t('no_permissions') || 'Sin permisos.');
          console.error(err);
        });
    } else {
      // localStorage fallback
      const matches = getMatches();
      const idx = matches.findIndex(function (x) { return x.id === matchId; });
      if (idx !== -1) {
        matches[idx] = updated;
        localStorage.setItem('ql_matches_v1', JSON.stringify(matches));
      }
      window.closeEditMatch();
      location.reload();
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
          const data      = snap.val() || {};
          const fbMatches = Object.values(data).sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });
          // If Firebase has no data, fall back to localStorage
          // (handles matches saved locally before Firebase auth was ready)
          const matches = fbMatches.length ? fbMatches : getMatches();
          renderStandings(matches);
          renderHistory(matches);
          updateCounter(matches);
          renderMatchStats(matches);
        })
        .catch(function (err) {
          console.error('Error leyendo ranking de Firebase:', err);
          const matches = getMatches();
          renderStandings(matches);
          renderHistory(matches);
          updateCounter(matches);
          renderMatchStats(matches);
        });
    } else {
      const matches = getMatches();
      renderStandings(matches);
      renderHistory(matches);
      updateCounter(matches);
      renderMatchStats(matches);
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', function () {
    const fbAvailable = typeof firebase !== 'undefined' &&
                        firebase.apps  && firebase.apps.length;
    if (fbAvailable) {
      // Wait for auth state before querying Firebase.
      // Handles rules that require auth for reads, and avoids the race condition
      // where onAuthStateChanged hasn't fired yet when the read is attempted.
      const unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
        unsubscribe();
        if (user && user.email === ADMIN_EMAIL) window._isAdmin = true;
        loadAndRender();
      });
    } else {
      loadAndRender();
    }
  });
})();
