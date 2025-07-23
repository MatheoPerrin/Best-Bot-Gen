require('dotenv').config();
const chalk = require('chalk');

const requiredKeys = ['TOKEN', 'CLIENT_ID'];

function isValidToken(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

function isValidClientId(id) {
  return typeof id === 'string' && /^\d{17,20}$/.test(id);
}

let allGood = true;
console.log(chalk.bold.cyan('\n[✔] Vérification des variables d\'environnement...\n'));

requiredKeys.forEach((key) => {
  const value = process.env[key];

  if (!value) {
    console.log(chalk.red(`❌ ${key} manquant dans le fichier .env`));
    allGood = false;
  } else {
    const isValid =
      key === 'TOKEN' ? isValidToken(value) :
      key === 'CLIENT_ID' ? isValidClientId(value) : true;

    if (!isValid) {
      console.log(chalk.yellow(`⚠️  ${key} est présent mais invalide.`));
      allGood = false;
    } else {
      console.log(chalk.green(`✅ ${key} est correctement défini.`));
    }
  }
});

if (!allGood) {
  console.log(chalk.redBright('\n⛔ Erreur : Corrigez les variables dans le fichier .env.'));
  process.exit(1);
}