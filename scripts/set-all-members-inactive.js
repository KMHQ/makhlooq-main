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

async function setAllInactive() {
    console.log("Setting default status to inactive for all members...");
    const { data, error } = await supabase.from("team_members").update({ status: "inactive" }).not("id", "is", null);

    if (error) {
        console.error("Error updating member statuses:", error);
    } else {
        console.log("Successfully set status = inactive for all team members!");
    }
}

setAllInactive();
