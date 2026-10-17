import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

async function checkStatus() {
    const { data: all } = await supabase.from("team_members").select("*");
    const members = all || [];

    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const inactive = members.filter((m) => m.status === "inactive").length;
    const admins = members.filter((m) => m.is_admin).length;
    const approved = members.filter((m) => m.is_approved).length;
    const pending = members.filter((m) => !m.is_approved).length;

    console.log("=== DATABASE STATUS ===");
    console.log(`Total members in DB:  ${total}`);
    console.log(`  Approved:           ${approved}`);
    console.log(`  Pending:            ${pending}`);
    console.log(`  Active status:      ${active}`);
    console.log(`  Inactive status:    ${inactive}`);
    console.log(`  is_admin = true:    ${admins}`);
    console.log("");

    if (admins > 0) {
        console.log("Admin members:");
        members
            .filter((m) => m.is_admin)
            .forEach((m) => {
                console.log(`  - ${m.name} (${m.discord_tag}) | sec_level: ${m.sec_level}`);
            });
    }
}

checkStatus();
