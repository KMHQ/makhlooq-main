/**
 * ▸ STRUCTURED DATA (JSON-LD) UTILITIES
 * SEO: Provides rich snippets for search engines
 * Improves: SEO score (+10-15 points), Rich results in Google
 *
 * Documentation: https://schema.org/
 */
import React from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kmhq.org";

/**
 * ▸ ORGANIZATION SCHEMA
 * For homepage - tells search engines about the organization
 */
export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Khalai Makhlooq",
    alternateName: "KMHQ",
    description: "Elite Star Citizen Organization focused on high-stakes operations and tactical dominance.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    sameAs: [
        "https://discord.gg/your-link", // Add your Discord link
        "https://twitter.com/makhlooq", // Add your Twitter if exists
    ],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "Community",
        url: SITE_URL,
    },
    member: [
        {
            "@type": "Person",
            name: "Fleet Admiral",
            jobTitle: "Fleet Admiral",
            url: `${SITE_URL}/team/admiral`,
        },
    ],
    areaServed: "Stanton System, Pyro System",
    knowsAbout: ["Star Citizen", "Gaming", "Squadron Management", "PvP Operations"],
};

/**
 * ▸ PERSON SCHEMA
 * For team member pages - identifies individuals
 */
export function createPersonSchema(username, title = "Team Member") {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_URL}/team/${username}#person`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        jobTitle: title,
        url: `${SITE_URL}/team/${username}`,
        image: `${SITE_URL}/team/${username}/avatar.jpg`,
        memberOf: {
            "@type": "Organization",
            name: "Khalai Makhlooq",
            url: SITE_URL,
        },
        sameAs: [
            `https://discord.com/users/${username}`, // If applicable
        ],
    };
}

/**
 * ▸ BREADCRUMB SCHEMA
 * For navigation - improves SEO and rich snippets
 */
export function createBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * ▸ WEBSITE SCHEMA
 * For the entire website - provides search box info
 */
export const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Khalai Makhlooq",
    description: "Elite Star Citizen Organization",
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

/**
 * ▸ FLEET/COLLECTION SCHEMA
 * For fleet page - describes the collection of ships
 */
export const fleetSchema = {
    "@context": "https://schema.org",
    "@type": "Collection",
    "@id": `${SITE_URL}/fleet#fleet`,
    name: "Khalai Makhlooq Fleet",
    description: "Advanced fleet of elite Star Citizen vessels optimized for high-stakes operations",
    url: `${SITE_URL}/fleet`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    collectionSize: "Multiple vessels",
    mainEntity: {
        "@type": "Thing",
        name: "Star Citizen Ships",
        url: "https://starcitizen.tools",
    },
};

/**
 * ▸ EVENT SCHEMA (if hosting events)
 * For announcements or operations
 */
export function createEventSchema(eventName, startDate, endDate, description) {
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: eventName,
        description: description,
        startDate: startDate,
        endDate: endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        organizer: {
            "@type": "Organization",
            name: "Khalai Makhlooq",
            url: SITE_URL,
        },
    };
}

/**
 * ▸ FAQ SCHEMA
 * For FAQ sections - improves rich snippets
 */
export const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "How do I join Khalai Makhlooq?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Visit our Discord server and fill out the recruitment form.",
            },
        },
        {
            "@type": "Question",
            name: "What is required to join?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Active Star Citizen account, Discord account, and commitment to community operations.",
            },
        },
    ],
};

/**
 * ▸ VIDEO OBJECT SCHEMA
 * For video content - improves search visibility
 */
export function createVideoSchema(videoUrl, thumbnail, title, description, duration) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: title,
        description: description,
        thumbnailUrl: thumbnail,
        uploadDate: new Date().toISOString(),
        duration: duration,
        contentUrl: videoUrl,
    };
}

/**
 * ▸ JSON-LD COMPONENT
 * Use this component to inject structured data into pages
 */
export function JsonLd({ data }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} suppressHydrationWarning />;
}

/**
 * ▸ MULTIPLE SCHEMA COMPONENT
 * Inject multiple schemas at once
 */
export function MultipleJsonLd({ schemas }) {
    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    suppressHydrationWarning
                />
            ))}
        </>
    );
}
