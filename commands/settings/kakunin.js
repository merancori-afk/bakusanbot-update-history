module.exports = {
  async execute(interaction, config) {
    const guildId = interaction.guild.id;
    const guildConfig = config[guildId] || {};

    const bypass = guildConfig.COOLDOWN_BYPASS_ROLE
      ? `<@&${guildConfig.COOLDOWN_BYPASS_ROLE}>`
      : '未設定';
    const immune = guildConfig.IMMUNE_ROLE
      ? `<@&${guildConfig.IMMUNE_ROLE}>`
      : '未設定';
    const configRole = guildConfig.CONFIG_ROLE_ID
      ? `<@&${guildConfig.CONFIG_ROLE_ID}>`
      : '未設定';

    return interaction.reply(
      `【現在の設定】\n` +
      `設定権限ロール　　：${configRole}\n` +
      `クールダウン免除　：${bypass}\n` +
      `爆殺不能ロール　　：${immune}`
    );
  }
};