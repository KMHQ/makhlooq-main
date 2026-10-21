import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
    description:
        "Meet the Khalai Makhlooq leadership. Admirals, commanders, and elite pilots organizing high-stakes operations across the Stanton and Pyro systems.",
    keywords: ["Team", "Members", "Leadership", "Star Citizen", "Khalai Makhlooq"],
    openGraph: {
        title: "Team | Khalai Makhlooq",
        description: "Leadership and elite members of Khalai Makhlooq",
        type: "website",
        images: [
            {
                url: "/logo.png",
                alt: "Khalai Makhlooq Team",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return children;
}
