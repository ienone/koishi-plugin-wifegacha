import { Context } from "koishi";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { module } from "./module";
import { createWifeData } from "./utils/createWifeData";
import command from "./command";
import sprit from "./utils/sprit";
import type { Config } from "./config";
import { ConfigSchema } from "./config";

export const name = "wifegacha";
export const inject = ["database"];
export { ConfigSchema as Config };

const wifegachaPath = path.join(__dirname, "../../..", "data/assets/wifegacha");

export async function apply(ctx: Context, config: Config) {
  await module(ctx, config);
  ctx.logger.info("数据库初始化完成");
  sprit.ensureDirs();
  ctx.logger.info("sprit初始化完成");
  // 初始化老婆图片文件夹
  if (!existsSync(wifegachaPath)) {
    ctx.logger.info("wifegacha文件夹不存在,开始初始化");
    mkdirSync(wifegachaPath);
  }
  // 初始化老婆数据
  if ((await ctx.database.get("wifeData", {})).length === 0) {
    ctx.logger.info("wifeData表中没有数据,开始初始化");
    createWifeData(ctx, config);
  }
  command.clp(ctx, config);
  command.nlp(ctx, config);
  command.chalp(ctx, config);
  command.lptj(ctx, config);
  command.lh(ctx, config);
  command.jhlp(ctx, config);
  command.rlp(ctx, config);
  command.tjlp(ctx, config);
  command.sclp(ctx, config);
  command.gxlp(ctx, config);
  command.lpda(ctx, config);
  command.yhda(ctx, config);
  command.gxlpsj(ctx, config);
  command.cmmlp(ctx, config);
}