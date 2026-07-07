import { GlobalConfig } from "payload";
import { revalidatePathHook } from "../hooks/revalidate";

export const NewsPage: GlobalConfig = {
  slug: "news-page",
  label: "News Page",
  admin: { group: "Pages" },
  hooks: {
    afterChange: [revalidatePathHook("/news")],
  },
  fields: [
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "SEO Title", defaultValue: "News & Intel | Khalai Makhlooq" },
        { name: "description", type: "textarea", label: "SEO Description", defaultValue: "Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command." },
        { name: "imageUrl", type: "text", label: "SEO Image URL" },
      ],
    },
    {
      name: "hero",
      type: "group",
      label: "Hero Section",
      fields: [
        { name: "kicker", type: "text", label: "Kicker", defaultValue: "KMHQ SIGNAL NETWORK // GLOBAL FEED" },
        { name: "heading", type: "text", label: "Heading", defaultValue: "News & Intel" },
        { name: "tagline", type: "textarea", label: "Tagline", defaultValue: "Official tactical dispatches, organizational announcements, fleet developments, and operational reports straight from the bridge." },
        { name: "backgroundImage", type: "text", label: "Background Image", defaultValue: "/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg" },
      ]
    }
  ],
};

export const FleetPage: GlobalConfig = {
  slug: "fleet-page",
  label: "Fleet Page",
  admin: { group: "Pages" },
  hooks: {
    afterChange: [revalidatePathHook("/fleet")],
  },
  fields: [
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "SEO Title", defaultValue: "Fleet | Khalai Makhlooq" },
        { name: "description", type: "textarea", label: "SEO Description", defaultValue: "Explore the KMHQ fleet." },
        { name: "imageUrl", type: "text", label: "SEO Image URL" },
      ],
    },
    { name: "kicker", type: "text", label: "Kicker", defaultValue: "KMHQ · Capital Assets" },
    { name: "headingLine1", type: "text", label: "Heading Line 1", defaultValue: "Fleet" },
    { name: "headingLine2", type: "text", label: "Heading Line 2", defaultValue: "Command" },
    { name: "badgeText", type: "text", label: "Badge Text", defaultValue: "Live" },
    { name: "shipsReadyLabel", type: "text", label: "Ships Ready Label", defaultValue: "Ships Ready" },
    { name: "totalValueLabel", type: "text", label: "Total Value Label", defaultValue: "Total Flex" },
    { name: "crewSeatsLabel", type: "text", label: "Crew Seats Label", defaultValue: "Crew Seats" },
    { name: "standardKicker", type: "text", label: "Standard Fleets Kicker", defaultValue: "Admin Managed" },
    { name: "standardHeading", type: "text", label: "Standard Fleets Heading", defaultValue: "Standard Fleets" },
    { name: "searchPlaceholder", type: "text", label: "Search Placeholder", defaultValue: "Search fleets..." },
  ],
};

export const TeamPage: GlobalConfig = {
  slug: "team-page",
  label: "Team Page",
  admin: { group: "Pages" },
  hooks: {
    afterChange: [revalidatePathHook("/team")],
  },
  fields: [
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "SEO Title", defaultValue: "Team | Khalai Makhlooq" },
        { name: "description", type: "textarea", label: "SEO Description", defaultValue: "Meet the KMHQ team." },
        { name: "imageUrl", type: "text", label: "SEO Image URL" },
      ],
    },
    { name: "kicker", type: "text", label: "Page Kicker", defaultValue: "Crew Network" },
    { name: "headingLine1", type: "text", label: "Heading Line 1", defaultValue: "Team" },
    { name: "headingLine2", type: "text", label: "Heading Line 2", defaultValue: "Scene" },
    { name: "description", type: "textarea", label: "Page Description", defaultValue: "The roster wall, but not the boring kind. Pilots, officers, and crew — all here in clean cards with full style." },
    {
      name: "accessCard",
      type: "group",
      label: "Crew Access Card",
      fields: [
        { name: "kicker", type: "text", label: "Kicker", defaultValue: "Crew Access" },
        { name: "heading", type: "text", label: "Heading", defaultValue: "Scene Live" },
        { name: "badge", type: "text", label: "Badge", defaultValue: "Live" },
        { name: "description", type: "textarea", label: "Description", defaultValue: "Entry is through Discord, then you set up your profile. Admins get extra tools; otherwise, chill mode." },
      ]
    },
    {
      name: "briefing",
      type: "group",
      label: "Command Briefing",
      fields: [
        { name: "kicker", type: "text", label: "Kicker", defaultValue: "Crew Matrix" },
        { name: "headingLine1", type: "text", label: "Heading Line 1", defaultValue: "Crew" },
        { name: "headingLine2", type: "text", label: "Heading Line 2", defaultValue: "Scene" },
        { name: "description", type: "textarea", label: "Description", defaultValue: "Simple vibe on the team page: find someone, check their role, feel the crew energy." }
      ]
    },
    {
      name: "joinCTA",
      type: "group",
      label: "Join Community CTA",
      fields: [
        { name: "badge", type: "text", label: "Badge", defaultValue: "Recruitment Open" },
        { name: "heading", type: "text", label: "Heading", defaultValue: "Join Khalai Makhlooq's space crew" },
        { name: "description", type: "textarea", label: "Description", defaultValue: "Join the crew, see the ships, and grow your rank through organized action." },
        { name: "discordLink", type: "text", label: "Discord Link", defaultValue: "https://discord.gg/K7SfxPSwXk" },
        { name: "discordLinkText", type: "text", label: "Discord Button Text", defaultValue: "Join on Discord" },
        { name: "learnMoreText", type: "text", label: "Learn More Button Text", defaultValue: "Learn More" }
      ]
    }
  ],
};
