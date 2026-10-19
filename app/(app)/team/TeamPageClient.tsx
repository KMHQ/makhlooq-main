"use client";

import { getServerUrl } from "@/app/lib/serverUrl";
import TeamPageImpl from "@/app/components/team/TeamPage";
import Header from "@/app/components/Header";
import type { PageData } from "@/app/lib/payload/queries";

import { useLivePreview } from "@payloadcms/live-preview-react";

export default function TeamPageClient({ data: initialData }: { data: PageData<"team-page"> | null }) {
    const { data } = useLivePreview<PageData<"team-page">>({
        initialData: initialData ?? ({} as PageData<"team-page">),
        serverURL: getServerUrl(),
        depth: 2,
    });

    return (
        <>
            <Header siteSettings={data?.siteSettings} />
            <div className="pt-20">
                <TeamPageImpl pageData={data} />
            </div>
        </>
    );
}
