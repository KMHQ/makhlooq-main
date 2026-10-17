import Redis from "ioredis";

let redis = null;

if (process.env.REDIS_URL) {
    try {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            connectTimeout: 3000,
            reconnectOnError: (err) => {
                const targetError = "READONLY";
                if (err.message.slice(0, targetError.length) === targetError) {
                    return true; // Reconnect
                }
                return false;
            },
        });

        redis.on("error", (err) => {
            // Log connection warnings instead of letting them crash the server
            console.warn("Redis client warning:", err.message);
        });
    } catch (err) {
        console.warn("Failed to initialize Redis client:", err.message);
    }
} else {
    console.log("REDIS_URL is not set. Caching is disabled.");
}

/**
 * Get a value from the cache, or fetch it and cache it if not found.
 * If Redis is unavailable or fails, it gracefully falls back to direct execution.
 *
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function returning the data on cache miss
 * @param {number} [ttlSeconds=60] - Time to live in seconds
 * @returns {Promise<any>}
 */
export async function getOrSetCache(key, fetchFn, ttlSeconds = 60) {
    if (!redis) {
        return fetchFn();
    }

    try {
        const cached = await redis.get(key);
        if (cached !== null) {
            try {
                return JSON.parse(cached);
            } catch (parseErr) {
                console.warn(`Redis parsing error for key ${key}:`, parseErr.message);
            }
        }
    } catch (err) {
        console.warn(`Redis read error for key ${key}:`, err.message);
    }

    // Cache miss or read failure
    const freshData = await fetchFn();

    try {
        if (freshData !== undefined && freshData !== null) {
            await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
        }
    } catch (err) {
        console.warn(`Redis write error for key ${key}:`, err.message);
    }

    return freshData;
}

/**
 * Force invalidate/delete a cache key.
 *
 * @param {string} key - Cache key to delete
 * @returns {Promise<void>}
 */
export async function invalidateCache(key) {
    if (!redis) return;
    try {
        await redis.del(key);
    } catch (err) {
        console.warn(`Redis delete error for key ${key}:`, err.message);
    }
}

export { redis };
