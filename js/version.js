(function () {
  const VERSION = 'v0.6';

  const CHANGELOG = [
    {
      version: 'v0.5',
      changes: [
        'Login y registro de usuarios con Firebase Authentication',
        'Campo "Nombre en Quake" en el registro, se auto-completa en Jugador 1 al iniciar sesión',
        'Ranking global en Firebase: solo usuarios registrados pueden guardar resultados',
        'Solo el administrador puede borrar el ranking',
        'Renombrado a Quake Champions',
      ],
    },
    {
      version: 'v0.4',
      changes: [
        'Íconos de mapa y champion en cada carta (sprites)',
        'Íconos de mapa en el tracker superior',
        'Botón de share más llamativo con pulso naranja y flecha ↗',
        'Bloqueo de doble guardado: solo un jugador puede registrar el resultado',
      ],
    },
    {
      version: 'v0.3',
      changes: [
        'Modo multijugador online via Firebase Realtime Database',
        'Player 1 crea la sesión y comparte el link al Player 2 con el botón 🔗',
        'Cada jugador solo puede actuar en su propio turno; el otro espera en tiempo real',
        'Badge "Jugando como: [nombre]" para identificar tu rol en la sesión',
      ],
    },
    {
      version: 'v0.2',
      changes: [
        'Champions ya pickeados en un mapa no pueden usarse en los siguientes',
        'Validación de nombres únicos al crear la partida (case-insensitive)',
      ],
    },
    {
      version: 'v0.1',
      changes: [
        'Sistema de Pick & Ban para mapas (Bo3)',
        'Jugador inicial sorteado aleatoriamente',
        'Secuencia: ban → ban → pick → pick → ban → ban → pick (MAP3)',
        'Selección de champions por mapa: home banea, away elige primero, home elige último',
        'Tracker visual de mapas y champions actualizado en tiempo real',
        'Log de acciones: bans en la misma línea, picks en línea nueva',
        'Ranking con historial de partidas guardado en localStorage',
        'Botón COPY RESULT STRING con formato competitivo',
      ],
    },
  ];

  window.addEventListener('DOMContentLoaded', function () {
    // ── Version badge ────────────────────────────────────────────────────────
    const badge = document.createElement('div');
    badge.className   = 'version-badge';
    badge.textContent = VERSION;
    badge.title       = typeof t === 'function' ? t('see_changelog') : 'Ver changelog';
    badge.addEventListener('click', function () {
      document.getElementById('changelog-modal').classList.add('open');
    });
    document.body.appendChild(badge);

    // ── Changelog modal ──────────────────────────────────────────────────────
    const entriesHtml = CHANGELOG.map(entry => `
      <div class="changelog-entry">
        <div class="changelog-version">${entry.version}</div>
        <ul class="changelog-list">
          ${entry.changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>`).join('');

    const changelogTitle = typeof t === 'function' ? t('changelog') : 'CHANGELOG';

    const modal = document.createElement('div');
    modal.id        = 'changelog-modal';
    modal.className = 'changelog-modal';
    modal.innerHTML = `
      <div class="changelog-inner">
        <div class="changelog-header">
          <span class="changelog-title">${changelogTitle}</span>
          <button class="changelog-close" id="changelog-close-btn">✕</button>
        </div>
        <div class="changelog-body">${entriesHtml}</div>
      </div>`;

    // Close on backdrop click
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });
    // Close on button click
    modal.querySelector('#changelog-close-btn').addEventListener('click', function () {
      modal.classList.remove('open');
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') modal.classList.remove('open');
    });

    document.body.appendChild(modal);
  });
})();
