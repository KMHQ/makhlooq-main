"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

export default function PayloadRefresh() {
    const router = useRouter();

    return (
        <RefreshRouteOnSave
            refresh={router.refresh}
            serverURL={(typeof window !== "undefined" && window.__SERVER_URL__) || process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org"}
        />
    );
}
