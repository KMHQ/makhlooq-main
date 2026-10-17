"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ConditionalStudioWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isStudio = pathname?.startsWith("/studio");

    if (isStudio) return null;

    return <>{children}</>;
}
