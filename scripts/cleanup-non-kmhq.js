import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Read .env file manually
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
            process.env[key.trim()] = values.join("=").trim();
        }
    });
}

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KMHQ_ROLE_ID = "1409930627704164493";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    try {
        // 1. Fetch Discord members
        const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
            headers: { Authorization: `Bot ${token}` },
        });
        const discordMembers = await res.json();
        if (!res.ok) {
            console.error("Discord fetch failed:", discordMembers);
            return;
        }

        const kmhqUids = new Set(
            discordMembers.filter((m) => m.user && !m.user.bot && m.roles && m.roles.includes(KMHQ_ROLE_ID)).map((m) => m.user.id),
        );

        console.log(`Found ${kmhqUids.size} KMHQ member UIDs in Discord.`);

        // 2. Fetch current Supabase team_members
        const { data: dbMembers, error } = await supabase.from("team_members").select("id, discord_uid, name");
        if (error) {
            console.error("Supabase fetch error:", error);
            return;
        }

        console.log(`Total current members in Supabase team_members: ${dbMembers.length}`);

        const toDelete = dbMembers.filter((m) => !kmhqUids.has(m.discord_uid));
        console.log(`Members to remove (non-KMHQ): ${toDelete.length}`);

        if (toDelete.length > 0) {
            const uidsToRemove = toDelete.map((m) => m.discord_uid).filter(Boolean);
            const idsToRemove = toDelete.map((m) => m.id);

            // Delete non-KMHQ members from team_members table
            const { error: delErr } = await supabase.from("team_members").delete().in("id", idsToRemove);

            if (delErr) {
                console.error("Delete error:", delErr);
            } else {
                console.log(`Successfully removed ${toDelete.length} non-KMHQ members from Supabase team_members table!`);
            }
        }

        // Check final count
        const { data: finalMembers } = await supabase.from("team_members").select("id");
        console.log(`Final count in Supabase team_members table: ${finalMembers.length}`);
    } catch (err) {
        console.error("Cleanup failed:", err);
    }
}

cleanup();
