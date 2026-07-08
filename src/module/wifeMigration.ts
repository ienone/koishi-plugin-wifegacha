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

export function wifeMigration(ctx: Context, config: Config) {
  ctx.model.extend("wifeMigration", {
    id: "unsigned",
    key: "string",
    value: "string",
    updatedAt: "timestamp",
  }, {
    autoInc: true,
  });
  ctx.logger.info("wifeMigration 表初始化完成");
}