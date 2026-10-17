import { createClient } from "@supabase/supabase-js";

// Lazy singleton — created on first use so that window.__SUPABASE_URL__
// (injected by the layout's inline <script>) is already set when we read it.
let _client = null;

function getSupabaseClient() {
    if (_client) return _client;

    const url =
        (typeof window !== "undefined" && window.__SUPABASE_URL__) ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://placeholder.supabase.co";

    const key =
        (typeof window !== "undefined" && window.__SUPABASE_ANON_KEY__) || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    _client = createClient(url, key);
    return _client;
}

// Export a Proxy so that existing `supabase.from(...)` / `supabase.channel(...)`
// call sites keep working without any changes — the real client is resolved lazily.
export const supabase = new Proxy(
    {},
    {
        get(_target, prop) {
            return getSupabaseClient()[prop];
        },
    },
);
