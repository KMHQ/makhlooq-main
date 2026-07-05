import { CollectionConfig } from "payload";
import { revalidatePathHook } from "../hooks/revalidate";

export const NewsPosts: CollectionConfig = {
  slug: "news-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt"],
  },
  hooks: {
    afterChange: [revalidatePathHook("/news")],
    afterDelete: [revalidatePathHook("/news")],
  },
  fields: [
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
      options: ["announcement", "ops", "fleet", "lore", "community"],
    },
    {
      name: "authorHandle",
      type: "text",
      label: "Author Discord Handle",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover Image",
    },
    {
      name: "body",
      type: "richText",
      label: "Body Content",
    },
  ],
};
