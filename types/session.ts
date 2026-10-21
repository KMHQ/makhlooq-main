import type { TeamMember } from "@/payload-types";

// Response of GET /api/auth/discord/session
export interface SessionUser {
    discordId: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    source: string;
}

export interface SessionResponse {
    authenticated: boolean;
    admin: boolean;
    user?: SessionUser;
    member?: TeamMember | null;
}
