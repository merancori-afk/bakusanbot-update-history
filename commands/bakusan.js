const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('爆散') // コマンド名
    .setDescription('VCにいるメンバーを爆散させる'), // コマンド説明
};