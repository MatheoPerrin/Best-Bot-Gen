// Pour configurer le token du bot et id du serveur, allez sur le fichier .env et pour le reste (role,salon...), allez sur le dossier config et ensuite sur le fichier config.jsonc
// Pour les problèmes ou autre, contactez moi depuis mon discord: o3gy

(async () => {
require('./checker/package');
require('./checker/sharp');
require('./checker/info');
await require("./checker/device")();


const {

  Client,

  GatewayIntentBits,

  SlashCommandBuilder,

  EmbedBuilder,

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,
    
  StringSelectMenuBuilder,

  ModalBuilder,

  TextInputBuilder,

  REST,

  Routes

} = require('discord.js');

const {

  readCooldowns,

  writeCooldowns,

  getCooldownPageEmbed,

  getCooldownRoleMenu,

  getCooldownButtons,

  getAddCooldownModal,

  getEditCooldownModal,
    
  getEditDefaultCooldownModal,

  getRemoveCooldownMenu

} = require('./utils/cooldown.js');

const fs = require('fs');

const path = require('path');

const { cleanInteraction, autoDelete } = require('./utils/messageCleaner');

const { showBanner } = require('./utils/banner');

const { footerText } = require('./config/config_bot');

function getFooterText(interactionOrClient) {

  if (footerText?.length) return footerText;

  if (interactionOrClient.guild) {

    return interactionOrClient.guild.name;

  }

  const client = interactionOrClient.client || interactionOrClient;

  const firstGuild = client.guilds.cache.first();

  return firstGuild ? firstGuild.name : 'Bot';

}

const commentJson = require('comment-json');

const raw = fs.readFileSync('./config/config.jsonc', 'utf8');

let config = commentJson.parse(raw);
let currentConfig = '';

const fetch = require('node-fetch');

const axios = require('axios');

const { Vibrant } = require('node-vibrant/node');

const { available: sharpAvailable } = require('./checker/sharp-available.json');
const sharp = sharpAvailable ? require('sharp') : null;

//const sharp = require('sharp');

const emojiRegex = require('emoji-regex');

function updateConfigKey(key, value, configFile = '/config/config.jsonc') {
  const configPath = path.join(__dirname, configFile);

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Le fichier ${configFile} est introuvable.`);
    return;
  }

  const rawContent = fs.readFileSync(configPath, 'utf8');
  let config;

  try {
    config = commentJson.parse(rawContent, null, true);
  } catch (err) {
    console.error('❌ Erreur lors du parsing JSONC :', err);
    return;
  }
  config[key] = value;
    
  currentConfig = config;

  const updated = commentJson.stringify(config, null, 2);

  fs.writeFileSync(configPath, updated, 'utf8');
  console.log(`✅ Clé "${key}" mise à jour dans ${configFile}`);
  
}

async function findServiceUrl(label) {
  const cleanLabel = label.replace(/'/g, '-').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  const query = `${cleanLabel} site officiel`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const wiki = require('wikijs').default;

async function fetchServiceMetaFromWiki(label) {
    if(label === 'free') {
        label = 'freebox';
  } else if (label === 'molotov') { 
        label = 'molotovtv'
      } else if (label === 'supercell') {
        label = 'supercell (entreprise)'
          }
  try {
    const page = await wiki({ apiUrl: 'https://fr.wikipedia.org/w/api.php' }).page(label);
    const summary = await page.summary();
    const images = await page.images();

    const image = findBestBannerImage(images);
    const description = truncateDescription(summary);

    return { description, image };
  } catch (err) {
    console.warn(`[wiki] Erreur pour "${label}" : ${err.message}`);
    return null;
  }
}

function generateAIDescription(label) {
  const lower = label.toLowerCase();

  if (lower.includes('netflix') || lower.includes('disney') || lower.includes('prime') || lower.includes('flix')) {
    return `${label} est une plateforme de streaming proposant un large catalogue de films, séries et documentaires.`;
  }

  if (lower.includes('spotify') || lower.includes('deezer') || lower.includes('music') || lower.includes('sound')) {
    return `${label} est un service de streaming musical permettant d'écouter des millions de titres en ligne.`;
  }

  if (lower.includes('vpn') || lower.includes('proxy') || lower.includes('surfshark')) {
    return `${label} est un service VPN permettant de naviguer anonymement et de sécuriser votre connexion.`;
  }

  if (lower.includes('crunchy') || lower.includes('anime') || lower.includes('manga')) {
    return `${label} est une plateforme spécialisée dans le streaming d'anime et de contenus asiatiques.`;
  }

  if (lower.includes('office') || lower.includes('microsoft') || lower.includes('drive')) {
    return `${label} offre des outils de productivité et de stockage en ligne pour les particuliers et les professionnels.`;
  }

  if (lower.includes('chat') || lower.includes('ai') || lower.includes('gpt')) {
    return `${label} est une intelligence artificielle conçue pour répondre à vos questions et vous assister dans vos tâches.`;
  }

  return `${label} est un service numérique apprécié, reconnu pour sa simplicité d'utilisation et ses fonctionnalités variées.`;
}

function getDefaultBanner(label) {
  const lower = label.toLowerCase();

  if (lower.includes('netflix') || lower.includes('prime') || lower.includes('flix')) {
    return 'https://iili.io/FEbcABa.jpg';
  }

  if (lower.includes('spotify') || lower.includes('deezer') || lower.includes('music')) {
    return 'https://www.radiofrance.fr/s3/cruiser-production/2020/04/b7e60c82-ad67-4758-bf43-e66daf21f6d6/1200x680_gettyimages-94376656.webp';
  }

  if (lower.includes('vpn') || lower.includes('proxy') || lower.includes('surfshark')) {
    return 'https://images.bfmtv.com/Vn3G_b2fE_2GziReZ3oLNG-Odoc=/0x0:1920x1228/640x0/images/VPN-Avantages-pourquoi-utiliser-un-tel-logiciel-et-quelle-utilite-1502676.jpg';
  }

  if (lower.includes('crunchy') || lower.includes('anime') || lower.includes('manga')) {
    return 'https://d36vu4awtdgnqw.cloudfront.net/1svg1%2Fpreview%2F68932792%2Fmain_full.jpg?response-content-disposition=inline%3Bfilename%3D%22main_full.jpg%22%3B&response-content-type=image%2Fjpeg&Expires=1752177526&Signature=GdyAJ3XA~l5qzXoZYjNg6iesASuAkilsdwa1CT4Ck7m2MY9PI4qGeErC6GxJm4vr1pxLufkC21zlU63Iaut5D2Smo2sMSeAgGe9AXS5EfomwYqfnQMm5JK5AsvAt3XbZ-HmHZNw9mNqvv2rPg9RS4zeqsGc~Cg4OvLc~um~zqAm6fjEgf0u1SUy7OIr1uNDeqY0A0FkGqove2veVvYnt68vu9blUVvnxrnbspUm4XZkVIvBTQTlPBIrYGHsk1bmCSeZOSLEwNBa92L-qdFnKFqUrr9xQQ5SqeaLBpiyAs3Bzsd7Baeh9-e6uXBhcnfN7QvJ0eBjN5uLjm1MpN6cjvA__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ';
  }

  if (lower.includes('office') || lower.includes('drive') || lower.includes('mail')) {
    return 'https://iili.io/FEbtBWl.jpg';
  }

  if (lower.includes('chat') || lower.includes('gpt') || lower.includes('ai')) {
    return 'https://iili.io/FEbyYKl.jpg';
  }

  return 'https://i.postimg.cc/3JNYRMTg/Chiffres-reseaux-sociaux-2023.jpg';
}

function truncateDescription(text, maxLength = 400) {

  if (text.length <= maxLength) return text;

  const clean = text.slice(0, maxLength);

  return clean.slice(0, clean.lastIndexOf(' ')) + '...';

}

function findBestBannerImage(images) {

  return images.find(url =>

    /\.(jpg|jpeg|png|webp)$/i.test(url) &&

    /banner|header|hero|background/i.test(url) &&

    !/logo|icon/i.test(url)

  ) ||

  images.find(url =>

    /\.(jpg|jpeg|png|webp)$/i.test(url) &&

    !/logo|icon|favicon/i.test(url)

  ) || null;

}

const setupAntiCrash = require('./utils/antiCrash.js');

setupAntiCrash({

  onCleanup: (err) => {

    console.log('[Cleanup] On nettoie avant fermeture...', err ? err.message : '');

  },

  exitOnError: false,

});

console.log('App Node.js démarrée');

setTimeout(() => {

  throw new Error('Erreur uncaughtException test');

}, 2000);

setTimeout(() => {

  Promise.reject('Rejet unhandledRejection test');

}, 4000);

require('dotenv').config();

const client = new Client({

  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent

  ]

});

const cooldown = new Map();

let ROLE_VIP = config.VIP_ROLE_ID;

let FOURNI_USER_ID = config.FOURNI_ROLE_ID;

let ADMIN_USER_ID = config.ADMIN_ROLE_ID;

let STOCK_CHANNEL_ID = config.STOCK_CHANNEL_ID;

let PANEL_CHANNEL_ID = config.PANEL_CHANNEL_ID;

let REQUIRED_ROLE_ID = config.REQUIRED_ROLE_ID;

const stockFolder = path.join(__dirname, 'stock');

let lac = 0;

let pax = 0;

let val_banner = 0;

let content_banner = "";

 const styleMap = {

    Primary: ButtonStyle.Primary,

    Secondary: ButtonStyle.Secondary,

    Success: ButtonStyle.Success,

    Danger: ButtonStyle.Danger,

    Link: ButtonStyle.Link,

  };

const styleColor = {

  Primary: 0x5865f2,    // bleu

  Secondary: 0xffffff,  // blanc

  Success: 0x57f287,    // vert

  Danger: 0xed4245      // rouge

};

