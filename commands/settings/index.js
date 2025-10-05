const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('設定')
    .setDescription('Botの設定を行います')
    .addSubcommand(sub =>
      sub.setName('免除')
         .setDescription('クールダウン免除ロールを設定（未指定で解除）')
         .addRoleOption(opt =>
           opt.setName('ロール')
              .setDescription('対象ロール（未指定で解除）')
              .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('無敵')
         .setDescription('爆殺不能ロールを設定（未指定で解除）')
         .addRoleOption(opt =>
           opt.setName('ロール')
              .setDescription('対象ロール（未指定で解除）')
              .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('権限')
         .setDescription('設定コマンドを実行できるロールを指定（未指定で解除）')
         .addRoleOption(opt =>
           opt.setName('ロール')
              .setDescription('対象ロール（未指定で解除）')
              .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('確認')
         .setDescription('現在の設定を確認する')),
};