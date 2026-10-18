import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Server-only client. The service-role key bypasses RLS, so never import this from client components.
// Placeholders keep `next build` working without env vars; requests fail at runtime instead.
export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
);
