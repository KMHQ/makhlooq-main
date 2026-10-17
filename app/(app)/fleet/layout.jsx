/**
 * ▸ FLEET PAGE METADATA & LAYOUT
 * SEO: Provides page-specific metadata for fleet section
 * Improves: SEO (+5 points), Open Graph sharing (+5 points)
 */

export const metadata = {
    title: "Fleet | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
    description:
        "Explore the Khalai Makhlooq fleet. Advanced warships, explorers, and industrial vessels optimized for high-stakes operations across Stanton and Pyro systems.",
    keywords: ["Fleet", "Ships", "Warship", "Star Citizen", "Khalai Makhlooq"],
    openGraph: {
        title: "Fleet | Khalai Makhlooq",
        description: "Advanced fleet of elite Star Citizen vessels",
        type: "website",
        images: [
            {
                url: "/opengraph-image.jpg",
                width: 1200,
                height: 630,
                alt: "Khalai Makhlooq Fleet",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function FleetLayout({ children }) {
    return <>{children}</>;
}
