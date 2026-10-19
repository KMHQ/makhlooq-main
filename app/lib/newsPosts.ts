import type { NextRequest } from "next/server";
import type { BasePayload } from "payload";
import type { Media, NewsPost, TeamMember } from "@/payload-types";

type LexicalState = NonNullable<NewsPost["body"]>;
type ContentBlock = NonNullable<NewsPost["contentBlocks"]>[number];

// Shape the editor sends for each block (files arrive separately in the form data under `fileKey`).
interface ContentBlockInput {
    blockType?: string;
    content?: unknown;
    image?: number | null;
    imageUrl?: string;
    prevImageUrl?: string;
    fileKey?: string;
    caption?: string | null;
    fullWidth?: boolean;
    videoSource?: "upload" | "url";
    videoFile?: number | null;
    videoUrl?: string | null;
    autoplay?: boolean;
    url?: string | null;
}

export interface NewsInput {
    title: string;
    body: string;
    mediaUrl: string | null;
    mediaFile: File | null;
    keepMedia: boolean;
    publishedAt: string | null;
    category: NonNullable<NewsPost["category"]>;
    authorHandle: string | null;
    authorSource: "member" | "external";
    authorMemberId: number | null;
    authorExternal: string | null;
    contentBlocks: string | null;
    formData: FormData | null;
}

const trimmed = (value: unknown) => String(value ?? "").trim() || null;

// Accepts both multipart (with uploads) and JSON bodies from the news editor.
export async function parseNewsInput(request: NextRequest): Promise<NewsInput> {
    if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
        const formData = await request.formData();
        const mediaFile = formData.get("media_file");
        const contentBlocks = formData.get("content_blocks");
        return {
            title: String(formData.get("title") || ""),
            body: String(formData.get("body") || ""),
            mediaUrl: trimmed(formData.get("media_url")),
            mediaFile: mediaFile instanceof File ? mediaFile : null,
            keepMedia: formData.get("keep_media") !== "false",
            publishedAt: trimmed(formData.get("published_at")),
            category: (trimmed(formData.get("category")) || "announcement") as NewsInput["category"],
            authorHandle: trimmed(formData.get("author_handle")),
            authorSource: formData.get("author_source") === "member" ? "member" : "external",
            authorMemberId: Number(formData.get("author_member_id")) || null,
            authorExternal: trimmed(formData.get("author_external")),
            contentBlocks: typeof contentBlocks === "string" ? contentBlocks : null,
            formData,
        };
    }

    const body = (await request.json()) as Record<string, unknown>;
    return {
        title: String(body.title || ""),
        body: String(body.body || ""),
        mediaUrl: trimmed(body.media_url),
        mediaFile: null,
        keepMedia: body.keep_media !== false,
        publishedAt: trimmed(body.published_at),
        category: (trimmed(body.category) || "announcement") as NewsInput["category"],
        authorHandle: trimmed(body.author_handle),
        authorSource: body.author_source === "member" ? "member" : "external",
        authorMemberId: Number(body.author_member_id) || null,
        authorExternal: trimmed(body.author_external),
        contentBlocks: typeof body.content_blocks === "string" ? body.content_blocks : JSON.stringify(body.content_blocks || []),
        formData: null,
    };
}

function stringToLexical(text: unknown): LexicalState | null {
    if (!text) return null;
    if (typeof text === "object") return text as LexicalState;

    const value = String(text);
    if (value.trim().startsWith("{")) {
        try {
            return JSON.parse(value) as LexicalState;
        } catch {
            // Not JSON; treat as plain text
        }
    }

    return {
        root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: null,
            children: value.split(/\n\s*\n/).map((p) => ({
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                children: [{ type: "text", text: p, version: 1 }],
            })),
        },
    };
}

// Stores an uploaded file, or downloads a remote URL, as a Media doc. Returns its id.
export async function uploadMedia(payload: BasePayload, source: File | string, alt: string, namePrefix = ""): Promise<number | null> {
    if (source instanceof File) {
        const doc = await payload.create({
            collection: "media",
            data: { alt },
            file: { data: Buffer.from(await source.arrayBuffer()), name: source.name, mimetype: source.type, size: source.size },
        });
        return doc.id;
    }

    try {
        const res = await fetch(source);
        if (!res.ok) return null;

        const data = Buffer.from(await res.arrayBuffer());
        const mimetype = res.headers.get("content-type") || "image/png";
        const doc = await payload.create({
            collection: "media",
            data: { alt },
            file: { data, name: `${namePrefix}${Date.now()}.${mimetype.split("/")[1] || "png"}`, mimetype, size: data.length },
        });
        return doc.id;
    } catch (error) {
        console.error("Failed to download media URL:", error);
        return null;
    }
}

