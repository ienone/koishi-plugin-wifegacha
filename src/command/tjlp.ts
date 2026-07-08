import { Context, h } from "koishi";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import sprit from "../utils/sprit";
import { createRecallSender } from "../utils/messageRecall";

function getAssetsPath() {
  if (path.join(__dirname).split("\\").pop() === "command") {
    return path.join(__dirname, "../../../..", "data/assets/wifegacha");
  }
  return path.join(__dirname, "../../..", "data/assets/wifegacha");
}

function hasUploadPermission(config: Config, userId: string) {
  return config.wifeUploadGroup.includes(userId)
    || config.wifeAllOperationGroup.includes(userId)
    || userId === config.adminId;
}

function extractImageUrl(input?: string) {
  return input?.match(/<img\s+src="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
}

function safeFilePart(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim();
}

async function addWife(ctx: Context, config: Config, session, comeFrom: string, wifeName: string, imageInput: string) {
  const send = createRecallSender(session, ctx, config, "add");
  const url = extractImageUrl(imageInput);
  if (!wifeName || !comeFrom) return send([h("quote", { id: session.messageId }), "来源和名称不能为空"]);
  if (!url) return send([h("quote", { id: session.messageId }), "未检测到图片，请发送 Koishi 图片消息"]);

  const exists = (await ctx.database.get("wifeData", { name: wifeName })).length > 0;
  if (exists) return send([h("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"]);

  const wifegachaPath = getAssetsPath();
  if (!existsSync(wifegachaPath)) mkdirSync(wifegachaPath, { recursive: true });
  const filename = `${safeFilePart(comeFrom)}${config.wifeNameSeparator}${safeFilePart(wifeName)}.png`;
  const filePath = path.join(wifegachaPath, filename);

  let buffer: Buffer;
  try {
    const data = await ctx.http.get(url);
    buffer = Buffer.from(data);
  } catch (error) {
    return send([h("quote", { id: session.messageId }), `图片下载失败：${error.message}`]);
  }

  try {
    writeFileSync(filePath, buffer);
  } catch (error) {
    return send([h("quote", { id: session.messageId }), `图片写入失败：${error.message}`]);
  }

  try {
    await ctx.database.create("wifeData", {
      name: wifeName,
      comeFrom,
      filepath: filePath,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupData: [],
    });
  } catch (error) {
    return send([h("quote", { id: session.messageId }), `数据库写入失败：${error.message}`]);
  }

  await sprit.generateThumbnails(ctx);
  sprit.clearAlbumCache();
  await send([
    h("quote", { id: session.messageId }),
    `老婆添加成功\n名称：${wifeName}\n来源：${comeFrom}\n文件：${filePath}`,
    h.image(pathToFileURL(filePath).href),
  ]);
}

export function tjlp(ctx: Context, config: Config) {
  ctx.command("新增老婆", "通过分步向导新增老婆：依次发送来源、名称、图片并确认写入").action(async ({ session }) => {
    if (!hasUploadPermission(config, session.userId.toString())) {
      return [h("quote", { id: session.messageId }), "你无权新增老婆"];
    }

    const send = createRecallSender(session, ctx, config, "add");
    await send([h("quote", { id: session.messageId }), "请发送老婆来源，60 秒内有效"]);
    const comeFrom = await session.prompt(60000);
    if (!comeFrom) return send([h("quote", { id: session.messageId }), "新增老婆已取消：未收到来源"]);

    await send("请发送老婆名称");
    const wifeName = await session.prompt(60000);
    if (!wifeName) return send([h("quote", { id: session.messageId }), "新增老婆已取消：未收到名称"]);

    if ((await ctx.database.get("wifeData", { name: wifeName })).length > 0) {
      return send([h("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"]);
    }

    await send("请发送老婆图片");
    const imageInput = await session.prompt(60000);
    if (!extractImageUrl(imageInput)) return send([h("quote", { id: session.messageId }), "新增老婆已取消：未收到有效图片"]);

    await send([`请确认新增：\n来源：${comeFrom}\n名称：${wifeName}\n回复“确认”写入，其他内容取消`, ...h.parse(imageInput)]);
    const confirm = await session.prompt(60000);
    if (confirm !== "确认") return send([h("quote", { id: session.messageId }), "新增老婆已取消"]);

    return addWife(ctx, config, session, comeFrom.trim(), wifeName.trim(), imageInput);
  });
}