"use client";

import TeamPageImpl from "../../../src/components/team/page";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";

import { useLivePreview } from "@payloadcms/live-preview-react";

export default function TeamPageClient({ data: initialData }) {
    const { data } = useLivePreview({
        initialData,
        serverURL: (typeof window !== "undefined" && window.__SERVER_URL__) || process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org",
        depth: 2,
    });

    return (
        <>
            <Header siteSettings={data?.siteSettings} />
            <div className="pt-20">
                <TeamPageImpl pageData={data} />
            </div>
            <Footer siteSettings={data?.siteSettings} />
        </>
    );
}