function getCooldownGradientColor(progress) {

  progress = Math.min(Math.max(progress, 0), 1);

  let r, g, b;

  if (progress < 0.5) {

    // 🔴 → 🟡

    const t = progress * 2;

    r = Math.round(231 + (241 - 231) * t);

    g = Math.round(76 + (196 - 76) * t);

    b = Math.round(60 + (15 - 60) * t);

  } else {

    // 🟡 → 🟢

    const t = (progress - 0.5) * 2;

    r = Math.round(241 + (46 - 241) * t);

    g = Math.round(196 + (204 - 196) * t);

    b = Math.round(15 + (113 - 15) * t);

  }

  return (r << 16) + (g << 8) + b;

}

function simpleUUID() {

  return 'xxxxxxxxyxxxxyxxx'.replace(/[xy]/g, c =>

    (Math.random() * 16 | 0).toString(16));

}

async function getDominantColorFromImageUrl(imageUrl) {
  try {
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const inputBuffer = Buffer.from(res.data, 'binary');
    let jpegBuffer = inputBuffer;
    if(sharp) {
    jpegBuffer = await sharp(inputBuffer).jpeg().toBuffer();
    }

    const tempName = `temp-${simpleUUID()}.jpg`;
    const tempPath = path.join(__dirname, tempName);

    fs.writeFileSync(tempPath, jpegBuffer);

    const palette = await Vibrant.from(tempPath).getPalette();

    fs.unlink(tempPath, err => {
      if (err) console.warn('⚠️ Fichier temporaire non supprimé :', err.message);
    });

    const hex = palette?.Vibrant?.hex
             || palette?.DarkMuted?.hex
             || palette?.Muted?.hex;

    if (hex) {
      console.log(`🎨 Couleur extraite : ${hex}`);
      return parseInt(hex.replace('#', ''), 16);
    } else {
      console.warn('⚠️ Aucune couleur trouvée, fallback.');
      return 0x2f3136;
    }

  } catch (err) {
    console.error('❌ Erreur analyse couleur image :', err.message || err);
    return 0x2f3136;
  }
}

async function getServiceSelectEmbed(client, services, config) {
  let imageUrl = null;
  if (config.banner?.length) {
    imageUrl = config.banner;
  } else {
    if (val_banner === 0) {
      imageUrl = client.user.bannerURL({ size: 1024, format: 'png' });
      content_banner = imageUrl;
      val_banner = 1;
    } else {
      imageUrl = content_banner;
    }
  }
    
  let availableServices = 0;
  const totalServices = services.length;

  await services.map(service => {
    let count = 0;
    if (fs.existsSync(service.file)) {
      count = fs.readFileSync(service.file, 'utf8')
        .split('\n')
        .filter(line => line.trim()).length;
    }

    if (count > 0) {
      availableServices++;
    }

    return null;
  }).filter(Boolean).join('\n');

    let embedColor = 0x2f3136;

    embedColor = await getDominantColorFromImageUrl(imageUrl)
    console.log(embedColor);
    const embed = new EmbedBuilder()

    .setTitle('📦 Générateur de services')

    .setDescription('Sélectionnez un service ci-dessous pour générer.\n\n➔ Y\'a **'+ totalServices +'** services dont **'+ availableServices +'** disponible\n\n⚠️ Nous respectons le **[t.o.s](https://discord.com/terms)** de Discord !')

    .setColor(embedColor);

  if (imageUrl) embed.setImage(imageUrl);
    
  console.log("Embed préparer");

  return embed;

}

function normalizeEmojiName(name) {
  return name
    .toLowerCase()
    .replace(/[\s+'*&@!.:;|\\/#-]/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function cleanupUnusedEmojisSmart(client, services) {
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.log('❌ Aucun serveur trouvé.');
    return;
  }

  const emojis = await guild.emojis.fetch();
  const usedImageHashes = new Set();

  const validEmojiNames = new Set(
    services.map(s => normalizeEmojiName(s.id || ''))
  );

  let total = 0;
  let removed = 0;

  for (const [id, emoji] of emojis) {
    total++;

    if (!emoji.user || emoji.user.id !== client.user.id) {
      console.log(`🔸 [SKIP] ${emoji.name} → Non créé par le bot.`);
      continue;
    }

    const emojiName = normalizeEmojiName(emoji.name || '');
    const isValid = validEmojiNames.has(emojiName);
    const hash = emoji.url.split('/').pop().split('.')[0];
    const isDuplicate = usedImageHashes.has(hash);

    if (isValid && !isDuplicate) {
      usedImageHashes.add(hash);
      console.log(`✔️ Conserve : ${emoji.name} (valide et unique).`);
      continue;
    }

    let reason = '';
    if (!isValid) {
      reason = 'non listé';
    } else if (isDuplicate) {
      reason = 'doublon';
    }

    try {
      await emoji.delete(`Auto-cleanup : ${reason}`);
      console.log(`🗑️ Supprimé : ${emoji.name} (${reason}).`);
      removed++;
    } catch (err) {
      console.warn(`❌ Erreur suppression emoji ${emoji.name} :`, err.message);
    }
  }

  console.log(`✅ Nettoyage terminé : ${removed}/${emojis.size} emojis supprimés.`);
}
    
async function registerCommands(services, lac, guildId) {
  try {
    const commands = await getCommands(services);
    if (guildId) {
      try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands }
      );
      console.log(`Commandes mises à jour pour la guilde ${guildId}`);
         } catch (error) {
  if (error.status === 429) {
    console.warn(`Rate limit hit. Retry after ${error.retryAfter}ms`);
  } else {
    console.error('Erreur lors de la mise à jour des commandes :', error);
  }
}
    } else {
     try {
      if (lac === 0) {
       const guilds = await client.guilds.fetch();

        for (const [guildId] of guilds) {
          await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
          console.log(`✅ Commandes supprimées pour la guilde ${guildId}`);
        }
        lac = 1;
      }
      console.log(`Commandes globales mises à jour`);
        } catch (error) {
  if (error.status === 429) {
    console.warn(`Rate limit hit. Retry after ${error.retryAfter}ms`);
  } else {
    console.error('Erreur lors de la mise à jour des commandes :', error);
  }
} 
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des commandes :', error);
  }
}

function isValidDiscordEmoji(input) {

  const discordCustomEmojiRegex = /^<a?:\w+:\d+>$/;

  const unicodeEmojiRegex = emojiRegex();

  return discordCustomEmojiRegex.test(input) || unicodeEmojiRegex.test(input);

}

function sanitizeEmoji(emoji) {

  return emoji?.replace(/\uFE0F/g, '');

}

function beautifyKey(key) {
  if (key === 'banner') return '🖼 Bannière';
  if (key === 'modeAffichage') return '🧩 Type de menu';
  if (key === 'filtrageStock') return '⚙️ Masquer service vide';

  let label = key.replace(/_USER_ID|_ROLE_ID|_CHANNEL_ID/g, '');
  label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

  if (key === 'STOCK_CHANNEL_ID') label = 'Restock';

  if (key.includes('USER')) label += ' (Utilisateur)';
  if (key.includes('ROLE')) label += ' (Rôle)';
  if (key.includes('CHANNEL')) label += ' (Salon)';

  let emoji = '';
  if (key.includes('FOURNI') || key.includes('STOCK')) emoji = '📦';
  else if (key.includes('USER')) emoji = '👤';
  else if (key.includes('REQUIRED')) emoji = '🔐';
  else if (key.includes('VIP')) emoji = '⭐️';
  else if (key.includes('ADMIN')) emoji = '🛠';
  else if (key.includes('CHANNEL')) emoji = '📝';
  else if (key.includes('TOKEN') || key.includes('CLE') || key.includes('CLÉ')) emoji = '🔑';

  return `${emoji} ${label}`;
 }

 function beautifyValue(key, val, client, guild) {
   if (key == 'banner') {
    const label = val ? val : '❌️ Aucun';
    return `${label}`;
   }
  if (key === 'modeAffichage') {
    const label = val == 1 ? 'Bouton' : 'Menu déroulant';
    return `${label}`;
  }

  if (key === 'filtrageStock') {
    const label = val == 1 ? 'Oui' : 'Non';
    return `${label}`;
  }

  if (key.includes('CHANNEL') && guild) {
    const channel = guild.channels.cache.get(val);
    return channel ? `<#${val}>` : `Salon inconnu (${val})`;
  }
    
if (key.includes('USER') && guild) {
  const member = guild.members.cache.get(val);
  return member ? `<@${val}>` : `Utilisateur inconnu (${val})`;
}
  if (key.includes('ROLE') && guild) {
    const role = guild.roles.cache.get(val);
    return role ? `<@&${val}>` : `Rôle inconnu (${val})`;
  }

  return `\`${String(val)}\``;
}

