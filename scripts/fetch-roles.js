import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  console.error('Error: DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is missing in .env');
  process.exit(1);
}

async function fetchRoles() {
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Discord API Error:', data);
      return;
    }

    data.sort((a, b) => b.position - a.position);

    console.log(`\n### Total Roles Fetched: ${data.length} (Guild ID: ${guildId})\n`);
    console.log('| Role Name | Role ID | Color | Position | Managed |');
    console.log('| --------- | ------- | ----- | -------- | ------- |');
    data.forEach(r => {
      const color = '#' + r.color.toString(16).padStart(6, '0');
      console.log(`| **${r.name}** | \`${r.id}\` | \`${color}\` | ${r.position} | ${r.managed ? 'Yes' : 'No'} |`);
    });
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

fetchRoles();
