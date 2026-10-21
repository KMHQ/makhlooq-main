import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";

// GET — list members for a fleet (public, no auth needed)
export async function GET(request: NextRequest) {
    const fleetId = request.nextUrl.searchParams.get("fleetId");

    try {
        const payload = await getPayloadInstance();
        const { docs } = await payload.find({
            collection: "fleet_members",
            where: fleetId ? { fleet_config: { equals: Number(fleetId) } } : undefined,
            sort: "createdAt",
            limit: 0,
            depth: 0,
        });
        return NextResponse.json(docs);
    } catch (error) {
        console.error("fleet_members GET failed:", error);
        return NextResponse.json([]); // graceful fallback
    }
}

// POST — add a member (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { fleet_config, name, role } = (await request.json()) as { fleet_config?: number; name?: string; role?: string };

        if (!fleet_config || !name?.trim()) {
            return NextResponse.json({ error: "fleet_config and name are required" }, { status: 400 });
        }

        const payload = await getPayloadInstance();
        const member = await payload.create({
            collection: "fleet_members",
            data: { fleet_config, name: name.trim(), role: role?.trim() || "Member" },
            depth: 0,
        });
        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("fleet_members POST failed:", error);
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
