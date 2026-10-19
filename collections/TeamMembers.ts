import { CollectionConfig } from "payload";
import { revalidateTagsHook } from "../hooks/revalidate";

export const TeamMembers: CollectionConfig = {
    slug: "team_members",
    lockDocuments: false,
    labels: {
        singular: "Team Member",
        plural: "Team Members",
    },
    admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "role", "category", "is_approved", "is_admin"],
        group: "Team",
    },
    hooks: {
        afterChange: [revalidateTagsHook("team-members", "news-posts")],
        afterDelete: [revalidateTagsHook("team-members", "news-posts")],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "discord_uid",
            type: "text",
            required: true,
            unique: true,
            label: "Discord UID",
        },
        {
            name: "discord_tag",
            type: "text",
            label: "Discord Tag",
        },
        {
            name: "name",
            type: "text",
            required: true,
            label: "Display Name",
        },
        {
            name: "role",
            type: "text",
            label: "Flair",
            defaultValue: "KMHQ",
        },
        {
            name: "flair_color",
            type: "text",
            label: "Flair Color",
            defaultValue: "#10b981",
        },
        {
            name: "flair_icon",
            type: "select",
            label: "Flair Icon",
            options: [
                { label: "Crown", value: "crown" },
                { label: "Shield", value: "shield" },
                { label: "Sword", value: "sword" },
                { label: "Users", value: "users" },
                { label: "Zap", value: "zap" },
                { label: "Terminal", value: "terminal" },
                { label: "None", value: "none" },
            ],
            defaultValue: "zap",
        },
        {
            name: "category",
            type: "select",
            label: "Rank",
            options: [
                "Field Marshal",
                "General",
                "Commander",
                "Colonel",
                "Major",
                "Captain",
                "Officer",
                "Lieutenant",
                "Sergeant",
                "Corporal",
                "Soldier",
                "Citizen",
                "Makhlooq",
            ],
            defaultValue: "Makhlooq",
        },
        {
            name: "sec_level",
            type: "select",
            label: "Clearance Level",
            options: ["R0", "R1", "R2", "R3", "R4", "R5", "R6"],
            defaultValue: "R0",
        },
        {
            name: "avatar_url",
            type: "text",
            label: "Avatar URL",
        },
        {
            name: "node_color",
            type: "text",
            label: "Frame Color",
            defaultValue: "#10b981",
        },
        {
            name: "bio",
            type: "textarea",
            label: "Bio",
        },
        {
            name: "status",
            type: "select",
            label: "Status",
            options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
            ],
            defaultValue: "active",
        },
        {
            name: "awards",
            type: "json",
            label: "Awards / Badges",
            defaultValue: [],
        },
        {
            name: "is_approved",
            type: "checkbox",
            defaultValue: false,
            label: "Approved",
        },
        {
            name: "is_admin",
            type: "checkbox",
            defaultValue: false,
            label: "Is Admin",
        },
        {
            name: "joined_at",
            type: "date",
            label: "Deployed Date",
            admin: {
                date: {
                    pickerAppearance: "dayAndTime",
                },
            },
        },
    ],
};
