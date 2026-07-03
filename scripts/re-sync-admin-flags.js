import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fetchDiscordMembers, fetchDiscordRoles, parseMemberRoles, KMHQ_ROLE_ID } from '../lib/discord.js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resyncAdmins() {
  const [discordMembers, rawRoles] = await Promise.all([
    fetchDiscordMembers(),
    fetchDiscordRoles()
  ]);
  const rolesMap = new Map((rawRoles || []).map(r => [r.id, r]));

  console.log(`Processing ${discordMembers.length} Discord members...`);

  let adminCount = 0;
  for (const dm of discordMembers) {
    if (!dm.user || dm.user.bot) continue;
    if (!dm.roles || !dm.roles.includes(KMHQ_ROLE_ID)) continue;

    const uid = dm.user.id;
    const parsed = parseMemberRoles(dm.roles, rolesMap, uid);

    if (parsed.is_admin) {
      adminCount++;
      console.log(` -> Admin (R6/Leadership): ${dm.user.username} (${parsed.sec_level})`);
    }

    await supabase
      .from('team_members')
      .update({ is_admin: parsed.is_admin, sec_level: parsed.sec_level })
      .eq('discord_uid', uid);
  }

  console.log(`Done! Total members granted admin (R6/Leadership): ${adminCount}`);
}

resyncAdmins();
