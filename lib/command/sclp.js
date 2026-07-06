"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sclp = sclp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const messageRecall_1 = require("../utils/messageRecall");
function sclp(ctx, config) {
    ctx
        .command("删除老婆 <name> 删除老婆信息")
        .action(async ({ session }, name) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "remove");
        // ctx.logger.info(name, comeFrom, image)
        if (!config.wifeDeleteGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权删除老婆"];
        }
        if (!name)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "请输入要删除的老婆名称"];
        const wifeNameList = (await ctx.database.get("wifeData", {})).map(item => item.name);
        if (!wifeNameList.includes(name)) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在，请使用添加老婆命令"];
        }
        // 删除老婆数据
        // 获取老婆数据
        const wifeData = await ctx.database.get("wifeData", {
            name: name,
        });
        // 获取老婆文件地址
        const wifeFilePath = path_1.default.join(wifeData[0].filepath);
        // 删除老婆文件
        (0, fs_1.unlinkSync)(wifeFilePath);
        // 删除老婆数据
        await ctx.database.remove("wifeData", {
            name: name,
        });
        // 清理用户对应的老婆历史
        const userData = await ctx.database.get("wifeUser", {
            userId: session.userId,
        });
        const userWifeHistories = userData[0].wifeHistories.filter(item => item.wifeName !== name);
        await ctx.database.set("wifeUser", {
            userId: session.userId,
        }, {
            wifeHistories: userWifeHistories,
        });
        // 如果用户当前老婆是删除的老婆，则清理用户当前老婆
        if (userData[0].wifeName === name) {
            await ctx.database.set("wifeUser", {
                userId: session.userId,
            }, {
                wifeName: '',
            });
        }
        send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            "老婆删除成功",
        ]);
    });
}
