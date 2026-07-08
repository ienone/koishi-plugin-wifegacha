# Migration Notes

## Schema versioning

The plugin stores its data-structure version in the `wifeMigration` table:

- `key = "schemaVersion"`
- `value = "1.5.0"` for this release
- `updatedAt` records the last successful migration time

At startup, the plugin declares all models with `ctx.model.extend()`, initializes missing wife assets/data, then runs `runDatabaseMigrations()`. The runner reads `wifeMigration.schemaVersion` and executes every pending migration in order. Future releases should append a new migration step, for example `1.6.0`, `1.7.0`; an install still marked `1.5.0` will run `1.6.0` and then `1.7.0` sequentially.

## 1.5.0 data changes

`wifeUser` adds the following fields:

- `currentWifeAffection: integer`, default `0`.
- `maxAffection: integer`, default `0`.
- `affectionDecayDate: timestamp`, default yesterday for existing rows when migrated.
- `drawBanUntil: timestamp`, default yesterday for existing rows when migrated.
- `kissWifeDate: timestamp`, default yesterday for existing rows when migrated.
- `dateWifeDate: timestamp`, default yesterday for existing rows when migrated.

Existing `wifeHistories` records may also gain these optional properties during migration:

- `interactionLogs`: recent interaction records with `action`, `delta`, `event`, and `time`.
- `lastCurrentAt`: last time this wife was current.
- `leftCurrentAt`: time this wife left the current-wife slot.

`wifeData.updatedAt` is normalized so album cache keys can detect asset changes.

## 1.5.0 migration behavior

The `1.5.0` migration normalizes all existing `wifeUser`, `wifeData`, and `groupData` rows, then writes `wifeMigration.schemaVersion = "1.5.0"`. Commands still keep lightweight normalization as a defensive guard, but regular upgrades should be handled at startup by the versioned migration runner.

## Upgrade notes

1. Back up the Koishi database before upgrading production bots.
2. Run `npm run build` after installing dependencies.
3. Start Koishi and check the log for `[wifegacha][migration] completed 1.5.0` on first upgrade.
4. Verify these commands in one group: `抽老婆`, `查老婆`, `用户档案`, `群档案`, `群老婆档案`, `老婆图鉴`, `日老婆`, `亲老婆`, `约会`, `牛老婆`.
5. If album images look stale after a manual asset edit, run `更新老婆数据`; it refreshes wife data, regenerates changed thumbnails, and clears album cache.