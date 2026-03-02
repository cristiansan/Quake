// ── MAP POOL ──────────────────────────────────────────────────────────────────
const MAPS = [
  { id: 'bloodcovenant',  name: 'Blood Covenant',  short: 'BC'       },
  { id: 'crucible',       name: 'Crucible',         short: 'Crucible' },
  { id: 'valeofpnath',    name: 'Vale of Pnath',    short: 'VP'       },
  { id: 'moltenfalls',    name: 'Molten Falls',     short: 'Molten'   },
  { id: 'ruinsofsarnath', name: 'Ruins of Sarnath', short: 'RS'       },
  { id: 'insomnia',       name: 'Insomnia',         short: 'Insomnia' },
  { id: 'exile',          name: 'Exile',            short: 'Exile'    },
  { id: 'deepembrace',    name: 'Deep Embrace',     short: 'DE'       },
  { id: 'corruptedkeep',  name: 'Corrupted Keep',   short: 'CK'       },
  { id: 'bloodrun',       name: 'Blood Run',        short: 'BR'       },
  { id: 'awoken',         name: 'Awoken',           short: 'Awoken'   },
  { id: 'towerofkoth',    name: 'Tower of Koth',    short: 'TK'       },
];

// ── CHAMPION POOL ─────────────────────────────────────────────────────────────
// sc = sprite column (0 or 1), sr = sprite row (0-7) in champions.png
const CHAMPIONS = [
  { id: 'ranger',       name: 'Ranger',          short: 'Ranger',  sc: 0, sr: 2 },
  { id: 'visor',        name: 'Visor',           short: 'Visor',   sc: 1, sr: 2 },
  { id: 'anarki',       name: 'Anarki',          short: 'Anarki',  sc: 1, sr: 0 },
  { id: 'bj',           name: 'B.J. Blazkowicz', short: 'BJ',      sc: 1, sr: 3 },
  { id: 'clutch',       name: 'Clutch',          short: 'Clutch',  sc: 1, sr: 6 },
  { id: 'deathknight',  name: 'Death Knight',    short: 'DK',      sc: 0, sr: 5 },
  { id: 'doomslayer',   name: 'Doom Slayer',     short: 'Doom',    sc: 0, sr: 4 },
  { id: 'eisen',        name: 'Eisen',           short: 'Eisen',   sc: 1, sr: 5 },
  { id: 'galena',       name: 'Galena',          short: 'Galena',  sc: 0, sr: 3 },
  { id: 'keel',         name: 'Keel',            short: 'Keel',    sc: 1, sr: 7 },
  { id: 'nyx',          name: 'Nyx',             short: 'Nyx',     sc: 0, sr: 0 },
  { id: 'slash',        name: 'Slash',           short: 'Slash',   sc: 0, sr: 1 },
  { id: 'solag',        name: 'Sorlag',          short: 'Sorlag',  sc: 0, sr: 7 },
  { id: 'scalebearer',  name: 'Scalebearer',     short: 'SB',      sc: 0, sr: 6 },
  { id: 'strogg',       name: 'Strogg & Peeker', short: 'Strogg',  sc: 1, sr: 4 },
];

// ── LOCALSTORAGE HELPERS ──────────────────────────────────────────────────────
const STORAGE_KEY = 'ql_matches_v1';

function getMatches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveMatch(match) {
  // localStorage (keeps local history as backup)
  const matches = getMatches();
  matches.unshift(match);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));

  // Firebase global ranking (if SDK is loaded and app is initialized)
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
    firebase.database().ref('matches/' + match.id).set(match).catch(function (err) {
      console.error('Error al guardar en Firebase:', err);
    });
  }
}

function clearMatches() {
  localStorage.removeItem(STORAGE_KEY);
}
