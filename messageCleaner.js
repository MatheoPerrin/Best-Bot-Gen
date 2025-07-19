// helpers/messageCleaner.js

/**

 * Supprime un message ou une réponse après un délai donné

 * @param {Message|InteractionResponse} messageOrReply - Le message ou la réponse

 * @param {number} delay - Délai en millisecondes avant suppression

 */

function isEmojiMessage(msg) {

  const urlRegex = /(https?:\/\/[^\s]+?\.(png|jpg|jpeg|webp|gif))/i;

  return msg.author.bot === false &&

         urlRegex.test(msg.content) &&

         !msg.interaction &&

         !msg.system;

}

function isCustomEmojiMessage(msg) {

  return msg.content?.match(/<a?:\w+:\d+>/g); // emoji Discord custom

}

function isUnicodeEmojiMessage(msg) {

  return /[\p{Emoji}]/u.test(msg.content);

}

function isEmojiMessage(msg) {

  const urlRegex = /(https?:\/\/[^\s]+?\.(png|jpg|jpeg|webp|gif))/i;

  const hasCustomEmoji = /<a?:\w+:\d+>/.test(msg.content);

  const hasUnicodeEmoji = /[\p{Emoji}]/u.test(msg.content);

  return (

    !msg.author.bot &&

    (urlRegex.test(msg.content) || hasCustomEmoji || hasUnicodeEmoji)

  );

}

async function autoDelete(messageOrReply, delay = 5000) {

  setTimeout(async () => {

    try {

      if (messageOrReply?.deletable) {

        await messageOrReply.delete();

      } else if (messageOrReply?.deleteReply) {

        await messageOrReply.deleteReply();

      }

    } catch (e) {

      console.warn('⚠️ autoDelete :', e.message);

    }

  }, delay);

}

/**

 * Supprime le message du bot + le message original de l’utilisateur (si possible)

 * @param {Interaction} interaction - L'interaction Discord

 * @param {Message} botReply - Le message du bot à supprimer

 * @param {number} delay - Délai avant suppression

 */


async function cleanInteraction(interaction, botReply, delay = 5000, maxAgeSec = 120) {
  autoDelete(botReply, delay);

  try {
    const messages = await interaction.channel.messages.fetch({ limit: 30 });

    const now = Date.now();

    // 1️⃣ Cherche un message emoji/lien/image valide
    const emojiMsg = messages.find(msg =>
      msg.author.id === interaction.user.id &&
      isEmojiMessage(msg) &&
      now - msg.createdTimestamp <= maxAgeSec * 1000
    );

    // 2️⃣ Sinon, prend le dernier message texte de l'utilisateur récent
    const fallbackMsg = messages.find(msg =>
      msg.author.id === interaction.user.id &&
      !msg.system &&
      !msg.interaction &&
      now - msg.createdTimestamp <= maxAgeSec * 1000
    );

    const target = emojiMsg || fallbackMsg;

    if (target?.deletable) {
      await target.delete();
      console.log(`🧹 Message supprimé : "${target.content}"`);
    } else {
      console.log(`ℹ️ Aucun message utilisateur à supprimer`);
    }

  } catch (err) {
    console.warn('⚠️ cleanInteraction :', err.message);
  }
}

module.exports = {

  autoDelete,

  cleanInteraction

};