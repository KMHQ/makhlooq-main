"use client";

import { getServerUrl } from "@/lib/serverUrl";
import TeamPageImpl from "@/src/components/team/TeamPage";
import Header from "@/src/components/Header";
import type { PageData } from "@/lib/payload/queries";

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
