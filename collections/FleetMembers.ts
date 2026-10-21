import { CollectionConfig } from "payload";
import { revalidateTagsHook } from "../hooks/revalidate";

export const FleetMembers: CollectionConfig = {
    slug: "fleet_members",
    lockDocuments: false,
    labels: {
        singular: "Fleet Member",
        plural: "Fleet Members",
    },
    admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "role", "fleet_config"],
        group: "Fleet",
    },
    hooks: {
        afterChange: [revalidateTagsHook("fleet-configs")],
        afterDelete: [revalidateTagsHook("fleet-configs")],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "fleet_config",
            type: "relationship",
            relationTo: "fleet_configs",
            required: true,
            label: "Fleet Config",
        },
        {
            name: "name",
            type: "text",
            required: true,
            label: "Name",
        },
        {
            name: "role",
            type: "text",
            label: "Role",
            defaultValue: "Member",
        },
    ],
};
