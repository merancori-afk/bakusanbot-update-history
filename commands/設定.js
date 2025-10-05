const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('設定')
    .setDescription('Botの動作に関わるロールを管理します')
    // 無制限
    .addSubcommand(sub =>
      sub.setName('無制限追加')
        .setDescription('指定したロールを無制限ロールに登録します（このロールを持つユーザーが6時間のクールタイムなしで爆散可能）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('無制限削除')
        .setDescription('指定したロールを無制限ロールから解除します（このロールを持つユーザーが6時間のクールタイムを受けるようになります）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    // 爆発耐性
    .addSubcommand(sub =>
      sub.setName('爆発耐性追加')
        .setDescription('指定したロールを爆発耐性ロールに登録します（このロールを持つユーザーが爆散されなくなります）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('爆発耐性削除')
        .setDescription('指定したロールを爆発耐性ロールから解除します（このロールを持つユーザーが爆散される対象になります）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    // 管理者権限
    .addSubcommand(sub =>
      sub.setName('管理者権限追加')
        .setDescription('指定したロールを管理者権限ロールに登録します（このロールを持つユーザーが無制限や爆発耐性の登録・解除を行えます）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('管理者権限削除')
        .setDescription('指定したロールを管理者権限ロールから解除します（このロールを持つユーザーが設定変更できなくなります）')
        .addRoleOption(opt =>
          opt.setName('ロール')
            .setDescription('対象ロール')
            .setRequired(true)))
    // 一覧
    .addSubcommand(sub =>
      sub.setName('ロール一覧')
        .setDescription('登録されている管理者権限・爆発耐性・無制限ロールをまとめて表示します')),

  async execute(interaction, config) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    if (!config[guildId]) config[guildId] = {};

    // ==========================
    // ロール一覧は誰でも実行可能
    // ==========================
    if (sub === 'ロール一覧') {
      const unlimited = config[guildId].UNLIMITED_ROLES || [];
      const immune = config[guildId].IMMUNE_ROLES || [];
      const admin = config[guildId].ADMIN_ROLES || [];

      let msg = `【管理者権限ロール】\n${admin.length ? admin.map(r => `<@&${r}>`).join('\n') : 'なし'}\n\n`;
      msg += `【爆発耐性ロール】\n${immune.length ? immune.map(r => `<@&${r}>`).join('\n') : 'なし'}\n\n`;
      msg += `【無制限ロール】\n${unlimited.length ? unlimited.map(r => `<@&${r}>`).join('\n') : 'なし'}`;

      return interaction.reply({ content: msg });
    }

// ==========================
// それ以外は管理者権限ロール必須
// ==========================
const adminRoles = config[guildId].ADMIN_ROLES || [];

// 管理者ロールが未設定なら誰でも実行可能
let isAdmin = true;
if (adminRoles.length > 0) {
  isAdmin = adminRoles.some(r => interaction.member.roles.cache.has(r));
}

if (!isAdmin) {
  return interaction.reply({
    content: '❌ あなたにはこのコマンドを実行する権限がありません（管理者権限ロールが必要です）',
    ephemeral: true
  });
}

    // 無制限追加
    if (sub === '無制限追加') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].UNLIMITED_ROLES) config[guildId].UNLIMITED_ROLES = [];
      if (config[guildId].UNLIMITED_ROLES.includes(role.id)) {
        return interaction.reply({ content: `すでに登録されています: ${role.name}`, ephemeral: true });
      }
      config[guildId].UNLIMITED_ROLES.push(role.id);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `無制限ロールに追加しました: ${role.name}`, ephemeral: true });
    }

    // 無制限削除
    if (sub === '無制限削除') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].UNLIMITED_ROLES) config[guildId].UNLIMITED_ROLES = [];
      const index = config[guildId].UNLIMITED_ROLES.indexOf(role.id);
      if (index === -1) {
        return interaction.reply({ content: `登録されていません: ${role.name}`, ephemeral: true });
      }
      config[guildId].UNLIMITED_ROLES.splice(index, 1);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `無制限に召喚できなくなりました: ${role.name}`, ephemeral: true });
    }

    // 爆発耐性追加
    if (sub === '爆発耐性追加') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].IMMUNE_ROLES) config[guildId].IMMUNE_ROLES = [];
      if (config[guildId].IMMUNE_ROLES.includes(role.id)) {
        return interaction.reply({ content: `すでに登録されています: ${role.name}`, ephemeral: true });
      }
      config[guildId].IMMUNE_ROLES.push(role.id);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `爆発耐性ロールに追加しました: ${role.name}`, ephemeral: true });
    }

    // 爆発耐性削除
    if (sub === '爆発耐性削除') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].IMMUNE_ROLES) config[guildId].IMMUNE_ROLES = [];
      const index = config[guildId].IMMUNE_ROLES.indexOf(role.id);
      if (index === -1) {
        return interaction.reply({ content: `登録されていません: ${role.name}`, ephemeral: true });
      }
      config[guildId].IMMUNE_ROLES.splice(index, 1);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `爆発耐性がなくなりました: ${role.name}`, ephemeral: true });
    }

    // 管理者権限追加
    if (sub === '管理者権限追加') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].ADMIN_ROLES) config[guildId].ADMIN_ROLES = [];
      if (config[guildId].ADMIN_ROLES.includes(role.id)) {
        return interaction.reply({ content: `すでに登録されています: ${role.name}`, ephemeral: true });
      }
      config[guildId].ADMIN_ROLES.push(role.id);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `管理者権限ロールに追加しました: ${role.name}`, ephemeral: true });
    }

    // 管理者権限削除
    if (sub === '管理者権限削除') {
      const role = interaction.options.getRole('ロール');
      if (!config[guildId].ADMIN_ROLES) config[guildId].ADMIN_ROLES = [];
      const index = config[guildId].ADMIN_ROLES.indexOf(role.id);
      if (index === -1) {
        return interaction.reply({ content: `登録されていません: ${role.name}`, ephemeral: true });
      }
      config[guildId].ADMIN_ROLES.splice(index, 1);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply({ content: `管理者権限を失いました: ${role.name}`, ephemeral: true });
    }
  }
};