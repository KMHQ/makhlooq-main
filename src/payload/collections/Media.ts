import { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
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
