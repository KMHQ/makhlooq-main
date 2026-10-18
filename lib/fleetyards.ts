export const FLEETYARDS_API = "https://api.fleetyards.net/v1";

// Reads the `rel="next"` URL from a paginated FleetYards response's Link header.
export function getNextLink(linkHeader: string | null) {
    const next = linkHeader
        ?.split(",")
        .map((part) => part.trim())
        .find((part) => /rel="?next"?/.test(part));
    return next?.match(/<([^>]+)>/)?.[1] || null;
}

export type FleetYardsError = { message?: string; error?: string };
