import type { Metadata } from "next";

export const metadata: Metadata = {
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
                url: "/logo.png",
                alt: "Khalai Makhlooq Fleet",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
    return children;
}
