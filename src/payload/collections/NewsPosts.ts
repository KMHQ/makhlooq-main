import { CollectionConfig } from "payload";
import { revalidatePathHook } from "../hooks/revalidate";

export const NewsPosts: CollectionConfig = {
    slug: "news-posts",
    lockDocuments: false,
    admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "publishedAt"],
        description: "Use Content Blocks to build the article — drag to reorder text, images, and videos.",
    },
    hooks: {
        afterChange: [revalidatePathHook("/news")],
        afterDelete: [revalidatePathHook("/news")],
    },
    fields: [
        // ─── Core meta ─────────────────────────────────────────────
        {
            name: "title",
            type: "text",
            required: true,
        },
        {
            name: "slug",
            type: "text",
            required: true,
            admin: {
                description: "URL-friendly identifier, e.g. my-news-post",
            },
        },
        {
            name: "publishedAt",
            type: "date",
            label: "Published At",
            admin: {
                date: { pickerAppearance: "dayAndTime" },
            },
        },
        {
            name: "category",
            type: "select",
            options: [
                { label: "Announcement", value: "announcement" },
                { label: "Tactical Ops", value: "ops" },
                { label: "Fleet Updates", value: "fleet" },
                { label: "Org Lore", value: "lore" },
                { label: "Community", value: "community" },
            ],
        },
        {
            name: "coverImage",
            type: "upload",
            relationTo: "media",
            label: "Cover Image / Thumbnail",
            admin: {
                description: "Used as the hero / card thumbnail for this post.",
            },
        },

        // ─── Author ────────────────────────────────────────────────
        {
            name: "authorSource",
            type: "radio",
            label: "Author",
            options: [
                { label: "Select a Team Member", value: "member" },
                { label: "Enter Name Manually", value: "external" },
            ],
            defaultValue: "external",
            admin: {
                layout: "horizontal",
                description: "Pick an existing member or type a custom name/handle.",
            },
        },
        {
            name: "authorMember",
            type: "relationship",
            relationTo: "team_members",
            label: "Team Member",
            admin: {
                condition: (data) => data?.authorSource === "member",
                description: "Start typing to search members.",
            },
        },
        {
            name: "authorExternal",
            type: "text",
            label: "External Author Name",
            admin: {
                condition: (data) => data?.authorSource !== "member",
                description: "Discord handle, alias, or full name.",
                placeholder: "e.g. @KRAKKEN or Jane Doe",
            },
        },

        // ─── Content Blocks ────────────────────────────────────────
        {
            name: "contentBlocks",
            type: "blocks",
            label: "Content Blocks",
            admin: {
                description: "Build the article body by adding blocks below. Drag the ⠿ handle to reorder them.",
                initCollapsed: false,
            },
            blocks: [
                // ── Text block ────────────────────────────────────────
                {
                    slug: "textBlock",
                    labels: { singular: "Text / Rich Content", plural: "Text Blocks" },
                    imageURL: undefined,
                    fields: [
                        {
                            name: "content",
                            type: "richText",
                            label: "Content",
                            required: true,
                        },
                    ],
                },

                // ── Image block ───────────────────────────────────────
                {
                    slug: "imageBlock",
                    labels: { singular: "Image", plural: "Images" },
                    fields: [
                        {
                            name: "image",
                            type: "upload",
                            relationTo: "media",
                            required: true,
                            label: "Image",
                        },
                        {
                            name: "caption",
                            type: "text",
                            label: "Caption",
                            admin: { placeholder: "Optional caption shown below the image" },
                        },
                        {
                            name: "fullWidth",
                            type: "checkbox",
                            label: "Full Width",
                            defaultValue: false,
                            admin: {
                                description: "Stretch the image to the full card width.",
                            },
                        },
                    ],
                },

                // ── Video block ───────────────────────────────────────
                {
                    slug: "videoBlock",
                    labels: { singular: "Video", plural: "Videos" },
                    fields: [
                        {
                            name: "videoSource",
                            type: "radio",
                            label: "Video Source",
                            options: [
                                { label: "Upload a file", value: "upload" },
                                { label: "External URL (YouTube, Vimeo, direct link…)", value: "url" },
                            ],
                            defaultValue: "upload",
                            admin: { layout: "horizontal" },
                        },
                        {
                            name: "videoFile",
                            type: "upload",
                            relationTo: "media",
                            label: "Video File",
                            admin: {
                                condition: (_, sibling) => sibling?.videoSource !== "url",
                                description: "Accepted: .mp4 · .webm · .mov · .ogg",
                            },
                        },
                        {
                            name: "videoUrl",
                            type: "text",
                            label: "Video URL",
                            admin: {
                                condition: (_, sibling) => sibling?.videoSource === "url",
                                placeholder: "https://youtu.be/... or https://vimeo.com/...",
                                description: "YouTube, Vimeo, or a direct .mp4 link.",
                            },
                        },
                        {
                            name: "caption",
                            type: "text",
                            label: "Caption",
                            admin: { placeholder: "Optional caption" },
                        },
                        {
                            name: "autoplay",
                            type: "checkbox",
                            label: "Autoplay (muted)",
                            defaultValue: false,
                        },
                    ],
                },

                // ── Embed block ───────────────────────────────────────
                {
                    slug: "embedBlock",
                    labels: { singular: "Embed", plural: "Embeds" },
                    fields: [
                        {
                            name: "url",
                            type: "text",
                            required: true,
                            label: "Embed URL",
                            admin: {
                                placeholder: "https://youtube.com/watch?v=... · Twitch · SoundCloud…",
                                description: "Any embeddable URL — we convert YouTube/Vimeo links automatically.",
                            },
                        },
                        {
                            name: "caption",
                            type: "text",
                            label: "Caption",
                            admin: { placeholder: "Optional caption" },
                        },
                    ],
                },
            ],
        },

        // ─── Legacy fields (kept for old posts) ───────────────────
        {
            name: "body",
            type: "richText",
            label: "Body Content (Legacy — use Content Blocks for new posts)",
            admin: {
                description: "⚠ This field is retained for existing posts. New posts should use Content Blocks above.",
                condition: (data) => {
                    // Only show if there's legacy content
                    try {
                        const b = data?.body;
                        if (!b) return false;
                        if (typeof b === "string") return b.length > 0;
                        if (typeof b === "object") return Object.keys(b).length > 0;
                    } catch {
                        // ignore
                    }
                    return false;
                },
            },
        },
        {
            name: "authorHandle",
            type: "text",
            label: "Author Handle (Legacy)",
            admin: {
                hidden: true,
            },
        },
    ],
};
