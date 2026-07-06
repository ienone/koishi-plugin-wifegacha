import { Context, h } from "koishi";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function chalp(ctx: Context, config: Config) {
  ctx.command("查老婆 [userId] 查看个人老婆或指定群友老婆").action(async ({ session }, userId) => {
        const send = createRecallSender(session, ctx, config, "query");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) {
      return;
    }
   if (userId && userId.match(/<at id="(\d+)"\s*\/>/)?.[1]){
    await utils.createTarget(ctx, session, userId?.match(/<at id="(\d+)"\s*\/>/)?.[1])
    const targetData = (await ctx.database.get("wifeUser", {
      userId: userId?.match(/<at id="(\d+)"\s*\/>/)?.[1],
      groupId: session.channelId.toString(),
    }))[0]
    // ctx.logger.info(targetData)
    if (targetData.wifeName === '') {
      send([
        h("quote", { id: session.messageId }),
        `对方还没有老婆`,
      ]);
    }
    else {
      const imageBuffer = await utils.readImageAsBinarySync((await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].filepath);
      send([
        h("quote", { id: session.messageId }),
        `对方的老婆是 ${targetData.wifeName} ${
          (await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].comeFrom ? `，来自《${(await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].comeFrom}》` : ""
        }`,
        h.image(imageBuffer, "image/png"),
      ]);
    }
   }
   else {
    await utils.createUserData(ctx, session)
    const userData = (
      await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
      })
    )[0];
    if (userData.wifeName) {
      const wifeImage = (
        await ctx.database.get("wifeData", { name: userData.wifeName })
      )[0].filepath;
      const comeFrom = (
        await ctx.database.get("wifeData", { name: userData.wifeName })
      )[0].comeFrom;
      send([
        h("quote", { id: session.messageId }),
        `你的老婆是 ${userData.wifeName} ${
          comeFrom ? `，来自《${comeFrom}》` : ""
        }`,
        h.image(pathToFileURL(wifeImage).href),
      ]);
      return;
    } else {
      send([
        h("quote", { id: session.messageId }),
        `你还没有老婆，快去抽一个吧`,
      ]);
    }
   }
  });
}
