// Hand-written stand-in for the generated Supabase schema types, derived from the
// Payload collections (which own team_members / fleet_configs) and supabase/migrations.
// Overwrite with `pnpm generate:db-types` once DATABASE_URL is available.

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TeamMembersRow = {
    id: number;
    discord_uid: string;
    discord_tag: string | null;
    name: string;
    role: string | null;
    flair_color: string | null;
    flair_icon: string | null;
    category: string | null;
    sec_level: string | null;
    avatar_url: string | null;
    node_color: string | null;
    bio: string | null;
    status: string | null;
    awards: Json | null;
    is_approved: boolean | null;
    is_admin: boolean | null;
    joined_at: string | null;
    created_at: string;
    updated_at: string;
};

type FleetConfigsRow = {
    id: number;
    slug: string;
    display_name: string;
    enabled: boolean | null;
    sort_order: number | null;
    fleet_type: string | null;
    ceo_name: string | null;
    ceo_discord_uid: string | null;
    quantity: number | null;
    created_at: string;
    updated_at: string;
};

type FleetMembersRow = {
    id: string;
    fleet_config_id: number;
    name: string;
    role: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type AboutSettingsRow = {
    id: number;
    [column: string]: Json | undefined;
};

type Table<Row> = {
    Row: Row;
    Insert: Partial<Row>;
    Update: Partial<Row>;
    Relationships: [];
};

export type Database = {
    public: {
        Tables: {
            team_members: Table<TeamMembersRow>;
            fleet_configs: Table<FleetConfigsRow>;
            fleet_members: Table<FleetMembersRow>;
            about_settings: Table<AboutSettingsRow>;
        };
        Views: Record<never, never>;
        Functions: Record<never, never>;
        Enums: Record<never, never>;
        CompositeTypes: Record<never, never>;
    };
};
