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
const KMHQ_ROLE_ID = '1409930627704164493';

if (!token || !guildId) {
  console.error('Error: DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is missing in .env');
  process.exit(1);
}

async function checkMembers() {
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Discord API Error:', data);
      return;
    }

    console.log(`Total Discord members in Guild: ${data.length}`);
    const kmhqMembers = data.filter(m => m.roles && m.roles.includes(KMHQ_ROLE_ID));
    console.log(`Members with KMHQ role (${KMHQ_ROLE_ID}): ${kmhqMembers.length}`);
    
    kmhqMembers.forEach(m => {
      console.log(` - ${m.user.username} (ID: ${m.user.id}, roles: ${m.roles.join(', ')})`);
    });

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkMembers();
