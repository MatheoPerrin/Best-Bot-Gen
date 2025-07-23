// cooldown.js
const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

const { formatRoleLabel } = require('../utils/deco.js');

const cooldownFile = path.join(__dirname, '../config/cooldowns.json');

function readCooldowns() { if (!fs.existsSync(cooldownFile)) return {}; return JSON.parse(fs.readFileSync(cooldownFile, 'utf8')); }

function writeCooldowns(data) { fs.writeFileSync(cooldownFile, JSON.stringify(data, null, 2)); }

function getCooldownPageEmbed(guild, cooldowns) {
    const embed = new EmbedBuilder()
    .setTitle('⏱ Configuration des Cooldowns')
    .setColor(0x57f287)
.setImage('https://i.ibb.co/fgPn6vW/Picsart-25-06-15-18-25-47-864.png')
    .setFooter({ text: 'Page 3/3 - Cooldowns' });


    const cooldownEntries = Object.entries(cooldowns).filter(([key]) => key !== 'default');

if (!cooldownEntries.length) {

  embed.setDescription('ℹ️ Aucun rôle avec cooldown configuré.');

} else {

  cooldownEntries.forEach(([roleId, minutes]) => {

    const role = guild.roles.cache.get(roleId);
    const roleName = role ? formatRoleLabel(role.name) : `Rôle inconnu (${roleId})`;

    embed.addFields({ name: roleName, value: `${minutes} minute(s)`, inline: true });

  });

}

if ('default' in cooldowns) {

  embed.addFields({

    name: '🕒 Cooldown par défaut',

    value: `${cooldowns.default} minute(s)`,

    inline: false

  });

}

return embed; 
}

function getCooldownRoleMenu(cooldowns, guild) {
  const options = Object.keys(cooldowns)

  .filter(roleId => roleId !== 'default') // ✅ on exclut "default"

  .map(roleId => {

    const role = guild.roles.cache.get(roleId);

    return {

      label: role ? role.name : `Rôle inconnu`,

      value: `cooldown-${roleId}`

    };

  })

  .slice(0, 24);

options.push({

  label: '🕒 Modifier le cooldown par défaut',

  value: 'cooldown-default'

});
    
  if (options.length === 0) return null;

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('cooldown-modify')
      .setPlaceholder('Modifier un cooldown')
      .addOptions(options)
  );
}

function getCooldownButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('cooldown-add').setLabel('➕ Ajouter').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('cooldown-remove').setLabel('➖ Supprimer').setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('switch-to-bot').setLabel('🤖').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('switch-to-jsonc').setLabel('📃').setStyle(ButtonStyle.Primary)
  );

  return [row1, row2];
}

function getAddCooldownModal() { return new ModalBuilder() .setCustomId('modal-cooldown-add') .setTitle('➕ Ajouter un cooldown') .addComponents( new ActionRowBuilder().addComponents( new TextInputBuilder() .setCustomId('role-id') .setLabel('ID du rôle') .setStyle(TextInputStyle.Short) .setMaxLength(19) .setRequired(true) ), new ActionRowBuilder().addComponents( new TextInputBuilder() .setCustomId('cooldown-minutes') .setLabel('Durée (minutes)')
.setStyle(TextInputStyle.Short)
.setMaxLength(3)
.setRequired(true) ) ); }

function getEditCooldownModal(roleId, currentValue) { return new ModalBuilder() .setCustomId(`modal-cooldown-edit-${roleId}`) .setTitle(`✏️ Modifier cooldown pour ${roleId}`) .addComponents( new ActionRowBuilder().addComponents( new TextInputBuilder() .setCustomId('cooldown-minutes') .setLabel('Nouvelle durée (minutes)') .setStyle(TextInputStyle.Short) .setRequired(true)
.setMaxLength(3)
.setValue(String(currentValue)) ) ); }

function getEditDefaultCooldownModal(currentValue) {

  return new ModalBuilder()

    .setCustomId('modal-cooldown-default')

    .setTitle('🕒 Modifier le cooldown par défaut')

    .addComponents(

      new ActionRowBuilder().addComponents(

        new TextInputBuilder()

          .setCustomId('cooldown-minutes')

          .setLabel('Durée (minutes)')

          .setStyle(TextInputStyle.Short)
          
          .setMaxLength(3)

          .setRequired(true)

          .setValue(String(currentValue ?? 20))

      )

    );

}

function getRemoveCooldownMenu(cooldowns, guild) { 
    const cooldownEntries = Object.entries(cooldowns).filter(([key]) => key !== 'default');
    if (!cooldownEntries.length) {
       return null;
    }
    const options = Object.keys(cooldowns).filter(roleId => roleId !== 'default').map(roleId => { const role = guild.roles.cache.get(roleId); return { label: role ? role.name : `Rôle inconnu`, value: `remove-${roleId}` }; });

return new ActionRowBuilder().addComponents( new StringSelectMenuBuilder() .setCustomId('cooldown-remove-select') .setPlaceholder('Sélectionnez un rôle à supprimer') .addOptions(options) ); }

module.exports = { readCooldowns, writeCooldowns, getCooldownPageEmbed, getCooldownRoleMenu, getCooldownButtons, getAddCooldownModal, getEditCooldownModal, getEditDefaultCooldownModal, getRemoveCooldownMenu };

