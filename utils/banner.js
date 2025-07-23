const figlet = require('figlet');

const chalk = require('chalk');

const gradient = require('gradient-string');

const ora = require('ora');

async function showBanner(client) {

  console.clear();

  process.stdout.write('\x1Bc');

  const spinner = ora({

    text: chalk.cyan('🚀 Démarrage du bot...\n'),

    spinner: 'dots'

  }).start();

  await new Promise(resolve => setTimeout(resolve, 2500));

  spinner.stop();
    
  const spinner2 = ora({

    text: chalk.cyan('⚙️ Actualisation...\n'),

    spinner: 'dots2'

  }).start();
   
  await new Promise(resolve => setTimeout(resolve, 500));
    
  spinner2.stop();
    
  process.stdout.write('\x1Bc');

  const isSmall = process.stdout.columns < 80;

  const ascii = figlet.textSync('BOT GEN', {

    font: isSmall ? 'Small' : 'Standard',

    horizontalLayout: 'default',

    verticalLayout: 'default'

  });

  const width = Math.min(process.stdout.columns, 70);

  const line = '─'.repeat(width);

  const version = '1.0.1';

  const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`;

  const profileURL = `https://discord.com/users/${client.user.id}`;

  console.log(isSmall ? chalk.cyan(ascii) : gradient.retro.multiline(ascii));

  const versionText = chalk.bold('🧩  Version ') + chalk.hex('#00ffff')(version);

  console.log(chalk.gray(line));

  const madeBy = chalk.bold('⚡  Made by ') +

    chalk.hex('#00ffff')('o3gy') +

    chalk.gray(' (Laser)');

  console.log(centerText(versionText + ' | ' + madeBy, width));

  console.log(chalk.gray(line));

  console.log(chalk.cyan('🤖  Nom : ') + chalk.white(client.user.username));

  console.log(chalk.cyan('🏷️   Tag : ') + chalk.white(`${client.user.tag}`));

  console.log(chalk.cyan('🆔  ID : ') + chalk.white(client.user.id));
    
  console.log(chalk.cyan('🌐  Serveurs : ') + chalk.white(client.guilds.cache.size));

  console.log(chalk.cyan('👤  Profil : ') + chalk.underline.blue(profileURL));

  console.log(chalk.cyan('🔗  Invitation : ') + chalk.underline.blue(inviteURL));

  console.log('');

}

function centerText(text, width = process.stdout.columns) {

  const clean = text.replace(/\x1b\[[0-9;]*m/g, ''); // retire codes couleur

  const pad = Math.max(0, Math.floor((width - clean.length) / 2));

  return ' '.repeat(pad) + text;

}

module.exports = { showBanner };
