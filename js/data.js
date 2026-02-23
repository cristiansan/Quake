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
const CHAMPIONS = [
  { id: 'ranger',       name: 'Ranger',          short: 'Ranger'  },
  { id: 'visor',        name: 'Visor',           short: 'Visor'   },
  { id: 'anarki',       name: 'Anarki',          short: 'Anarki'  },
  { id: 'bj',           name: 'B.J. Blazkowicz', short: 'BJ'      },
  { id: 'clutch',       name: 'Clutch',          short: 'Clutch'  },
  { id: 'deathknight',  name: 'Death Knight',    short: 'DK'      },
  { id: 'doomslayer',   name: 'Doom Slayer',     short: 'Doom'    },
  { id: 'eisen',        name: 'Eisen',           short: 'Eisen'   },
  { id: 'galena',       name: 'Galena',          short: 'Galena'  },
  { id: 'keel',         name: 'Keel',            short: 'Keel'    },
  { id: 'nyx',          name: 'Nyx',             short: 'Nyx'     },
  { id: 'slash',        name: 'Slash',           short: 'Slash'   },
  { id: 'solag',        name: 'Solag',           short: 'Solag'   },
  { id: 'scalebearer',  name: 'Scalebearer',     short: 'SB'      },
  { id: 'strogg',       name: 'Strogg & Peeker', short: 'Strogg'  },
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
  const matches = getMatches();
  matches.unshift(match);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

function clearMatches() {
  localStorage.removeItem(STORAGE_KEY);
}
