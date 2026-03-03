/* ─────────────────────────────────────────────────────────────────────────────
   i18n.js — Internationalization for Quake Pick & Ban
   Languages: es (default), en, fr, pt, ru
   ───────────────────────────────────────────────────────────────────────────── */
(function () {

  var TRANSLATIONS = {

    // ── ESPAÑOL (default) ────────────────────────────────────────────────────
    es: {
      // common
      back_home:             '← INICIO',
      loading:               'Cargando...',
      login_tab:             'INICIAR SESIÓN',
      register_tab:          'REGISTRARSE',
      logout:                'SALIR',
      login_register:        'INICIAR SESIÓN / REGISTRARSE',
      login_to_save:         'para guardar resultados en el ranking',
      // index.html
      new_match:             'NUEVA PARTIDA',
      player_1:              'JUGADOR 1',
      player_2:              'JUGADOR 2',
      name_placeholder:      'Nombre',
      start_pickban:         'INICIAR PICK & BAN',
      names_equal_error:     'Los nombres no pueden ser iguales.',
      view_ranking:          'VER RANKING',
      // login.html
      email:                 'EMAIL',
      password:              'CONTRASEÑA',
      remember_session:      'RECORDAR SESIÓN',
      enter_btn:             'ENTRAR',
      quake_name:            'NOMBRE EN QUAKE',
      nick_placeholder:      'Tu nick en el juego',
      min_6_chars:           'Mínimo 6 caracteres',
      confirm_password:      'CONFIRMAR CONTRASEÑA',
      repeat_password:       'Repetí tu contraseña',
      create_account:        'CREAR CUENTA',
      verify_email_msg:      'Verificá tu email antes de entrar. Revisá tu bandeja de entrada.',
      enter_quake_name:      'Ingresá tu nombre en Quake.',
      passwords_no_match:    'Las contraseñas no coinciden.',
      account_created:       '✓ Cuenta creada para {username}. Te enviamos un email de verificación. Iniciá sesión cuando quieras.',
      // auth errors
      err_invalid_email:     'Email inválido.',
      err_user_not_found:    'No existe una cuenta con ese email.',
      err_wrong_password:    'Contraseña incorrecta.',
      err_invalid_credential:'Email o contraseña incorrectos.',
      err_email_in_use:      'Ya existe una cuenta con ese email.',
      err_weak_password:     'La contraseña debe tener al menos 6 caracteres.',
      err_too_many_requests: 'Demasiados intentos. Intentá más tarde.',
      err_network:           'Error de red. Verificá tu conexión.',
      err_generic:           'Ocurrió un error. Intentá de nuevo.',
      // pickban.html static
      actions:               'ACCIONES',
      register_result:       'REGISTRAR RESULTADO',
      copy_result:           'COPY RESULT STRING',
      save_ranking:          'GUARDAR Y VER RANKING',
      already_saved:         '✓ Resultado ya guardado por el otro jugador.',
      login_to_save_global:  'para guardar en el ranking global',
      new_match_no_save:     'NUEVA PARTIDA (SIN GUARDAR)',
      // pickban.js dynamic
      phase_maps:            'FASE DE MAPAS',
      pick_ban_complete:     'PICK & BAN COMPLETO',
      champions_phase:       'CHAMPIONS — {label}: {map}',
      step:                  'PASO {current} / {total}',
      waiting_for:           'Esperando a {player}...',
      waiting_session:       'Esperando sesión...',
      firebase_error:        'Error de conexión con Firebase.',
      playing_as:            'Jugando como: {player}',
      a_map:                 'UN MAPA',
      a_champion:            'UN CHAMPION',
      ban:                   'BANEA',
      pick:                  'ELIGE',
      banned:                'BANNED',
      decider:               'DECIDER',
      map_1:                 'MAP 1',
      map_2:                 'MAP 2',
      map_3_decider:         'MAP 3 · DECIDER',
      map_n:                 'MAP {n}',
      tracker_bans:          'ban: {bans}',
      log_sorteo:            'Sorteo: empieza baneando {playerSpan}',
      log_map_banned:        '{playerSpan} baneó <strong>{mapName}</strong>{suffix}',
      log_map_picked:        '{playerSpan} eligió <strong>{mapName}</strong>{suffix}',
      log_map3:              '<span class="log-decider">(MAP 3)</span>',
      log_champ_banned:      '{playerSpan} baneó champion <strong>{champName}</strong>',
      log_champ_picked:      '{playerSpan} eligió <strong>{champName}</strong>',
      log_champs_for:        '── Champions para <strong>{label}: {mapName}</strong>',
      select_winner:         'Seleccioná un ganador.',
      select_score:          'Seleccioná el score.',
      copied:                '✓ COPIADO',
      error:                 'ERROR',
      // ranking
      ranking:               'RANKING',
      clear_all:             'BORRAR TODO',
      standings:             'TABLA DE POSICIONES',
      player_col:            'JUGADOR',
      match_history:         'HISTORIAL DE PARTIDAS',
      date_col:              'FECHA',
      match_col:             'PARTIDA',
      maps_col:              'MAPAS',
      no_matches:            'Sin partidas. <a href="index.html">Crear una</a>',
      no_matches_recorded:   'Sin partidas registradas',
      screenshots:           'SCREENSHOTS',
      confirm_clear:         '¿Borrar TODOS los datos del ranking? Esta acción no se puede deshacer.',
      no_permissions:        'No tenés permisos para borrar el ranking.',
      // version.js
      see_changelog:         'Ver changelog',
      changelog:             'CHANGELOG',
    },

    // ── ENGLISH ──────────────────────────────────────────────────────────────
    en: {
      back_home:             '← HOME',
      loading:               'Loading...',
      login_tab:             'LOGIN',
      register_tab:          'REGISTER',
      logout:                'LOGOUT',
      login_register:        'LOGIN / REGISTER',
      login_to_save:         'to save results to the ranking',
      new_match:             'NEW MATCH',
      player_1:              'PLAYER 1',
      player_2:              'PLAYER 2',
      name_placeholder:      'Name',
      start_pickban:         'START PICK & BAN',
      names_equal_error:     'Player names cannot be the same.',
      view_ranking:          'VIEW RANKING',
      email:                 'EMAIL',
      password:              'PASSWORD',
      remember_session:      'REMEMBER SESSION',
      enter_btn:             'LOGIN',
      quake_name:            'QUAKE NAME',
      nick_placeholder:      'Your in-game nick',
      min_6_chars:           'Minimum 6 characters',
      confirm_password:      'CONFIRM PASSWORD',
      repeat_password:       'Repeat your password',
      create_account:        'CREATE ACCOUNT',
      verify_email_msg:      'Please verify your email before logging in. Check your inbox.',
      enter_quake_name:      'Please enter your Quake name.',
      passwords_no_match:    'Passwords do not match.',
      account_created:       '✓ Account created for {username}. We sent a verification email. Log in whenever you\'re ready.',
      err_invalid_email:     'Invalid email address.',
      err_user_not_found:    'No account found with that email.',
      err_wrong_password:    'Incorrect password.',
      err_invalid_credential:'Incorrect email or password.',
      err_email_in_use:      'An account with that email already exists.',
      err_weak_password:     'Password must be at least 6 characters.',
      err_too_many_requests: 'Too many attempts. Please try again later.',
      err_network:           'Network error. Check your connection.',
      err_generic:           'An error occurred. Please try again.',
      actions:               'ACTIONS',
      register_result:       'SAVE RESULT',
      copy_result:           'COPY RESULT STRING',
      save_ranking:          'SAVE & VIEW RANKING',
      already_saved:         '✓ Result already saved by the other player.',
      login_to_save_global:  'to save in the global ranking',
      new_match_no_save:     'NEW MATCH (WITHOUT SAVING)',
      phase_maps:            'MAP PHASE',
      pick_ban_complete:     'PICK & BAN COMPLETE',
      champions_phase:       'CHAMPIONS — {label}: {map}',
      step:                  'STEP {current} / {total}',
      waiting_for:           'Waiting for {player}...',
      waiting_session:       'Waiting for session...',
      firebase_error:        'Firebase connection error.',
      playing_as:            'Playing as: {player}',
      a_map:                 'A MAP',
      a_champion:            'A CHAMPION',
      ban:                   'BANS',
      pick:                  'PICKS',
      banned:                'BANNED',
      decider:               'DECIDER',
      map_1:                 'MAP 1',
      map_2:                 'MAP 2',
      map_3_decider:         'MAP 3 · DECIDER',
      map_n:                 'MAP {n}',
      tracker_bans:          'ban: {bans}',
      log_sorteo:            'Draw: {playerSpan} starts banning',
      log_map_banned:        '{playerSpan} banned <strong>{mapName}</strong>{suffix}',
      log_map_picked:        '{playerSpan} picked <strong>{mapName}</strong>{suffix}',
      log_map3:              '<span class="log-decider">(MAP 3)</span>',
      log_champ_banned:      '{playerSpan} banned champion <strong>{champName}</strong>',
      log_champ_picked:      '{playerSpan} picked <strong>{champName}</strong>',
      log_champs_for:        '── Champions for <strong>{label}: {mapName}</strong>',
      select_winner:         'Select a winner.',
      select_score:          'Select the score.',
      copied:                '✓ COPIED',
      error:                 'ERROR',
      ranking:               'RANKING',
      clear_all:             'CLEAR ALL',
      standings:             'STANDINGS',
      player_col:            'PLAYER',
      match_history:         'MATCH HISTORY',
      date_col:              'DATE',
      match_col:             'MATCH',
      maps_col:              'MAPS',
      no_matches:            'No matches yet. <a href="index.html">Create one</a>',
      no_matches_recorded:   'No matches recorded',
      screenshots:           'SCREENSHOTS',
      confirm_clear:         'Delete ALL ranking data? This action cannot be undone.',
      no_permissions:        'You do not have permission to clear the ranking.',
      see_changelog:         'View changelog',
      changelog:             'CHANGELOG',
    },

    // ── FRANÇAIS ─────────────────────────────────────────────────────────────
    fr: {
      back_home:             '← ACCUEIL',
      loading:               'Chargement...',
      login_tab:             'CONNEXION',
      register_tab:          'INSCRIPTION',
      logout:                'DÉCONNEXION',
      login_register:        'CONNEXION / INSCRIPTION',
      login_to_save:         'pour sauvegarder les résultats dans le classement',
      new_match:             'NOUVELLE PARTIE',
      player_1:              'JOUEUR 1',
      player_2:              'JOUEUR 2',
      name_placeholder:      'Nom',
      start_pickban:         'DÉMARRER PICK & BAN',
      names_equal_error:     'Les noms ne peuvent pas être identiques.',
      view_ranking:          'VOIR LE CLASSEMENT',
      email:                 'EMAIL',
      password:              'MOT DE PASSE',
      remember_session:      'SE SOUVENIR DE LA SESSION',
      enter_btn:             'ENTRER',
      quake_name:            'NOM DANS QUAKE',
      nick_placeholder:      'Votre pseudo dans le jeu',
      min_6_chars:           'Minimum 6 caractères',
      confirm_password:      'CONFIRMER LE MOT DE PASSE',
      repeat_password:       'Répétez votre mot de passe',
      create_account:        'CRÉER UN COMPTE',
      verify_email_msg:      'Vérifiez votre email avant de vous connecter. Consultez votre boîte de réception.',
      enter_quake_name:      'Entrez votre nom dans Quake.',
      passwords_no_match:    'Les mots de passe ne correspondent pas.',
      account_created:       '✓ Compte créé pour {username}. Nous avons envoyé un email de vérification. Connectez-vous quand vous voulez.',
      err_invalid_email:     'Adresse email invalide.',
      err_user_not_found:    'Aucun compte trouvé avec cet email.',
      err_wrong_password:    'Mot de passe incorrect.',
      err_invalid_credential:'Email ou mot de passe incorrect.',
      err_email_in_use:      'Un compte avec cet email existe déjà.',
      err_weak_password:     'Le mot de passe doit comporter au moins 6 caractères.',
      err_too_many_requests: 'Trop de tentatives. Réessayez plus tard.',
      err_network:           'Erreur réseau. Vérifiez votre connexion.',
      err_generic:           'Une erreur s\'est produite. Réessayez.',
      actions:               'ACTIONS',
      register_result:       'ENREGISTRER LE RÉSULTAT',
      copy_result:           'COPIER LE RÉSULTAT',
      save_ranking:          'SAUVEGARDER ET VOIR LE CLASSEMENT',
      already_saved:         '✓ Résultat déjà sauvegardé par l\'autre joueur.',
      login_to_save_global:  'pour sauvegarder dans le classement global',
      new_match_no_save:     'NOUVELLE PARTIE (SANS SAUVEGARDER)',
      phase_maps:            'PHASE DES CARTES',
      pick_ban_complete:     'PICK & BAN TERMINÉ',
      champions_phase:       'CHAMPIONS — {label}: {map}',
      step:                  'ÉTAPE {current} / {total}',
      waiting_for:           'En attente de {player}...',
      waiting_session:       'En attente de la session...',
      firebase_error:        'Erreur de connexion Firebase.',
      playing_as:            'Vous jouez en tant que: {player}',
      a_map:                 'UNE CARTE',
      a_champion:            'UN CHAMPION',
      ban:                   'BANNIT',
      pick:                  'CHOISIT',
      banned:                'BANNI',
      decider:               'DÉCISIVE',
      map_1:                 'CARTE 1',
      map_2:                 'CARTE 2',
      map_3_decider:         'CARTE 3 · DÉCISIVE',
      map_n:                 'CARTE {n}',
      tracker_bans:          'ban: {bans}',
      log_sorteo:            'Tirage: {playerSpan} commence à bannir',
      log_map_banned:        '{playerSpan} a banni <strong>{mapName}</strong>{suffix}',
      log_map_picked:        '{playerSpan} a choisi <strong>{mapName}</strong>{suffix}',
      log_map3:              '<span class="log-decider">(CARTE 3)</span>',
      log_champ_banned:      '{playerSpan} a banni le champion <strong>{champName}</strong>',
      log_champ_picked:      '{playerSpan} a choisi <strong>{champName}</strong>',
      log_champs_for:        '── Champions pour <strong>{label}: {mapName}</strong>',
      select_winner:         'Sélectionnez un gagnant.',
      select_score:          'Sélectionnez le score.',
      copied:                '✓ COPIÉ',
      error:                 'ERREUR',
      ranking:               'CLASSEMENT',
      clear_all:             'TOUT EFFACER',
      standings:             'TABLEAU DES SCORES',
      player_col:            'JOUEUR',
      match_history:         'HISTORIQUE DES PARTIES',
      date_col:              'DATE',
      match_col:             'PARTIE',
      maps_col:              'CARTES',
      no_matches:            'Pas de parties. <a href="index.html">En créer une</a>',
      no_matches_recorded:   'Aucune partie enregistrée',
      screenshots:           'CAPTURES D\'ÉCRAN',
      confirm_clear:         'Supprimer TOUTES les données du classement? Cette action est irréversible.',
      no_permissions:        'Vous n\'avez pas les droits pour effacer le classement.',
      see_changelog:         'Voir le journal des modifications',
      changelog:             'CHANGELOG',
    },

    // ── PORTUGUÊS (BR) ───────────────────────────────────────────────────────
    pt: {
      back_home:             '← INÍCIO',
      loading:               'Carregando...',
      login_tab:             'ENTRAR',
      register_tab:          'REGISTRAR',
      logout:                'SAIR',
      login_register:        'ENTRAR / REGISTRAR',
      login_to_save:         'para salvar resultados no ranking',
      new_match:             'NOVA PARTIDA',
      player_1:              'JOGADOR 1',
      player_2:              'JOGADOR 2',
      name_placeholder:      'Nome',
      start_pickban:         'INICIAR PICK & BAN',
      names_equal_error:     'Os nomes não podem ser iguais.',
      view_ranking:          'VER RANKING',
      email:                 'EMAIL',
      password:              'SENHA',
      remember_session:      'LEMBRAR SESSÃO',
      enter_btn:             'ENTRAR',
      quake_name:            'NOME NO QUAKE',
      nick_placeholder:      'Seu nick no jogo',
      min_6_chars:           'Mínimo 6 caracteres',
      confirm_password:      'CONFIRMAR SENHA',
      repeat_password:       'Repita sua senha',
      create_account:        'CRIAR CONTA',
      verify_email_msg:      'Verifique seu email antes de entrar. Confira sua caixa de entrada.',
      enter_quake_name:      'Digite seu nome no Quake.',
      passwords_no_match:    'As senhas não coincidem.',
      account_created:       '✓ Conta criada para {username}. Enviamos um email de verificação. Faça login quando quiser.',
      err_invalid_email:     'Email inválido.',
      err_user_not_found:    'Nenhuma conta encontrada com esse email.',
      err_wrong_password:    'Senha incorreta.',
      err_invalid_credential:'Email ou senha incorretos.',
      err_email_in_use:      'Já existe uma conta com esse email.',
      err_weak_password:     'A senha deve ter pelo menos 6 caracteres.',
      err_too_many_requests: 'Muitas tentativas. Tente novamente mais tarde.',
      err_network:           'Erro de rede. Verifique sua conexão.',
      err_generic:           'Ocorreu um erro. Tente novamente.',
      actions:               'AÇÕES',
      register_result:       'REGISTRAR RESULTADO',
      copy_result:           'COPIAR RESULTADO',
      save_ranking:          'SALVAR E VER RANKING',
      already_saved:         '✓ Resultado já salvo pelo outro jogador.',
      login_to_save_global:  'para salvar no ranking global',
      new_match_no_save:     'NOVA PARTIDA (SEM SALVAR)',
      phase_maps:            'FASE DE MAPAS',
      pick_ban_complete:     'PICK & BAN COMPLETO',
      champions_phase:       'CAMPEÕES — {label}: {map}',
      step:                  'PASSO {current} / {total}',
      waiting_for:           'Aguardando {player}...',
      waiting_session:       'Aguardando sessão...',
      firebase_error:        'Erro de conexão com Firebase.',
      playing_as:            'Jogando como: {player}',
      a_map:                 'UM MAPA',
      a_champion:            'UM CAMPEÃO',
      ban:                   'BANE',
      pick:                  'ESCOLHE',
      banned:                'BANIDO',
      decider:               'DECISOR',
      map_1:                 'MAPA 1',
      map_2:                 'MAPA 2',
      map_3_decider:         'MAPA 3 · DECISOR',
      map_n:                 'MAPA {n}',
      tracker_bans:          'ban: {bans}',
      log_sorteo:            'Sorteio: {playerSpan} começa banindo',
      log_map_banned:        '{playerSpan} baniu <strong>{mapName}</strong>{suffix}',
      log_map_picked:        '{playerSpan} escolheu <strong>{mapName}</strong>{suffix}',
      log_map3:              '<span class="log-decider">(MAPA 3)</span>',
      log_champ_banned:      '{playerSpan} baniu campeão <strong>{champName}</strong>',
      log_champ_picked:      '{playerSpan} escolheu <strong>{champName}</strong>',
      log_champs_for:        '── Campeões para <strong>{label}: {mapName}</strong>',
      select_winner:         'Selecione um vencedor.',
      select_score:          'Selecione o placar.',
      copied:                '✓ COPIADO',
      error:                 'ERRO',
      ranking:               'RANKING',
      clear_all:             'LIMPAR TUDO',
      standings:             'TABELA DE POSIÇÕES',
      player_col:            'JOGADOR',
      match_history:         'HISTÓRICO DE PARTIDAS',
      date_col:              'DATA',
      match_col:             'PARTIDA',
      maps_col:              'MAPAS',
      no_matches:            'Sem partidas. <a href="index.html">Criar uma</a>',
      no_matches_recorded:   'Sem partidas registradas',
      screenshots:           'SCREENSHOTS',
      confirm_clear:         'Excluir TODOS os dados do ranking? Esta ação não pode ser desfeita.',
      no_permissions:        'Você não tem permissão para limpar o ranking.',
      see_changelog:         'Ver changelog',
      changelog:             'CHANGELOG',
    },

    // ── РУССКИЙ ──────────────────────────────────────────────────────────────
    ru: {
      back_home:             '← ГЛАВНАЯ',
      loading:               'Загрузка...',
      login_tab:             'ВОЙТИ',
      register_tab:          'РЕГИСТРАЦИЯ',
      logout:                'ВЫЙТИ',
      login_register:        'ВОЙТИ / РЕГИСТРАЦИЯ',
      login_to_save:         'чтобы сохранить результаты в рейтинге',
      new_match:             'НОВАЯ ИГРА',
      player_1:              'ИГРОК 1',
      player_2:              'ИГРОК 2',
      name_placeholder:      'Имя',
      start_pickban:         'НАЧАТЬ ПИКБАН',
      names_equal_error:     'Имена игроков не могут совпадать.',
      view_ranking:          'РЕЙТИНГ',
      email:                 'EMAIL',
      password:              'ПАРОЛЬ',
      remember_session:      'ЗАПОМНИТЬ СЕССИЮ',
      enter_btn:             'ВОЙТИ',
      quake_name:            'НИК В QUAKE',
      nick_placeholder:      'Ваш ник в игре',
      min_6_chars:           'Минимум 6 символов',
      confirm_password:      'ПОДТВЕРДИТЬ ПАРОЛЬ',
      repeat_password:       'Повторите пароль',
      create_account:        'СОЗДАТЬ АККАУНТ',
      verify_email_msg:      'Подтвердите email перед входом. Проверьте почту.',
      enter_quake_name:      'Введите ваш ник в Quake.',
      passwords_no_match:    'Пароли не совпадают.',
      account_created:       '✓ Аккаунт создан для {username}. Мы отправили письмо для подтверждения. Войдите когда будете готовы.',
      err_invalid_email:     'Неверный email.',
      err_user_not_found:    'Аккаунт с таким email не найден.',
      err_wrong_password:    'Неверный пароль.',
      err_invalid_credential:'Неверный email или пароль.',
      err_email_in_use:      'Аккаунт с таким email уже существует.',
      err_weak_password:     'Пароль должен содержать не менее 6 символов.',
      err_too_many_requests: 'Слишком много попыток. Попробуйте позже.',
      err_network:           'Ошибка сети. Проверьте подключение.',
      err_generic:           'Произошла ошибка. Попробуйте снова.',
      actions:               'ДЕЙСТВИЯ',
      register_result:       'СОХРАНИТЬ РЕЗУЛЬТАТ',
      copy_result:           'СКОПИРОВАТЬ РЕЗУЛЬТАТ',
      save_ranking:          'СОХРАНИТЬ И РЕЙТИНГ',
      already_saved:         '✓ Результат уже сохранён другим игроком.',
      login_to_save_global:  'чтобы сохранить в глобальный рейтинг',
      new_match_no_save:     'НОВАЯ ИГРА (БЕЗ СОХРАНЕНИЯ)',
      phase_maps:            'ФАЗА КАРТ',
      pick_ban_complete:     'ПИКБАН ЗАВЕРШЁН',
      champions_phase:       'ЧЕМПИОНЫ — {label}: {map}',
      step:                  'ШАГ {current} / {total}',
      waiting_for:           'Ожидаем {player}...',
      waiting_session:       'Ожидаем сессию...',
      firebase_error:        'Ошибка подключения к Firebase.',
      playing_as:            'Вы играете за: {player}',
      a_map:                 'КАРТУ',
      a_champion:            'ЧЕМПИОНА',
      ban:                   'БАНИТ',
      pick:                  'ВЫБИРАЕТ',
      banned:                'ЗАБАНЕН',
      decider:               'РЕШАЮЩАЯ',
      map_1:                 'КАРТА 1',
      map_2:                 'КАРТА 2',
      map_3_decider:         'КАРТА 3 · РЕШАЮЩАЯ',
      map_n:                 'КАРТА {n}',
      tracker_bans:          'бан: {bans}',
      log_sorteo:            'Жребий: {playerSpan} начинает банить',
      log_map_banned:        '{playerSpan} забанил <strong>{mapName}</strong>{suffix}',
      log_map_picked:        '{playerSpan} выбрал <strong>{mapName}</strong>{suffix}',
      log_map3:              '<span class="log-decider">(КАРТА 3)</span>',
      log_champ_banned:      '{playerSpan} забанил чемпиона <strong>{champName}</strong>',
      log_champ_picked:      '{playerSpan} выбрал <strong>{champName}</strong>',
      log_champs_for:        '── Чемпионы для <strong>{label}: {mapName}</strong>',
      select_winner:         'Выберите победителя.',
      select_score:          'Выберите счёт.',
      copied:                '✓ СКОПИРОВАНО',
      error:                 'ОШИБКА',
      ranking:               'РЕЙТИНГ',
      clear_all:             'ОЧИСТИТЬ',
      standings:             'ТУРНИРНАЯ ТАБЛИЦА',
      player_col:            'ИГРОК',
      match_history:         'ИСТОРИЯ МАТЧЕЙ',
      date_col:              'ДАТА',
      match_col:             'МАТЧ',
      maps_col:              'КАРТЫ',
      no_matches:            'Нет матчей. <a href="index.html">Создать</a>',
      no_matches_recorded:   'Матчи не записаны',
      screenshots:           'СКРИНШОТЫ',
      confirm_clear:         'Удалить ВСЕ данные рейтинга? Это действие нельзя отменить.',
      no_permissions:        'У вас нет прав для очистки рейтинга.',
      see_changelog:         'История изменений',
      changelog:             'CHANGELOG',
    },
  };

  // ── LANG METADATA ──────────────────────────────────────────────────────────
  var LANGS   = ['es', 'pt', 'en', 'ru', 'fr'];
  var FLAGS   = { es: '🇪🇸', pt: '🇧🇷', en: 'EN', ru: '🇷🇺', fr: '🇫🇷' };
  var LABELS  = { es: 'Español', pt: 'Português', en: 'English', ru: 'Русский', fr: 'Français' };
  var LOCALES = { es: 'es-AR',   pt: 'pt-BR',     en: 'en-US',  ru: 'ru-RU',   fr: 'fr-FR'  };

  // ── STATE ──────────────────────────────────────────────────────────────────
  var _stored = localStorage.getItem('qc_lang');
  var current = LANGS.indexOf(_stored) >= 0 ? _stored : 'es';

  // ── CORE TRANSLATE ─────────────────────────────────────────────────────────
  function t(key, params) {
    var dict = TRANSLATIONS[current] || TRANSLATIONS['es'];
    var str  = dict[key] !== undefined ? dict[key]
             : (TRANSLATIONS['es'][key] !== undefined ? TRANSLATIONS['es'][key] : key);
    if (params) {
      Object.keys(params).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  // ── APPLY TRANSLATIONS TO DOM ──────────────────────────────────────────────
  function apply() {
    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });

    // Update lang-selector active state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === current);
    });
  }

  // ── SET LANGUAGE ───────────────────────────────────────────────────────────
  function setLang(lang) {
    if (LANGS.indexOf(lang) < 0) return;
    current = lang;
    localStorage.setItem('qc_lang', lang);
    apply();
  }

  // ── INJECT LANGUAGE SELECTOR ───────────────────────────────────────────────
  function injectSelector() {
    var container = document.createElement('div');
    container.className = 'lang-selector';

    LANGS.forEach(function (lang) {
      var btn = document.createElement('button');
      btn.className          = 'lang-btn' + (lang === current ? ' active' : '');
      btn.setAttribute('data-lang', lang);
      btn.title              = LABELS[lang];
      btn.textContent        = FLAGS[lang];
      btn.addEventListener('click', function () { setLang(lang); });
      container.appendChild(btn);
    });

    // If a slot element exists on the page, insert inline there instead of fixed
    var slot = document.getElementById('lang-selector-slot');
    if (slot) {
      slot.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  // ── INIT ───────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', function () {
    apply();
    injectSelector();
  });

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  window.i18n = {
    t:       t,
    setLang: setLang,
    apply:   apply,
    getLang: function () { return current; },
    locale:  function () { return LOCALES[current] || 'es-AR'; },
  };

  // Shorthand
  window.t = t;

})();
