import { getPageData, seoMetadata } from "@/lib/payload/queries";
import HomePageClient from "./HomePageClient";

export async function generateMetadata() {
    const data = await getPageData("home-page");
    return seoMetadata(data?.seo, {
        title: "KHALAI MAKHLOOQ — Elite Star Citizen Organization",
        description: "Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination.",
    });
}

export default async function Page() {
    return <HomePageClient data={await getPageData("home-page")} />;
}
