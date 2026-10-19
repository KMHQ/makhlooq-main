import { NextResponse } from "next/server";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";

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
