import { Context } from "koishi";
export declare const CURRENT_SCHEMA_VERSION = "1.5.0";
export declare function runDatabaseMigrations(ctx: Context): Promise<void>;
