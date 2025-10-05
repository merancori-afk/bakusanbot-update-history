const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('爆散') // コマンド名
    .setDescription('VCにいるお友達をまとめて爆死させます（強制切断）'), // コマンド説明
};