"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { getServerUrl } from "@/lib/serverUrl";

export default function PayloadRefresh() {
    const router = useRouter();
    return <RefreshRouteOnSave refresh={router.refresh} serverURL={getServerUrl()} />;
}
