import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team Profile | KHALAI MAKHLOOQ",
    description: "View detailed profile information for Khalai Makhlooq team members.",
    robots: { index: false, follow: false },
};

export default function TeamProfileLayout({ children }: { children: React.ReactNode }) {
    return children;
}
