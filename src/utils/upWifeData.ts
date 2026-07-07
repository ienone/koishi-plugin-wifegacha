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

export async function upWifeData(ctx: Context,config:Config) {
  // 获取老婆数据
  const wifeData = await ctx.database.get("wifeData", {})
  // 获取老婆文件列表
  const files = readdirSync(wifegachaPath);
  // 遍历文件列表
  for (const file of files) {
    // 使用 path.parse 拆解文件名
    const parsed = path.parse(file);
    const splitName = config.wifeNameSeparator
    const wifeName = parsed.name.split(splitName)[1]
    const comeFrom = parsed.name.split(splitName)[0]
    // 判断老婆数据是否存在
    if(wifeData.find(item => item.name === wifeName)){
      // 更新老婆数据
      await ctx.database.set('wifeData', { name: wifeName }, {
        comeFrom: comeFrom,
        filepath: path.join(wifegachaPath, file),
      })
      continue;
    }
    ctx.logger.info("创建老婆数据",wifeName)
    // 创建老婆数据
    await ctx.database.create('wifeData', {
      name: wifeName,
      comeFrom: comeFrom,
      filepath: path.join(wifegachaPath, file),
      createdAt: new Date(),
      groupData: []
    })
  }
  const wifeNewData = await ctx.database.get("wifeData", {})
  // 遍历老婆数据，如果老婆数据不存在，则删除
  for (const item of wifeNewData) {
    const fileNameList = files.map(file => path.parse(file).name.split(config.wifeNameSeparator)[1])
    if(!fileNameList.includes(item.name)){
      ctx.logger.info("删除老婆数据",item.comeFrom+config.wifeNameSeparator+item.name)
      await ctx.database.remove('wifeData', { name: item.name })
    }
  }
  ctx.logger.info('wifeData表更新完成')
  sprit.generateThumbnails(ctx)

}
