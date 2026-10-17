/**
 * ▸ TEAM MEMBER PROFILE PAGE METADATA & LAYOUT
 * SEO: Dynamic metadata for individual team member pages
 * Improves: SEO for individual profiles, Person schema integration
 */

export async function generateMetadata({ params }) {
    const { username } = await params;

    // In a real app, fetch member data from Supabase
    // const member = await fetchTeamMember(username);

    // Placeholder data - update when connected to database
    const memberTitle = username.charAt(0).toUpperCase() + username.slice(1);
    const memberDescription = `${memberTitle} - Khalai Makhlooq team member. Elite Star Citizen pilot.`;

    return {
        title: `${memberTitle} | KHALAI MAKHLOOQ Team`,
        description: memberDescription,
        keywords: [username, "Team", "Star Citizen", "Khalai Makhlooq"],
        openGraph: {
            title: `${memberTitle} | Khalai Makhlooq`,
            description: memberDescription,
            type: "profile",
            images: [
                {
                    url: "/opengraph-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: `${memberTitle} profile`,
                },
            ],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default function TeamMemberLayout({ children }) {
    return <>{children}</>;
}
