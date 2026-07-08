"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmmlp = cmmlp;
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
function cmmlp(ctx, config) {
    ctx.command("重命名老婆 <name> <newName>", "管理员按 来源+名称 格式重命名老婆并同步资源文件名").action(async ({ session }, name, newName) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "rename");
        if (!canUpdate(config, session.userId.toString()))
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权重命名老婆"];
        if (!name || !newName)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "缺少参数"];
        if (name.split(config.wifeNameSeparator).length < 2 || newName.split(config.wifeNameSeparator).length < 2) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), `名称格式错误，请使用 来源${config.wifeNameSeparator}名称`];
        }
        const [oldFrom, oldWifeName] = name.split(config.wifeNameSeparator);
        const [newFrom, nextWifeName] = newName.split(config.wifeNameSeparator);
        if (oldWifeName === nextWifeName && oldFrom === newFrom)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "新名称与旧名称相同"];
        const wifeData = await ctx.database.get("wifeData", { name: oldWifeName });
        if (wifeData.length === 0)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在"];
        const nextPath = path_1.default.join(assetsPath(), `${newName}.png`);
        (0, fs_1.renameSync)(wifeData[0].filepath, nextPath);
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
        await sprit_1.default.generateThumbnails(ctx);
        sprit_1.default.clearAlbumCache();
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "老婆重命名成功", koishi_1.h.image((0, url_1.pathToFileURL)(nextPath).href)]);
    });
}
