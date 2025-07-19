function setupAntiCrash(options = {}) {

  const {

    onCleanup = () => {},

    exitOnError = false,

  } = options;

  // Erreur fatale non catchée

  process.on('uncaughtException', (err) => {

    console.error('[antiCrash] uncaughtException :', err);

    try {

      onCleanup(err);

    } catch (cleanupErr) {

      console.error('[antiCrash] Erreur dans le nettoyage:', cleanupErr);

    }

    if (exitOnError) {

      console.log('[antiCrash] Arrêt du process après uncaughtException.');

      process.exit(1);

    } else {

      console.log('[antiCrash] Process continue après uncaughtException (risqué)');

    }

  });

  // Promesse rejetée non catchée

  process.on('unhandledRejection', (reason, promise) => {

    console.error('[antiCrash] unhandledRejection :', reason);

    try {

      onCleanup(reason);

    } catch (cleanupErr) {

      console.error('[antiCrash] Erreur dans le nettoyage:', cleanupErr);

    }

    if (exitOnError) {

      console.log('[antiCrash] Arrêt du process après unhandledRejection.');

      process.exit(1);

    } else {

      console.log('[antiCrash] Process continue après unhandledRejection (risqué)');

    }

  });

  // Signaux système (CTRL+C, kill, quit)

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {

    process.on(signal, () => {

      console.log(`[antiCrash] Signal ${signal} reçu, nettoyage avant arrêt...`);

      try {

        onCleanup();

      } catch (cleanupErr) {

        console.error('[antiCrash] Erreur dans le nettoyage:', cleanupErr);

      }

      process.exit(0);

    });

  });

  // Avertissements Node.js (ex: dépréciation)

  process.on('warning', (warning) => {

    console.warn('[antiCrash] Warning Node.js :', warning.name);

    console.warn(warning.message);

    console.warn(warning.stack);

  });

  // Promesses résolues ou rejetées plusieurs fois (peut indiquer un bug)

  process.on('multipleResolves', (type, promise, reason) => {

    console.warn('[antiCrash] multipleResolves détecté :', type);

    console.warn('Promise:', promise);

    console.warn('Reason:', reason);

  });

  // (optionnel) Avant la sortie (utile pour logs)

  process.on('beforeExit', (code) => {

    console.log('[antiCrash] beforeExit event, code:', code);

  });

  // (optionnel) Après la sortie (dernier event)

  process.on('exit', (code) => {

    console.log('[antiCrash] Process exited avec code:', code);

  });

  console.log('[antiCrash] Module anti-crash activé');

}

module.exports = setupAntiCrash;