async function updateBotBannerFromUrl(url, client) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(response.data, 'binary');
    const MAX_SIZE = 8 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) throw new Error("Image trop lourde");

    const mime = url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg'
               : url.endsWith('.gif') ? 'image/gif'
               : 'image/png';

    const base64 = buffer.toString('base64');
    const imageData = `data:${mime};base64,${base64}`;
      
    content_banner = url;

    await axios.patch(
      'https://discord.com/api/v10/users/@me',
      { banner: imageData },
      {
        headers: {
          'Authorization': `Bot ${client.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true };

  } catch (err) {
    console.error('❌ Erreur PATCH bannière :', err.response?.data || err.message);
    return { success: false, error: err.message };
  }
}

let services = [];
compteTemporaire = new Map();

try {

  const raw = fs.readFileSync(path.join(__dirname, '/config/boutons.json'), 'utf8');

  services = JSON.parse(raw).map(s => ({

    ...s,

    file: path.join(stockFolder, path.basename(s.file))

  }));

} catch (err) {

  console.error('❌ Erreur lors du rechargement des services après restock :', err);

}  

async function getCommands(services) {

const commands = [];

  commands.push(
  new SlashCommandBuilder()

    .setName('panel')

    .setDescription('Affiche le panel des services'));
    
  commands.push(

  new SlashCommandBuilder()

    .setName('stock')

    .setDescription('Affiche l\'état des services'));

  commands.push(
  new SlashCommandBuilder()

    .setName('create')

    .setDescription('Créer un nouveau service')

    .addStringOption(option =>

      option.setName('label')

        .setDescription('Nom du service (ex: Netflix)')

        .setRequired(true))

    .addStringOption(option =>

      option.setName('type')

        .setDescription('Choisir entre emoji ou lien image')

        .setRequired(true)

        .addChoices(

          { name: '😃 Emoji', value: 'emoji' },

          { name: '🔗 Lien', value: 'image' }

        ))

    .addStringOption(option =>

      option.setName('valeur')

        .setDescription('Emoji (ex: 📺) ou URL de l\'image')

        .setRequired(true))
    .addStringOption(option =>

      option.setName('style')

        .setDescription('Style du bouton')

        .setRequired(false)

        .addChoices(

      { name: '🔵 Bleu', value: 'Primary' },

      { name: '⚪️ Gris', value: 'Secondary' },

      { name: '🟢 Vert', value: 'Success' },

      { name: '🔴 Rouge', value: 'Danger' }

    )
  ));

  commands.push(
  new SlashCommandBuilder()
  .setName('modif')
  .setDescription('Modifier un service existant')
  .addStringOption(option =>
    option.setName('service')
      .setDescription('Service à modifier')
      .setRequired(true)
      .setAutocomplete(true)
      )
  .addStringOption(option =>
    option.setName('label')
      .setDescription('Nouveau nom du service')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Emoji ou lien image')
      .setRequired(false)
      .addChoices(
        { name: '😃 Emoji', value: 'emoji' },
        { name: '🔗 Lien', value: 'image' }
      )
  )
  .addStringOption(option =>
    option.setName('valeur')
      .setDescription('Emoji (📺) ou lien image')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('style')
      .setDescription('Style du bouton')
      .setRequired(false)
      .addChoices(
        { name: '🔵 Bleu', value: 'Primary' },
        { name: '⚪️ Gris', value: 'Secondary' },
        { name: '🟢 Vert', value: 'Success' },
        { name: '🔴 Rouge', value: 'Danger' }
      )
                   ));

  commands.push(
  new SlashCommandBuilder()

  .setName('delete')

  .setDescription('Supprime un service')

  .addStringOption(option =>

    option.setName('service')

      .setDescription('Service à supprimer')

      .setRequired(true)
       
      .setAutocomplete(true)

  ));

  commands.push(
  new SlashCommandBuilder()

    .setName('restock')

    .setDescription('Restock un service avec de nouveaux comptes')

    .addStringOption(option =>

      option.setName('service')

        .setDescription('Le service à restocker')

        .setRequired(true)
         
        .setAutocomplete(true)
                    )

    .addAttachmentOption(option =>

      option.setName('fichier')

        .setDescription('Fichier contenant les comptes à ajouter (un par ligne)'))

    .addStringOption(option =>

      option.setName('comptes')

        .setDescription('Comptes à ajouter (un par ligne)')));
    
  commands.push(

  new SlashCommandBuilder()

    .setName('unstock')

    .setDescription('Vide le stock d’un service')

    .addStringOption(option =>

      option.setName('service')

        .setDescription('Le service à vider')

        .setRequired(true)

        .setAutocomplete(true)

    )

);

  commands.push(
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurer le bot')
);

return commands.map(cmd => cmd.toJSON());
    }

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const cooldowns = new Map();

client.once('ready', async () => {
    
  await client.users.fetch(client.user.id, { force: true });

  console.log(`Connecté en tant que ${client.user.tag}`);
    
  await cleanupUnusedEmojisSmart(client, services);

  for (const service of services) {

    if (fs.existsSync(service.file)) {

     const lines = fs.readFileSync(service.file, 'utf8').split('\n').filter(l => l.trim());

     service.count = lines.length;

     } else {

      service.count = 0;

  }

}

  await registerCommands(services, lac);
    
  const statutPath = path.join(__dirname, '/config/statut.json');

if (fs.existsSync(statutPath)) {

  const saved = JSON.parse(fs.readFileSync(statutPath, 'utf8'));

  const presence = {

    activities: [{ name: saved.activity, type: saved.type }],

    status: saved.status,

  };

  client.user.setPresence(presence);

  console.log('✅ Statut du bot restauré depuis statut.json');

  await showBanner(client);

}

});

function getCooldownByRole(member) {

  const cooldowns = readCooldowns();

  const matched = member.roles.cache

    .filter(role => cooldowns[role.id])

    .map(role => cooldowns[role.id]);

  if (matched.length > 0) {

    const min = Math.min(...matched);

    return min * 60 * 1000;

  }

  const fallback = cooldowns.default ?? 20;

  return fallback * 60 * 1000;

}

async function checkUserRole(interaction) {

  const member = interaction.member;
  if (!REQUIRED_ROLE_ID) return true;
  if (!member.roles.cache.has(REQUIRED_ROLE_ID)) {

    await interaction.reply({

      content: `❌️ Vous devrez avoir le rôle <@${REQUIRED_ROLE_ID}> pour continuer`,

      ephemeral: true,

    });

    return false;

  }

  return true;

}

function saveBotStatus(status, activityText, type) {

  const statutPath = path.join(__dirname, '/config/statut.json');

  const payload = {

    status,

    activity: activityText,

    type,

  };

  fs.writeFileSync(statutPath, JSON.stringify(payload, null, 2), 'utf8');

}

function getTranslatedStatus(status) {
  const map = {
    online: '🟢 En ligne',
    idle: '🌙 Inactif',
    dnd: '⛔ Occupé',
    invisible: '🕶️ Invisible',
  };
  return map[status] || '❓ Inconnu';
}
 
function getBotConfigEmbed(client) {
    
  let imageUrl = null;

  if (val_banner === 0) {
    imageUrl = client.user.bannerURL({ size: 1024, format: 'png' });
    content_banner = imageUrl;
    val_banner = 1;
  } else {
    imageUrl = content_banner;
  }

  const status = client.presence?.status || 'indéfini';

  const translated = getTranslatedStatus(status);

  const activity = client.user.presence?.activities?.[0];

  const activityText = activity?.name || 'Aucun';

  const activityType = activity?.type === 1 ? 'Stream (Twitch)' : 'Texte';

  const embed = new EmbedBuilder()

    .setTitle('🤖 Configuration du bot')

    .setColor(0x5865f2)

    .setFooter({ text: 'Page 1/3 - Bot' })

    .addFields(

      { name: 'ℹ️ Nom du bot', value: `\`${client.user.username}\``, inline: true },

      { name: '❓️ Statut', value: `${translated}`, inline: true },

      { name: '💬 Texte', value: `\`${activityText}\` (${activityType})`, inline: false }

    )

    .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }));

  if (client.user.banner) {

    embed.setImage(imageUrl);

  }

  return embed;

}

function getConfigBotComponents() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('config-menu')
    .setPlaceholder('Sélectionnez une option')
    .addOptions([
      { emoji: 'ℹ️', label: 'Changer le nom', value: 'bot-name' },
      { emoji: '🎨', label: 'Changer l’avatar', value: 'bot-avatar' },
      { emoji: '🖼', label: 'Changer la bannière', value: 'bot-banner' },
      { emoji: '💬', label: 'Modifier le statut', value: 'bot-activer' },
    ]);

  const switchButton = new ButtonBuilder()
    .setCustomId('switch-to-jsonc')
    .setLabel('📃')
    .setStyle(ButtonStyle.Primary);
    
  const switchCooldown = new ButtonBuilder()
     .setCustomId('switch-to-cooldown')
     .setLabel('⏰️')
     .setStyle(ButtonStyle.Success);

  return [
    new ActionRowBuilder().addComponents(selectMenu),
    new ActionRowBuilder().addComponents(switchButton,switchCooldown),
  ];
}

function getConfigJsoncEmbed(config, client, guild) {

  const embed = new EmbedBuilder()

    .setTitle('⚙️ Configuration du Fichier')

    .setColor(0xffffff)
  
     .setImage('https://i.ibb.co/jZfsvC1J/Picsart-25-06-15-17-43-59-412.jpg')

    .setFooter({ text: 'Page 2/3 - Modification Fichier' });
  Object.entries(config).forEach(([key, val]) => {

    const name = beautifyKey(key);
      
    const display = beautifyValue(key, val, client, guild);

    embed.addFields({ name, value: display, inline: true });

  });

  return embed;

}
  
