import { CollectionConfig } from "payload";
import { revalidateTagsHook } from "../hooks/revalidate";

export const FleetConfigs: CollectionConfig = {
    slug: "fleet_configs",
    lockDocuments: false,
    labels: {
        singular: "Fleet Config",
        plural: "Fleet Configs",
    },
    admin: {
        useAsTitle: "display_name",
        defaultColumns: ["display_name", "slug", "fleet_type", "enabled"],
        group: "Fleet",
    },
    hooks: {
        // Payload doesn't cascade relationship deletes, so remove the fleet's crew with it.
        beforeDelete: [
            async ({ id, req }) => {
                await req.payload.delete({ collection: "fleet_members", where: { fleet_config: { equals: id } }, req });
            },
        ],
        afterChange: [revalidateTagsHook("fleet-configs")],
        afterDelete: [revalidateTagsHook("fleet-configs")],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "slug",
            type: "text",
            required: true,
            label: "FleetYards Slug",
        },
        {
            name: "display_name",
            type: "text",
            required: true,
            label: "Display Name",
        },
        {
            name: "enabled",
            type: "checkbox",
            defaultValue: true,
            label: "Enabled",
        },
        {
            name: "sort_order",
            type: "number",
            label: "Sort Order",
            defaultValue: 0,
            admin: {
                position: "sidebar",
            },
        },
        {
            name: "fleet_type",
            type: "select",
            label: "Fleet Type",
            options: [
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
                { label: "Sub-Capital", value: "sub_capital" },
                { label: "Capital", value: "capital" },
            ],
            defaultValue: "medium",
        },
        {
            name: "ceo_name",
            type: "text",
            label: "CEO Name",
        },
        {
            name: "ceo_discord_uid",
            type: "text",
            label: "CEO Discord UID",
        },
        {
            name: "quantity",
            type: "number",
            label: "Quantity (if overriding)",
            defaultValue: 1,
        },
    ],
};
