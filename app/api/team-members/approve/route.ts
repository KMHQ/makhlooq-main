import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";

async function getAuthorizedId(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return { response: NextResponse.json({ error: auth.error }, { status: auth.status }) };

    const id = request.nextUrl.searchParams.get("id");
    if (!id) return { response: NextResponse.json({ error: "id is required" }, { status: 400 }) };

    return { id: Number(id) };
}

// PUT /api/team-members/approve?id=<member_id>  — Admin approves a pending member
export async function PUT(request: NextRequest) {
    const { id, response } = await getAuthorizedId(request);
    if (response) return response;

    try {
        const payload = await getPayloadInstance();
        return NextResponse.json(await payload.update({ collection: "team_members", id, data: { is_approved: true } }));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

// DELETE /api/team-members/approve?id=<member_id>  — Admin rejects (deletes) a pending applicant
export async function DELETE(request: NextRequest) {
    const { id, response } = await getAuthorizedId(request);
    if (response) return response;

    try {
        const payload = await getPayloadInstance();
        await payload.delete({ collection: "team_members", id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
