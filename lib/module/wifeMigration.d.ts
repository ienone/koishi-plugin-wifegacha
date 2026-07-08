import { Context } from "koishi";
import type { Config } from "../config";
export interface WifeMigration {
    id: number;
    key: string;
    value: string;
    updatedAt: Date;
}
declare module "koishi" {
    interface Tables {
        wifeMigration: WifeMigration;
    }
}
export declare function wifeMigration(ctx: Context, config: Config): void;
