// The parts of the FleetYards API responses this app reads (https://api.fleetyards.net/v1).

interface FleetYardsImage {
    url?: string;
    mediumUrl?: string;
}

export interface FleetYardsModel {
    slug?: string;
    name?: string;
    description?: string;
    focus?: string;
    classification?: string;
    classificationLabel?: string;
    productionStatus?: string;
    hasPaints?: boolean;
    hasModules?: boolean;
    price?: number | string;
    pledgePrice?: number | string;
    priceLabel?: string;
    pledgePriceLabel?: string;
    manufacturer?: { name?: string };
    crew?: { max?: number; maxLabel?: string };
    speeds?: { maxSpeed?: number };
    metrics?: {
        length?: number;
        lengthLabel?: string;
        mass?: number;
        massLabel?: string;
        cargo?: number;
        cargoLabel?: string;
    };
    media?: {
        holo?: { url?: string };
        storeImage?: FleetYardsImage;
        angledViewColored?: FleetYardsImage;
        angledView?: FleetYardsImage;
        frontViewColored?: FleetYardsImage;
        frontView?: FleetYardsImage;
        fleetchartImage?: string;
    };
    error?: string;
}

export interface FleetYardsVehicle extends FleetYardsModel {
    id?: string;
    serial?: string;
    modelSlug?: string;
    model_slug?: string;
    activeLoadout?: unknown;
    model?: FleetYardsModel;
}
