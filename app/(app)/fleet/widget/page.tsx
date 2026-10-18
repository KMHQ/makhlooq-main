import type { Metadata } from "next";
import WidgetClient from "./WidgetClient";

export const metadata: Metadata = {
    title: "FleetYards Widget",
    robots: { index: false, follow: false },
};

export default async function FleetWidgetPage({ searchParams }: { searchParams: Promise<{ ships?: string }> }) {
    const ships = String((await searchParams).ships || "")
        .split(",")
        .map((ship) => ship.trim())
        .filter(Boolean);

    return <WidgetClient ships={ships} />;
}
