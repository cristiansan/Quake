(function () {
  // ── URL PARAMS ────────────────────────────────────────────────────────────────
  const params    = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');                          // null in legacy mode
  const myPlayer  = parseInt(params.get('player') ?? '-1', 10);    // 0, 1, or -1 (legacy)
  const fbMode    = !!sessionId && typeof firebase !== 'undefined'; // Firebase available?

  // ── SOUND EFFECTS ─────────────────────────────────────────────────────────────
  const SFX = (function () {
    let _ctx = null;
    function ctx() {
      if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
      return _ctx;
    }
    function tone(freq, endFreq, dur, type, vol) {
      try {
        const ac   = ctx();
        const osc  = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ac.currentTime + dur);
        gain.gain.setValueAtTime(vol, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        osc.start();
        osc.stop(ac.currentTime + dur);
      } catch (e) {}
    }
    return {
      ban:    function () { tone(520, 80,   0.22, 'sawtooth', 0.25); },
      pick:   function () { tone(260, 680,  0.2,  'sine',     0.3);  },
      notify: function () {
        tone(880,  880,  0.09, 'sine', 0.3);
        setTimeout(function () { tone(1100, 1100, 0.13, 'sine', 0.25); }, 115);
      },
    };
  })();

  // ── SEQUENCE BUILDERS ─────────────────────────────────────────────────────────
  function buildMapSeq(sp) {
    const op = 1 - sp;
    return [
      { player: sp, action: 'ban'  },
      { player: op, action: 'ban'  },
      { player: sp, action: 'pick' },
      { player: op, action: 'pick' },
      { player: sp, action: 'ban'  },
      { player: op, action: 'ban'  },
      { player: sp, action: 'pick', isDecider: true },
    ];
  }

  function buildChampSeq(homePlayer) {
    const away = 1 - homePlayer;
    return [
      { player: homePlayer, action: 'ban'  },
      { player: away,       action: 'pick' },
      { player: homePlayer, action: 'pick' },
    ];
  }

  // ── STATE ────────────────────────────────────────────────────────────────────
  let players     = [params.get('p1') || 'Player 1', params.get('p2') || 'Player 2'];
  let startPlayer = Math.floor(Math.random() * 2);  // may be overwritten by Firebase
  let otherPlayer = 1 - startPlayer;
  let MAP_SEQ     = buildMapSeq(startPlayer);

  let phase         = 'maps';
  let mapPool       = MAPS.map(m => ({ ...m, status: 'available', actionBy: null, stepIndex: null }));
  let mapStep       = 0;
  let mapsToPlay    = [];
  let champMapIndex = 0;
  let champPool     = [];
  let champStep     = 0;
  let champSeq      = [];
  let results       = [];
  let logLines      = [];
  let pendingBans   = [];
  let resultSaved   = false;

  // ── FIREBASE HELPERS ──────────────────────────────────────────────────────────
  // Firebase converts arrays with gaps/nulls to objects keyed by numeric strings.
  // This converts them back to a proper array.
  function toArr(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    const maxKey = Math.max(...Object.keys(val).map(Number));
    const result = [];
    for (let i = 0; i <= maxKey; i++) {
      result.push(val[i] !== undefined ? val[i] : null);
    }
    return result;
  }

  // Firebase drops null values from arrays. Restore picks = [p0, p1] safely.
  function fixPicks(val) {
    if (!val) return [null, null];
    return [(val[0] ?? null), (val[1] ?? null)];
  }

  function applySnapshot(data) {
    const p = toArr(data.players);
    players     = [p[0] || 'Player 1', p[1] || 'Player 2'];
    startPlayer = data.startPlayer ?? 0;
    otherPlayer = 1 - startPlayer;
    MAP_SEQ     = buildMapSeq(startPlayer);
    phase       = data.phase || 'maps';
    mapStep     = data.mapStep || 0;

    // Restore mapPool (12 entries, keyed by MAPS index)
    const rawMap = toArr(data.mapPool);
    mapPool = MAPS.map((m, i) => {
      const r = rawMap[i];
      if (!r) return { ...m, status: 'available', actionBy: null, stepIndex: null };
      return {
        id:        m.id,
        name:      m.name,
        short:     m.short,
        status:    r.status    || 'available',
        actionBy:  r.actionBy  ?? null,
        stepIndex: r.stepIndex ?? null,
      };
    });

    champMapIndex = data.champMapIndex || 0;
    champStep     = data.champStep     || 0;

    // Restore champPool (variable-length, matched by champion id)
    const rawChamp = toArr(data.champPool);
    champPool = rawChamp.map(c => {
      if (!c) return null;
      const base = CHAMPIONS.find(ch => ch.id === c.id) || {};
      return {
        id:       c.id       || base.id,
        name:     c.name     || base.name,
        short:    c.short    || base.short,
        status:   c.status   || 'available',
        actionBy: c.actionBy ?? null,
      };
    }).filter(Boolean);

    // Restore results
    const rawRes = toArr(data.results);
    results = rawRes.map(r => {
      if (!r) return null;
      return {
        mapName:    r.mapName    || '?',
        homePlayer: r.homePlayer ?? 0,
        bans:       toArr(r.bans),
        picks:      fixPicks(r.picks),
      };
    }).filter(Boolean);

    logLines    = toArr(data.logLines);
    pendingBans = toArr(data.pendingBans);
    resultSaved = data.resultSaved || false;

    // Recompute derived state
    mapsToPlay = computeMapsToPlay();
    if (phase === 'champs' && mapsToPlay[champMapIndex]) {
      champSeq = buildChampSeq(mapsToPlay[champMapIndex].homePlayer);
    }
  }

  function getState() {
    return { players, startPlayer, phase, mapStep, mapPool,
             champMapIndex, champStep, champPool, results, logLines, pendingBans, resultSaved };
  }

  function writeState() {
    if (!fbMode || !window._fbDb) return;
    window._fbDb.ref('sessions/' + sessionId).set(getState());
  }

  // ── SPRITE HELPERS ───────────────────────────────────────────────────────────
  // Sprite dimensions (from PNG headers)
  const MAP_CELL_W = 676 / 3;   // ≈ 225.33 px per cell
  const MAP_CELL_H = 457 / 7;   // ≈ 65.28 px per cell
  const CHM_CELL_W = 453 / 2;   // = 226.5 px per cell
  const CHM_CELL_H = 525 / 8;   // = 65.625 px per cell
  // Icon circle center from cell top-left (icon ≈ 52px, left-pad ≈ 7px → center = 33)
  const ICON_CTR = 33;

  // Returns background-position string to center the icon in a displaySize×displaySize div
  function mapBp(mapIndex, displaySize) {
    const pad = ICON_CTR - displaySize / 2;
    const c = mapIndex % 3, r = Math.floor(mapIndex / 3);
    return `-${Math.round(c * MAP_CELL_W + pad)}px -${Math.round(r * MAP_CELL_H + pad)}px`;
  }
  function champBp(sc, sr, displaySize) {
    const pad = ICON_CTR - displaySize / 2;
    return `-${Math.round(sc * CHM_CELL_W + pad)}px -${Math.round(sr * CHM_CELL_H + pad)}px`;
  }

  // ── TURN GATING ──────────────────────────────────────────────────────────────
  function isMyTurn() {
    if (!fbMode) return true;
    if (phase === 'done') return false;
    const seq = phase === 'maps' ? MAP_SEQ[mapStep] : champSeq[champStep];
    return seq?.player === myPlayer;
  }

  // ── LOG HELPERS ───────────────────────────────────────────────────────────────
  function flushBans() {
    if (pendingBans.length > 0) {
      logLines.push(pendingBans.join(', '));
      pendingBans = [];
    }
  }

  function addLog(type, html) {
    if (type === 'ban') {
      pendingBans.push(html);
    } else {
      flushBans();
      logLines.push(html);
    }
  }

  // Returns an HTML span for a player with their color class
  function playerSpan(p) {
    return `<span class="log-p${p + 1}">${players[p]}</span>`;
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function freshChampPool() {
    const usedNames = new Set();
    for (let i = 0; i < champMapIndex; i++) {
      if (results[i]?.picks[0]) usedNames.add(results[i].picks[0]);
      if (results[i]?.picks[1]) usedNames.add(results[i].picks[1]);
      (results[i]?.bans || []).forEach(name => usedNames.add(name));
    }
    return CHAMPIONS
      .filter(c => !usedNames.has(c.name))
      .map(c => ({ ...c, status: 'available', actionBy: null }));
  }

  function computeMapsToPlay() {
    const picks   = mapPool.filter(m => m.status === 'picked').sort((a, b) => a.stepIndex - b.stepIndex);
    const decider = mapPool.find(m => m.status === 'decider');
    return [
      { mapName: picks[0]?.name  || '?', homePlayer: picks[0]?.actionBy  ?? startPlayer },
      { mapName: picks[1]?.name  || '?', homePlayer: picks[1]?.actionBy  ?? otherPlayer },
      { mapName: decider?.name   || '?', homePlayer: startPlayer },
    ];
  }

  function mapPickNumber(map) {
    const picks = mapPool.filter(m => m.status === 'picked').sort((a, b) => a.stepIndex - b.stepIndex);
    return picks.findIndex(m => m.id === map.id) + 1;
  }

  // ── TRANSITIONS ──────────────────────────────────────────────────────────────
  function finishMapPhase() {
    phase      = 'champs';
    mapsToPlay = computeMapsToPlay();
    results    = mapsToPlay.map(m => ({
      mapName:    m.mapName,
      homePlayer: m.homePlayer,
      bans:       [],
      picks:      [null, null],
    }));
    champMapIndex = 0;
    startChampMap();
  }

  function startChampMap() {
    if (champMapIndex >= 3) {
      phase = 'done';
      flushBans();
      writeState();
      if (!fbMode) renderAll();
      return;
    }
    champPool = freshChampPool();
    champSeq  = buildChampSeq(mapsToPlay[champMapIndex].homePlayer);
    champStep = 0;
    const label = champMapIndex === 2 ? t('decider') : t('map_n', { n: champMapIndex + 1 });
    addLog('separator', t('log_champs_for', { label: label, mapName: mapsToPlay[champMapIndex].mapName }));
    writeState();
    if (!fbMode) renderAll();
  }

  // ── CLICK HANDLERS ───────────────────────────────────────────────────────────
  function handleMapClick(mapId) {
    if (phase !== 'maps' || mapStep >= MAP_SEQ.length) return;
    if (!isMyTurn()) return;
    const map = mapPool.find(m => m.id === mapId);
    if (!map || map.status !== 'available') return;

    const seq     = MAP_SEQ[mapStep];
    map.status    = seq.action === 'ban' ? 'banned' : (seq.isDecider ? 'decider' : 'picked');
    map.actionBy  = seq.player;
    map.stepIndex = mapStep;

    const isBan  = seq.action === 'ban';
    if (isBan) SFX.ban(); else SFX.pick();
    const pSpan  = playerSpan(seq.player);
    const suffix = seq.isDecider ? ` ${t('log_map3')}` : '';
    addLog(isBan ? 'ban' : 'pick',
      isBan
        ? t('log_map_banned', { playerSpan: pSpan, mapName: map.name, suffix: suffix })
        : t('log_map_picked', { playerSpan: pSpan, mapName: map.name, suffix: suffix }));

    mapStep++;
    if (mapStep >= MAP_SEQ.length) { finishMapPhase(); return; }

    writeState();
    if (!fbMode) renderAll();
  }

  function handleChampClick(champId) {
    if (phase !== 'champs' || champStep >= champSeq.length) return;
    if (!isMyTurn()) return;
    const champ = champPool.find(c => c.id === champId);
    if (!champ || champ.status !== 'available') return;

    const seq      = champSeq[champStep];
    champ.status   = seq.action === 'ban' ? 'banned' : 'picked';
    champ.actionBy = seq.player;

    const result = results[champMapIndex];
    const pSpan  = playerSpan(seq.player);
    if (seq.action === 'ban') {
      SFX.ban();
      result.bans.push(champ.name);
      addLog('ban',  t('log_champ_banned', { playerSpan: pSpan, champName: champ.name }));
    } else {
      SFX.pick();
      result.picks[seq.player] = champ.name;
      addLog('pick', t('log_champ_picked', { playerSpan: pSpan, champName: champ.name }));
    }

    champStep++;
    if (champStep >= champSeq.length) { champMapIndex++; startChampMap(); return; }

    writeState();
    if (!fbMode) renderAll();
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  function renderAll() {
    document.getElementById('p1-name').textContent = players[0];
    document.getElementById('p2-name').textContent = players[1];
    renderPlayerBadge();
    renderShareBtn();
    renderTracker();
    renderPhaseIndicator();
    renderTurnBar();
    renderGrids();
    renderLog();
    if (phase === 'done') showResult();
  }

  function renderPlayerBadge() {
    if (!fbMode) return;
    const el = document.getElementById('my-player-badge');
    if (!el) return;
    el.textContent   = t('playing_as', { player: players[myPlayer] || '...' });
    el.style.display = 'block';
  }

  function renderShareBtn() {
    if (!fbMode || myPlayer !== 0) return;
    const btn = document.getElementById('share-btn');
    if (!btn || btn.style.display === 'inline-flex') return;
    btn.style.display = 'inline-flex';
    btn.textContent   = `\u21D7 LINK ${players[1].toUpperCase()}`;
  }

  function renderTracker() {
    const container  = document.getElementById('match-tracker');
    const picks      = mapPool.filter(m => m.status === 'picked').sort((a, b) => a.stepIndex - b.stepIndex);
    const deciderMap = mapPool.find(m => m.status === 'decider');

    const slots = [
      { label: t('map_1'),         map: picks[0]   || null, isDecider: false },
      { label: t('map_2'),         map: picks[1]   || null, isDecider: false },
      { label: t('map_3_decider'), map: deciderMap || null, isDecider: true  },
    ];

    container.innerHTML = slots.map((slot, i) => {
      const hasMap         = slot.map !== null;
      const isCurrentChamp = phase === 'champs' && champMapIndex === i;
      const result         = results[i] || { picks: [null, null], bans: [] };
      const p0champ        = result.picks[0];
      const p1champ        = result.picks[1];
      const bans           = result.bans || [];

      let cls = 'tracker-slot';
      if (hasMap)         cls += slot.isDecider ? ' active-decider' : ' active';
      if (isCurrentChamp) cls += ' current-champ';

      const banHtml    = bans.length
        ? `<div class="tracker-ban">${t('tracker_bans', { bans: bans.join(', ') })}</div>` : '';
      const champsHtml = (p0champ || p1champ) ? `
        <div class="tracker-champs">
          <div class="tracker-champ tracker-p1">${players[0]}: <strong>${p0champ || '—'}</strong></div>
          <div class="tracker-champ tracker-p2">${players[1]}: <strong>${p1champ || '—'}</strong></div>
          ${banHtml}
        </div>` : '';

      const mapIdx     = hasMap ? MAPS.findIndex(m => m.id === slot.map.id) : -1;
      const mapBpStr   = mapIdx >= 0 ? mapBp(mapIdx, 30) : null;
      const mapIconHtml = mapBpStr
        ? `<div class="sprite-icon sprite-icon-sm" style="background-image:url('images/maps.png');background-position:${mapBpStr}"></div>`
        : '';

      return `
        <div class="${cls}">
          <div class="tracker-label">${slot.label}</div>
          <div class="tracker-map-row">
            ${mapIconHtml}
            <div class="tracker-mapname">${hasMap ? slot.map.name : '—'}</div>
          </div>
          ${champsHtml}
        </div>`;
    }).join('');
  }

  function renderPhaseIndicator() {
    const el = document.getElementById('phase-indicator');
    if (phase === 'maps') {
      el.textContent = t('phase_maps');
      el.className   = 'phase-indicator phase-maps';
    } else if (phase === 'champs') {
      const label   = champMapIndex === 2 ? t('decider') : t('map_n', { n: champMapIndex + 1 });
      const mapName = mapsToPlay[champMapIndex]?.mapName || '';
      el.textContent = t('champions_phase', { label: label, map: mapName });
      el.className   = 'phase-indicator phase-champs';
    } else {
      el.textContent = t('pick_ban_complete');
      el.className   = 'phase-indicator phase-done';
    }
  }

  function renderTurnBar() {
    const bar      = document.getElementById('turn-bar');
    const turnText = document.getElementById('turn-text');
    const counter  = document.getElementById('step-counter');

    if (phase === 'done') {
      bar.className        = 'turn-bar complete';
      turnText.textContent = t('pick_ban_complete');
      counter.textContent  = '';
      return;
    }

    const seq     = phase === 'maps' ? MAP_SEQ[mapStep]   : champSeq[champStep];
    const total   = phase === 'maps' ? MAP_SEQ.length     : champSeq.length;
    const current = phase === 'maps' ? mapStep + 1        : champStep + 1;
    const subject = phase === 'maps' ? t('a_map')         : t('a_champion');
    const verb    = seq.action === 'ban' ? t('ban') : t('pick');

    counter.textContent = t('step', { current: current, total: total });

    if (fbMode && !isMyTurn()) {
      bar.className        = 'turn-bar waiting';
      turnText.textContent = t('waiting_for', { player: players[seq.player].toUpperCase() });
      return;
    }

    bar.className        = `turn-bar player${seq.player + 1}`;
    turnText.textContent = `${players[seq.player].toUpperCase()} — ${verb} ${subject}`;
  }

  function renderGrids() {
    const mapGrid   = document.getElementById('map-grid');
    const champGrid = document.getElementById('champ-grid');

    if (phase === 'maps') {
      mapGrid.style.display   = 'grid';
      champGrid.style.display = 'none';
      renderMapGrid();
    } else if (phase === 'champs') {
      mapGrid.style.display   = 'none';
      champGrid.style.display = 'grid';
      renderChampGrid();
    } else {
      mapGrid.style.display   = 'none';
      champGrid.style.display = 'none';
    }
  }

  function renderMapGrid() {
    const grid   = document.getElementById('map-grid');
    const myTurn = isMyTurn();
    grid.innerHTML = '';
    mapPool.forEach((map, i) => {
      const card = document.createElement('div');
      card.className = `map-card ${map.status}`;
      if (map.actionBy !== null) card.classList.add(`p${map.actionBy + 1}`);

      if (map.status === 'available' && myTurn) {
        card.classList.add('clickable');
        card.addEventListener('click', () => handleMapClick(map.id));
      }

      const iconEl = document.createElement('div');
      iconEl.className = 'sprite-icon';
      iconEl.style.backgroundImage    = "url('images/maps.png')";
      iconEl.style.backgroundPosition = mapBp(i, 40);

      const nameEl = document.createElement('span');
      nameEl.className   = 'map-card-name';
      nameEl.textContent = map.name;

      const badgeEl = document.createElement('span');
      badgeEl.className = 'map-card-badge';
      if      (map.status === 'banned')  badgeEl.textContent = t('banned');
      else if (map.status === 'picked')  badgeEl.textContent = t('map_n', { n: mapPickNumber(map) });
      else if (map.status === 'decider') badgeEl.textContent = t('decider');

      card.appendChild(iconEl);
      card.appendChild(nameEl);
      card.appendChild(badgeEl);
      grid.appendChild(card);
    });
  }

  function renderChampGrid() {
    const grid   = document.getElementById('champ-grid');
    const myTurn = isMyTurn();
    grid.innerHTML = '';
    champPool.forEach(champ => {
      const base = CHAMPIONS.find(c => c.id === champ.id);

      const card = document.createElement('div');
      card.className = `map-card ${champ.status}`;
      if (champ.actionBy !== null) card.classList.add(`p${champ.actionBy + 1}`);

      if (champ.status === 'available' && myTurn) {
        card.classList.add('clickable');
        card.addEventListener('click', () => handleChampClick(champ.id));
      }

      const iconEl = document.createElement('div');
      iconEl.className = 'sprite-icon';
      iconEl.style.backgroundImage    = "url('images/champions.png')";
      iconEl.style.backgroundPosition = base ? champBp(base.sc, base.sr, 40) : '0 0';

      const nameEl = document.createElement('span');
      nameEl.className   = 'map-card-name';
      nameEl.textContent = champ.name;

      const badgeEl = document.createElement('span');
      badgeEl.className = 'map-card-badge';
      if      (champ.status === 'banned') badgeEl.textContent = t('banned');
      else if (champ.status === 'picked') badgeEl.textContent = players[champ.actionBy].toUpperCase();

      card.appendChild(iconEl);
      card.appendChild(nameEl);
      card.appendChild(badgeEl);
      grid.appendChild(card);
    });
  }

  function renderLog() {
    const el    = document.getElementById('action-log');
    const lines = pendingBans.length > 0
      ? [...logLines, pendingBans.join(', ')]
      : logLines;
    el.innerHTML = lines.map(e => `<li class="log-entry">${e}</li>`).join('');
    el.scrollTop = el.scrollHeight;
  }

  // ── RESULT SECTION ────────────────────────────────────────────────────────────
  // Separated from showResult() so it can be called again when auth state resolves.
  function updateSaveUI() {
    const saveBtn  = document.getElementById('save-btn');
    const savedMsg = document.getElementById('already-saved-msg');
    const anonNote = document.getElementById('anon-save-note');

    // In fbMode check firebase auth; in legacy mode anyone can save locally
    const user   = fbMode && typeof firebase !== 'undefined' ? firebase.auth().currentUser : true;
    const authed = !!user;

    if (resultSaved) {
      if (saveBtn)  saveBtn.style.display  = 'none';
      if (savedMsg) savedMsg.style.display = 'block';
      if (anonNote) anonNote.style.display = 'none';
    } else {
      if (savedMsg) savedMsg.style.display = 'none';
      if (saveBtn)  saveBtn.style.display  = authed ? 'block' : 'none';
      if (anonNote) anonNote.style.display = authed ? 'none'  : 'block';
    }
  }

  function showResult() {
    document.getElementById('winner-p1-label').textContent = players[0];
    document.getElementById('winner-p2-label').textContent = players[1];

    updateSaveUI();

    const section = document.getElementById('result-section');
    if (section.style.display !== 'block') {
      section.style.display = 'block';
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ── COPY RESULT STRING ───────────────────────────────────────────────────────
  function buildResultString() {
    const mapShort   = name => (MAPS.find(m => m.name === name)?.short)      || name;
    const champShort = name => (CHAMPIONS.find(c => c.name === name)?.short) || name || '?';

    const maps = results.map(r =>
      `[${mapShort(r.mapName)}]: ${champShort(r.picks[0])}/${champShort(r.picks[1])}`
    ).join(', ');

    return `[${players[0]} - ${players[1]}] ${maps}`;
  }

  window.copyResult = function () {
    const str = buildResultString();
    const btn = document.getElementById('copy-btn');
    const finish = (ok) => {
      btn.textContent = ok ? t('copied') : t('error');
      btn.disabled    = true;
      setTimeout(() => { btn.textContent = t('copy_result'); btn.disabled = false; }, 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str).then(() => finish(true)).catch(() => finish(false));
    } else {
      const ta = document.createElement('textarea');
      ta.value = str; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); finish(true); } catch { finish(false); }
      document.body.removeChild(ta);
    }
  };

  // ── COPY SHARE LINK ───────────────────────────────────────────────────────────
  window.copyShareLink = function () {
    const url = `${window.location.origin}${window.location.pathname}?session=${sessionId}&player=1`;
    const btn = document.getElementById('share-btn');
    const origText = btn ? btn.textContent : '';

    const finish = () => {
      if (btn) {
        btn.textContent = t('copied');
        setTimeout(() => { btn.textContent = origText; }, 2000);
      }
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(finish).catch(() => { fallbackCopy(url); finish(); });
    } else {
      fallbackCopy(url);
      finish();
    }
  };

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ── SAVE (exposed for onclick) ────────────────────────────────────────────────
  window.saveResult = function () {
    if (resultSaved) return;
    const winnerRadio = document.querySelector('input[name="winner"]:checked');
    const scoreRadio  = document.querySelector('input[name="score"]:checked');
    if (!winnerRadio) { alert(t('select_winner')); return; }
    if (!scoreRadio)  { alert(t('select_score'));  return; }

    const match = {
      id:      Date.now(),
      date:    new Date().toISOString(),
      players: [...players],
      winner:  parseInt(winnerRadio.value),
      score:   scoreRadio.value,
      maps:    results.map((r, i) => ({
        label:     i === 2 ? 'Decider' : `Map ${i + 1}`,
        name:      r.mapName,
        champions: { [players[0]]: r.picks[0], [players[1]]: r.picks[1] },
      })),
    };
    saveMatch(match);
    resultSaved = true;
    if (fbMode) writeState();
    window.location.href = 'ranking.html';
  };

  // ── FIREBASE SESSION ──────────────────────────────────────────────────────────
  let _prevIsMyTurn = null;

  function subscribeToSession() {
    window._fbDb.ref('sessions/' + sessionId).on('value', snap => {
      const data = snap.val();
      if (!data) {
        document.getElementById('turn-text').textContent = t('waiting_session');
        return;
      }
      const prevTurn = _prevIsMyTurn;
      applySnapshot(data);
      const nowMyTurn = phase !== 'done' && isMyTurn();
      if (prevTurn === false && nowMyTurn) SFX.notify();
      _prevIsMyTurn = nowMyTurn;
      renderAll();
    }, err => {
      console.error('Firebase error:', err);
      document.getElementById('turn-text').textContent = t('firebase_error');
    });
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    if (!fbMode) {
      // Legacy mode (no session in URL, or Firebase not available)
      const pSpan = `<span class="log-p${startPlayer + 1}"><strong>${players[startPlayer]}</strong></span>`;
      addLog('separator', t('log_sorteo', { playerSpan: pSpan }));
      renderAll();
      return;
    }

    // Firebase mode
    window._fbDb = firebase.database();

    // When auth state resolves (may happen after the first render), re-evaluate
    // the save button visibility. Fixes the race condition where currentUser is
    // null on the first render even though the user is logged in.
    firebase.auth().onAuthStateChanged(function () {
      if (phase === 'done') updateSaveUI();
    });

    if (myPlayer === 0) {
      // Player 1: initialize session if it doesn't exist yet, then subscribe
      window._fbDb.ref('sessions/' + sessionId).once('value').then(snap => {
        if (!snap.exists()) {
          const pSpan = `<span class="log-p${startPlayer + 1}"><strong>${players[startPlayer]}</strong></span>`;
          addLog('separator', t('log_sorteo', { playerSpan: pSpan }));
          writeState();
        }
        subscribeToSession();
      });
    } else {
      // Player 2: just subscribe (reads everything from Firebase)
      subscribeToSession();
    }
  });
})();
