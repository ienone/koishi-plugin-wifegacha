import { Context, h } from "koishi";
import { existsSync, unlinkSync, writeFileSync } from "fs";
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
function imageUrl(input: string) {
  return input?.match(/<img\s+src="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
}

export function gxlp(ctx: Context, config: Config) {
  ctx.command("更新老婆 <name> <image>", "管理员更新指定老婆图片并刷新图鉴缓存").action(async ({ session }, name, image) => {
    const send = createRecallSender(session, ctx, config, "update");
    if (!canUpdate(config, session.userId.toString())) return [h("quote", { id: session.messageId }), "你无权更新老婆"];
    if (!name || !image) return [h("quote", { id: session.messageId }), "缺少参数"];
    const url = imageUrl(image);
    if (!url) return [h("quote", { id: session.messageId }), "未检测到图片"];

    const wifeData = await ctx.database.get("wifeData", { name });
    if (wifeData.length === 0) return [h("quote", { id: session.messageId }), "该老婆不存在，请使用新增老婆命令"];

    const wife = wifeData[0];
    const nextPath = path.join(assetsPath(), `${wife.comeFrom ? wife.comeFrom + config.wifeNameSeparator : ""}${name}.png`);
    const data = await ctx.http.get(url);
    if (existsSync(wife.filepath)) unlinkSync(wife.filepath);
    writeFileSync(nextPath, Buffer.from(data));
    await ctx.database.set("wifeData", { name }, { filepath: nextPath, updatedAt: new Date() });
    await sprit.generateThumbnails(ctx);
    sprit.clearAlbumCache();
    await send([h("quote", { id: session.messageId }), "老婆更新成功", h.image(pathToFileURL(nextPath).href)]);
  });
}
