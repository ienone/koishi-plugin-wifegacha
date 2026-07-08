"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tjlp = tjlp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const sprit_1 = __importDefault(require("../utils/sprit"));
const messageRecall_1 = require("../utils/messageRecall");
function getAssetsPath() {
    if (path_1.default.join(__dirname).split("\\").pop() === "command") {
        return path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
    }
    return path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
}
function hasUploadPermission(config, userId) {
    return config.wifeUploadGroup.includes(userId)
        || config.wifeAllOperationGroup.includes(userId)
        || userId === config.adminId;
}
function extractImageUrl(input) {
    return input?.match(/<img\s+src="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
}
function safeFilePart(value) {
    return value.replace(/[\\/:*?"<>|]/g, "_").trim();
}
async function addWife(ctx, config, session, comeFrom, wifeName, imageInput) {
    const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "add");
    const url = extractImageUrl(imageInput);
    if (!wifeName || !comeFrom)
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), "来源和名称不能为空"]);
    if (!url)
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), "未检测到图片，请发送 Koishi 图片消息"]);
    const exists = (await ctx.database.get("wifeData", { name: wifeName })).length > 0;
    if (exists)
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"]);
    const wifegachaPath = getAssetsPath();
    if (!(0, fs_1.existsSync)(wifegachaPath))
        (0, fs_1.mkdirSync)(wifegachaPath, { recursive: true });
    const filename = `${safeFilePart(comeFrom)}${config.wifeNameSeparator}${safeFilePart(wifeName)}.png`;
    const filePath = path_1.default.join(wifegachaPath, filename);
    let buffer;
    try {
        const data = await ctx.http.get(url);
        buffer = Buffer.from(data);
    }
    catch (error) {
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), `图片下载失败：${error.message}`]);
    }
    try {
        (0, fs_1.writeFileSync)(filePath, buffer);
    }
    catch (error) {
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), `图片写入失败：${error.message}`]);
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
    }
    catch (error) {
        return send([(0, koishi_1.h)("quote", { id: session.messageId }), `数据库写入失败：${error.message}`]);
    }
    await sprit_1.default.generateThumbnails(ctx);
    sprit_1.default.clearAlbumCache();
    await send([
        (0, koishi_1.h)("quote", { id: session.messageId }),
        `老婆添加成功\n名称：${wifeName}\n来源：${comeFrom}\n文件：${filePath}`,
        koishi_1.h.image((0, url_1.pathToFileURL)(filePath).href),
    ]);
}
function tjlp(ctx, config) {
    ctx.command("新增老婆", "通过分步向导新增老婆：依次发送来源、名称、图片并确认写入").action(async ({ session }) => {
        if (!hasUploadPermission(config, session.userId.toString())) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权新增老婆"];
        }
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "add");
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "请发送老婆来源，60 秒内有效"]);
        const comeFrom = await session.prompt(60000);
        if (!comeFrom)
            return send([(0, koishi_1.h)("quote", { id: session.messageId }), "新增老婆已取消：未收到来源"]);
        await send("请发送老婆名称");
        const wifeName = await session.prompt(60000);
        if (!wifeName)
            return send([(0, koishi_1.h)("quote", { id: session.messageId }), "新增老婆已取消：未收到名称"]);
        if ((await ctx.database.get("wifeData", { name: wifeName })).length > 0) {
            return send([(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"]);
        }
        await send("请发送老婆图片");
        const imageInput = await session.prompt(60000);
        if (!extractImageUrl(imageInput))
            return send([(0, koishi_1.h)("quote", { id: session.messageId }), "新增老婆已取消：未收到有效图片"]);
        await send([`请确认新增：\n来源：${comeFrom}\n名称：${wifeName}\n回复“确认”写入，其他内容取消`, ...koishi_1.h.parse(imageInput)]);
        const confirm = await session.prompt(60000);
        if (confirm !== "确认")
            return send([(0, koishi_1.h)("quote", { id: session.messageId }), "新增老婆已取消"]);
        return addWife(ctx, config, session, comeFrom.trim(), wifeName.trim(), imageInput);
    });
}
