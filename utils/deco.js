// utils/roleLabel.js

function detectTimeEmojiPrefix(name) {

  const timeMatch = name.match(/(\d+)\s*(m|min|minutes?)/i);

  if (!timeMatch) return null;

  const clocks = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'];

  const minutes = parseInt(timeMatch[1], 10);

  return clocks[minutes % clocks.length];

}

function capitalizeFirstLetter(name) {

  const match = name.match(/^([\p{Emoji}\W_]*)([a-zA-ZÀ-ÿ])(.*)$/u);

  if (!match) return name;

  const [, prefix, firstChar, rest] = match;

  return `${prefix}${firstChar.toUpperCase()}${rest}`;

}

function hasEmojiPrefix(name) {

  return /^\p{Emoji}/u.test(name.trim());

}

function formatRoleLabel(name) {

  const lower = name.toLowerCase();

  let emojiPrefix = '';

  const hasLeadingEmoji = hasEmojiPrefix(name);

  const timeEmoji = !hasLeadingEmoji ? detectTimeEmojiPrefix(name) : null;

  if (timeEmoji) emojiPrefix += `${timeEmoji} `;

  if (!hasLeadingEmoji) {

    if (lower.includes('fourni') || lower.includes('stock')) emojiPrefix += '📦 ';

    else if (lower.includes('membre') || lower.includes('member') || lower.includes('utilisateur') || lower.includes('user')) emojiPrefix += '👤 ';

    else if (lower.includes('admin') || lower.includes('modo')) emojiPrefix += '🛡️ ';
      
    else if (lower.includes('boost')) emojiPrefix += '🔮 ';

    else if (lower.includes('premium') || lower.includes('vip')) emojiPrefix += '💎 ';

    else if (lower.includes('test')) emojiPrefix += '🧪 ';

  }

  const capitalized = capitalizeFirstLetter(name);

  return `${emojiPrefix}${capitalized}`.trim();

}

module.exports = {

  formatRoleLabel

};

