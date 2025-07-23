const os = require('os');
const fs = require('fs');
const path = require('path');

const isTermux = process.env.PREFIX?.includes('/data/data/com.termux');
const isARM = os.arch() === 'arm64' || os.arch() === 'arm';
const isAndroid = os.platform() === 'android';

let sharpAvailable = true;
try {
  require.resolve('sharp');
  if (isTermux || isARM || isAndroid) {
    sharpAvailable = false;
  }
} catch (e) {
  sharpAvailable = false;
}

const resultPath = path.join(__dirname, 'sharp-available.json');
fs.writeFileSync(resultPath, JSON.stringify({ available: sharpAvailable }, null, 2));

module.exports = sharpAvailable;