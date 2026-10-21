import { CollectionConfig } from "payload";
import { uploadDir } from "./uploadDir";

export const Media: CollectionConfig = {
    slug: "media",
    upload: {
        staticDir: uploadDir("media"),
        mimeTypes: [
            // Images
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            // Videos
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/ogg",
        ],
    },
    fields: [
        {
            name: "alt",
            type: "text",
            label: "Alt Text",
        },
    ],
};
