import { GlobalConfig } from "payload";
import { revalidateTagsHook } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
    slug: "site-settings",
    label: "Site Settings",
    admin: {
        group: "Global",
    },
    hooks: {
        afterChange: [revalidateTagsHook("global:site-settings")],
    },
    fields: [
        // --- SEO ---
        {
            name: "seo",
            type: "group",
            label: "SEO / Global Metadata",
            fields: [
                {
                    name: "title",
                    type: "text",
                    label: "Global Site Title",
                    defaultValue: "KHALAI MAKHLOOQ — Elite Star Citizen Organization",
                },
                {
                    name: "description",
                    type: "textarea",
                    label: "Global Site Description",
                    defaultValue:
                        "Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination when the scene gets spicy.",
                },
                { name: "imageUrl", type: "text", label: "Global SEO Image URL", defaultValue: "/opengraph-image.jpg" },
            ],
        },
        // --- Navigation ---
        {
            name: "navLinks",
            type: "array",
            label: "Navigation Links",
            defaultValue: [
                { label: "Home", href: "/" },
                { label: "Team", href: "/team" },
                { label: "Fleet", href: "/fleet" },
                { label: "News", href: "/news" },
            ],
            fields: [
                { name: "label", type: "text", label: "Link Label" },
                { name: "href", type: "text", label: "Link URL" },
            ],
        },
        // --- Footer ---
        {
            name: "footer",
            type: "group",
            label: "Footer",
            fields: [
                { name: "orgName", type: "text", label: "Org Name", defaultValue: "Khalai Makhlooq" },
                { name: "orgShortName", type: "text", label: "Short Name / Ticker", defaultValue: "KMHQ" },
                {
                    name: "description",
                    type: "textarea",
                    label: "Footer Description",
                    defaultValue:
                        "A Star Citizen organization built around sharp coordination, capable crews, and a cinematic fleet presence.",
                },
                { name: "statusBadge1", type: "text", label: "Status Badge 1", defaultValue: "Ready" },
                { name: "statusBadge2", type: "text", label: "Status Badge 2", defaultValue: "Stay tuned" },
                { name: "navSectionLabel", type: "text", label: "Navigate Section Label", defaultValue: "Navigate" },
                { name: "commsSectionLabel", type: "text", label: "Comms Section Label", defaultValue: "Comms" },
                { name: "emailAddress", type: "text", label: "Email Address", defaultValue: "info@khalai.makhlooq" },
                { name: "discordLink", type: "text", label: "Discord Link", defaultValue: "https://discord.gg/kmhq" },
                { name: "discordLinkText", type: "text", label: "Discord Link Text", defaultValue: "discord.gg/kmhq" },
                { name: "signalLog1", type: "text", label: "Signal Log Line 1", defaultValue: "System: calm" },
                { name: "signalLog2", type: "text", label: "Signal Log Line 2", defaultValue: "Hangar: open" },
                { name: "signalLog3", type: "text", label: "Signal Log Line 3", defaultValue: "Vibe: locked in" },
                { name: "copyright", type: "text", label: "Copyright Suffix", defaultValue: "KHALAI MAKHLOOQ // SECTOR 7" },
            ],
        },
        // --- Misc ---
        {
            name: "discordUrl",
            type: "text",
            label: "Global Discord URL",
            defaultValue: "https://discord.gg/kmhq",
        },
    ],
};
