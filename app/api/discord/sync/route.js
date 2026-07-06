import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchDiscordMembers, fetchDiscordRoles, parseMemberRoles, mapDiscordStatus, KMHQ_ROLE_ID } from '../../../../lib/discord';
import { requireFleetAdmin } from '../../../../lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const auth = await requireFleetAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. Fetch live members and roles from Discord
    const [discordMembers, rawRoles] = await Promise.all([
      fetchDiscordMembers(),
      fetchDiscordRoles()
    ]);
    
    if (!discordMembers || discordMembers.length === 0) {
      return NextResponse.json({ error: 'No Discord members found or API error' }, { status: 500 });
    }

    const rolesMap = new Map((rawRoles || []).map(r => [r.id, r]));

    // 2. Fetch existing roster from Supabase
    const { data: existingMembers, error: fetchError } = await supabase
      .from('team_members')
      .select('*');

    if (fetchError) throw fetchError;

    const existingMap = new Map((existingMembers || []).map(m => [m.discord_uid, m]));

    let createdCount = 0;
    let updatedCount = 0;
    const operations = [];
    const activeKmhqUids = new Set();

    // 3. Process each Discord member
    for (const dm of discordMembers) {
      const { user, nick, roles = [], presence } = dm;
      if (!user || user.bot) continue; // Skip bot accounts

      // Only pull members who have the KMHQ role (1409930627704164493)
      if (!roles.includes(KMHQ_ROLE_ID)) continue;

      const uid = user.id;
      activeKmhqUids.add(uid);

      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${uid}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(uid) >> 22n) % 5n}.png`;

      const tag = user.discriminator && user.discriminator !== '0'
        ? `${user.username}#${user.discriminator}`
        : user.username;

      const displayName = nick || user.global_name || user.username;
      
      // Auto-derive security level, rank (category), role/flair, admin status, and awards from Discord roles
      const parsed = parseMemberRoles(roles, rolesMap, uid);
      const status = mapDiscordStatus(presence?.status);

      const existing = existingMap.get(uid);

      if (existing) {
        // Prepare update
        const payload = {
          discord_tag: tag,
          avatar_url: avatarUrl,
          sec_level: parsed.sec_level,
          category: parsed.category,
          status: existing.status || 'inactive',
          is_approved: true,
          updated_at: new Date().toISOString()
        };

        // Always sync display name from Discord
        payload.name = displayName;

        // Update role if current role is default or empty
        if (!existing.role || existing.role === 'KMHQ' || existing.role === 'Officer') {
          payload.role = parsed.role;
        }

        // Update is_admin status according to R6 / Leadership / Env status
        payload.is_admin = parsed.is_admin;

        // Update awards if parsed has awards or existing has none
        if (parsed.awards && parsed.awards.length > 0) {
          payload.awards = parsed.awards;
        }

        operations.push(
          supabase
            .from('team_members')
            .update(payload)
            .eq('discord_uid', uid)
        );
        updatedCount++;
      } else {
        // Prepare insert for new member from Discord server
        const newPayload = {
          discord_uid: uid,
          discord_tag: tag,
          name: displayName,
          role: parsed.role,
          category: parsed.category,
          sec_level: parsed.sec_level,
          avatar_url: avatarUrl,
          node_color: '#10b981',
          status: 'inactive',
          is_approved: true,
          is_admin: parsed.is_admin,
          awards: parsed.awards || [],
          joined_at: dm.joined_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        operations.push(
          supabase
            .from('team_members')
            .insert(newPayload)
        );
        createdCount++;
      }
    }

    // Batch process all updates and inserts
    const batchSize = 20;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    // 4. Remove members from database who lost the KMHQ role or left Discord
    const nonKmhqUids = Array.from(existingMap.keys()).filter(uid => !activeKmhqUids.has(uid));
    let removedCount = 0;
    if (nonKmhqUids.length > 0) {
      const { count } = await supabase
        .from('team_members')
        .delete({ count: 'exact' })
        .in('discord_uid', nonKmhqUids);
      removedCount = count || nonKmhqUids.length;
    }

    return NextResponse.json({ 
      success: true, 
      synced: operations.length,
      created: createdCount,
      updated: updatedCount,
      removed: removedCount,
      totalDiscord: discordMembers.length,
      kmhqMembersCount: activeKmhqUids.size
    });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
