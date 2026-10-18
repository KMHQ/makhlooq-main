import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { getPayloadInstance } from "@/lib/payload";
import { errorMessage } from "@/lib/errors";
import { buildPostData, formatPost, parseNewsInput, uploadMedia } from "@/lib/newsPosts";

export async function GET() {
    try {
        const payload = await getPayloadInstance();
        const result = await payload.find({ collection: "news-posts", sort: "-publishedAt", limit: 100, depth: 3 });

        return NextResponse.json(result.docs.map((post) => formatPost(post)));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const input = await parseNewsInput(request);
    if (!input.title.trim()) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    try {
        const payload = await getPayloadInstance();
        const alt = input.title.trim();

        let coverImage: number | null = null;
        if (input.mediaFile) {
            coverImage = await uploadMedia(payload, input.mediaFile, alt);
        } else if (input.mediaUrl?.startsWith("http")) {
            coverImage = await uploadMedia(payload, input.mediaUrl, alt);
        }

        const created = await payload.create({ collection: "news-posts", data: await buildPostData(payload, input, coverImage) });
        const populated = await payload.findByID({ collection: "news-posts", id: created.id, depth: 3 });

        return NextResponse.json(formatPost(populated, { stringifyBody: true }), { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
