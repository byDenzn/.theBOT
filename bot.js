const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


const client = new Client({ 
  intents: [ 
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES 
  ]
});

client.on('ready', () => {
  console.log(`Bot ist eingeloggt als ${client.user.tag}`);


  // AKTIVITÄTEN

  const activities = [
    { name: 'with himself.', type: 'PLAYING' },
    { name: 'his progress.', type: 'WATCHING' },
    { name: 'to the future.', type: 'LISTENING' }
  ];

  const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * activities.length);
    return activities[randomIndex];
  };

  const setActivity = () => {
    const activity = getRandomActivity();
    client.user.setPresence({ activities: [{ name: activity.name, type: activity.type }] });
  };

  setActivity();

  setInterval(() => {
    setActivity();
  }, 2 * 60 * 1000);
});


// WILLKOMMENSNACHRICHT

client.on('guildMemberAdd', member => {
  const welcomeChannelId = '1086017443350204446';
  const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

  if (welcomeChannel) {
    const welcomeEmbed = new MessageEmbed()
      .setColor('#50d281')
      .setTitle('Willkommen!')
      .setDescription(`Willkommen ${member} auf unserem Server! \n Respektiere und Akzeptiere bitte die Regeln bevor du den Server weiter begutachtest! \n Willkommen an Board.`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp()
      .setFooter('.boy by .denzn#5412', member.guild.iconURL());

    welcomeChannel.send({ embeds: [welcomeEmbed] })
      .catch(console.error);
  }
});

// VERLASSENNACHRICHT

client.on('guildMemberRemove', member => {
  const goodbyeChannelId = '1086017495997088015';
  const goodbyeChannel = client.channels.cache.get(goodbyeChannelId);
  if (goodbyeChannel) {
    const embed = new MessageEmbed()
      .setTitle('Auf Wiedersehen')
      .setDescription(`${member} hat den Server verlassen.\n Auf Wiedersehen, bis bald!`)
      .setColor('#50d281')
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp()
      .setFooter('.boy by .denzn#5412', member.guild.iconURL());
    goodbyeChannel.send({ embeds: [embed] })
      .catch(console.error);
  }
});


// HELPBEFEHL

client.on('ready', async () => {
  try {
    await client.application.commands.set([
      {
        name: 'help',
        description: 'Zeigt eine Liste der verfügbaren Befehle an'
      }
    ]);
    console.log('Slash-Befehle erfolgreich registriert!');
  } catch (error) {
    console.error('Fehler beim Registrieren der Slash-Befehle:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'help') {
    const helpEmbed = new MessageEmbed()
      .setColor('#50d281')
      .setTitle('Hilfe')
      .setDescription('Hier ist eine Liste der verfügbaren Befehle:')
      .setTimestamp()
      .setFooter({ text: '.boy by .denzn#5412', iconURL: client.user.displayAvatarURL() });

    const commands = [
      { name: '/ban', description: 'bannt ein Mitglied' },
      { name: '/unban', description: 'entbannt ein Mitglied' },
      { name: '/kick', description: 'kickt ein Mitglied' },
      { name: '/verify', description: 'legt deinen Verifizierungs-Kanal fest' },
      { name: '/announce', description: 'führt eine Ankündigung durch mit deiner Nachricht' },
    ];

    for (const command of commands) {
      const { name, description } = command;
      helpEmbed.addFields({ name, value: description, inline: true });
    }

    await interaction.reply({ embeds: [helpEmbed] });
  }
});


// KICKBEFEHL

client.on('ready', () => {
  client.api.applications(client.user.id).guilds('1028723896163258458').commands.post({
    data: {
      name: 'kick',
      description: 'Kickt einen Benutzer vom Server',
      options: [
        {
          name: 'user',
          description: 'Der Benutzer, der gekickt werden soll',
          type: 6, 
          required: true
        },
        {
          name: 'reason',
          description: 'Der Grund für den Kick',
          type: 3, 
          required: false
        }
      ]
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'kick') {
    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      return interaction.reply({
        content: 'Du hast nicht die Berechtigung, Mitglieder zu kicken.',
        ephemeral: true
      });
    }

    const user = options.getUser('user');
    const reason = options.getString('reason') || 'Kein Grund angegeben';
    try {
      await interaction.guild.members.kick(user.id, reason);
      interaction.reply({
        content: `Der Benutzer ${user.tag} wurde erfolgreich gekickt.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Fehler beim Kicken des Benutzers:', error);
      interaction.reply({
        content: 'Es ist ein Fehler aufgetreten. Der Benutzer konnte nicht gekickt werden.',
        ephemeral: true
      });
    }
  }
});


// BANBEFEHL

client.on('ready', () => {
  client.api.applications(client.user.id).guilds('1028723896163258458').commands.post({
    data: {
      name: 'ban',
      description: 'Bannt einen Benutzer vom Server',
      options: [
        {
          name: 'user',
          description: 'Der Benutzer, der gebannt werden soll',
          type: 6,
          required: true
        },
        {
          name: 'reason',
          description: 'Der Grund für den Ban',
          type: 3,
          required: false
        }
      ]
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ban') {
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({
        content: 'Du hast nicht die Berechtigung, Mitglieder zu bannen.',
        ephemeral: true
      });
    }

    const user = options.getUser('user');
    const reason = options.getString('reason') || 'Kein Grund angegeben';
    try {
      await interaction.guild.members.ban(user.id, { reason });
      interaction.reply({
        content: `Der Benutzer ${user.tag} wurde erfolgreich gebannt.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Fehler beim Bannen des Benutzers:', error);
      interaction.reply({
        content: 'Es ist ein Fehler aufgetreten. Der Benutzer konnte nicht gebannt werden.',
        ephemeral: true
      });
    }
  }
});


// UNBANBEFEHL

client.on('ready', () => {
  client.api.applications(client.user.id).guilds('1028723896163258458').commands.post({
    data: {
      name: 'unban',
      description: 'Entbannt einen Benutzer auf dem Server',
      options: [
        {
          name: 'user',
          description: 'Der Benutzer, der entbannt werden soll',
          type: 6,
          required: true
        }
      ]
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'unban') {
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({
        content: 'Du hast nicht die Berechtigung, Mitglieder zu entbannen.',
        ephemeral: true
      });
    }

    const user = options.getUser('user');

    try {
      await interaction.guild.bans.remove(user.id);
      interaction.reply({
        content: `Der Benutzer ${user.tag} wurde erfolgreich entbannt.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Fehler beim Entbannen des Benutzers:', error);
      interaction.reply({
        content: 'Es ist ein Fehler aufgetreten. Der Benutzer konnte nicht entbannt werden.',
        ephemeral: true
      });
    }
  }
});

// VERIFY
client.on('ready', () => {
  client.guilds.cache.forEach((guild) => {
    guild.commands.create({
      name: 'verify',
      description: 'Startet den Verifizierungsprozess.',
      options: [
        {
          name: 'channel',
          description: 'Der Verifizierungs-Channel',
          type: 'CHANNEL',
          required: true,
        },
      ],
    });
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'verify') {
    const channel = options.getChannel('channel');
    const verificationChannel = interaction.guild.channels.cache.get(channel.id);

    if (verificationChannel && verificationChannel.type === 'GUILD_TEXT') {
      const embed = new MessageEmbed()
        .setTitle('Verifizierung')
        .setDescription('Klicke auf den Button unten, um dich zu verifizieren.')
        .setColor('#50d281');

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('verificationButton')
          .setLabel('Verifizieren')
          .setStyle('SUCCESS')
      );

      await interaction.reply({ content: 'Verifizierung gestartet!', ephemeral: true });
      await verificationChannel.send({ embeds: [embed], components: [row] }).then(async (sentMessage) => {
        const filter = (i) => i.customId === 'verificationButton' && i.user.id === interaction.user.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
          const member = interaction.guild.members.cache.get(i.user.id);
          await member.roles.add('1086029939335249970');

          await sentMessage.delete();

          const verifiedEmbed = new MessageEmbed()
            .setTitle('Verifizierung')
            .setDescription('DU BIST VERIFIZIERT')
            .setColor('#50d281');

          await verificationChannel.send({ embeds: [verifiedEmbed] });

          collector.stop();
        });
      });
    } else {
      await interaction.reply(`Der ausgewählte Kanal ist ungültig oder kein Textkanal.`);
    }
  }
});
// ANNOUNCE

client.on('ready', async () => {
  await client.application.commands.fetch();
  
  client.guilds.cache.forEach((guild) => {
    const command = guild.commands.cache.find((cmd) => cmd.name === 'announce');

    if (!command) {
      guild.commands.create({
        name: 'announce',
        description: 'Sendet eine Nachricht als Embed in einem Channel.',
        options: [
          {
            name: 'channel',
            type: 'CHANNEL',
            description: 'Die ID des Ziel-Channels.',
            required: true,
          },
          {
            name: 'text',
            type: 'STRING',
            description: 'Der Text des Embeds.',
            required: true,
          },
        ],
      });
    }
  });
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isCommand() || interaction.user.bot) return;

  if (interaction.commandName === 'announce') {
    announce(interaction);
  }
});

async function announce(interaction) {
  const channel = interaction.options.getChannel('channel');
  const text = interaction.options.getString('text');

  if (!channel || channel.type !== 'GUILD_TEXT') {
    return interaction.reply('Ungültiger Channel!');
  }

  const embed = new MessageEmbed()
    .setColor('#50d281')
    .setTitle('Important Updates')
    .setDescription(text)
    .setThumbnail(interaction.guild.iconURL())
    .setTimestamp()
    .setFooter('.boy by .denzn#5412', interaction.guild.iconURL());

  try {
    await channel.send({ embeds: [embed] });
    interaction.reply('Nachricht gesendet!');
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    interaction.reply('Fehler beim Senden der Nachricht!');
  }
}

// CHATCLEAR

client.guilds.cache.forEach((guild) => {
  const command = guild.commands.cache.find((cmd) => cmd.name === 'chatclear');

  if (!command) {
    guild.commands.create({
      name: 'chatclear',
      description: 'Löscht Nachrichten in einem Kanal.',
      options: [
        {
          name: 'channel',
          type: 'CHANNEL',
          description: 'Der Kanal, in dem die Nachrichten gelöscht werden sollen.',
          required: true,
        },
        {
          name: 'amount',
          type: 'INTEGER',
          description: 'Die Anzahl der zu löschenden Nachrichten.',
          required: true,
        },
      ],
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'chatclear') {
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      return interaction.reply({ content: 'Du hast nicht die Berechtigung, Nachrichten zu löschen!', ephemeral: true });
    }

  const channel = options.getChannel('channel');
  const amount = options.getInteger('amount');

  if (!channel || !amount || amount < 1 || amount > 100) {
    return interaction.reply({ content: 'Ungültige Kanal- oder Mengenangabe!', ephemeral: true });
  }

  const fetchedMessages = await channel.messages.fetch({ limit: amount + 1 });

  try {
    await channel.bulkDelete(fetchedMessages);
    interaction.reply({ content: `Nachrichten erfolgreich gelöscht: ${amount}`, ephemeral: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Nachrichten:', error);
    interaction.reply({ content: 'Fehler beim Löschen der Nachrichten!', ephemeral: true });
  }
}
});


client.login('MTAxNjQwODc1MTk2OTk0MzYxMg.G2IVMS.KSDIyK2XkyCtrAbLMU--pEUygQegGKkU9OCv_o');