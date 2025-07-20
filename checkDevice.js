const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

function tryRequire(pkg) {
  try {
    return require(pkg);
  } catch (e) {
    console.log(`[!] Installation du package requis : ${pkg}...`);
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
    return require(pkg);
  }
}

const chalk = tryRequire('chalk');
const boxen = tryRequire('boxen');

const isAndroid = os.platform() === 'linux' && os.arch() === 'arm64';
const isTermux = process.env.PREFIX?.includes('com.termux') || fs.existsSync('/data/data/com.termux');

if (isAndroid || isTermux) {
  const message = `
${chalk.red.bold('🚫 Exécution impossible sur ce terminal !')}

Ce bot ne peut pas être lancé depuis ${chalk.yellow.bold('Termux')} ou un terminal ${chalk.cyan.bold('mobile')}.

👉 Merci d’utiliser un ${chalk.green.bold('VPS')}, un ${chalk.green.bold('ordinateur')} ou un ${chalk.green.bold('hébergeur Node.js')}.
`;

  const styled = boxen(message, {
    padding: 1,
    borderColor: 'red',
    borderStyle: 'round',
    align: 'center',
  });

  console.log(styled);
  process.exit(1);
}