function getConfigJsoncComponents(config) {
  const options = Object.keys(config).map(k => ({
    label: beautifyKey(k),
    value: `jsonc-${k}`,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('jsonc-select')
    .setPlaceholder('Choisissez une option')
    .addOptions(options);

  const backButton = new ButtonBuilder()
    .setCustomId('switch-to-bot')
    .setLabel('🤖')
    .setStyle(ButtonStyle.Primary);
    
  const switchCooldown = new ButtonBuilder()

     .setCustomId('switch-to-cooldown')

     .setLabel('⏰️')

     .setStyle(ButtonStyle.Success);

  return [
    new ActionRowBuilder().addComponents(selectMenu),
    new ActionRowBuilder().addComponents(backButton,switchCooldown),
  ];
}
    
function safeEmoji(emojiStr, client) {

  if (!emojiStr) return '💿';

  const match = emojiStr.match(/^<a?:([\w~]+):(\d+)>$/);

  if (match) {

    const [, name, id] = match;

    const emoji = client.emojis.cache.get(id);

    return emoji ? emojiStr : '💿';

  }

  return emojiStr;

}

async function sendPanel(interaction) {
    if (pax === 0) {
  PANEL_CHANNEL_ID = interaction.channel.id;
updateConfigKey('PANEL_CHANNEL_ID',interaction.channel.id);
        } else {
  pax = 0;
            }

  for (const service of services) {
    if (fs.existsSync(service.file)) {
      const lines = fs.readFileSync(service.file, 'utf8').split('\n').filter(Boolean);
      service.count = lines.length;
    } else {
      service.count = 0;
    }
  }

  let visibleServices;
  if (config.filtrageStock === 1) {
    visibleServices = services.filter(s => s.count > 0);
  } else {
    visibleServices = [...services]
  }
    
  await client.users.fetch(client.user.id, { force: true });
    
  const embed = await getServiceSelectEmbed(client, services, config);

  const allRows = [];

  if (config.modeAffichage === 1) {
    const buttons = visibleServices.sort((a, b) => b.count - a.count).map(service =>
      new ButtonBuilder()
        .setCustomId(`gen-${service.id}`)
        .setLabel(service.label)
                                                                          .setEmoji(safeEmoji(service.emoji, client))
        .setStyle(styleMap[service.style] || ButtonStyle.Secondary)
        .setDisabled(config.filtrageStock === 2 && service.count === 0)
    );

    for (let i = 0; i < buttons.length; i += 5) {
      allRows.push(new ActionRowBuilder().addComponents(...buttons.slice(i, i + 5)));
    }

  } else if (config.modeAffichage === 2) {
    const MAX_OPTIONS_PER_MENU = 25;
    const options = visibleServices.sort((a, b) => b.count - a.count).map(service => ({
      label: service.label,
      value: `gen-${service.id}`,
      description: `${service.count} comptes`,
      emoji: safeEmoji(service.emoji, client)
    }));

    for (let i = 0; i < options.length; i += MAX_OPTIONS_PER_MENU) {
      const optionsChunk = options.slice(i, i + MAX_OPTIONS_PER_MENU);
      allRows.push(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`select-gen-${i / MAX_OPTIONS_PER_MENU}`)
            .setPlaceholder('Choisissez un service')
            .addOptions(optionsChunk)
        )
      );
    }
  }

  const stockRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('stock')
      .setLabel('📦 Stock')
      .setStyle(ButtonStyle.Secondary)
  );

  const MAX_ROWS_PER_MESSAGE = 5;
  const rowGroups = [];
  for (let i = 0; i < allRows.length; i += MAX_ROWS_PER_MESSAGE) {
    rowGroups.push(allRows.slice(i, i + MAX_ROWS_PER_MESSAGE));
  }

  if (rowGroups.length > 0) {
    const lastGroup = rowGroups[rowGroups.length - 1];
    if (lastGroup.length >= MAX_ROWS_PER_MESSAGE) {
      rowGroups.push([stockRow]);
    } else {
      lastGroup.push(stockRow);
    }
  } else {
    rowGroups.push([stockRow]);
  }

  try {
    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

    for (let i = 0; i < rowGroups.length; i++) {
      await channel.send({
        embeds: i === 0 ? [embed] : [],
        components: rowGroups[i]
      });
    }

  } catch (err) {
    console.log(`❌ Erreur lors de l'envoi du panel :`, err);
  }
}

async function deleteOldPanelMessages() {
  try {
    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

    const messages = await channel.messages.fetch({ limit: 25 });
    const toDelete = [];

    messages.forEach(msg => {
      if (msg.author.id !== client.user.id) return;
      if (!msg.components || msg.components.length === 0) return;

      const hasPanelComponents = msg.components.some(row =>
        row.components.some(comp =>
          comp.customId?.startsWith('gen-') ||
          comp.customId?.startsWith('select-gen-') ||
          comp.customId === 'stock'
        )
      );

      const hasRestockEmbed = msg.embeds?.some(embed =>
        embed.title?.toLowerCase().includes('restock')
      );

      if (hasPanelComponents && !hasRestockEmbed && msg.deletable) {
        toDelete.push(msg);
      }
    });

    for (const msg of toDelete) {
      await msg.delete().catch(() => {});
    }

    console.log(`🧹 ${toDelete.length} messages de panel supprimés.`);

  } catch (e) {
    console.warn('❌ Erreur lors de la suppression du panel :', e.message);
  }
}
    
