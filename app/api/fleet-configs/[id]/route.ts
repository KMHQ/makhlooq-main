import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import { toFleetType } from "@/app/lib/fleetTypes";
import type { FleetConfig } from "@/payload-types";

type Context = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = ["slug", "display_name", "sort_order", "enabled", "ceo_name", "ceo_discord_uid", "quantity"] as const;

// PUT — update a fleet config
export async function PUT(request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const updates = (await request.json()) as Partial<FleetConfig>;

        const data: Partial<FleetConfig> = {};
        for (const field of EDITABLE_FIELDS) {
            if (updates[field] !== undefined) Object.assign(data, { [field]: updates[field] });
        }
        if (updates.fleet_type !== undefined) data.fleet_type = toFleetType(updates.fleet_type);

        const payload = await getPayloadInstance();
        return NextResponse.json(await payload.update({ collection: "fleet_configs", id: Number(id), data }));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

// DELETE — remove a fleet config (its crew is removed by the collection's beforeDelete hook)
export async function DELETE(_request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const payload = await getPayloadInstance();
        await payload.delete({ collection: "fleet_configs", id: Number(id) });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
