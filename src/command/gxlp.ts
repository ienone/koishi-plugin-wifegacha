import { Context, h } from "koishi";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function gxlp(ctx: Context,config:Config) {
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
    .command("更新老婆 <name> <image> 更新老婆信息")
    .action(async ({ session }, name, image) => {
        const send = createRecallSender(session, ctx, config, "update");
      if(!config.wifeUpdateGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId){
        return [h("quote", { id: session.messageId }), "你无权更新老婆"];
      }
      if (!name || !image)
        return [h("quote", { id: session.messageId }), "缺少参数"];
      if(!image.includes("<img src=")){
        return [h("quote", { id: session.messageId }), "未检测到图片"];
      }
      const wifeData = (
        await ctx.database.get("wifeData", {name: name})
      )
      if(wifeData.length === 0){
        return [h("quote", { id: session.messageId }), "该老婆不存在，请使用添加老婆命令"];
      }
      const wifeImageData = await ctx.http.get(
        image.match(/<img\s+src="([^"]+)"/)?.[1].replaceAll("&amp;", "&")
      );
      const wifeComeFrom = wifeData[0].comeFrom
      const buffer = Buffer.from(wifeImageData);
      unlinkSync(wifeData[0].filepath);
      writeFileSync(path.join(wifegachaPath, `${wifeComeFrom?wifeComeFrom+config.wifeNameSeparator:''}${name}.png`), buffer);
      await ctx.database.set("wifeData",{
        name: name
      }, {
        comeFrom: wifeComeFrom,
        filepath: path.join(wifegachaPath, `${wifeComeFrom?wifeComeFrom+config.wifeNameSeparator:''}${name}.png`),
      });
      const imageBuffer = await utils.readImageAsBinarySync(path.join(wifegachaPath, `${wifeComeFrom?wifeComeFrom+config.wifeNameSeparator:''}${name}.png`));
      send([
        h("quote", { id: session.messageId }),
        "老婆更新成功",
        h.image(imageBuffer, "image/png"),
      ]);
    });
}
