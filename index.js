const tmi = require('tmi.js');
const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();
const twitchClients = {};

const twitchChannels = ['TWITCH_CHANNEL', 'TWITCH_CHANNEL', 'TWITCH_CHANNEL'];

twitchChannels.forEach((channel) => {
  twitchClients[channel] = new tmi.Client({
    options: { debug: true },
    identity: {
      username: 'TWITCH_USERNAME',
      password: 'Twitch_Chat_OAuth_Password',
    },
    channels: [channel],
  });

  twitchClients[channel].connect();
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (message.content.startsWith(`${config.prefix}YOUR_NAME`)) {
    // Code pour activer ou désactiver les alertes de bannissement
    // Vous pouvez ajouter cette fonctionnalité ici
  }
});

twitchChannels.forEach((channel) => {
  twitchClients[channel].on('ban', (channelName, username, reason) => {
    console.log('Event de bannissement reçu :', {
      channelName,
      username,
      reason,
    });

    const discordChannel = client.channels.cache.get('DISCORD_CHANNEL_ID');
    if (discordChannel) {
      const cleanChannelName = channelName.replace('#', ''); // Supprime le caractère '#'
      const cleanUsername = username.replace('@', ''); // Supprime le caractère '@'
      
      const banEmbed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Utilisateur Banni sur Twitch')
        .setDescription(`**@${cleanUsername}** a été banni de la chaîne Twitch **@${cleanChannelName}**`) // Modification ici
        .addField('Raison du bannissement', reason || 'Raison inconnue')
        .setTimestamp();

      discordChannel.send(banEmbed);

      // Envoie le message sur le chat Twitch avec ou sans la raison
      if (reason) {
        const twitchMessage = `L'utilisateur @${cleanUsername} a été banni de la chaîne @${cleanChannelName} pour la raison suivante : ${reason}`; // Modification ici
        console.log('Message envoyé sur Twitch :', twitchMessage);
        twitchClients[channel].say(channel, twitchMessage);
      } else {
        const twitchMessage = `L'utilisateur @${cleanUsername} a été banni de la chaîne @${cleanChannelName}.`; // Modification ici
        console.log('Message envoyé sur Twitch :', twitchMessage);
        twitchClients[channel].say(channel, twitchMessage);
      }
    }
  });
});

// Ajoutez cette partie pour effacer le cache toutes les minutes
setInterval(() => {
  console.log('Clearing cache...');
  // Vous pouvez ajouter ici le code pour effacer le cache, s'il y en a un.
}, 60000); // 60000 millisecondes équivalent à 1 minute

client.login(config.token);
