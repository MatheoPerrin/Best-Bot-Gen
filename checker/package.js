(async () => {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  const requiredModules = ['chalk'];

  for (const mod of requiredModules) {
    try {
      require.resolve(mod);
    } catch {
      console.log(`[🔧] Installation de ${mod}...`);
      execSync(`npm install ${mod}`, { stdio: 'inherit' });
    }
  }

  const chalk = require('chalk');

  const os = require('os');
  const isTermux = process.env.PREFIX?.includes('/data/data/com.termux');
  const isARM = os.arch() === 'arm64' || os.arch() === 'arm';
  const isAndroid = os.platform() === 'android';
  const isSharpBlocked = isTermux || isARM || isAndroid;

  const packageJson = require(path.join(__dirname, '../package.json'));
  const dependencies = Object.keys(packageJson.dependencies || {});

  console.log(chalk.bold.cyan('\n📦 Vérification des dépendances...\n'));

  const missing = [];

  for (const pkg of dependencies) {
    if (pkg === 'sharp' && isSharpBlocked) {
      console.log(chalk.gray(`⚠️  sharp ignoré sur cet appareil (ARM / Termux / Android)`));
      continue;
    }

    try {
      require.resolve(pkg);
      console.log(chalk.green(`✅ ${pkg} est installé.`));
    } catch {
      console.log(chalk.yellow(`⚠️  ${pkg} est manquant.`));
      missing.push(pkg);
    }
  }

  if (missing.length > 0) {
    console.log(chalk.bold.yellow(`\n📥 Installation de ${missing.length} dépendance(s) manquante(s)...\n`));
    try {
      execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
      console.log(chalk.greenBright('\n✅ Tous les packages ont été installés avec succès.\n'));
    } catch (err) {
      console.error(chalk.red(`❌ Échec de l'installation automatique.`));
      console.error(err.message);
      process.exit(1);
    }
  } else {
    console.log(chalk.greenBright('\n✔️ Aucune dépendance manquante.\n'));
  }
})();