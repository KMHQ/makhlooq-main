import WidgetClient from "./WidgetClient";

export const metadata = {
    title: "FleetYards Widget",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function FleetWidgetPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const ships = String(resolvedParams?.ships || "")
        .split(",")
        .map((ship) => ship.trim())
        .filter(Boolean);

    return <WidgetClient ships={ships} />;
}
