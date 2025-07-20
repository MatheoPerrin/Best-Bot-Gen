const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");

const requiredPackages = ["chalk", "boxen", "ora"];
let missing = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
  } catch {
    missing.push(pkg);
  }
}

if (missing.length > 0) {
  console.log("\n📦 Modules manquants détectés, installation en cours...");
  const result = spawnSync("npm", ["install", ...missing], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`❌ Erreur d'installation des modules : ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("\n🔁 Redémarrage automatique du script...\n");
  require("child_process").spawn("node", [process.argv[1]], {
    stdio: "inherit",
    shell: true,
  });
  process.exit();
}

const chalk = require("chalk");
const boxen = require("boxen");
const ora = require("ora");

const arch = os.arch();
const platform = os.platform();
const isMobile = arch.includes("arm") || platform === "android";
const isTermux = process.env.PREFIX && process.env.PREFIX.includes("com.termux");

if (isMobile || isTermux) {
  const spinner = ora("Vérification de l'environnement...").start();

  setTimeout(() => {
    spinner.fail("❌ Lancement bloqué : Environnement mobile détecté.");
    console.log(boxen(
      chalk.red.bold("❌ Ce projet ne peut pas être exécuté depuis Termux ou un téléphone.\n\n") +
      chalk.yellow("💡 Utilise plutôt un VPS Linux, un serveur Node.js ou un hébergeur cloud (Render, Railway, etc)."),
      {
        padding: 1,
        margin: 1,
        borderStyle: "bold",
        borderColor: "red",
        title: "Best-Bot-Gen ⚠️",
        titleAlignment: "center"
      }
    ));
    process.exit(1);
  }, 1000);
}
