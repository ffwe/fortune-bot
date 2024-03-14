const dotenv = require('dotenv');
// Check for --dev option
if (process.argv.includes('--dev')) {
    dotenv.config({path: '.env.dev'});
} else {
    dotenv.config({path: '.env'});
}

const {token, clientId} = process.env;

const fs = require('node:fs');
const path = require('node:path');

// Require the necessary discord.js classes
const {Client, REST, Routes, Collection, Events, GatewayIntentBits, EmbedBuilder, ChannelType,codeBlock} = require('discord.js');
const client = new Client({
	intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
	]
});

const deployCommands = require('./helpers/deployCommands.js');

deployCommands(token, clientId);

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}



client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      
      const botAvatarURL = client.user.displayAvatarURL();//client.users.cache.get('932090166254907422').avatarURL();

      await command.execute(interaction, botAvatarURL);
      return;
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while interaction.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while interaction.', ephemeral: true });
    }
  }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
const randomMessage = function(msgList){
    return msgList[getRandomInt(0, msgList.length)];
}
const callNickname = function (guild, author){
	const member = guild.member(author);
	return member ? member.displayName : author.username;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("error", () => { console.log("error"); });

client.login(token);