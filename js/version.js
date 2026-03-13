(function () {
  const VERSION = 'v0.9';

  const CHANGELOG = [
    {
      version: 'v0.9',
      changes: [
        'Admin (cristiansan): botón ✏️ en cada partida del historial para editar ganador y score',
        'Modal de edición con selección de ganador por nombre y campo de score',
        'Cambios se guardan directamente en Firebase y refrescan el ranking',
      ],
    },
    {
      version: 'v0.8',
      changes: [
        'Selector de formato (Bo1/Bo3/Bo5) y pool de mapas configurable desde index',
        'Badge Bo3/Bo1/Bo5 en pickban clickeable: abre el mismo modal para ajustar formato y mapas en cualquier momento',
        'Reinicia la partida con los mismos jugadores al aplicar cambios desde pickban',
        'Fix: pool de mapas vacío si los IDs guardados no coincidían con MAPS',
      ],
    },
    {
      version: 'v0.7',
      changes: [
        'Mobile: ocultar tagline en index para ganar espacio en pantalla',
        'Badge de versión movido a esquina superior derecha',
        'Header en pickban.html rediseñado para mobile (CSS Grid): nombres en segunda fila',
        'Badge de versión integrado junto al Bo3 en pickban, sin superposición',
        'i18n: agregados inglés (EN) y francés (FR); orden ES · BR · EN · RU · FR',
      ],
    },
    {
      version: 'v0.6',
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
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      badge.classList.add('version-badge--inline');
      headerRight.appendChild(badge);
    } else {
      document.body.appendChild(badge);
    }

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
