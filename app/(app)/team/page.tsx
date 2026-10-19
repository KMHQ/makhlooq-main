import { getPageData, seoMetadata } from "@/app/lib/payload/queries";
import TeamPageClient from "./TeamPageClient";

export async function generateMetadata() {
    const data = await getPageData("team-page");
    return seoMetadata(data?.seo, {
        title: "Team | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
        description: "Meet the KMHQ team.",
    });
}

export default async function Page() {
    return <TeamPageClient data={await getPageData("team-page")} />;
}