async function handleStock(interaction, services, config) {
  let availableServices = 0;
  const totalServices = services.length;
    
  const servicesWithCount = services.map(service => {
  let count = 0;

  if (fs.existsSync(service.file)) {
    count = fs.readFileSync(service.file, 'utf8')
      .split('\n')
      .filter(line => line.trim()).length;
  }

  return { ...service, count };
});

const sortedServices = servicesWithCount.sort((a, b) => b.count - a.count);

const stockStatuses = sortedServices.map(service => {
  if (service.count > 0) {
    availableServices++;
    let statusEmoji = '🟢';
    if (service.count <= 0) statusEmoji = '🔴';
    else if (service.count <= 15) statusEmoji = '🟡';

    return `**${safeEmoji(service.emoji, client)} ${service.label}**\n➔ \`${service.count} comptes ${statusEmoji}\``;
  }
  return null;
}).filter(Boolean).join('\n');

  const footerText = `__Services disponibles:__ **${availableServices}/${totalServices}**`;
  const ratio = availableServices / totalServices;

  function interpolateColor(color1, color2, factor) {
    const result = color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
    return (result[0] << 16) + (result[1] << 8) + result[2];
  }

  let embedColor;
  if (ratio <= 0.5) {
    embedColor = interpolateColor([255, 0, 0], [255, 255, 0], ratio / 0.5);
  } else {
    embedColor = interpolateColor([255, 255, 0], [13, 115, 0], (ratio - 0.5) / 0.5);
  }

  const embed = new EmbedBuilder()
    .setTitle(availableServices === 0 ? '❌ Aucun stock disponible' : '📦 Stock')
    .setDescription(availableServices === 0 ? 'Aucun compte n’est actuellement disponible sur les services.' : `⠀\n${stockStatuses}\n\n❓️ ${footerText}\n`)
    .setColor(embedColor)
    .setFooter({ text: availableServices === 0 ? `📦 Services: ${availableServices}/${totalServices}` : '📅 Date' })
    .setImage("https://i.postimg.cc/cHM0KYTj/Picsart-25-07-10-22-15-01-870.jpg")
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

client.on('interactionCreate', async interaction => {
  const guild = await interaction.client.guilds.fetch(interaction.guildId);
  const member = await guild.members.fetch(interaction.user.id);
    
  const cooldowns = readCooldowns();
    
  config = commentJson.parse(raw);
  if (currentConfig && currentConfig !== '') {
  config = currentConfig;
      }
    
  ROLE_VIP = config.VIP_ROLE_ID;
  FOURNI_USER_ID = config.FOURNI_ROLE_ID;
  ADMIN_USER_ID = config.ADMIN_ROLE_ID;
  STOCK_CHANNEL_ID = config.STOCK_CHANNEL_ID;
  PANEL_CHANNEL_ID = config.PANEL_CHANNEL_ID;
  REQUIRED_ROLE_ID = config.REQUIRED_ROLE_ID;
    
    if (interaction.isAutocomplete()) {

  const focused = interaction.options.getFocused().toLowerCase();

  const filtered = services

    .filter(s => s.label.toLowerCase().includes(focused))

    .slice(0, 25);

  await interaction.respond(

    filtered.map(s => ({

      name: s.label,

      value: s.id

    }))

  );

  return;
}

  // --- COMMANDES SLASH ---

  if (interaction.isChatInputCommand()) {
if (interaction.commandName === 'panel') {
  const isOwner = member.id === guild.ownerId;

  let protector = 1;

  if (isOwner === true) {
    protector = 0;
  }

  const isAdmin = member.roles.cache.has(ADMIN_USER_ID);

  if (!isAdmin && protector === 1) {
    return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
  }
  await interaction.reply({ content: '⏳ Veuillez patienter...', ephemeral: true });
  if (PANEL_CHANNEL_ID) { 
  const plc = interaction.client.channels.cache.get(PANEL_CHANNEL_ID);
  if(plc) {
      await deleteOldPanelMessages();
    }
  }
  await sendPanel(interaction)
    
  await interaction.followUp({content:"✅️ panel envoyer avec **succès**", ephemeral:true });
  return
}
    const panelChannel = interaction.client.channels.cache.get(PANEL_CHANNEL_ID);

if (!PANEL_CHANNEL_ID || !panelChannel) {

    PANEL_CHANNEL_ID = null;

    return interaction.reply({

        content: "⚠️ Faites __d'abord la commande__ `/panel` dans __le salon__ **gen** par exemple avant de __exécuter d'autres commandes__",

        ephemeral: true

    });

}
 
const missing = interaction.guild.members.me.permissions.missing([

  'ManageEmojisAndStickers',

  //'EmbedLinks'

]);

if (missing.length > 0) {

  return interaction.reply({

    content: `❌ Permissions manquantes : ${missing.map(p => `\`${p}\``).join(', ')}`,

    ephemeral: true

  });

}
      
     if (interaction.commandName === 'config') {

  const isOwner = member.id === guild.ownerId;
  let protector = 1;
  if (isOwner === true) {
    protector = 0;
  }

const isAdmin = member.roles.cache.has(ADMIN_USER_ID);

  if (!isAdmin && protector === 1) {
      return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
      }

  return interaction.reply({

    embeds: [getBotConfigEmbed(client)],

    components: getConfigBotComponents(),

    ephemeral: true

  });

}
    
    if (interaction.commandName === 'stock') {

  await handleStock(interaction, services, config);

  return;

}
      
    if (interaction.commandName === 'create') {
  if (!member.roles.cache.has(FOURNI_USER_ID)) {
    return interaction.reply({ content: "❌️ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
  }
  
  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

  if (!fs.existsSync(stockFolder)) {
  fs.mkdirSync(stockFolder);
  }

  const label = interaction.options.getString('label');
  const typeimage = interaction.options.getString('type');
  const valeur = interaction.options.getString('valeur');
  const id = label.toLowerCase().replace(/\s+/g, '-');
    
  const styleString = interaction.options.getString('style') || 'Secondary';

const style = styleMap[styleString] || ButtonStyle.Secondary;     
        
  const file = path.join('stock', `${id}.txt`);
 const filePath = path.join(__dirname, 'stock', `${id}.txt`);

  if (services.find(s => s.id === id)) {
    return interaction.reply({ content: `⚠️ Le service avec l'ID \`${id}\` existe déjà.`, ephemeral: true });
  }

  if (!fs.existsSync(filePath)) {
   fs.writeFileSync(filePath, '', 'utf8');
  }

  let emoji = '';
  let image = '';
        
  const rps = (...args) => interaction.replied

  ? interaction.editReply(...args)

  : interaction.reply(...args);

if (typeimage === 'emoji') {
  if (isValidDiscordEmoji(valeur)) {
    emoji = valeur;
  } else {
    return interaction.reply({content:"❌ Ce n'est pas un emoji valide Discord ou Unicode.",ephemeral: true});
  }

} else if (typeimage === 'image') {
  let emojiName = id.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

  const existingEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);

if (existingEmoji) {

  emoji = `<:${existingEmoji.name}:${existingEmoji.id}>`;

  image = valeur;

 } else {
  try {
    const response = await fetch(valeur);
    if (!response.ok) throw new Error('Lien d\'image invalide ou inaccessible.');

    const imageBuffer = await response.buffer();

    const MAX_SIZE = 256 * 1024; // 256 KB
    if (imageBuffer.length > MAX_SIZE) {
      throw new Error(`L’image dépasse 256 Ko (taille : ${(imageBuffer.length / 1024).toFixed(2)} Ko).`);
    }

    emojiName = id.replace(/[^a-z0-9_]/gi, '_');
    const newEmoji = await guild.emojis.create({ attachment: imageBuffer, name: emojiName })
    //const newEmoji = await interaction.guild.emojis.create({ attachment: imageBuffer, name: emojiName });

    emoji = `<:${newEmoji.name}:${newEmoji.id}>`;
    image = valeur;

  } catch (error) {

  console.error('❌ Erreur création emoji :', error);

  const errorMsg = await interaction.reply({

    content: `❌ Impossible de créer un emoji avec l’image fournie.\n> Erreur : ${error.message}\n\n**Merci de répondre avec un emoji standard dans les 15 secondes.**`,
      
    fetchReply: true,

    ephemeral: true
  });

  const filter = m => m.author.id === interaction.user.id;

  try {

    const collected = await interaction.channel.awaitMessages({

      filter,

      max: 1,

      time: 15000,

      errors: ['time']

    });

    const userMessage = collected.first();

    const userEmoji = userMessage.content.trim();

    const emojiRegex = /^(\p{Emoji}|\p{Extended_Pictographic})+$/u;

    if (!emojiRegex.test(userEmoji)) {

      await interaction.followUp({ content: '❌ Ce n’est pas un emoji valide.', ephemeral: true });
        
      cleanInteraction(interaction, errorMsg, 1500);

      return;

    }

    emoji = userEmoji;

    image = valeur;

    await interaction.followUp({ content: `✅ Emoji personnalisé : ${emoji}`, ephemeral: true });
      
    cleanInteraction(interaction, errorMsg, 1500);

  } catch {

    await interaction.followUp({ content: '⏰ Temps écoulé. Commande annulée.', ephemeral: true });
      
    autoDelete(errorMsg, 1500);

    return;

   }
  }
 }
}
             
  emoji = sanitizeEmoji(emoji);

  const newService = {

  id,

  label,

  emoji,

  image,

  style: styleString,
  file

};

  services.push(newService);

  try {
    fs.writeFileSync(
      path.join(__dirname, '/config/boutons.json'),
      JSON.stringify(services.map(s => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
        image: s.image,
        style: s.style,
        file: path.posix.join('stock', path.basename(s.file))
      })), null, 2)
    );
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du service:', error);
    return rps({ content: '❌ Erreur lors de la sauvegarde des données.', ephemeral: true });
  }
        
  await registerCommands(services, lac, interaction.guildId);

  await rps({

  content: `✅ Service **${label}** créé avec succès avec l’emoji ${emoji}`,

  ephemeral: true,

  components: [

    new ActionRowBuilder().addComponents(

      new ButtonBuilder()

        .setCustomId(`preview`)

        .setLabel(newService.label)

        .setEmoji(emoji)

        .setStyle(styleMap[newService.style] || ButtonStyle.Secondary)

    )

  ]

});
 try {
     await deleteOldPanelMessages();
     pax = 1;
     await sendPanel(interaction);
 } catch (e) {
     console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
}
}

    if (interaction.commandName === 'modif') {
  if (!member.roles.cache.has(ADMIN_USER_ID)) {
    return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
  }
        
  await interaction.reply({ content: '⏳ Veuillez patienter...', ephemeral: true });

  const id = interaction.options.getString('service');
  const service = services.find(s => s.id === id);
  if (!service) {
    return interaction.reply({ content: `❌ Service introuvable.`, ephemeral: true });
  }
       
  const nouveauLabel = interaction.options.getString('label');
  const typeimage = interaction.options.getString('type');
  const valeur = interaction.options.getString('valeur');
  const styleString = interaction.options.getString('style');

   let oldId = service.id;
let oldFilePath = service.file;

   if (nouveauLabel) {
  const newId = nouveauLabel.toLowerCase().replace(/\s+/g, '-');
  const oldId = service.id;
  const oldFileName = `${oldId}.txt`;
  const newFileName = `${newId}.txt`;
  const oldFilePath = path.join(stockFolder, oldFileName);
  const newFilePath = path.join(stockFolder, newFileName);

  if (services.some(s => s.id === newId && s.id !== oldId)) {
    return interaction.reply({ content: `❌ Un autre service porte déjà ce nom.`, ephemeral: true });
  }

  try {
    if (fs.existsSync(oldFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
    } else {
      fs.writeFileSync(newFilePath, '', 'utf8');
    }
  } catch (err) {
    console.error('❌ Erreur lors du renommage du fichier :', err);
    return interaction.reply({ content: `❌ Impossible de renommer le fichier .txt du service.`, ephemeral: true });
  }

  service.label = nouveauLabel;
  service.id = newId;
  service.file = path.posix.join('stock', newFileName);
}

  if (styleString) {
    service.style = styleString;
  }

  if (typeimage && valeur) {
    let emoji = '';
    let image = '';
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    if (typeimage === 'emoji') {
      if (isValidDiscordEmoji(valeur)) {
        emoji = valeur;
        const emojiName = service.id.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
       const existingEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);
        if (existingEmoji) {
        try {
       await existingEmoji.delete();
       } catch (err) {
       console.warn(`⚠️ Impossible de supprimer l'ancien emoji ${existingEmoji.name}:`, err.message);
      }

    }
      } else {
        return interaction.reply({ content: "❌ Ce n'est pas un emoji valide.", ephemeral: true });
      }
    } else if (typeimage === 'image') {
  try {
    const response = await fetch(valeur);
    if (!response.ok) throw new Error('Lien d\'image invalide ou inaccessible.');

    const imageBuffer = await response.buffer();
    const MAX_SIZE = 256 * 1024; // 256 KB
    if (imageBuffer.length > MAX_SIZE) {
      throw new Error(`L’image dépasse 256 Ko (taille : ${(imageBuffer.length / 1024).toFixed(2)} Ko).`);
    }
    const emojiName = service.id.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const existingEmoji = guild.emojis.cache.find(e => e.name === emojiName);

    const isSameImage = service.image === valeur;

    if (existingEmoji && !isSameImage) {
      try {
        await existingEmoji.delete();
      } catch (err) {
        console.warn(`⚠️ Impossible de supprimer l'ancien emoji ${existingEmoji.name}:`, err.message);
      }
    }

    //const newEmoji = await interaction.guild.emojis.create({ attachment: imageBuffer, name: emojiName });
    const newEmoji = await guild.emojis.create({ attachment: imageBuffer, name: emojiName });

    emoji = `<:${newEmoji.name}:${newEmoji.id}>`;
    image = valeur;

  } catch (error) {
    console.error('❌ Erreur création emoji :', error);

    const errMsg = await interaction.editReply({
      content: `❌ Impossible de créer un emoji avec l’image fournie.\n> Erreur : ${error.message}\n\n**Merci de répondre avec un emoji standard dans les 15 secondes.**`,
      fetchReply: true,
      ephemeral: false,
    });

    const filter = m => m.author.id === interaction.user.id;

    try {
      const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time']
      });

      const userMessage = collected.first();
      const userEmoji = userMessage.content.trim();

      const emojiRegex = /^(\p{Emoji}|\p{Extended_Pictographic})+$/u;
      if (!emojiRegex.test(userEmoji)) {
        await interaction.followUp({ content: '❌ Ce n’est pas un emoji valide.', ephemeral: true });
        cleanInteraction(interaction, errMsg, 1500);
        return;
      }

      emoji = userEmoji;
      image = valeur;
      await interaction.followUp({ content: `✅ Emoji personnalisé : ${emoji}`, ephemeral: true });
      cleanInteraction(interaction, errMsg, 1500);

    } catch {
      await interaction.followUp({ content: '⏰ Temps écoulé. Commande annulée.', ephemeral: true });
      autoDelete(errMsg, 1500);
      return;
   }
  }
 }
      
 service.emoji = sanitizeEmoji(emoji);
 service.image = image;
      
}

  try {
    fs.writeFileSync(
      path.join(__dirname, '/config/boutons.json'),
      JSON.stringify(services.map(s => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
        image: s.image,
        style: s.style,
        file: path.posix.join('stock', path.basename(s.file))
      })), null, 2)
    );
  } catch (e) {
    console.error('❌ Erreur sauvegarde JSON:', e);
    return interaction.editReply({ content: "❌ Erreur lors de la sauvegarde des modifications.", ephemeral: true });
  }
        
  await registerCommands(services, lac, interaction.guildId);
        
  await interaction.editReply({

  content: `✅ Service \`${id}\` modifié avec succès.`,

  ephemeral: true,

  components: [

    new ActionRowBuilder().addComponents(

      new ButtonBuilder()

        .setCustomId(`preview`)

        .setLabel(service.label)

        .setEmoji(service.emoji)

        .setStyle(styleMap[service.style] || ButtonStyle.Secondary)

    )

  ]

});
        
  try {
      await deleteOldPanelMessages();
      pax = 1;
      await sendPanel(interaction);
} catch (e) {
    console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
}
        
   await cleanupUnusedEmojisSmart(client, services)

}
      
