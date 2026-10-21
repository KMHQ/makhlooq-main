import { revalidateTag } from "next/cache";

// Expires the given cache tags (see app/lib/payload/queries.ts and the API routes) after a Payload save or delete.
// Bulk writers (the Discord sync) pass `context: { skipRevalidate: true }` and revalidate once at the end.
export const revalidateTagsHook = (...tags: string[]) => {
    return ({ context }: { context: Record<string, unknown> }) => {
        if (context.skipRevalidate) return;
        try {
            for (const tag of tags) revalidateTag(tag, { expire: 0 });
        } catch (error) {
            console.error(`[Revalidation] Error revalidating ${tags.join(", ")}:`, error);
        }
    };
};
