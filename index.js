require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const TEST_MODE = true; // 本番運用時は false に
const configFile = './config.json';
let config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
const usageFile = './usage.json';
let usageData = fs.existsSync(usageFile) ? JSON.parse(fs.readFileSync(usageFile, 'utf8')) : {};

client.once('ready', () => {
  console.log(`✅ ログイン完了: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ------------------------------
  // 爆散コマンド
  // ------------------------------
  if (interaction.commandName === '爆散') {
    const guildId = interaction.guild.id;
    const guildConfig = config[guildId] || {};
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldown = 6 * 60 * 60 * 1000; // 6時間

    // クールダウン判定
    const bypassRole = guildConfig.COOLDOWN_BYPASS_ROLE;
    if (!TEST_MODE && (!bypassRole || !interaction.member.roles.cache.has(bypassRole))) {
      const lastUsed = usageData[userId] || 0;
      const elapsed = now - lastUsed;
      if (elapsed < cooldown) {
        const remaining = cooldown - elapsed;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return interaction.reply({
          content: `💤 爆発装置は冷却中… あと **${hours}時間${minutes}分** 待ってね。`,
          ephemeral: true,
        });
      }
    }

    const vc = interaction.member.voice.channel;
    if (!vc) {
      return interaction.reply({
        content: 'VCにいないみたいだよ。VCに入ってから実行してね。',
        ephemeral: true,
      });
    }

    await interaction.reply("💣 爆散シークエンス開始…");

    setTimeout(async () => {
      await interaction.followUp("💥 爆散！！");

      const succeeded = [];
      const failed = [];

      for (const member of vc.members.values()) {
        if (member.id === client.user.id) continue;

        // 無敵ロール判定
        const immuneRole = guildConfig.IMMUNE_ROLE;
        if (immuneRole && immuneRole !== "null" && member.roles.cache.has(immuneRole)) {
          failed.push(`${member.displayName}（爆発耐性ロール保持者）`);
          continue;
        }

        try {
          await member.voice.disconnect();
          succeeded.push(member.displayName);
        } catch (err) {
          failed.push(`${member.displayName}（${err.name}）`);
        }
      }

      // 報告書
      const timestamp = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      let result = `==============================\n` +
                   `【作戦報告書】\n` +
                   `発動者　　：${interaction.user.username}\n` +
                   `時刻　　　：${timestamp}\n` +
                   `------------------------------\n`;

      if (succeeded.length) {
        result += `対象の殺害に成功。\n` +
                  `殺害人数　：${succeeded.length}名\n` +
                  `排除者一覧：${succeeded.join(', ')}\n`;
      } else {
        result += `殺害対象は存在しなかったよ。\n`;
      }

      if (failed.length) {
        result += `殺害失敗　：${failed.join(', ')}\n`;
      }

      result += `==============================`;

      await interaction.followUp(result);

      if (!TEST_MODE) {
        usageData[userId] = now;
        fs.writeFileSync(usageFile, JSON.stringify(usageData, null, 2));
      }
    }, 3000);
  }

// ------------------------------
// 設定コマンド
// ------------------------------
if (interaction.commandName === '設定') {
  const guildId = interaction.guild.id;
  if (!config[guildId]) config[guildId] = {};

  const sub = interaction.options.getSubcommand();

  // ★ 確認は誰でも実行可能
  if (sub === '確認') {
    const kakunin = require('./commands/settings/kakunin.js');
    return kakunin.execute(interaction, config);
  }

  // ★ それ以外は権限チェック
  const configRoleId = config[guildId].CONFIG_ROLE_ID;
  if (configRoleId && !interaction.member.roles.cache.has(configRoleId)) {
    return interaction.reply({
      content: '❌ このコマンドを実行する権限がありません。',
      ephemeral: true
    });
  }

  // 免除・無敵・権限の設定処理
  const roles = require('./commands/settings/roles.js');
  return roles.execute(interaction, config);
}
});

client.login(process.env.DISCORD_TOKEN);