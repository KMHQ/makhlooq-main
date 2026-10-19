import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import { buildPostData, formatPost, parseNewsInput, uploadMedia } from "@/app/lib/newsPosts";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = Number((await params).id);
    if (!id) {
        return NextResponse.json({ error: "News ID is required." }, { status: 400 });
    }

    const input = await parseNewsInput(request);
    if (!input.title.trim()) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    try {
        const payload = await getPayloadInstance();
        const current = await payload.findByID({ collection: "news-posts", id, depth: 1 });
        const currentCover = typeof current.coverImage === "object" ? current.coverImage : null;
        const alt = input.title.trim();

        let coverImage = currentCover?.id ?? (current.coverImage as number | null | undefined) ?? null;
        if (!input.keepMedia && !input.mediaFile && !input.mediaUrl) {
            coverImage = null;
        } else if (input.mediaFile) {
            coverImage = await uploadMedia(payload, input.mediaFile, alt);
        } else if (input.mediaUrl?.startsWith("http") && input.mediaUrl !== currentCover?.url) {
            coverImage = (await uploadMedia(payload, input.mediaUrl, alt)) ?? coverImage;
        }

        await payload.update({ collection: "news-posts", id, data: await buildPostData(payload, input, coverImage) });
        const populated = await payload.findByID({ collection: "news-posts", id, depth: 3 });

        return NextResponse.json(formatPost(populated, { stringifyBody: true }));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = Number((await params).id);
    if (!id) {
        return NextResponse.json({ error: "News ID is required." }, { status: 400 });
    }

    try {
        const payload = await getPayloadInstance();
        await payload.delete({ collection: "news-posts", id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
