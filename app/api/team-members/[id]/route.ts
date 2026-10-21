import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import type { TeamMember } from "@/payload-types";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
    const { id } = await params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Display names are only synced from Discord.
    const { id: _id, name: _name, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = (await request.json()) as Partial<TeamMember>;

    try {
        const payload = await getPayloadInstance();
        return NextResponse.json(await payload.update({ collection: "team_members", id: Number(id), data }));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
    const { id } = await params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const payload = await getPayloadInstance();
        await payload.delete({ collection: "team_members", id: Number(id) });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
