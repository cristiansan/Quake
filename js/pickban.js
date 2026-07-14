(function () {
  // ── URL PARAMS ────────────────────────────────────────────────────────────────
  const params    = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  const myPlayer  = parseInt(params.get('player') ?? '-1', 10);
  const fbMode    = !!sessionId && typeof firebase !== 'undefined';

  let bo         = parseInt(params.get('bo') || localStorage.getItem('qc_bo') || '3', 10);
  if (![1, 3, 5].includes(bo)) bo = 3;
  const activeIds = (params.get('maps') || localStorage.getItem('qc_active_maps') || '').split(',').filter(Boolean);
  let activeMaps  = activeIds.length ? MAPS.filter(m => activeIds.includes(m.id)) : MAPS.slice();
  if (!activeMaps.length) activeMaps = MAPS.slice();

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

  // ── PLAYERS ──────────────────────────────────────────────────────────────────
  const _pArr = [];
  for (let i = 1; ; i++) {
    const v = params.get('p' + i);
    if (!v) break;
    _pArr.push(v);
  }
  let players    = _pArr.length >= 2 ? _pArr : ['Player 1', 'Player 2'];
  let numPlayers = players.length;

  // ── SEQUENCE BUILDERS ─────────────────────────────────────────────────────────
  function buildMapSeq(sp) {
    function P(n) { return (sp + n) % numPlayers; }

    if (numPlayers >= 3) {
      // Each player picks their own map — no bans, no decider
      return Array.from({ length: numPlayers }, function (_, i) {
        return { player: P(i), action: 'pick' };
      });
    }

    // 2-player
    const op = 1 - sp;
    if (bo === 1) return [
      { player: sp, action: 'ban'  },
      { player: op, action: 'ban'  },
      { player: sp, action: 'pick', isDecider: true },
    ];
    if (bo === 5) return [
      { player: sp, action: 'ban'  },
      { player: op, action: 'ban'  },
      { player: sp, action: 'pick' },
      { player: op, action: 'pick' },
      { player: sp, action: 'pick' },
      { player: op, action: 'pick' },
      { player: sp, action: 'ban'  },
      { player: op, action: 'ban'  },
      { player: sp, action: 'pick', isDecider: true },
    ];
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
    if (numPlayers >= 3) {
      if (champMapIndex === 0) {
        // Map 1: only J1 and J2 play — J3 waits
        return [
          { player: homePlayer,                          action: 'pick' },
          { player: (homePlayer + 1) % numPlayers,       action: 'pick' },
        ];
      }
      // Maps 2 & 3: any of the 3 could end up playing — all pick their champion
      return Array.from({ length: numPlayers }, function (_, i) {
        return { player: (homePlayer + i) % numPlayers, action: 'pick' };
      });
    }
    const away = 1 - homePlayer;
    if (bo === 1) return [
      { player: homePlayer, action: 'ban'  },
      { player: away,       action: 'ban'  },
      { player: away,       action: 'pick' },
      { player: homePlayer, action: 'pick' },
    ];
    return [
      { player: homePlayer, action: 'ban'  },
      { player: away,       action: 'pick' },
      { player: homePlayer, action: 'pick' },
    ];
  }

  // ── STATE ────────────────────────────────────────────────────────────────────
  let startPlayer = Math.floor(Math.random() * numPlayers);
  let MAP_SEQ     = buildMapSeq(startPlayer);

  let phase         = 'maps';
  let mapPool       = MAPS.map(m => ({
    ...m,
    status:    activeMaps.some(am => am.id === m.id) ? 'available' : 'disabled',
    actionBy:  null,
    stepIndex: null,
  }));
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

  function fixPicks(val) {
    const n = numPlayers;
    if (!val) return Array(n).fill(null);
    const arr = Array(n).fill(null);
    for (let i = 0; i < n; i++) arr[i] = (val[i] !== undefined ? val[i] : null);
    return arr;
  }

  function applySnapshot(data) {
    const p = toArr(data.players);
    players     = p.map((name, i) => name || 'Player ' + (i + 1));
    numPlayers  = players.length;
    startPlayer = data.startPlayer ?? 0;
    bo          = data.bo || 3;
    const aIds  = toArr(data.activeMaps).filter(Boolean);
    activeMaps  = aIds.length ? MAPS.filter(m => aIds.includes(m.id)) : MAPS.slice();
    if (!activeMaps.length) activeMaps = MAPS.slice();
    MAP_SEQ     = buildMapSeq(startPlayer);
    phase       = data.phase || 'maps';
    mapStep     = data.mapStep || 0;

    const rawMap = toArr(data.mapPool);
    mapPool = MAPS.map((m, i) => {
      const isActive = activeMaps.some(am => am.id === m.id);
      if (!isActive) return { ...m, status: 'disabled', actionBy: null, stepIndex: null };
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

    mapsToPlay = computeMapsToPlay();
    if (phase === 'champs' && mapsToPlay[champMapIndex]) {
      champSeq = buildChampSeq(mapsToPlay[champMapIndex].homePlayer);
    }
  }

  function getState() {
    return { players, startPlayer, phase, mapStep, mapPool,
             champMapIndex, champStep, champPool, results, logLines, pendingBans, resultSaved,
             bo, activeMaps: activeMaps.map(m => m.id) };
  }

  function writeState() {
    if (!fbMode || !window._fbDb) return;
    window._fbDb.ref('sessions/' + sessionId).set(getState());
  }

  // ── SPRITE HELPERS ───────────────────────────────────────────────────────────
  const MAP_CELL_W = 676 / 3;
  const MAP_CELL_H = 457 / 7;
  const CHM_CELL_W = 453 / 2;
  const CHM_CELL_H = 525 / 8;
  const ICON_CTR = 33;

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

  function playerSpan(p) {
    return `<span class="log-p${p + 1}">${players[p]}</span>`;
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function freshChampPool() {
    const usedNames = new Set();
    for (let i = 0; i < champMapIndex; i++) {
      const r = results[i];
      if (!r) continue;
      if (r.picks) r.picks.forEach(name => { if (name) usedNames.add(name); });
      (r.bans || []).forEach(name => usedNames.add(name));
    }
    return CHAMPIONS
      .filter(c => !usedNames.has(c.name))
      .map(c => ({ ...c, status: 'available', actionBy: null }));
  }

  function computeMapsToPlay() {
    const picks   = mapPool.filter(m => m.status === 'picked').sort((a, b) => a.stepIndex - b.stepIndex);
    const decider = mapPool.find(m => m.status === 'decider');

    if (numPlayers >= 3) {
      // One map per player — homePlayer is the picker (they wait and play last on their map)
      return picks.map(p => ({
        mapName:    p.name,
        homePlayer: p.actionBy ?? startPlayer,
      }));
    }

    // 2-player
    const otherPlayer = 1 - startPlayer;
    if (bo === 1) return [
      { mapName: decider?.name || '?', homePlayer: startPlayer },
    ];
    if (bo === 5) {
      const slots = picks.map((p, i) => ({
        mapName:    p.name,
        homePlayer: p.actionBy ?? (i % 2 === 0 ? startPlayer : otherPlayer),
      }));
      if (decider) slots.push({ mapName: decider.name, homePlayer: startPlayer });
      return slots;
    }
    return [
      { mapName: picks[0]?.name || '?', homePlayer: picks[0]?.actionBy ?? startPlayer },
      { mapName: picks[1]?.name || '?', homePlayer: picks[1]?.actionBy ?? otherPlayer },
      { mapName: decider?.name  || '?', homePlayer: startPlayer },
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
      picks:      Array(numPlayers).fill(null),
    }));
    champMapIndex = 0;
    startChampMap();
  }

  function startChampMap() {
    const totalMaps = numPlayers >= 3 ? mapsToPlay.length : bo;
    if (champMapIndex >= totalMaps) {
      phase = 'done';
      flushBans();
      writeState();
      if (!fbMode) renderAll();
      return;
    }
    champPool = freshChampPool();
    champSeq  = buildChampSeq(mapsToPlay[champMapIndex].homePlayer);
    champStep = 0;
    const label = t('map_n', { n: champMapIndex + 1 });
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
    renderMatchTitle();
    renderPlayerBadge();
    renderShareBtns();
    renderTracker();
    renderPhaseIndicator();
    renderTurnBar();
    renderGrids();
    renderLog();
    if (phase === 'done') showResult();
  }

  function renderMatchTitle() {
    const el = document.getElementById('match-title');
    if (!el) return;
    el.innerHTML = players.map((name, i) =>
      `<span class="name-p${i + 1}">${name}</span>`
    ).join('<span class="vs">VS</span>');
  }

  function renderPlayerBadge() {
    if (!fbMode) return;
    const el = document.getElementById('my-player-badge');
    if (!el) return;
    el.textContent   = t('playing_as', { player: players[myPlayer] || '...' });
    el.style.display = 'block';
  }

  let _shareBtnsRendered = false;
  function renderShareBtns() {
    if (!fbMode || myPlayer !== 0) return;
    const container = document.getElementById('share-btns');
    if (!container || _shareBtnsRendered) return;
    _shareBtnsRendered = true;
    for (let i = 1; i < numPlayers; i++) {
      const btn = document.createElement('button');
      btn.className    = 'btn-share';
      btn.style.display = 'inline-flex';
      btn.textContent  = `⇗ LINK ${players[i].toUpperCase()}`;
      const idx = i;
      btn.onclick = function () { copyShareLink(idx); };
      container.appendChild(btn);
    }
  }

  function renderTracker() {
    const container  = document.getElementById('match-tracker');
    const picks      = mapPool.filter(m => m.status === 'picked').sort((a, b) => a.stepIndex - b.stepIndex);
    const deciderMap = mapPool.find(m => m.status === 'decider');

    let slots;
    if (numPlayers >= 3) {
      // 3-player: one pick per player — show king-of-hill format label per slot
      container.style.gridTemplateColumns = 'repeat(3, 1fr)';
      const P = (n) => players[(startPlayer + n) % numPlayers];
      const formatLabels = [
        `${P(0)} vs ${P(1)}`,
        `Perdedor vs ${P(2)}`,
        `Final`,
      ];
      slots = Array.from({ length: numPlayers }, function (_, i) {
        return { label: t('map_n', { n: i + 1 }), map: picks[i] || null, isDecider: false, formatLabel: formatLabels[i] };
      });
    } else if (bo === 1) {
      container.style.gridTemplateColumns = '1fr';
      slots = [{ label: t('decider'), map: deciderMap || null, isDecider: true }];
    } else if (bo === 5) {
      container.style.gridTemplateColumns = 'repeat(5, 1fr)';
      slots = [
        { label: t('map_n', { n: 1 }), map: picks[0] || null, isDecider: false },
        { label: t('map_n', { n: 2 }), map: picks[1] || null, isDecider: false },
        { label: t('map_n', { n: 3 }), map: picks[2] || null, isDecider: false },
        { label: t('map_n', { n: 4 }), map: picks[3] || null, isDecider: false },
        { label: t('decider'),          map: deciderMap || null, isDecider: true },
      ];
    } else {
      container.style.gridTemplateColumns = 'repeat(3, 1fr)';
      slots = [
        { label: t('map_1'),         map: picks[0]   || null, isDecider: false },
        { label: t('map_2'),         map: picks[1]   || null, isDecider: false },
        { label: t('map_3_decider'), map: deciderMap || null, isDecider: true  },
      ];
    }

    container.innerHTML = slots.map((slot, i) => {
      const hasMap         = slot.map !== null;
      const isCurrentChamp = phase === 'champs' && champMapIndex === i;
      const result         = results[i] || { picks: Array(numPlayers).fill(null), bans: [] };
      const bans           = result.bans || [];

      let cls = 'tracker-slot';
      if (hasMap)         cls += slot.isDecider ? ' active-decider' : ' active';
      if (isCurrentChamp) cls += ' current-champ';

      let champsHtml = '';
      if (numPlayers >= 3) {
        const rPicks = (results[i] || {}).picks || [];
        const p0 = (startPlayer + 0) % numPlayers;
        const p1 = (startPlayer + 1) % numPlayers;
        const p2 = (startPlayer + 2) % numPlayers;
        const lines = [];
        if (i === 0) {
          // Map 1: only J1 and J2 pick
          if (rPicks[p0] || rPicks[p1]) {
            lines.push(`<div class="tracker-champ tracker-p${p0+1}">${players[p0]}: <strong>${rPicks[p0] || '—'}</strong></div>`);
            lines.push(`<div class="tracker-champ tracker-p${p1+1}">${players[p1]}: <strong>${rPicks[p1] || '—'}</strong></div>`);
          }
        } else {
          // Maps 2 & 3: all 3 pick — show those who have already chosen
          [p0, p1, p2].forEach(function (pi) {
            if (rPicks[pi]) {
              lines.push(`<div class="tracker-champ tracker-p${pi+1}">${players[pi]}: <strong>${rPicks[pi]}</strong></div>`);
            }
          });
        }
        if (lines.length) champsHtml = `<div class="tracker-champs">${lines.join('')}</div>`;
      } else {
        const hasChamps = result.picks && result.picks.some(Boolean);
        const banHtml   = bans.length
          ? `<div class="tracker-ban">${t('tracker_bans', { bans: bans.join(', ') })}</div>` : '';
        if (hasChamps) {
          champsHtml = `<div class="tracker-champs">
            ${players.map((name, pi) =>
              `<div class="tracker-champ tracker-p${pi + 1}">${name}: <strong>${result.picks[pi] || '—'}</strong></div>`
            ).join('')}
            ${banHtml}
          </div>`;
        }
      }

      const formatHtml  = slot.formatLabel
        ? `<div class="tracker-format">${slot.formatLabel}</div>` : '';
      const mapIdx      = hasMap ? MAPS.findIndex(m => m.id === slot.map.id) : -1;
      const mapBpStr    = mapIdx >= 0 ? mapBp(mapIdx, 30) : null;
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
          ${formatHtml}
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
      const label   = t('map_n', { n: champMapIndex + 1 });
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
      if (map.status === 'disabled') return;
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
  function renderScoreRadios() {
    const el = document.getElementById('score-radios');
    if (!el) return;
    if (numPlayers >= 3) { el.innerHTML = ''; return; }
    const options = bo === 1 ? ['1-0'] : bo === 5 ? ['3-0', '3-1', '3-2'] : ['2-0', '2-1'];
    el.innerHTML = options.map(v => `
      <label class="radio-label">
        <input type="radio" name="score" value="${v}"> ${v}
      </label>`).join('');
    if (options.length === 1) el.querySelector('input').checked = true;
  }

  function updateSaveUI() {
    const saveBtn  = document.getElementById('save-btn');
    const savedMsg = document.getElementById('already-saved-msg');
    const anonNote = document.getElementById('anon-save-note');

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
    const radios = document.getElementById('winner-radios');
    if (radios) {
      radios.innerHTML = players.map((name, i) =>
        `<label class="radio-label"><input type="radio" name="winner" value="${i}"> ${name}</label>`
      ).join('');
    }

    renderScoreRadios();
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

    const maps = results.map(r => {
      const champStr = players.map((_, pi) => champShort(r.picks[pi])).join('/');
      return `[${mapShort(r.mapName)}]: ${champStr}`;
    }).join(', ');

    return `[${players.join(' - ')}] ${maps}`;
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
  window.copyShareLink = function (playerIdx) {
    playerIdx = playerIdx || 1;
    const url = `${window.location.origin}${window.location.pathname}?session=${sessionId}&player=${playerIdx}`;
    const container = document.getElementById('share-btns');
    const btn = container ? container.children[playerIdx - 1] : null;

    const finish = () => {
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = t('copied');
      setTimeout(() => { btn.textContent = orig; }, 2000);
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

  // ── SAVE ─────────────────────────────────────────────────────────────────────
  window.saveResult = function () {
    if (resultSaved) return;
    const winnerRadio = document.querySelector('input[name="winner"]:checked');
    const scoreRadio  = document.querySelector('input[name="score"]:checked');
    if (!winnerRadio) { alert(t('select_winner')); return; }
    if (numPlayers < 3 && !scoreRadio) { alert(t('select_score')); return; }

    const match = {
      id:      Date.now(),
      date:    new Date().toISOString(),
      players: [...players],
      winner:  parseInt(winnerRadio.value),
      score:   scoreRadio ? scoreRadio.value : (numPlayers + '-player'),
      maps:    results.map((r, i) => ({
        label:     `Map ${i + 1}`,
        name:      r.mapName,
        champions: players.reduce((obj, name, pi) => {
          obj[name] = r.picks[pi];
          return obj;
        }, {}),
      })),
    };
    saveMatch(match);
    resultSaved = true;
    if (fbMode) writeState();
    window.location.href = 'ranking.html';
  };

  // ── SETTINGS MODAL ────────────────────────────────────────────────────────────
  let _settingsBo = bo;

  function renderSettingsMapList() {
    const container = document.getElementById('settings-map-list');
    if (!container) return;
    const activeSet = new Set(activeMaps.map(m => m.id));
    container.innerHTML = MAPS.map(m => {
      const checked = activeSet.has(m.id) ? 'checked' : '';
      return `<label class="map-check-item"><input type="checkbox" value="${m.id}" ${checked}> ${m.name}</label>`;
    }).join('');
  }

  function setActiveSettingsBo() {
    document.querySelectorAll('#settings-modal .bo-opt').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-bo'), 10) === _settingsBo);
    });
  }

  window.openPickbanSettings = function () {
    _settingsBo = bo;
    renderSettingsMapList();
    setActiveSettingsBo();
    const modal = document.getElementById('settings-modal');
    if (modal) { modal.classList.add('open'); window.i18n.apply(); }
  };

  window.closePickbanSettings = function () {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('open');
  };

  window.settingsToggleAll = function (checked) {
    document.querySelectorAll('#settings-map-list input[type=checkbox]').forEach(cb => {
      cb.checked = checked;
    });
  };

  window.applyPickbanSettings = function () {
    const checkedIds = Array.from(
      document.querySelectorAll('#settings-map-list input[type=checkbox]:checked')
    ).map(cb => cb.value);
    localStorage.setItem('qc_active_maps', checkedIds.join(','));
    localStorage.setItem('qc_bo', String(_settingsBo));
    window.closePickbanSettings();
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let newSid = '';
    for (let i = 0; i < 6; i++) newSid += chars[Math.floor(Math.random() * chars.length)];
    const mapsParam = checkedIds.length ? '&maps=' + encodeURIComponent(checkedIds.join(',')) : '';
    const pParams   = players.map((name, i) => 'p' + (i + 1) + '=' + encodeURIComponent(name)).join('&');
    window.location.href =
      'pickban.html?session=' + encodeURIComponent(newSid) +
      '&player=0&' + pParams +
      '&bo=' + _settingsBo +
      mapsParam;
  };

  // ── AUTO PLAY ─────────────────────────────────────────────────────────────────
  function autoPlay() {
    function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function step() {
      if (phase === 'maps') {
        const available = mapPool.filter(m => m.status === 'available');
        if (available.length) handleMapClick(rand(available).id);
        setTimeout(step, 60);
      } else if (phase === 'champs') {
        const available = champPool.filter(c => c.status === 'available');
        if (available.length) handleChampClick(rand(available).id);
        setTimeout(step, 60);
      }
    }
    step();
  }

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
    const boEl = document.getElementById('bo-badge');
    if (boEl) boEl.textContent = 'Bo' + bo;

    document.querySelectorAll('#settings-modal .bo-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        _settingsBo = parseInt(btn.getAttribute('data-bo'), 10);
        setActiveSettingsBo();
      });
    });
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.addEventListener('click', e => {
        if (e.target === settingsModal) window.closePickbanSettings();
      });
    }

    if (!fbMode) {
      const pSpan = `<span class="log-p${startPlayer + 1}"><strong>${players[startPlayer]}</strong></span>`;
      addLog('separator', t('log_sorteo', { playerSpan: pSpan }));
      renderAll();
      if (params.get('auto') === '1') autoPlay();
      return;
    }

    window._fbDb = firebase.database();

    firebase.auth().onAuthStateChanged(function () {
      if (phase === 'done') updateSaveUI();
    });

    if (myPlayer === 0) {
      window._fbDb.ref('sessions/' + sessionId).once('value').then(snap => {
        if (!snap.exists()) {
          const pSpan = `<span class="log-p${startPlayer + 1}"><strong>${players[startPlayer]}</strong></span>`;
          addLog('separator', t('log_sorteo', { playerSpan: pSpan }));
          writeState();
        }
        subscribeToSession();
      });
    } else {
      // Players 2, 3, etc.: subscribe and get all state from Firebase
      subscribeToSession();
    }
  });
})();
