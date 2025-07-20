const os = require('os');
const fs = require('fs');

const isAndroid = os.platform() === 'linux' && os.arch() === 'arm64';
const isTermux = process.env.PREFIX?.includes('com.termux') || fs.existsSync('/data/data/com.termux');

if (isAndroid || isTermux) {
  console.error(`❌ Ce projet ne peut pas être exécuté sur Termux ou un terminal Android.
Veuillez utiliser un VPS, un hébergeur de bot, ou un serveur Linux/Windows.
`);
  process.exit(1); // Arrête le programme
}
