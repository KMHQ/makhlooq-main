import type { Media } from "@/payload-types";

// URL of a Payload upload field, which is either a populated Media doc or just its id.
export function mediaUrl(value: number | Media | null | undefined): string | null {
    return value && typeof value === "object" ? value.url || null : null;
}

// Keep in sync with `images.remotePatterns` in next.config.mjs.
const OPTIMIZED_HOSTS = new Set(["cdn.discordapp.com", "api.fleetyards.net", "fleetyards.net", "storage.fltyrd.net"]);

// next/image can only optimize local paths and allowlisted hosts. Other URLs (pasted into the CMS or a profile,
// or blob: previews) get `unoptimized` so they're served as-is instead of failing.
export function isUnoptimized(src: string): boolean {
    if (src.startsWith("/") && !src.startsWith("//")) return false;
    try {
        return !OPTIMIZED_HOSTS.has(new URL(src).hostname);
    } catch {
        return true;
    }
}