if (interaction.commandName === 'delete') {

  if (!member.roles.cache.has(ADMIN_USER_ID)) {

    return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });

  }
    
const id = interaction.options.getString('service'); const index = services.findIndex(s => s.id === id);

if (index === -1) {
  return interaction.reply({ content: `❌ Service \`${id}\` introuvable.`, ephemeral: true });
}
    
await interaction.reply({ content: '⏳ Veuillez patienter...\n-# Ceci peut prendre quelques minutes', ephemeral: true });

const removed = services.splice(index, 1)[0];

try {
  fs.writeFileSync(
    path.join(__dirname, '/config/boutons.json'),
    JSON.stringify(services.map(s => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      image: s.image,
      style: s.style,
      file: s.file
    })), null, 2)
  );

  try {

  const serviceFile = path.join(removed.file);

  if (fs.existsSync(serviceFile)) {

    fs.unlinkSync(serviceFile);

    console.log(`🗑️ Fichier supprimé : ${serviceFile}`);

  } else {

    console.warn(`⚠️ Le fichier n'existe pas : ${serviceFile}`);

  }

} catch (err) {

  console.error(`❌ Impossible de supprimer le fichier ${removed.file} :`, err.message);

  return interaction.editReply({

    content: `❌ Erreur lors de la suppression du fichier \`${removed.file}\` : ${err.message}`,

    ephemeral: true

  });

}
    
  const emojiName = removed.id.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

 const existingEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);
    
    if (existingEmoji) {
      try {
       await existingEmoji.delete();
          } catch (err) { console.warn(`⚠️ Impossible de supprimer l'ancien emoji ${existingEmoji.name}:`, err.message);
      }
    }
    
    
  await registerCommands(services, lac, interaction.guildId);

  try {
      await interaction.editReply({ content: `🗑️ Service \`${id}\` supprimé avec succès.`, ephemeral: true });
      } catch (err) {
          console.log(`❌️ Erreur lors de l'envoi du message`, err)
          }
} catch (err) {
  console.error(err);
  return interaction.editReply({ content: `❌ Erreur lors de la suppression.`, ephemeral: true });
}
  try {
      await deleteOldPanelMessages();
      pax = 1;
      sendPanel(interaction);
   } catch (e) {
    console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
   }
}

 if (interaction.commandName === 'restock') {
  if (!member.roles.cache.has(FOURNI_USER_ID)) {
    return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
  }

  const serviceId = interaction.options.getString('service');
  const comptesTexte = interaction.options.getString('comptes');
  const fichier = interaction.options.getAttachment('fichier');

  const service = services.find(s => s.id === serviceId);
  if (!service) {
    return interaction.reply({ content: '❌ Service introuvable.', ephemeral: true });
  }

  const stockFilePath = path.join(stockFolder, `${service.id}.txt`);
  let newAccounts = [];

  if (comptesTexte) {
    newAccounts = comptesTexte.split('\n').map(line => line.trim()).filter(line => line);
  }

  if (fichier && fichier.name.endsWith('.txt')) {
    try {
      const response = await fetch(fichier.url);
      const fileContent = await response.text();
      const fileAccounts = fileContent.split('\n').map(line => line.trim()).filter(line => line);
      newAccounts = newAccounts.concat(fileAccounts);
    } catch (err) {
      return interaction.reply({ content: '❌ Erreur lors de la lecture du fichier.', ephemeral: true });
    }
  }

  if (newAccounts.length === 0) {
    return interaction.reply({ content: '❌ Aucun compte valide à ajouter.', ephemeral: true });
  }
     
     try {
    let existingAccounts = [];
    if (fs.existsSync(stockFilePath)) {
      existingAccounts = fs.readFileSync(stockFilePath, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);
    }

    const allAccounts = existingAccounts.concat(newAccounts).filter((v, i, a) => a.indexOf(v) === i); // uniq

    if (allAccounts.length === 0) {
      console.log('⚠️ Aucun compte à écrire, on ne modifie pas le fichier.');
      return;
    }

    const backupPath = stockFilePath + '.bak';
    fs.copyFileSync(stockFilePath, backupPath);

    fs.writeFileSync(stockFilePath, allAccounts.join('\n'), 'utf8');

    fs.unlinkSync(backupPath);

    console.log(`✅ Fichier mis à jour avec ${newAccounts.length} nouveaux comptes.`);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du fichier :', err.message);
    if (fs.existsSync(stockFilePath + '.bak')) {
      fs.copyFileSync(stockFilePath + '.bak', stockFilePath);
      fs.unlinkSync(stockFilePath + '.bak');
      console.log('✅ Fichier restauré à partir de la sauvegarde.');
    }
  }
     
   await interaction.reply({ content: '⏳ Veuillez patienter...', ephemeral: true });

  const stockChannel = await client.channels.fetch(STOCK_CHANNEL_ID);
     
try {
    
  await deleteOldPanelMessages();
    
    pax = 1;
 sendPanel(interaction);

} catch (e) {

  console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);

}     

try {
  const raw = fs.readFileSync(path.join(__dirname, 'boutons.json'), 'utf8');
  services = JSON.parse(raw).map(s => ({
    ...s,
    file: path.join(stockFolder, path.basename(s.file))
  }));
} catch (err) {
  console.error('❌ Erreur lors du rechargement des services après restock :', err);
}

const updatedService = services.find(s => s.id === serviceId);
if (!updatedService) {
  return interaction.editReply({ content: '❌ Erreur : service mis à jour introuvable.', ephemeral: true });
}

const meta = await fetchServiceMetaFromWiki(updatedService.label);
const embedColor = styleColor[updatedService.style];
const embed = new EmbedBuilder()
  .setTitle(`📥 Restock (${updatedService.label})`)
  .setDescription(
  meta?.description && meta.description.trim().length > 0
    ? meta.description.trim()
    : generateAIDescription(updatedService.label)
  )
  .setColor(embedColor)
  .setThumbnail(updatedService.image || null)
  .setImage(meta?.image || getDefaultBanner(updatedService.label))
  .setFooter({ text: '📦 Quantité: '+newAccounts.length})
  .setTimestamp();
     
const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(`gen-${updatedService.id}-vip`)
    .setLabel(`Générer`)
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🔁')
);

await stockChannel.send({
  embeds: [embed],
  components: [row]
});
     
  await interaction.editReply({
    content: `✅ ${newAccounts.length} comptes ajoutés à **${service.label}**.`,
    ephemeral: true
  });
}
      
