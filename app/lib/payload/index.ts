import { getPayload } from "payload";
import config from "@payload-config";

// Cache the resolved payload instance (not the promise)
// so a failed connection doesn't permanently poison the cache.
let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

export async function getPayloadInstance() {
    if (cached) return cached;

    try {
        cached = await getPayload({ config });
        return cached;
    } catch (err) {
        // Reset so the next request can retry — don't hold a broken promise.
        cached = null;
        throw err;
    }
}