async function processContentBlocks(
    raw: string | null,
    formData: FormData | null,
    payload: BasePayload,
    title: string,
): Promise<ContentBlock[]> {
    if (!raw) return [];

    let blocks: ContentBlockInput[];
    try {
        blocks = JSON.parse(raw);
    } catch (error) {
        console.error("Failed to parse content blocks JSON:", error);
        return [];
    }

    const processed: ContentBlock[] = [];

    for (const block of blocks) {
        const upload = block.fileKey && formData ? formData.get(block.fileKey) : null;
        const file = upload instanceof File ? upload : null;

        switch (block.blockType) {
            case "textBlock":
                processed.push({ blockType: "textBlock", content: stringToLexical(block.content) as LexicalState });
                break;

            case "imageBlock": {
                const alt = (block.caption || title || "Image block").trim();
                let imageId = block.image ?? null;
                if (file) {
                    imageId = await uploadMedia(payload, file, alt);
                } else if (block.imageUrl?.startsWith("http") && (!block.image || block.imageUrl !== block.prevImageUrl)) {
                    imageId = (await uploadMedia(payload, block.imageUrl, alt, "block-image-")) ?? imageId;
                }
                processed.push({
                    blockType: "imageBlock",
                    image: imageId as number,
                    caption: block.caption || null,
                    fullWidth: !!block.fullWidth,
                });
                break;
            }

            case "videoBlock":
                processed.push({
                    blockType: "videoBlock",
                    videoSource: block.videoSource || "upload",
                    videoFile: file
                        ? await uploadMedia(payload, file, (block.caption || title || "Video block").trim())
                        : block.videoFile || null,
                    videoUrl: block.videoUrl || null,
                    caption: block.caption || null,
                    autoplay: !!block.autoplay,
                });
                break;

            case "embedBlock":
                processed.push({ blockType: "embedBlock", url: block.url || "", caption: block.caption || null });
                break;
        }
    }

    return processed;
}

// Builds the stored post fields shared by create and update.
export async function buildPostData(payload: BasePayload, input: NewsInput, coverImage: number | null) {
    const contentBlocks = await processContentBlocks(input.contentBlocks, input.formData, payload, input.title);

    // Without an explicit body, store a short placeholder summary.
    let body = input.body.trim();
    if (!body && contentBlocks.length > 0) {
        body = contentBlocks.some((b) => b.blockType === "textBlock") ? "Structured dispatch report." : "Dispatch update.";
    }

    let authorHandle = input.authorHandle;
    if (!authorHandle) {
        if (input.authorSource === "member" && input.authorMemberId) {
            const member = await payload.findByID({ collection: "team_members", id: input.authorMemberId }).catch(() => null);
            authorHandle = member?.discord_tag || member?.name || "";
        } else {
            authorHandle = input.authorExternal || "";
        }
    }

    const title = input.title.trim();
    return {
        title,
        slug: title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        publishedAt: input.publishedAt ? new Date(input.publishedAt).toISOString() : new Date().toISOString(),
        category: input.category,
        authorSource: input.authorSource,
        authorMember: input.authorSource === "member" ? input.authorMemberId : null,
        authorExternal: input.authorSource === "external" ? input.authorExternal : null,
        authorHandle,
        coverImage,
        contentBlocks,
        body: stringToLexical(body),
    } satisfies Omit<NewsPost, "id" | "createdAt" | "updatedAt">;
}

// The JSON shape the news page and editor consume.
export function formatPost(post: NewsPost, { stringifyBody = false } = {}) {
    const cover = typeof post.coverImage === "object" ? (post.coverImage as Media | null) : null;
    const member = typeof post.authorMember === "object" ? (post.authorMember as TeamMember | null) : null;

    let authorHandle = post.authorHandle || null;
    if (post.authorSource === "member" && member) {
        authorHandle = member.discord_tag || member.name || null;
    } else if (post.authorExternal) {
        authorHandle = post.authorExternal;
    }

    return {
        id: post.id,
        title: post.title,
        // Pass both body (legacy) and contentBlocks (new) so the client can render either
        body: stringifyBody ? JSON.stringify(post.body || "") : post.body || null,
        contentBlocks: post.contentBlocks || [],
        published_at: post.publishedAt || new Date().toISOString(),
        media_url: cover?.url || null,
        media_type: cover ? "image" : null,
        category: post.category || "announcement",
        author_handle: authorHandle,
        authorSource: post.authorSource || "external",
        authorMember: member,
        authorExternal: post.authorExternal || null,
        coverImage: cover,
    };
}

export type FormattedPost = ReturnType<typeof formatPost>;
