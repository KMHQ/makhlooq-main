import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";
import type { TeamMember } from "@/types/db";

// Looks a member up by Discord ID, falling back to a case-insensitive name match.
export async function getMember(discordUidOrName: string): Promise<TeamMember | null> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    const { data: member, error } = await supabase.from("team_members").select("*").eq("discord_uid", discordUidOrName).maybeSingle();
    if (error) throw error;
    if (member) return member;

    const { data: byName } = await supabase.from("team_members").select("*").ilike("name", discordUidOrName).maybeSingle();
    return byName ?? null;
}

export async function getMembers(approvedOnly: boolean): Promise<TeamMember[]> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    let query = supabase.from("team_members").select("*");
    if (approvedOnly) query = query.eq("is_approved", true);
    const { data, error } = await query.order("joined_at");

    if (error) throw error;
    return data ?? [];
}
