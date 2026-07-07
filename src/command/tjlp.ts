import { Context, h } from "koishi";
import { writeFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function tjlp(ctx: Context,config:Config) {
  let wifegachaPath = "";
  if (path.join(__dirname).split("\\").pop()=="command"){
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

  ctx
    .command("添加老婆 <name> <image> 添加老婆信息")
    .action(async ({ session }, name, image) => {
        const send = createRecallSender(session, ctx, config, "add");
      ctx.logger.info(path.join(__dirname))
      if(!config.wifeUploadGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId){
        return [h("quote", { id: session.messageId }), "你无权添加老婆"];
      }
      // ctx.logger.info(name, comeFrom, image)
      if (!name || !image)
        return [h("quote", { id: session.messageId }), "缺少参数"];
      if(name.split(config.wifeNameSeparator).length<2){
        return [h("quote", { id: session.messageId }), "老婆名称格式错误,请使用" + config.wifeNameSeparator + "分隔来源和名称"];
      }
      if(!image.includes("<img src=")){
        return [h("quote", { id: session.messageId }), "未检测到图片"];
      }
      const wifeNameList = (
        await ctx.database.get("wifeData", {})
      ).map(item => item.name)
      if(wifeNameList.includes(name.split(config.wifeNameSeparator)[1])){
        return [h("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"];
      }
      const wifeImageData = await ctx.http.get(
        image.match(/<img\s+src="([^"]+)"/)?.[1].replaceAll("&amp;", "&")
      );
      const buffer = Buffer.from(wifeImageData);
      writeFileSync(path.join(wifegachaPath, `${name}.png`), buffer);
      await ctx.database.create("wifeData",{
        name: name.split(config.wifeNameSeparator)[1],
        comeFrom: name.split(config.wifeNameSeparator)[0],
        filepath: path.join(wifegachaPath, `${name}.png`),
        createdAt: new Date(),
        groupData: []
      });
      const imageBuffer = await utils.readImageAsBinarySync(path.join(wifegachaPath, `${name}.png`));
      send([
        h("quote", { id: session.messageId }),
        "老婆添加成功",
        h.image(imageBuffer, "image/png"),
      ]);
    });
}
