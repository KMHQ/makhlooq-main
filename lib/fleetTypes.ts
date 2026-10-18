export const FLEET_TYPES = ["small", "medium", "large", "sub_capital", "capital"] as const;
export type FleetType = (typeof FLEET_TYPES)[number];

// Unknown values fall back to "small" so the DB check constraint never rejects a write.
export function toFleetType(value: unknown): FleetType {
    return FLEET_TYPES.includes(value as FleetType) ? (value as FleetType) : "small";
}