if (interaction.commandName === 'unstock') {
  if (!member.roles.cache.has(ADMIN_USER_ID)) {
    return interaction.reply({ content: "❌ Vous n'êtes pas autorisé à utiliser cette commande.", ephemeral: true });
  }

  const serviceId = interaction.options.getString('service');
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return interaction.reply({ content: '❌ Service introuvable.', ephemeral: true });
  }

  const stockFilePath = path.join(stockFolder, `${service.id}.txt`);

  if (!fs.existsSync(stockFilePath)) {
    return interaction.reply({ content: `❌ Le fichier du service **${service.label}** est introuvable.`, ephemeral: true });
  }

  const currentStock = fs.readFileSync(stockFilePath, 'utf8')
    .split('\n')
    .filter(line => line.trim());

  if (currentStock.length === 0) {
    return interaction.reply({
      content: `⚠️ Le service **${service.label}** est déjà vide.`,
      ephemeral: true
    });
  }
    
  try {
      
  fs.writeFileSync(stockFilePath, '', 'utf8');
  service.count = 0;

  await interaction.reply({
    content: `✅ Le stock du service **${service.label}** a été vidé.`,
    ephemeral: true
  });
    
  const stockChannel = await client.channels.fetch(STOCK_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle(`🗑️ Unstock (${service.label})`)
    .setDescription(`Le stock du service **${service.label}** a été vidé.`)
    .setColor(0xed4245)
    .setThumbnail(service.image || null)
    .setFooter({ text: getFooterText(interaction) })
    .setTimestamp();

  await stockChannel.send({ embeds: [embed] });

    await deleteOldPanelMessages();
    pax = 1;
    await sendPanel(interaction);

  } catch (err) {
    console.error('❌ Erreur lors du vidage du fichier :', err);
    return interaction.reply({ content: '❌ Erreur lors du vidage du fichier.', ephemeral: true });
  }
}

  }

  // --- BOUTONS ---

  if (interaction.isButton()) {
      
if (interaction.customId === 'stock') {

  await handleStock(interaction, services, config);

  return;

} else if (interaction.customId === 'copier-compte') { const data = compteTemporaire.get(interaction.user.id); if (!data) return interaction.reply({ content: 'Aucun compte à copier.', ephemeral: true });

return interaction.reply({

  content: `\`\`\`\n${data}\n\`\`\``,

  ephemeral: true

}); } else if (interaction.customId.startsWith('gen-')) {

  if (!(await checkUserRole(interaction))) return;

  let serviceId = interaction.customId.slice(4);

  const isVipService = serviceId.endsWith('-vip');

  if (isVipService && !interaction.member.roles.cache.has(ROLE_VIP)) {

    return interaction.reply({

      content: '❌ Ce service est réservé aux membres **VIP**.\nRejoignez le VIP pour y accéder.',

      ephemeral: true

    });

  }

  if (isVipService) {
    serviceId = serviceId.replace(/-vip$/, '');
  }

  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return interaction.reply({ content: '❌ Service introuvable.', ephemeral: true });
  }


    const userId = interaction.user.id;
    
    let accounts = [];

    if (fs.existsSync(service.file)) {

      accounts = fs.readFileSync(service.file, 'utf8').split('\n').filter(line => line.trim());

    } else {

     console.err(`❌️ Le fichier ${service.file} existe pas merci de crée le fichier ou supprimé le fichier`);

     return interaction.reply({content: `❌️ Une erreur est survenu, merci de réessayer plus tard`, ephemeral: true});

        }

    if (cooldown.has(userId) && accounts.length > 0) {

       const cooldownMs = getCooldownByRole(interaction.member);
const expirationTime = cooldown.get(userId) + cooldownMs;
const now = Date.now();
const timeLeft = expirationTime - now;

if (now < expirationTime) {
  const progress = 1 - timeLeft / cooldownMs;

  const secondsLeft = Math.floor(timeLeft / 1000);
  const minutesLeft = Math.floor(secondsLeft / 60);

  const timeDisplay = minutesLeft >= 1
    ? `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`
    : `${secondsLeft} seconde${secondsLeft > 1 ? 's' : ''}`;

  const cooldownEmbed = new EmbedBuilder()
    .setTitle('⏳ Cooldown en cours')
    .setDescription(`Veuillez patienter encore **${timeDisplay}** avant de générer un nouveau compte.`)
    .setColor(getCooldownGradientColor(progress))
    .setFooter({ text: getFooterText(interaction) });

  return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
}

    } else if (accounts.length === 0) {
      return interaction.reply({ content: `❌️ Aucun compte disponible pour **${service.label}**.`, ephemeral: true });
       }
    await interaction.reply({ content: '⏳ Veuillez patienter...', ephemeral: true });
    const now = Date.now();
    cooldown.set(userId, now);
    
    const lastAccount = accounts.pop();

    fs.writeFileSync(service.file, accounts.join('\n'));

    if (accounts.length < 1 && config.modeAffichage === 1) {
        try {
            await deleteOldPanelMessages();
            pax = 1;
            sendPanel(interaction);
        } catch (e) {
            console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
        }
    } else if (config.modeAffichage === 2) {      
        try {
            await deleteOldPanelMessages();
            pax = 1;
            sendPanel(interaction);
        } catch (e) {
            console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
        }
      }
        

    const [email, password] = lastAccount.split(':');
    const compteFormat = `${email}:${password}`; compteTemporaire.set(interaction.user.id, compteFormat);
const formattedDate = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    
let filtrer_v2 = safeEmoji(service.emoji, client);

if (filtrer_v2.length > 10) {

  filtrer_v2 = service.label;

} else {

  filtrer_v2 = `${filtrer_v2} ${service.label}`;

}

const embed = new EmbedBuilder()
  .setColor('Green')
  .setTitle(`${filtrer_v2}`)
  .setDescription(`Voici votre accès pour **${service.label}**`)
  .addFields(
    { name: '✉️ Email', value: `\`${email}\``, inline: true },
    { name: '🔑 Mot de passe', value: `\`${password}\``, inline: true },
    { name: '📅 Date', value: formattedDate, inline: false }
  )
  .setThumbnail(service.image || null)
  .setFooter({ text: getFooterText(interaction) });

const url = await findServiceUrl(service.label);
const remainingStock = accounts.length;

const row1 = new ActionRowBuilder().addComponents(

  new ButtonBuilder()

    .setCustomId('copier-compte')

    .setLabel('📋 Copier')

    .setStyle(ButtonStyle.Primary),

  new ButtonBuilder()

    .setCustomId('stock-count')

    .setLabel(`${remainingStock} restants`)

    .setStyle(ButtonStyle.Secondary)

    .setDisabled(true)

);

const row2 = new ActionRowBuilder().addComponents(

  new ButtonBuilder()

    .setLabel(`Ouvrir ${service.label}`)

    .setStyle(ButtonStyle.Link)

    .setURL(url)

    .setEmoji(safeEmoji(service.emoji, client))

);

await interaction.followUp({

  embeds: [embed],

  components: [row1, row2],

  ephemeral: true

});
    } else if (interaction.customId === 'preview') {
        
    return interaction.reply({ content: 'ℹ️ Ceci est qu\'un preview pour voir comment le bouton ressemble et sera sur panel des services', ephemeral: true });

} else if (interaction.customId === 'switch-to-jsonc') {
  const embed = getConfigJsoncEmbed(config, client, interaction.guild);

  await interaction.update({
    embeds: [embed],
    components: getConfigJsoncComponents(config),
    ephemeral: true
  });
} else if (interaction.customId === 'switch-to-bot') {
  const embed = getBotConfigEmbed(client);

  await interaction.update({
    embeds: [embed],
    components: getConfigBotComponents(),
    ephemeral: true
  });
} else if (interaction.customId === 'switch-to-cooldown') {
    const embed = getCooldownPageEmbed(interaction.guild, cooldowns);
    const components = [];

    const menu = getCooldownRoleMenu(cooldowns, interaction.guild);

    if (menu) components.push(menu);

    const buttons = getCooldownButtons();

    if (buttons) components.push(...buttons);

    await interaction.update({
        embeds: [embed],
        components: components.length > 0 ? components : [],
        ephemeral: true
});
  } else if (interaction.customId === 'cooldown-add') {
    return interaction.showModal(getAddCooldownModal());
  } else if (interaction.customId === 'cooldown-remove') {
    const cooldownEntries = Object.entries(cooldowns).filter(([key]) => key !== 'default');
    if (!cooldownEntries.length) return interaction.reply({content:'ℹ️ Aucun rôle avec cooldown configuré.',ephemeral:true});
    return interaction.update({
      content: 'Sélectionne un rôle à supprimer :',
      embed: null,
      components: [getRemoveCooldownMenu(cooldowns, interaction.guild)],
      ephemeral: true,
    });
  } else {

  return interaction.reply({

    content: '❌ Bouton inconnu ou non pris en charge.',

    ephemeral: true

  });

}

  }
    
    if (interaction.isStringSelectMenu()) {
      if(interaction.customId.startsWith('select-gen-')) {

  const selectedValue = interaction.values[0]; // ex: gen-netflix

  const fakeButtonInteraction = Object.create(interaction);

  fakeButtonInteraction.customId = selectedValue;

  fakeButtonInteraction.isButton = () => true;

  fakeButtonInteraction.isStringSelectMenu = () => false;

  client.emit('interactionCreate', fakeButtonInteraction);

 }

      if (interaction.customId === 'config-menu') {
  const value = interaction.values[0];

  if (value === 'bot-name') {
    const modal = new ModalBuilder()
      .setCustomId('modal-bot-name')
      .setTitle('ℹ️ Changer le nom du bot')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('new-name')
            .setLabel("💭 Nom du bot")
            .setStyle(1)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
  }

  if (value === 'bot-avatar') {
    const modal = new ModalBuilder()
      .setCustomId('modal-bot-avatar')
      .setTitle('🎨 Changer l’avatar du bot')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('new-avatar')
            .setLabel("🔗 Lien de l'image")
            .setStyle(1)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
  }
if (value === 'bot-activer') {
  const modal = new ModalBuilder()
    .setCustomId('modal-bot-activity')
    .setTitle('🛠 Statut et activité du bot')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('activity-status')
          .setLabel("Statut (online,idle,dnd,invisible,streaming)")
          .setStyle(1)
          .setRequired(true)
          .setValue(client.presence?.status || 'online')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('activity-text')
          .setLabel("Texte du statut (ex: En ligne...)")
          .setStyle(1)
          .setRequired(true)
          .setValue(client.user.presence?.activities?.[0]?.name || '')
      )
    );

  await interaction.showModal(modal);
}
if (value === 'bot-banner') {

  const modal = new ModalBuilder()

    .setCustomId('modal-bot-banner')

    .setTitle('🖼 Changer la bannière du bot')

    .addComponents(

      new ActionRowBuilder().addComponents(

        new TextInputBuilder()

          .setCustomId('new-banner')

          .setLabel("🔗 Lien de la bannière (PNG, max 3MB)")

          .setStyle(1)

          .setRequired(true)

      )

    );

  await interaction.showModal(modal);

}  
}

if (interaction.customId === 'jsonc-select') {
  const key = interaction.values[0].replace('jsonc-', '');

  let title = `✏️ Modification`;
  let optio = `📄 Modifier ${key}`;
let placeholder = config[key] !== undefined ? String(config[key]) : '';
let maxLength = 100;

if (key.includes('ID')) {
  maxLength = 19;
}
if (key === 'banner') {
  optio = '🖼 Bannière';
  maxLength = 750;
    }
if (key === 'modeAffichage') {
  optio = '🧩 Type de menu (1=Boutons, 2=Menu Déroulant)';
  maxLength = 1;
}
if (key === 'filtrageStock') {
  optio = '⚙️ Masquer service vide (1=Oui,2=Non)';
  maxLength = 1;
}

const modal = new ModalBuilder()
  .setCustomId(`modal-jsonc-${key}`)
  .setTitle(title)
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('new-value')
        .setLabel(optio)
        .setStyle(1)
        .setRequired(true)
        .setMaxLength(maxLength)
        .setValue(placeholder)
    )
  );

  await interaction.showModal(modal);
}

  if (interaction.customId === 'cooldown-modify') {

  const selected = interaction.values[0];

  if (selected === 'cooldown-default') {

    const current = cooldowns.default ?? 20;

    return interaction.showModal(getEditDefaultCooldownModal(current));

  }

  const roleId = selected.replace('cooldown-', '');

  const current = cooldowns[roleId] || 5;
      
  let check_current = parseInt(current);
      
  if(isNaN(check_current)) return interaction.reply({ content: '❌ Entrée invalide.', ephemeral: true });

  return interaction.showModal(getEditCooldownModal(roleId, current));

}

  if (interaction.customId === 'cooldown-remove-select') {
    const roleId = interaction.values[0].replace('remove-', '');
    delete cooldowns[roleId];
    writeCooldowns(cooldowns);

    const embed = getCooldownPageEmbed(interaction.guild, cooldowns);
    const components = [];

    const menu = getCooldownRoleMenu(cooldowns, interaction.guild);

    if (menu) components.push(menu);

    const buttons = getCooldownButtons();

    if (buttons) components.push(...buttons);

    await interaction.update({
        embeds: [embed],
        components: components.length > 0 ? components : [],
        ephemeral: true
});
    return interaction.followUp({
      content: '✅ Rôle supprimé.',
      ephemeral: true,
    });
  }

}

