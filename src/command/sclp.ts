import { Context, h } from "koishi";
import { existsSync, unlinkSync } from "fs";
import type { Config } from "../config";
import sprit from "../utils/sprit";
import { createRecallSender } from "../utils/messageRecall";

function canDelete(config: Config, userId: string) {
  return config.wifeDeleteGroup.includes(userId) || config.wifeAllOperationGroup.includes(userId) || userId === config.adminId;
}

export function sclp(ctx: Context, config: Config) {
  ctx.command("删除老婆 <name>", "管理员删除指定老婆数据、图片和相关图鉴缓存").action(async ({ session }, name) => {
    const send = createRecallSender(session, ctx, config, "remove");
    if (!canDelete(config, session.userId.toString())) return [h("quote", { id: session.messageId }), "你无权删除老婆"];
    if (!name) return [h("quote", { id: session.messageId }), "请输入要删除的老婆名称"];

    const wifeData = await ctx.database.get("wifeData", { name });
    if (wifeData.length === 0) return [h("quote", { id: session.messageId }), "该老婆不存在"];
    if (existsSync(wifeData[0].filepath)) unlinkSync(wifeData[0].filepath);
    await ctx.database.remove("wifeData", { name });

    const users = await ctx.database.get("wifeUser", { groupId: session.channelId.toString() });
    for (const user of users) {
      const histories = user.wifeHistories.filter((item) => item.wifeName !== name);
      await ctx.database.set("wifeUser", { userId: user.userId, groupId: user.groupId }, {
        wifeName: user.wifeName === name ? "" : user.wifeName,
        wifeHistories: histories,
        currentWifeAffection: user.wifeName === name ? 0 : user.currentWifeAffection,
      });
    }

    await sprit.generateThumbnails(ctx);
    sprit.clearAlbumCache();
    await send([h("quote", { id: session.messageId }), "老婆删除成功"]);
  });
}
