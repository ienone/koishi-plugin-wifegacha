import { Context, h } from "koishi";
import { renameSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import sprit from "../utils/sprit";
import { createRecallSender } from "../utils/messageRecall";

function assetsPath() {
  return path.join(__dirname, path.join(__dirname).split("\\").pop() === "command" ? "../../../.." : "../../..", "data/assets/wifegacha");
}
function canUpdate(config: Config, userId: string) {
  return config.wifeUpdateGroup.includes(userId) || config.wifeAllOperationGroup.includes(userId) || userId === config.adminId;
}

export function cmmlp(ctx: Context, config: Config) {
  ctx.command("重命名老婆 <name> <newName>", "管理员按 来源+名称 格式重命名老婆并同步资源文件名").action(async ({ session }, name, newName) => {
    const send = createRecallSender(session, ctx, config, "rename");
    if (!canUpdate(config, session.userId.toString())) return [h("quote", { id: session.messageId }), "你无权重命名老婆"];
    if (!name || !newName) return [h("quote", { id: session.messageId }), "缺少参数"];
    if (name.split(config.wifeNameSeparator).length < 2 || newName.split(config.wifeNameSeparator).length < 2) {
      return [h("quote", { id: session.messageId }), `名称格式错误，请使用 来源${config.wifeNameSeparator}名称`];
    }

    const [oldFrom, oldWifeName] = name.split(config.wifeNameSeparator);
    const [newFrom, nextWifeName] = newName.split(config.wifeNameSeparator);
    if (oldWifeName === nextWifeName && oldFrom === newFrom) return [h("quote", { id: session.messageId }), "新名称与旧名称相同"];
    const wifeData = await ctx.database.get("wifeData", { name: oldWifeName });
    if (wifeData.length === 0) return [h("quote", { id: session.messageId }), "该老婆不存在"];

    const nextPath = path.join(assetsPath(), `${newName}.png`);
    renameSync(wifeData[0].filepath, nextPath);
    await ctx.database.set("wifeData", { name: oldWifeName }, {
      name: nextWifeName,
      comeFrom: newFrom,
      filepath: nextPath,
      updatedAt: new Date(),
    });

    const users = await ctx.database.get("wifeUser", {});
    for (const user of users) {
      const histories = user.wifeHistories.map((item) => item.wifeName === oldWifeName ? { ...item, wifeName: nextWifeName } : item);
      await ctx.database.set("wifeUser", { userId: user.userId, groupId: user.groupId }, {
        wifeName: user.wifeName === oldWifeName ? nextWifeName : user.wifeName,
        wifeHistories: histories,
      });
    }

    await sprit.generateThumbnails(ctx);
    sprit.clearAlbumCache();
    await send([h("quote", { id: session.messageId }), "老婆重命名成功", h.image(pathToFileURL(nextPath).href)]);
  });
}
