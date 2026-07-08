"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gxlp = gxlp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const sprit_1 = __importDefault(require("../utils/sprit"));
const messageRecall_1 = require("../utils/messageRecall");
function assetsPath() {
    return path_1.default.join(__dirname, path_1.default.join(__dirname).split("\\").pop() === "command" ? "../../../.." : "../../..", "data/assets/wifegacha");
}
function canUpdate(config, userId) {
    return config.wifeUpdateGroup.includes(userId) || config.wifeAllOperationGroup.includes(userId) || userId === config.adminId;
}
function imageUrl(input) {
    return input?.match(/<img\s+src="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
}
function gxlp(ctx, config) {
    ctx.command("更新老婆 <name> <image>", "管理员更新指定老婆图片并刷新图鉴缓存").action(async ({ session }, name, image) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "update");
        if (!canUpdate(config, session.userId.toString()))
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权更新老婆"];
        if (!name || !image)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "缺少参数"];
        const url = imageUrl(image);
        if (!url)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "未检测到图片"];
        const wifeData = await ctx.database.get("wifeData", { name });
        if (wifeData.length === 0)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在，请使用新增老婆命令"];
        const wife = wifeData[0];
        const nextPath = path_1.default.join(assetsPath(), `${wife.comeFrom ? wife.comeFrom + config.wifeNameSeparator : ""}${name}.png`);
        const data = await ctx.http.get(url);
        if ((0, fs_1.existsSync)(wife.filepath))
            (0, fs_1.unlinkSync)(wife.filepath);
        (0, fs_1.writeFileSync)(nextPath, Buffer.from(data));
        await ctx.database.set("wifeData", { name }, { filepath: nextPath, updatedAt: new Date() });
        await sprit_1.default.generateThumbnails(ctx);
        sprit_1.default.clearAlbumCache();
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "老婆更新成功", koishi_1.h.image((0, url_1.pathToFileURL)(nextPath).href)]);
    });
}
