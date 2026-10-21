import { getGlobal, getNewsPosts, seoMetadata } from "@/app/lib/payload/queries";
import NewsPageClient from "./NewsPageClient";

export async function generateMetadata() {
    const newsPage = await getGlobal("news-page");
    return seoMetadata(newsPage?.seo, {
        title: "News & Intel | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
        description:
            "Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command.",
        image: "/logo.png",
    });
}

export default async function Page() {
    const [newsPosts, siteSettings, newsPage] = await Promise.all([getNewsPosts(), getGlobal("site-settings"), getGlobal("news-page")]);

    return <NewsPageClient newsPosts={newsPosts} siteSettings={siteSettings} newsPage={newsPage} />;
}
