// messageCleaner.js

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

async function cleanInteraction(interaction, botReply, delay = 5000, maxAgeSec = 120) {
  autoDelete(botReply, delay);

  try {
    const messages = await interaction.channel.messages.fetch({ limit: 30 });

    const now = Date.now();

    const emojiMsg = messages.find(msg =>
      msg.author.id === interaction.user.id &&
      isEmojiMessage(msg) &&
      now - msg.createdTimestamp <= maxAgeSec * 1000
    );

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
