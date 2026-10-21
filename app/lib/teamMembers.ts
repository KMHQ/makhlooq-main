import { cacheLife, cacheTag } from "next/cache";
import { getPayloadInstance } from "./payload";
import type { TeamMember } from "@/payload-types";

// Uncached lookup by Discord ID, for auth and per-user requests.
export async function findMemberByDiscordId(discordUid: string): Promise<TeamMember | null> {
    const payload = await getPayloadInstance();
    const { docs } = await payload.find({
        collection: "team_members",
        where: { discord_uid: { equals: discordUid } },
        limit: 1,
        depth: 0,
    });
    return docs[0] ?? null;
}

// Looks a member up by Discord ID, falling back to a case-insensitive name match.
export async function getMember(discordUidOrName: string): Promise<TeamMember | null> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    const member = await findMemberByDiscordId(discordUidOrName);
    if (member) return member;

    // `like` matches all words in any order, so narrow it to an exact case-insensitive name.
    const payload = await getPayloadInstance();
    const { docs } = await payload.find({ collection: "team_members", where: { name: { like: discordUidOrName } }, limit: 0, depth: 0 });
    const name = discordUidOrName.trim().toLowerCase();
    return docs.find((doc) => doc.name.trim().toLowerCase() === name) ?? null;
}

export async function getMembers(approvedOnly: boolean): Promise<TeamMember[]> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    const payload = await getPayloadInstance();
    const { docs } = await payload.find({
        collection: "team_members",
        where: approvedOnly ? { is_approved: { equals: true } } : undefined,
        sort: "joined_at",
        limit: 0,
        depth: 0,
    });
    return docs;
}