if (interaction.isModalSubmit()) {

if (interaction.customId === 'modal-bot-name') {
  const newName = interaction.fields.getTextInputValue('new-name');
  await client.user.setUsername(newName);
  await interaction.update({

  embeds: [getBotConfigEmbed(client)],

  components: getConfigBotComponents(),
      
  ephemeral: true

});
  return interaction.followUp({ content: `✅ Nom du bot mis à jour : **${newName}**`, ephemeral: true });
}

if (interaction.customId === 'modal-bot-avatar') {
  const newAvatar = interaction.fields.getTextInputValue('new-avatar');
  await client.user.setAvatar(newAvatar);
  await interaction.update({

  embeds: [getBotConfigEmbed(client)],

  components: getConfigBotComponents(),
      
  ephemeral: true

});
  return interaction.followUp({ content: `✅ Avatar du bot mis à jour.`, ephemeral: true });
}

if (interaction.customId === 'modal-bot-activity') {
  const status = interaction.fields.getTextInputValue('activity-status').toLowerCase();
  const text = interaction.fields.getTextInputValue('activity-text');

  const allowedStatus = ['online', 'idle', 'dnd', 'invisible', 'streaming'];
  if (!allowedStatus.includes(status)) {
    return interaction.reply({
      content: '❌ Statut invalide. Choisissez : `online`, `idle`, `dnd`, `invisible`, ou `streaming`.',
      ephemeral: true,
    });
  }

  let activityOptions = {
    name: text,
    type: status === 'streaming' ? 1 : 0, // 1 = STREAMING
  };

  if (status === 'streaming') {
    activityOptions.url = 'https://twitch.tv/trasibs';
  }

  try {
    await client.user.setPresence({
      activities: [activityOptions],
      status: status === 'streaming' ? 'online' : status,
    });
      
   saveBotStatus(status === 'streaming' ? 'online' : status, text, activityOptions.type);
      
    await interaction.update({

  embeds: [getBotConfigEmbed(client)],

  components: getConfigBotComponents(),
        
  ephemeral: true

});

    return interaction.followUp({
      content: `✅ Statut mis à jour : **${status}** avec texte **${text}**`,
      ephemeral: true,
    });
  } catch (e) {
    return interaction.reply({
      content: `❌ Erreur lors de la mise à jour du statut : ${e.message}`,
      ephemeral: true,
    });
  }
}
    
if (interaction.customId === 'modal-bot-banner') {
  const newBannerUrl = interaction.fields.getTextInputValue('new-banner');

  const result = await updateBotBannerFromUrl(newBannerUrl, client);

  if (!result.success) {
    return interaction.reply({
      content: `❌ Impossible de modifier la bannière : ${result.error}`,
      ephemeral: true
    });
  }

  await client.users.fetch(client.user.id, { force: true });

  await interaction.update({
    embeds: [getBotConfigEmbed(client)],
    components: getConfigBotComponents(),
    ephemeral: true
  });

  await interaction.followUp({ content: '✅ Bannière mise à jour.', ephemeral: true });
}

if (interaction.customId.startsWith('modal-jsonc-')) {
  const key = interaction.customId.replace('modal-jsonc-', '');
  let newValue = interaction.fields.getTextInputValue('new-value');
  let final_var = beautifyValue(key, newValue, client, guild);

  if (['filtrageStock', 'modeAffichage'].includes(key)) {
    if (!['1', '2'].includes(newValue)) {
      return interaction.reply({
        content: `❌ Valeur invalide pour **${beautifyKey(key)}**. Entrez **1** ou **2**.`,
        ephemeral: true,
      });
    }
    newValue = parseInt(newValue);

  } else if (key.includes('ID')) {
  const isValidDiscordID = /^\d{17,20}$/.test(String(newValue));
  if (!isValidDiscordID) {
    return interaction.reply({
      content: `❌ L’ID fourni n’est pas un ID Discord valide.`,
      ephemeral: true,
    });
  }
  try {
    if (key.includes('USER')) {
      await interaction.guild.members.fetch(newValue);
    } else if (key.includes('CHANNEL')) {
      await client.channels.fetch(newValue);
    } else if (key.includes('ROLE')) {
      const role = interaction.guild.roles.cache.get(newValue);
      if (!role) throw new Error('Unknown Role');
    }
  } catch (e) {
    return interaction.reply({
      content: `❌ L’ID **${newValue}** ne correspond à aucun ${key.includes('USER') ? 'utilisateur' : key.includes('CHANNEL') ? 'salon' : 'rôle'} connu dans ce serveur.`,
      ephemeral: true,
    });
  }
}

  await updateConfigKey(key, newValue);
    
  config = currentConfig;
    
  await interaction.update({

  embeds: [getConfigJsoncEmbed(config, client, guild)],

  components: getConfigJsoncComponents(config),
      
  ephemeral: true

});

  await interaction.followUp({
    content: `**${beautifyKey(key)}** mise à jour : **${final_var}**`,
    ephemeral: true,
  });
    
  if (['filtrageStock', 'modeAffichage'].includes(key)) {
      try {
          await deleteOldPanelMessages();
          pax = 1;
          sendPanel(interaction);
      } catch (e) {
  console.warn('❌ Impossible de supprimer ou réafficher le panel :', e.message);
  }
 }
 return
}

  if (interaction.customId === 'modal-cooldown-add') {

    const roleId = interaction.fields.getTextInputValue('role-id');

    const minutes = parseInt(interaction.fields.getTextInputValue('cooldown-minutes'));

    if (!/^[0-9]{17,20}$/.test(roleId) || isNaN(minutes)) {

      return interaction.reply({ content: '❌ Entrée invalide.', ephemeral: true });

    }
     
    const role = guild.roles.cache.get(roleId);
    await role;
    if (!role) return interaction.reply({content:`❌️ Le rôle \`${roleId}\` est introuvable !`,ephemeral:true});

    cooldowns[roleId] = minutes;

    writeCooldowns(cooldowns);

    const embed = getCooldownPageEmbed(interaction.guild, cooldowns);
    const components = [];

    const menu = getCooldownRoleMenu(cooldowns, interaction.guild);

    if (menu) components.push(menu);

    const buttons = getCooldownButtons();

    if (buttons) components.push(...buttons);

    await interaction.update({
        embeds: [embed],
        components: components.length > 0 ? components : [],
        ephemeral: true
    });

    return interaction.followUp({
        content: `✅ Cooldown ajouté pour <@&${roleId}> : ${minutes} min.`,
        ephemeral: true,
    });

  }

  if (interaction.customId.startsWith('modal-cooldown-edit-')) {

    const roleId = interaction.customId.replace('modal-cooldown-edit-', '');

    const minutes = parseInt(interaction.fields.getTextInputValue('cooldown-minutes'));

    if (isNaN(minutes)) {

      return interaction.reply({ content: '❌ Entrée invalide.', ephemeral: true });

    }
      
    const role = guild.roles.cache.get(roleId);
      
    if(!role) return interaction.reply({content:`❌️ Le rôle \`${role}\` est introuvable !`,ephemeral:true});

    cooldowns[roleId] = minutes;

    writeCooldowns(cooldowns);

    const embed = getCooldownPageEmbed(interaction.guild, cooldowns);
      
    const components = [];

    const menu = getCooldownRoleMenu(cooldowns, interaction.guild);

    if (menu) components.push(menu);

    const buttons = getCooldownButtons();

    if (buttons) components.push(...buttons);

    await interaction.update({
        embeds: [embed],
        components: components.length > 0 ? components : [],
        ephemeral: true

});

    return interaction.followUp({
        content: `✅ Cooldown modifié pour <@&${roleId}> : ${minutes} min.`,
        ephemeral: true,
   });

  }
    
if (interaction.customId === 'modal-cooldown-default') {

  const minutes = parseInt(interaction.fields.getTextInputValue('cooldown-minutes'));

  if (isNaN(minutes)) {

    return interaction.reply({ content: '❌ Entrée invalide.', ephemeral: true });

  }

  const cooldowns = readCooldowns();

  cooldowns.default = minutes;

  writeCooldowns(cooldowns);

  const embed = getCooldownPageEmbed(interaction.guild, cooldowns);
    
  const components = [];

  const menu = getCooldownRoleMenu(cooldowns, interaction.guild);

  if (menu) components.push(menu);

  const buttons = getCooldownButtons();

  if (buttons) components.push(...buttons);

  await interaction.update({
      embeds: [embed],
      components: components.length > 0 ? components : [],
      ephemeral: true
});

  return interaction.followUp({
      content: `✅ Cooldown par défaut modifié : ${minutes} min.`,
      ephemeral: true
  });

}

}


});

client.login(process.env.TOKEN);
})();
