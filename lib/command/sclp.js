"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sclp = sclp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const sprit_1 = __importDefault(require("../utils/sprit"));
const messageRecall_1 = require("../utils/messageRecall");
function canDelete(config, userId) {
    return config.wifeDeleteGroup.includes(userId) || config.wifeAllOperationGroup.includes(userId) || userId === config.adminId;
}
function sclp(ctx, config) {
    ctx.command("删除老婆 <name>", "管理员删除指定老婆数据、图片和相关图鉴缓存").action(async ({ session }, name) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "remove");
        if (!canDelete(config, session.userId.toString()))
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权删除老婆"];
        if (!name)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "请输入要删除的老婆名称"];
        const wifeData = await ctx.database.get("wifeData", { name });
        if (wifeData.length === 0)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在"];
        if ((0, fs_1.existsSync)(wifeData[0].filepath))
            (0, fs_1.unlinkSync)(wifeData[0].filepath);
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
        await sprit_1.default.generateThumbnails(ctx);
        sprit_1.default.clearAlbumCache();
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "老婆删除成功"]);
    });
}
