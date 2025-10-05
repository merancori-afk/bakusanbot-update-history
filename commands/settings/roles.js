const fs = require('fs');
const configFile = './config.json';

module.exports = {
  async execute(interaction, config) {
    const sub = interaction.options.getSubcommand();
    const role = interaction.options.getRole('ロール');
    const guildId = interaction.guild.id;

    if (!config[guildId]) config[guildId] = {};

    if (sub === '免除') {
      config[guildId].COOLDOWN_BYPASS_ROLE = role ? role.id : null;
      await interaction.reply(role
        ? `免除ロールを ${role.name} に設定しました。`
        : `免除ロールを解除しました。`);
    }

 if (sub === '無敵') {
  config[guildId].IMMUNE_ROLE = role ? role.id : null;
  await interaction.reply(
    role
      ? `無敵ロールを ${role.name} に設定しました。`
      : `無敵ロールを解除しました。`
  );

  // ここを忘れずに！
  const fs = require('fs');
  const configFile = './config.json';
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

    if (sub === '権限') {
      config[guildId].CONFIG_ROLE_ID = role ? role.id : null;
      await interaction.reply(role
        ? `設定コマンド権限ロールを ${role.name} に設定しました。`
        : `設定コマンド権限ロールを解除しました。`);
    }

    // 保存
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  }
};