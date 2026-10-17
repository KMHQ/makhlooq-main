/**
 * ▸ TEAM PROFILE PAGE METADATA & LAYOUT
 * SEO: Team member profile pages with dynamic metadata
 */

export const metadata = {
    title: "Team Profile | KHALAI MAKHLOOQ",
    description: "View detailed profile information for Khalai Makhlooq team members.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function TeamProfileLayout({ children }) {
    return <>{children}</>;
}
