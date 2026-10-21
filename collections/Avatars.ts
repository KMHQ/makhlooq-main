import { CollectionConfig } from "payload";
import { uploadDir } from "./uploadDir";

// Profile pictures members upload from /team/profile. The member's avatar_url points at the file.
export const Avatars: CollectionConfig = {
    slug: "avatars",
    lockDocuments: false,
    admin: {
        useAsTitle: "filename",
        defaultColumns: ["filename", "discord_uid", "updatedAt"],
        group: "Team",
    },
    access: {
        read: () => true,
    },
    upload: {
        staticDir: uploadDir("avatars"),
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },
    fields: [
        {
            name: "discord_uid",
            type: "text",
            label: "Discord UID",
            index: true,
        },
    ],
};
