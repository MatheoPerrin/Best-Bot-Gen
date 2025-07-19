// utils/roleLabel.js

/**

 * Détecte si le nom contient une durée (ex: 5min, 10M) et retourne un emoji horloge

 */

function detectTimeEmojiPrefix(name) {

  const timeMatch = name.match(/(\d+)\s*(m|min|minutes?)/i);

  if (!timeMatch) return null;

  const clocks = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'];

  const minutes = parseInt(timeMatch[1], 10);

  return clocks[minutes % clocks.length];

}

/**

 * Met en majuscule la première lettre alphabétique d'un nom, en conservant les emojis ou caractères spéciaux devant.

 */

function capitalizeFirstLetter(name) {

  const match = name.match(/^([\p{Emoji}\W_]*)([a-zA-ZÀ-ÿ])(.*)$/u);

  if (!match) return name;

  const [, prefix, firstChar, rest] = match;

  return `${prefix}${firstChar.toUpperCase()}${rest}`;

}

/**

 * Vérifie si le nom commence par un emoji Discord standard

 */

function hasEmojiPrefix(name) {

  return /^\p{Emoji}/u.test(name.trim());

}

/**

 * Formate le nom du rôle : majuscule sur première lettre alphabétique,

 * ajoute emoji contextuel (📦, 👤, ...) + horloge si durée détectée,

 * sauf si un emoji est déjà au début du nom.

 */

function formatRoleLabel(name) {

  const lower = name.toLowerCase();

  let emojiPrefix = '';

  const hasLeadingEmoji = hasEmojiPrefix(name);

  // 🕒 Horloge si durée détectée et pas déjà d'emoji

  const timeEmoji = !hasLeadingEmoji ? detectTimeEmojiPrefix(name) : null;

  if (timeEmoji) emojiPrefix += `${timeEmoji} `;

  // 📦 Emoji selon contenu (uniquement si pas déjà d'emoji)

  if (!hasLeadingEmoji) {

    if (lower.includes('fourni') || lower.includes('stock')) emojiPrefix += '📦 ';

    else if (lower.includes('membre') || lower.includes('member') || lower.includes('utilisateur') || lower.includes('user')) emojiPrefix += '👤 ';

    else if (lower.includes('admin') || lower.includes('modo')) emojiPrefix += '🛡️ ';
      
    else if (lower.includes('boost')) emojiPrefix += '🔮 ';

    else if (lower.includes('premium') || lower.includes('vip')) emojiPrefix += '💎 ';

    else if (lower.includes('test')) emojiPrefix += '🧪 ';

  }

  // ✅ Appliquer majuscule à la première lettre alphabétique réelle

  const capitalized = capitalizeFirstLetter(name);

  return `${emojiPrefix}${capitalized}`.trim();

}

module.exports = {

  formatRoleLabel

};

