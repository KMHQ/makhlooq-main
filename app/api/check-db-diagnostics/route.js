import { NextResponse } from "next/server";
import { getPayloadInstance } from "../../../lib/payload";

export async function GET() {
    try {
        const payload = await getPayloadInstance();
        const data = await payload.findGlobal({
            slug: "fleet-page",
        });
        const siteSettings = await payload.findGlobal({
            slug: "site-settings",
        });
        return NextResponse.json({
            success: true,
            fleetPage: data,
            siteSettings,
        });
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err.message,
            stack: err.stack,
        });
    }
}
