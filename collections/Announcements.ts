import { CollectionConfig } from "payload";

export const Announcements: CollectionConfig = {
    slug: "announcements",
    lockDocuments: false,
    admin: {
        useAsTitle: "message",
    },
    fields: [
        {
            name: "message",
            type: "text",
            required: true,
        },
        {
            name: "severity",
            type: "select",
            defaultValue: "info",
            options: [
                { label: "Info", value: "info" },
                { label: "Warning", value: "warning" },
                { label: "Critical", value: "critical" },
            ],
        },
        {
            name: "active",
            type: "checkbox",
            defaultValue: true,
        },
        {
            name: "expiresAt",
            type: "date",
            label: "Expires At (optional)",
        },
    ],
};
