import { Context } from "koishi";
import { normalizeWifeUser } from "./affection";

const MIGRATION_KEY = "schemaVersion";
export const CURRENT_SCHEMA_VERSION = "1.5.0";

type MigrationStep = {
  version: string;
  description: string;
  up: (ctx: Context) => Promise<void>;
};

function compareVersion(a: string, b: string) {
  const left = a.split(".").map((item) => Number(item) || 0);
  const right = b.split(".").map((item) => Number(item) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index++) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function getStoredSchemaVersion(ctx: Context) {
  const rows = await ctx.database.get("wifeMigration", { key: MIGRATION_KEY });
  return rows[0]?.value ?? "0.0.0";
}

async function setStoredSchemaVersion(ctx: Context, version: string) {
  const rows = await ctx.database.get("wifeMigration", { key: MIGRATION_KEY });
  const payload = { key: MIGRATION_KEY, value: version, updatedAt: new Date() };
  if (rows.length > 0) {
    await ctx.database.set("wifeMigration", { key: MIGRATION_KEY }, payload);
  } else {
    await ctx.database.create("wifeMigration", payload);
  }
}

async function migrateTo150(ctx: Context) {
  const users = await ctx.database.get("wifeUser", {});
  for (const user of users) {
    normalizeWifeUser(user);
    await ctx.database.set("wifeUser", { userId: user.userId, groupId: user.groupId }, {
      wifeName: user.wifeName,
      operationDate: user.operationDate,
      fuckWifeDate: user.fuckWifeDate,
      kissWifeDate: user.kissWifeDate,
      dateWifeDate: user.dateWifeDate,
      lpdaDate: user.lpdaDate,
      divorceDate: user.divorceDate,
      affectionDecayDate: user.affectionDecayDate,
      drawBanUntil: user.drawBanUntil,
      wifeHistories: user.wifeHistories,
      interactionWithOtherUser: user.interactionWithOtherUser,
      ntrOrdinal: user.ntrOrdinal,
      ntrCount: user.ntrCount,
      ntrTotalCount: user.ntrTotalCount,
      ntrSuccessCount: user.ntrSuccessCount,
      drawCount: user.drawCount,
      exchangeCount: user.exchangeCount,
      divorceCount: user.divorceCount,
      totalAffection: user.totalAffection,
      currentWifeAffection: user.currentWifeAffection,
      maxAffection: user.maxAffection,
      targetNtrCount: user.targetNtrCount,
      targetNtrSuccessCount: user.targetNtrSuccessCount,
    });
  }

  const wives = await ctx.database.get("wifeData", {});
  for (const wife of wives) {
    const groupData = (wife.groupData ?? []).map((item) => ({
      groupId: item.groupId,
      drawCount: item.drawCount ?? 0,
      ntrCount: item.ntrCount ?? 0,
      fuckCount: item.fuckCount ?? 0,
      divorceCount: item.divorceCount ?? 0,
      ntrFailCount: item.ntrFailCount ?? 0,
    }));
    await ctx.database.set("wifeData", { name: wife.name }, {
      comeFrom: wife.comeFrom ?? "",
      filepath: wife.filepath ?? "",
      createdAt: wife.createdAt ?? new Date(),
      updatedAt: wife.updatedAt ?? wife.createdAt ?? new Date(),
      groupData,
    });
  }

  const groups = await ctx.database.get("groupData", {});
  for (const group of groups) {
    await ctx.database.set("groupData", { groupId: group.groupId }, {
      drawCount: group.drawCount ?? 0,
      ntrTotalCount: group.ntrTotalCount ?? 0,
      ntrSuccessCount: group.ntrSuccessCount ?? 0,
      exchangeCount: group.exchangeCount ?? 0,
      divorceTotalCount: group.divorceTotalCount ?? 0,
      fuckTotalCount: group.fuckTotalCount ?? 0,
    });
  }
}

const migrations: MigrationStep[] = [
  {
    version: "1.5.0",
    description: "normalize wifeUser affection fields, wifeData updatedAt, group counters, and write schema flag",
    up: migrateTo150,
  },
];

export async function runDatabaseMigrations(ctx: Context) {
  let current = await getStoredSchemaVersion(ctx);
  const pending = migrations.filter((migration) => compareVersion(migration.version, current) > 0);
  if (pending.length === 0) {
    ctx.logger.info(`[wifegacha][migration] schema is up to date: ${current}`);
    return;
  }

  for (const migration of pending) {
    ctx.logger.info(`[wifegacha][migration] start ${current} -> ${migration.version}: ${migration.description}`);
    await migration.up(ctx);
    await setStoredSchemaVersion(ctx, migration.version);
    current = migration.version;
    ctx.logger.info(`[wifegacha][migration] completed ${migration.version}`);
  }
}