import { GlobalConfig } from "payload";
import { revalidatePathHook } from "../hooks/revalidate";

export const HomePage: GlobalConfig = {
    slug: "home-page",
    label: "Home Page",
    admin: {
        group: "Pages",
    },
    hooks: {
        afterChange: [revalidatePathHook("/")],
    },
    fields: [
        // --- SEO ---
        {
            name: "seo",
            type: "group",
            label: "SEO",
            fields: [
                { name: "title", type: "text", label: "SEO Title" },
                { name: "description", type: "textarea", label: "SEO Description" },
                { name: "imageUrl", type: "text", label: "SEO Image URL" },
            ],
        },

        // --- Hero Section ---
        {
            name: "hero",
            type: "group",
            label: "Hero Section",
            fields: [
                {
                    name: "heading1",
                    type: "text",
                    label: "Heading Line 1",
                    defaultValue: "Join Khalai Makhlooq",
                },
                {
                    name: "heading2",
                    type: "text",
                    label: "Heading Line 2",
                    defaultValue: "Rule the Stars",
                },
                {
                    name: "description",
                    type: "text",
                    label: "Description Badge Text",
                    defaultValue: "Elite Star Citizen Org, laid-back scene",
                },
                {
                    name: "ctaText",
                    type: "text",
                    label: "CTA Button Text",
                    defaultValue: "Click Here to Join Discord",
                },
                {
                    name: "ctaLink",
                    type: "text",
                    label: "CTA Button Link",
                    defaultValue: "https://discord.gg/kmhq",
                },
                {
                    name: "subheading1Normal",
                    type: "text",
                    label: "Subheading 1 (Default)",
                    defaultValue: "And, Welcome PvP",
                },
                {
                    name: "subheading1Hover",
                    type: "text",
                    label: "Subheading 1 (On Hover)",
                    defaultValue: "We Enjoy PvE",
                },
                {
                    name: "subheading2Normal",
                    type: "text",
                    label: "Subheading 2 (Default)",
                    defaultValue: "Also, Murder Hobos",
                },
                {
                    name: "subheading2Hover",
                    type: "text",
                    label: "Subheading 2 (On Hover)",
                    defaultValue: "Space Capitalists",
                },
                {
                    name: "subheading3Normal",
                    type: "text",
                    label: "Subheading 3 (Default)",
                    defaultValue: "Hide or Die",
                },
                {
                    name: "subheading3Hover",
                    type: "text",
                    label: "Subheading 3 (On Hover)",
                    defaultValue: "Deep Space Chilling",
                },
                {
                    name: "backgroundVideo",
                    type: "upload",
                    relationTo: "media",
                    label: "Background Video (Optional fallback: /Fight space and ground  Star Citizen epic cinematic,   Lighthouse.mp4)",
                },
                {
                    name: "posterImage",
                    type: "upload",
                    relationTo: "media",
                    label: "Poster Image (Optional fallback: /backgrounds/jp.jpg)",
                },
                {
                    name: "logoImage",
                    type: "upload",
                    relationTo: "media",
                    label: "Logo Image (Optional fallback: /nobglogo.png)",
                },
            ],
        },

        // --- About Section ---
        {
            name: "about",
            type: "group",
            label: "About Section",
            fields: [
                {
                    name: "sectionLabel",
                    type: "text",
                    label: "Section Label",
                    defaultValue: "Fleet Operations Scene",
                },
                {
                    name: "intro",
                    type: "textarea",
                    label: "Intro Paragraph",
                    defaultValue:
                        "Khalai Makhlooq is no boring history lecture. It is crew, ships, signal, and pressure combined. Even space took notice.",
                },
                {
                    name: "statusBadge",
                    type: "text",
                    label: "Status Badge Text",
                    defaultValue: "KMHQ / Scene Active",
                },
                {
                    name: "manifestoLines",
                    type: "array",
                    label: "Manifesto Lines (large text)",
                    defaultValue: [{ text: "Move" }, { text: "Like A" }, { text: "Full Squad" }],
                    fields: [{ name: "text", type: "text" }],
                },
                {
                    name: "visualLabel",
                    type: "text",
                    label: "Fleet Image Label",
                    defaultValue: "Hangar posture",
                },
                {
                    name: "visualHeading",
                    type: "text",
                    label: "Fleet Image Heading",
                    defaultValue: "Calm mind. Dangerous aim.",
                },
                {
                    name: "fleetImage",
                    type: "upload",
                    relationTo: "media",
                    label: "Fleet Background Image (Optional fallback)",
                },
                {
                    name: "principles",
                    type: "array",
                    label: "Principle Cards",
                    defaultValue: [
                        {
                            kicker: "01 / Scene",
                            title: "One signal. Full squad.",
                            copy: "Comms clean, moves sharp, and no aimless orbiting. When KMHQ moves, everyone knows.",
                        },
                        {
                            kicker: "02 / Entry",
                            title: "We arrive first, then we assess.",
                            copy: "Positioning strong, scouting smart, and pressure so smooth the other side starts seeing loading screens.",
                        },
                        {
                            kicker: "03 / Backup",
                            title: "Not a fleet patch � a system.",
                            copy: "Logistics, recovery, escort, intel: all part of one machine. No one flies alone; the convoy carries the vibe.",
                        },
                    ],
                    fields: [
                        { name: "kicker", type: "text", label: "Kicker (e.g. 01 / Scene)" },
                        { name: "title", type: "text", label: "Card Title" },
                        { name: "copy", type: "textarea", label: "Card Body" },
                    ],
                },
                {
                    name: "signals",
                    type: "array",
                    label: "Scrolling Signal Tags",
                    defaultValue: [
                        { signal: "STRIKE" },
                        { signal: "ESCORT" },
                        { signal: "HAUL" },
                        { signal: "SCAN" },
                        { signal: "RECOVER" },
                        { signal: "HOLD" },
                        { signal: "EXPAND" },
                    ],
                    fields: [{ name: "signal", type: "text" }],
                },
            ],
        },

        // --- Showcase / Operations Section ---
        {
            name: "showcase",
            type: "group",
            label: "Showcase Section",
            fields: [
                {
                    name: "sectionLabel",
                    type: "text",
                    label: "Section Label",
                    defaultValue: "Operations Breakdown",
                },
                {
                    name: "headlineWords",
                    type: "array",
                    label: "Large Headline Words",
                    defaultValue: [{ word: "We" }, { word: "Never" }, { word: "Idle" }],
                    fields: [{ name: "word", type: "text" }],
                },
                {
                    name: "overviewText",
                    type: "textarea",
                    label: "Overview Text",
                    defaultValue:
                        "Khalai Makhlooq covers every angle of the Stanton system. Whether it is moving high-value cargo through contested space, recovering downed ships in hostile territory, or locking down an orbital station with overwhelming firepower—KMHQ is equipped, trained, and ready to deploy.",
                },
                {
                    name: "metrics",
                    type: "array",
                    label: "Metrics Panel",
                    defaultValue: [
                        { value: "2950", label: "Scene since" },
                        { value: "6", label: "Big ships" },
                        { value: "80+", label: "Active pilots" },
                        { value: "24/7", label: "Hangar ready" },
                    ],
                    fields: [
                        { name: "value", type: "text", label: "Metric Value" },
                        { name: "label", type: "text", label: "Metric Label" },
                    ],
                },
                {
                    name: "metricsPanelBody",
                    type: "textarea",
                    label: "Metrics Panel Body Text",
                    defaultValue:
                        "Every division has a simple rule: move fast, see first, and leave the battlefield so clean people ask who the cleanup crew was.",
                },
                {
                    name: "pillarsHeading",
                    type: "text",
                    label: "Pillars Section Heading",
                    defaultValue: "Style under pressure.",
                },
                {
                    name: "pillarsSubtext",
                    type: "textarea",
                    label: "Pillars Section Subtext",
                    defaultValue:
                        "Fleet layout is simple: clear roles, wide space, and zero random button mashing. Just coordinated action.",
                },
                {
                    name: "pillars",
                    type: "array",
                    label: "Operation Pillars",
                    defaultValue: [
                        {
                            code: "01",
                            name: "Strike Mode",
                            detail: "Target spotted, squad deployed, scene done. Clean pressure with no extra drama.",
                        },
                        {
                            code: "02",
                            name: "Cargo Chill",
                            detail: "Boxes move and so do the vibes. Supply line strong, fleet well-stocked.",
                        },
                        {
                            code: "03",
                            name: "Recovery Ops",
                            detail: "Ship down? No stress. Salvage, extract, rebuild, then back on the runway.",
                        },
                        {
                            code: "04",
                            name: "Deep Orbit",
                            detail: "Map ends where KMHQ begins. Scout, mark, and plan the next move.",
                        },
                    ],
                    fields: [
                        { name: "code", type: "text", label: "Code (e.g. 01)" },
                        { name: "name", type: "text", label: "Pillar Name" },
                        { name: "detail", type: "textarea", label: "Pillar Detail" },
                    ],
                },
            ],
        },

        // --- Values / Parallax Section ---
        {
            name: "values",
            type: "group",
            label: "Fleet Narrative Section (Scrolling)",
            fields: [
                {
                    name: "narratives",
                    type: "array",
                    label: "Scroll Narratives",
                    defaultValue: [
                        {
                            id: "intro",
                            subtitle: "? STANTON SYSTEM � GRID REF 4.7 � KM-FLEET ACTIVE ?",
                            title1: "KMHQ",
                            title2: "Space Garage",
                            desc: "Big ships, loud engines, and a crew built for confident operations. In Stanton, KMHQ does not just arrive; it establishes presence.",
                        },
                        {
                            id: "hammerhead",
                            subtitle: "? FLEET DEFENSE � SQUADRON A ?",
                            title1: "The Shield",
                            title2: "",
                            desc: "The Hammerhead anchors convoy defense with layered firepower, screening hostile movement before it reaches the formation.",
                        },
                        {
                            id: "carrack",
                            subtitle: "? DEEP SPACE � EXPLORATION DIVISION ?",
                            title1: "The Unknown",
                            title2: "",
                            desc: "The Carrack pushes beyond mapped routes, turning unknown space into marked corridors and actionable intelligence.",
                        },
                        {
                            id: "merchantman",
                            subtitle: "? ECONOMIC DOMINANCE � LOGISTICS CORPS ?",
                            title1: "The Artery",
                            title2: "",
                            desc: "The Merchantman keeps the fleet economy moving, carrying cargo, resources, and influence through contested space.",
                        },
                        {
                            id: "inferno",
                            subtitle: "? STRIKE WING � HUNTER KILLERS ?",
                            title1: "The Fangs",
                            title2: "",
                            desc: "The Ares brings focused anti-capital pressure: one pilot, one heavy weapon, and no wasted intent.",
                        },
                        {
                            id: "unity",
                            subtitle: "? KHALAI MAKHLOOQ � UNIFIED COMMAND ?",
                            title1: "Together",
                            title2: "We Fly",
                            desc: "One crew, one fleet, one command signal. From MicroTech to Hurston, KMHQ moves with quiet authority.",
                        },
                    ],
                    fields: [
                        { name: "id", type: "text", label: "ID / Key" },
                        { name: "subtitle", type: "text", label: "Subtitle" },
                        { name: "title1", type: "text", label: "Title Line 1" },
                        { name: "title2", type: "text", label: "Title Line 2 (optional)" },
                        { name: "desc", type: "textarea", label: "Description" },
                    ],
                },
            ],
        },
        // --- FAQ Section ---
        {
            name: "faq",
            type: "group",
            label: "FAQ Section",
            fields: [
                {
                    name: "sectionLabel",
                    type: "text",
                    label: "Section Label",
                    defaultValue: "Quick Q&A",
                },
                {
                    name: "headlineLines",
                    type: "array",
                    label: "Headline Lines (large text)",
                    defaultValue: [{ text: "Straight" }, { text: "Answers" }],
                    fields: [{ name: "text", type: "text" }],
                },
                {
                    name: "description",
                    type: "textarea",
                    label: "Description Text",
                    defaultValue:
                        "Toss your confusion out the airlock. Ask the question, get the answer, then head back to the hangar for more fun.",
                },
                {
                    name: "searchPlaceholder",
                    type: "text",
                    label: "Search Placeholder",
                    defaultValue: "Search a question...",
                },
                {
                    name: "noResultsText",
                    type: "text",
                    label: "No Results Text",
                    defaultValue: "No matching answers found — try checking the spelling",
                },
                {
                    name: "questions",
                    type: "array",
                    label: "FAQ List",
                    defaultValue: [
                        {
                            q: "How do I join KMHQ?",
                            a: "Come to Discord, get your handle verified, then you get listed on the roster. Simple process. We will see your playstyle and slot you into the wing that fits best.",
                        },
                        {
                            q: "I am a new pilot — will I get help?",
                            a: "Absolutely. Escorts, crewed ships, fleet support — all available. We have no interest in leaving anyone stranded in the menu.",
                        },
                        {
                            q: "What actually happens in KMHQ?",
                            a: "Combat patrol, convoy security, recon, cargo, salvage, deep-space staging. Sometimes a serious op, sometimes full hangar fun. But coordination is always tight.",
                        },
                        {
                            q: "Is it casual or serious?",
                            a: "The perfect mix of both. We keep a chill vibe, but once an op starts, comms tighten and the fleet becomes one unit.",
                        },
                        {
                            q: "What makes KMHQ special?",
                            a: "Less noise, more coordination. When everyone understands the same plan, even a small fleet looks cinematic.",
                        },
                    ],
                    fields: [
                        { name: "q", type: "text", label: "Question" },
                        { name: "a", type: "textarea", label: "Answer" },
                    ],
                },
            ],
        },
    ],
};
