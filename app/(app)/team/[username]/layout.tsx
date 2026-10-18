import type { Metadata } from "next";
import { getMember } from "@/lib/teamMembers";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;
    const member = await getMember(decodeURIComponent(username)).catch(() => null);
    const name = member?.name || "Team Member";
    const description = `${name} - Khalai Makhlooq team member.`;

    return {
        title: `${name} | KHALAI MAKHLOOQ Team`,
        description,
        openGraph: {
            title: `${name} | Khalai Makhlooq`,
            description,
            type: "profile",
            images: [{ url: member?.avatar_url || "/opengraph-image.jpg", alt: `${name} profile` }],
        },
        robots: { index: Boolean(member?.is_approved), follow: true },
    };
}

export default function TeamMemberLayout({ children }: { children: React.ReactNode }) {
    return children;
}
