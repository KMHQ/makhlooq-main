import { NextResponse } from "next/server";
import { getPayloadInstance } from "@/lib/payload";
import { errorMessage } from "@/lib/errors";

export async function GET() {
    try {
        const payload = await getPayloadInstance();
        const [fleetPage, siteSettings] = await Promise.all([
            payload.findGlobal({ slug: "fleet-page" }),
            payload.findGlobal({ slug: "site-settings" }),
        ]);
        return NextResponse.json({ success: true, fleetPage, siteSettings });
    } catch (error) {
        return NextResponse.json({ success: false, error: errorMessage(error) });
    }
}
