import { Context } from "koishi";
import { readdirSync } from "fs";
import path from "path";
import sprit from "./sprit";
import type { Config } from "../config";

let wifegachaPath = "";
if (path.join(__dirname).split("\\").pop()=="utils"){
  wifegachaPath = path.join(
    __dirname,
    "../../../..",
    "data/assets/wifegacha"
  );
}else{
  wifegachaPath = path.join(
    __dirname,
    "../../..",
    "data/assets/wifegacha"
  );
}

export function createWifeData(ctx: Context,config:Config) {
  const files = readdirSync(wifegachaPath);
  // 遍历文件列表
  for (const file of files) {
    // 使用 path.parse 拆解文件名
    const parsed = path.parse(file);
    const splitName = config.wifeNameSeparator
    const wifeName = parsed.name.split(splitName)[1]
    const comeFrom = parsed.name.split(splitName)[0]
    ctx.database.create('wifeData', {
      name: wifeName,
      comeFrom: comeFrom,
      filepath: path.join(wifegachaPath, file),
      createdAt: new Date(),
      groupData: []
    })
  }
  ctx.logger.info('wifeData表初始化完成')
  sprit.generateThumbnails(ctx)

}
