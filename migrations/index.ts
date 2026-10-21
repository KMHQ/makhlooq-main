import * as migration_20261021_203150_baseline from "./20261021_203150_baseline";
import * as migration_20261021_203200_reconcile_live_schema from "./20261021_203200_reconcile_live_schema";
import * as migration_20261021_203735_fleet_members_avatars from "./20261021_203735_fleet_members_avatars";

export const migrations = [
    {
        up: migration_20261021_203150_baseline.up,
        down: migration_20261021_203150_baseline.down,
        name: "20261021_203150_baseline",
    },
    {
        up: migration_20261021_203200_reconcile_live_schema.up,
        down: migration_20261021_203200_reconcile_live_schema.down,
        name: "20261021_203200_reconcile_live_schema",
    },
    {
        up: migration_20261021_203735_fleet_members_avatars.up,
        down: migration_20261021_203735_fleet_members_avatars.down,
        name: "20261021_203735_fleet_members_avatars",
    },
];
