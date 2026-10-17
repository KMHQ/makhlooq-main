import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fetchDiscordMembers, KMHQ_ROLE_ID } from "../lib/discord.js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeNonKmhq() {
    console.log("Fetching Discord members with KMHQ role...");
    const discordMembers = await fetchDiscordMembers();

    // Collect only the UIDs that have KMHQ role on Discord
    const kmhqUids = new Set();
    for (const dm of discordMembers) {
        if (!dm.user || dm.user.bot) continue;
        if (dm.roles && dm.roles.includes(KMHQ_ROLE_ID)) {
            kmhqUids.add(dm.user.id);
        }
    }

    console.log(`Found ${kmhqUids.size} members with KMHQ role on Discord.`);

    // Fetch everyone in the DB
    const { data: dbMembers, error } = await supabase.from("team_members").select("id, discord_uid, name");
    if (error) {
        console.error("DB fetch error:", error);
        return;
    }

    // Find DB members NOT in KMHQ set
    const toDelete = (dbMembers || []).filter((m) => !kmhqUids.has(m.discord_uid));
    console.log(`Removing ${toDelete.length} non-KMHQ members from DB...`);

    if (toDelete.length > 0) {
        const idsToDelete = toDelete.map((m) => m.discord_uid);
        const { error: delError } = await supabase.from("team_members").delete().in("discord_uid", idsToDelete);

        if (delError) {
            console.error("Delete error:", delError);
        } else {
            console.log(`✅ Deleted ${toDelete.length} non-KMHQ members.`);
        }
    }

    // Final count
    const { data: remaining } = await supabase.from("team_members").select("id");
    console.log(`\n✅ Done! DB now has ${remaining?.length || 0} KMHQ members.`);
}

purgeNonKmhq();
