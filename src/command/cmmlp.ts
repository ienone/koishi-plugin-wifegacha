import { Context, h } from "koishi";
import { renameSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function cmmlp(ctx: Context,config:Config) {
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
    .command("重命名 <name> <newName> 重命名老婆")
    .action(async ({ session }, name, newName) => {
        const send = createRecallSender(session, ctx, config, "rename");
      if(!config.wifeUpdateGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId){
        return [h("quote", { id: session.messageId }), "你无权重命名老婆"];
      }
      if (!name || !newName)
        return [h("quote", { id: session.messageId }), "缺少参数"];
      if(name.split(config.wifeNameSeparator).length<2 || newName.split(config.wifeNameSeparator).length<2){
        return [h("quote", { id: session.messageId }), "老婆名称格式错误,请使用" + config.wifeNameSeparator + "分隔来源和名称"];
      }
      if(name === newName){
        return [h("quote", { id: session.messageId }), "新名称与旧名称相同"];
      }
      const wifeData = (
        await ctx.database.get("wifeData", {name: name.split(config.wifeNameSeparator)[1]})
      )
      if(wifeData.length === 0){
        return [h("quote", { id: session.messageId }), "该老婆不存在，请使用添加老婆命令"];
      }
      renameSync(wifeData[0].filepath, path.join(wifegachaPath, `${newName}.png`));
      await ctx.database.set("wifeData",{
        name: newName.split(config.wifeNameSeparator)[1]
      }, {
        comeFrom: newName.split(config.wifeNameSeparator)[0],
        filepath: path.join(wifegachaPath, `${newName}.png`),
      });
      const imageBuffer = await utils.readImageAsBinarySync(path.join(wifegachaPath, `${newName}.png`));
      send([
        h("quote", { id: session.messageId }),
        "老婆更新成功",
        h.image(imageBuffer, "image/png"),
      ]);
    });
}
