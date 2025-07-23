const os = require('os');
const chalk = require('chalk');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function checkDevice() {
  const isTermux = process.env.PREFIX?.includes('/data/data/com.termux');
  const isARM = os.arch() === 'arm64' || os.arch() === 'arm';
  const isAndroid = os.platform() === 'android';
  const isReplit = process.env.REPL_ID || process.env.REPL_OWNER || process.env.REPLIT_DB_URL;

  let warned = false;

  if (isTermux || isARM || isAndroid) {
    console.log(chalk.bold.yellow('\n⚠️  ATTENTION : Votre environnement ne supporte pas le module `sharp`.'));
    console.log(chalk.yellowBright('📵 `sharp` sera automatiquement désactivé pour éviter les erreurs.'));
    warned = true;
  }

  if (isReplit) {
    console.log(chalk.red('\n🚫 Replit détecté'));
    console.log(chalk.redBright('⚠️  Les bots Discord ne peuvent pas rester en ligne 24h/24 sur Replit.'));
    console.log(chalk.gray('🕓 Utilisez un hébergeur alternatif ou UptimeRobot pour garder le bot actif.'));
    warned = true;
  }

  if (warned) {
    console.log(chalk.gray('\n⏳ Démarrage dans 5 secondes...\n'));
    await sleep(5000);
  }
};