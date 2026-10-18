import type { Database } from "./supabase";

type PublicTables = Database["public"]["Tables"];

type Row<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type Insert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type Update<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type TeamMember = Row<"team_members">;
export type FleetConfig = Row<"fleet_configs">;
export type FleetMember = Row<"fleet_members">;
