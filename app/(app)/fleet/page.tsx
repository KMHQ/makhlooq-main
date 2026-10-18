import { getPageData, seoMetadata } from "@/lib/payload/queries";
import FleetPageClient from "./FleetPageClient";

export async function generateMetadata() {
    const data = await getPageData("fleet-page");
    return seoMetadata(data?.seo, {
        title: "Fleet | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
        description: "Explore the KMHQ fleet.",
    });
}

export default async function Page() {
    return <FleetPageClient data={await getPageData("fleet-page")} />;
}
