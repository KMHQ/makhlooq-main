import { revalidateTag } from "next/cache";

// Expires the given cache tags (see app/lib/payload/queries.ts and the API routes) after a Payload save or delete.
export const revalidateTagsHook = (...tags: string[]) => {
    return () => {
        try {
            for (const tag of tags) revalidateTag(tag, { expire: 0 });
        } catch (error) {
            console.error(`[Revalidation] Error revalidating ${tags.join(", ")}:`, error);
        }
    };
};
