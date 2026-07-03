/**
 * Discord API Utility
 * Uses the bot token to fetch server data and map roles automatically
 */

const getBotToken = () => process.env.DISCORD_BOT_TOKEN;
const getGuildId = () => process.env.DISCORD_GUILD_ID;

// Map of Role IDs for Clearance Levels (higher index = higher clearance priority)
export const CLEARANCE_ROLES = [
  { id: '1370432627814961212', name: 'R0' },
  { id: '1364662076013940841', name: 'R1' },
  { id: '1364662156850761890', name: 'R2' },
  { id: '1362418699377709299', name: 'R3' },
  { id: '1362415755009986790', name: 'R4' },
  { id: '1364662461365751989', name: 'R5' },
  { id: '1362416160787791993', name: 'R6' }
];

// Map of Role IDs for Military Ranks (lower index = higher rank priority)
export const RANK_ROLES = [
  { id: '1370438091613016135', name: 'Field Marshal' },
  { id: '1370437141452030102', name: 'General' },
  { id: '1370436925537910936', name: 'Commander' },
  { id: '1370436793568071823', name: 'Colonel' },
  { id: '1370436727675551825', name: 'Major' },
  { id: '1370436614605766799', name: 'Captain' },
  { id: '1370436510762930279', name: 'Lieutenant' },
  { id: '1370436389052874752', name: 'Officer' },
  { id: '1370436217828540638', name: 'Sergeant' },
  { id: '1370436139952902174', name: 'Corporal' },
  { id: '1370436042544644288', name: 'Soldier' },
  { id: '1370435922730156093', name: 'Citizen' },
  { id: '1370486810832273489', name: 'Makhlooq' }
];

export const KMHQ_ROLE_ID = '1409930627704164493';

// Map of Leadership Roles -> { roleName, isAdmin }
export const LEADERSHIP_ROLES = {
  '1364677903995900097': { role: 'Quaid - Founder', isAdmin: true },
  '1365424506507890771': { role: 'High Council', isAdmin: true },
  '1365424626276241470': { role: 'Advisor', isAdmin: true },
  [KMHQ_ROLE_ID]: { role: 'KMHQ', isAdmin: true }
};

const TIER_RANKING = { Ustad: 4, Uncle: 3, Launda: 2, Charsi: 1 };

export async function fetchDiscordMembers() {
  const token = getBotToken();
  const guildId = getGuildId();

  if (!token || !guildId) {
    console.warn('Discord Bot Token or Guild ID missing');
    return [];
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      let errMsg = response.statusText;
      try {
        const errBody = await response.json();
        if (errBody && errBody.message) {
          errMsg = `${response.statusText} - ${errBody.message} (code ${errBody.code})`;
        }
      } catch (_) {}
      throw new Error(`Discord API error: ${response.status} ${errMsg}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Discord members:', error);
    throw error;
  }
}

export async function fetchDiscordRoles() {
  const token = getBotToken();
  const guildId = getGuildId();

  if (!token || !guildId) {
    console.warn('Discord Bot Token or Guild ID missing');
    return [];
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Discord roles:', error);
    return [];
  }
}

/**
 * Maps Discord presence to internal status
 */
export function mapDiscordStatus(presence) {
  switch (presence) {
    case 'online':
    case 'idle':
    case 'dnd':
      return 'active';
    default:
      return 'active';
  }
}

/**
 * Parses member roles to auto-determine:
 * - sec_level (R0 - R6)
 * - category (Rank)
 * - role (Leadership / Flair)
 * - is_admin (boolean)
 * - awards ([{ category, tier }])
 */
export function parseMemberRoles(userRoleIds = [], rolesMap = new Map(), discordUid = '') {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim());

  let sec_level = 'R0';
  let category = 'Makhlooq';
  let role = 'KMHQ';
  let is_admin = adminIds.includes(discordUid);
  
  // Track highest clearance found
  let maxClearanceIdx = -1;
  CLEARANCE_ROLES.forEach((c, idx) => {
    if (userRoleIds.includes(c.id)) {
      if (idx > maxClearanceIdx) {
        maxClearanceIdx = idx;
        sec_level = c.name;
      }
    }
  });

  // Track highest rank found
  let minRankIdx = 999;
  RANK_ROLES.forEach((r, idx) => {
    if (userRoleIds.includes(r.id)) {
      if (idx < minRankIdx) {
        minRankIdx = idx;
        category = r.name;
      }
    }
  });

  // Track leadership roles & admin status
  userRoleIds.forEach(roleId => {
    if (LEADERSHIP_ROLES[roleId]) {
      role = LEADERSHIP_ROLES[roleId].role;
      if (LEADERSHIP_ROLES[roleId].isAdmin) {
        is_admin = true;
      }
    }
  });

  // Track awards
  const categoryAwards = {};
  userRoleIds.forEach(roleId => {
    const discordRole = rolesMap.get(roleId);
    if (!discordRole) return;

    // Check if role name matches Tier-e-Category
    const match = discordRole.name.match(/^(Ustad|Uncle|Launda|Charsi)-e-([A-Za-z]+)$/i);
    if (match) {
      const tier = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      let cat = match[2].charAt(0).toUpperCase() + match[2].slice(1);
      if (cat.toLowerCase() === 'rihla') cat = 'Rehla';

      const currentScore = TIER_RANKING[categoryAwards[cat]] || 0;
      const newScore = TIER_RANKING[tier] || 0;

      if (newScore > currentScore) {
        categoryAwards[cat] = tier;
      }
    }
  });

  const awards = Object.keys(categoryAwards).map(cat => ({
    category: cat,
    tier: categoryAwards[cat]
  }));

  return {
    sec_level,
    category,
    role,
    is_admin,
    awards
  };
}
