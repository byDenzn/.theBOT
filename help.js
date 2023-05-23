const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


const client = new Client({ 
  intents: [ 
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES 
  ]
});


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
  