import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import type { FleetMember } from "@/payload-types";

type Context = { params: Promise<{ id: string }> };

// PUT — update member name/role (admin only)
export async function PUT(request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const { name, role } = (await request.json()) as { name?: string; role?: string };

        const data: Partial<FleetMember> = {};
        if (name !== undefined) data.name = name.trim();
        if (role !== undefined) data.role = role.trim() || "Member";

        const payload = await getPayloadInstance();
        return NextResponse.json(await payload.update({ collection: "fleet_members", id: Number(id), data, depth: 0 }));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

// DELETE — remove member (admin only)
export async function DELETE(_request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const payload = await getPayloadInstance();
        await payload.delete({ collection: "fleet_members", id: Number(id) });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
