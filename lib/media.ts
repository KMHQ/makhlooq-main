import type { Media } from "@/payload-types";

// URL of a Payload upload field, which is either a populated Media doc or just its id.
export function mediaUrl(value: number | Media | null | undefined): string | null {
    return value && typeof value === "object" ? value.url || null : null;
}
