const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const foldersPath = './commands';
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = `${foldersPath}/${folder}`;
  const commandFiles = fs.statSync(commandsPath).isDirectory()
    ? fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    : [folder]; // 単独ファイルの場合

  for (const file of commandFiles) {
    const filePath = fs.statSync(commandsPath).isDirectory()
      ? `${commandsPath}/${file}`
      : `${foldersPath}/${file}`;
    const command = require(filePath);
    if ('data' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();