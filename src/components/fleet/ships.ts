import type { FleetYardsModel, FleetYardsVehicle } from "@/types/fleetyards";

export type MeshType = "capital" | "fighter" | "explorer" | "industrial" | "luxury" | "medium";

function getShipType(model: FleetYardsModel): MeshType {
    const c = (model.classification || model.classificationLabel || "").toLowerCase();
    if (c.includes("capital") || c.includes("battleship") || c.includes("carrier") || c.includes("corvette")) return "capital";
    if (c.includes("fighter") || c.includes("interceptor") || c.includes("gunship")) return "fighter";
    if (c.includes("explorer") || c.includes("scout")) return "explorer";
    if (c.includes("freighter") || c.includes("industrial") || c.includes("hauler") || c.includes("transport")) return "industrial";
    if (c.includes("luxury") || c.includes("yacht")) return "luxury";
    return "medium";
}

function getAccentColor(classification: string) {
    const n = classification.toLowerCase();
    if (n.includes("fighter") || n.includes("interceptor")) return "#a3e635";
    if (n.includes("explore") || n.includes("scout")) return "#22c55e";
    if (n.includes("industrial") || n.includes("freighter") || n.includes("transport")) return "#65a30d";
    if (n.includes("luxury") || n.includes("yacht")) return "#84cc16";
    if (n.includes("capital") || n.includes("command") || n.includes("corvette")) return "#d9f99d";
    return "#4ade80";
}

// FleetYards sometimes returns holo URLs with a trailing slash after the extension.
const normalizeAssetUrl = (value?: string) => (value ? value.replace(/(\.(?:gltf|glb))\/?$/i, "$1").trim() : "");

export function mapVehicleToShip(vehicle: FleetYardsVehicle) {
    const model = vehicle.model || vehicle;
    const media = model.media || {};
    const metrics = model.metrics || {};
    const name = vehicle.name || model.name || "Unknown Vessel";
    const classification = model.classificationLabel || model.classification || "Unknown";

    return {
        id: vehicle.id || vehicle.slug || `${name}-${vehicle.serial || "unknown"}`,
        slug: model.slug || vehicle.modelSlug || vehicle.model_slug || vehicle.slug || "",
        name,
        manufacturer: model.manufacturer?.name || "Unknown Manufacturer",
        class: classification,
        role: model.focus || classification,
        crew: model.crew?.maxLabel || (model.crew?.max ? String(model.crew.max) : "N/A"),
        length: metrics.lengthLabel || (metrics.length ? `${metrics.length}m` : "N/A"),
        cargo: metrics.cargoLabel || (metrics.cargo ? `${metrics.cargo} SCU` : "N/A"),
        topSpeed: model.speeds?.maxSpeed ? `${model.speeds.maxSpeed} m/s` : "N/A",
        price: model.price,
        pledgePrice: model.pledgePrice,
        priceLabel: model.priceLabel,
        pledgePriceLabel: model.pledgePriceLabel,
        description: model.description || "No description available.",
        holoUrl: normalizeAssetUrl(media.holo?.url),
        thumbnail:
            media.storeImage?.mediumUrl ||
            media.storeImage?.url ||
            media.angledViewColored?.mediumUrl ||
            media.angledView?.mediumUrl ||
            media.frontViewColored?.mediumUrl ||
            media.frontView?.mediumUrl ||
            media.fleetchartImage ||
            "",
        meshType: getShipType(model),
        accentColor: getAccentColor(classification),
    };
}

// A FleetYards ship plus the admin-managed fleet config it came from.
export type FleetShip = ReturnType<typeof mapVehicleToShip> & {
    sourceFleet: string;
    fleetSlug: string;
    fleetType: string;
    ceoName: string;
    ceoDiscordUid: string;
    ceoAvatarUrl: string;
    fleetQuantity: number;
};

export function getShipPrice(ship: Pick<FleetShip, "pledgePrice" | "price" | "pledgePriceLabel" | "priceLabel">) {
    const raw = ship.pledgePrice ?? ship.price ?? ship.pledgePriceLabel ?? ship.priceLabel ?? 0;
    const number = Number(String(raw).replace(/[^0-9.]/g, ""));
    return Number.isFinite(number) ? number : 0;
}

export function formatCurrency(value: number) {
    if (!Number.isFinite(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number) {
    return Number.isFinite(value) ? new Intl.NumberFormat("en-US").format(value) : "0";
}

// What /api/fleet-configs returns: DB rows plus env-only entries (string ids)
export interface FleetConfigEntry {
    id: number | string;
    slug: string;
    display_name?: string | null;
    enabled?: boolean | null;
    sort_order?: number | null;
    fleet_type?: string | null;
    ceo_name?: string | null;
    ceo_discord_uid?: string | null;
    ceo_avatar_url?: string | null;
    quantity?: number | null;
    source?: string;
}
