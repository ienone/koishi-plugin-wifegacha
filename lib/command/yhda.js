"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yhda = yhda;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
function parseAt(input) {
    return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}
async function sendUserArchive(ctx, config, session, userId) {
    const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "userArchive");
    const targetId = parseAt(userId) ?? session.userId;
    if (targetId === session.userId)
        await utils_1.default.createUserData(ctx, session);
    else
        await utils_1.default.createTarget(ctx, session, targetId);
    const user = (await ctx.database.get("wifeUser", {
        userId: targetId,
        groupId: session.channelId.toString(),
    }))[0];
    (0, affection_1.normalizeWifeUser)(user);
    (0, affection_1.settleAffectionDecay)(user);
    await (0, affection_1.persistWifeUser)(ctx, user);
    const wifeCount = (await ctx.database.get("wifeData", {})).length;
    const current = user.wifeName ? (0, affection_1.findWifeHistory)(user, user.wifeName) : undefined;
    const successRate = user.ntrTotalCount > 0 ? `${Math.floor((user.ntrSuccessCount / user.ntrTotalCount) * 100)}%` : "0%";
    const owner = targetId === session.userId ? "个人档案" : "目标用户档案";
    await send([(0, koishi_1.h)("quote", { id: session.messageId }), [
            `${owner}：`,
            `老婆收集进度：${user.wifeHistories.length}/${wifeCount}`,
            `当前老婆：${user.wifeName || "无"}`,
            `当前好感度：${current?.affection ?? 0}`,
            `好感等级：${(0, affection_1.formatAffectionLevel)(current?.affectionLevel ?? 0)}`,
            `最高好感度：${user.maxAffection ?? 0}`,
            `抽取次数：${user.drawCount ?? 0}`,
            `离婚次数：${user.divorceCount ?? 0}`,
            `交换次数：${user.exchangeCount ?? 0}`,
            `牛老婆次数：${user.ntrTotalCount ?? 0}`,
            `牛老婆成功率：${successRate}`,
            `被牛次数：${user.targetNtrCount ?? 0}`,
            `被牛成功次数：${user.targetNtrSuccessCount ?? 0}`,
            `总好感度：${user.totalAffection ?? 0}`,
        ].join("\n")]);
}
async function sendGroupArchive(ctx, config, session) {
    const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "userArchive");
    await utils_1.default.createGroupData(ctx, session);
    const group = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
    const successRate = group.ntrTotalCount > 0 ? `${Math.floor((group.ntrSuccessCount / group.ntrTotalCount) * 100)}%` : "0%";
    await send([(0, koishi_1.h)("quote", { id: session.messageId }), [
            "群档案：",
            `群总抽取：${group.drawCount ?? 0}`,
            `总牛：${group.ntrTotalCount ?? 0}`,
            `牛成功率：${successRate}`,
            `总离婚：${group.divorceTotalCount ?? 0}`,
            `总交换：${group.exchangeCount ?? 0}`,
            `总互动次数：${group.fuckTotalCount ?? 0}`,
        ].join("\n")]);
}
function yhda(ctx, config) {
    ctx.command("用户档案 [userId]", "查看自己或被 @ 群友在当前群的个人老婆档案").action(async ({ session }, userId) => {
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        await sendUserArchive(ctx, config, session, userId);
    });
    ctx.command("群档案", "查看当前群的抽取、牛老婆、离婚、交换、互动聚合统计").action(async ({ session }) => {
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        await sendGroupArchive(ctx, config, session);
    });
}
