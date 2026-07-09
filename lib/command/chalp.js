"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalp = chalp;
const koishi_1 = require("koishi");
const url_1 = require("url");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
function parseAt(input) {
    return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}
function chalp(ctx, config) {
    ctx.command("查老婆 [userId]", "查看自己或被 @ 群友的当前老婆、来源、好感度和冷却信息").action(async ({ session }, userId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "query");
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        const targetId = parseAt(session.content) ?? parseAt(userId) ?? session.userId;
        if (targetId === session.userId)
            await utils_1.default.createUserData(ctx, session);
        else
            await utils_1.default.createTarget(ctx, session, targetId);
        const userData = (await ctx.database.get("wifeUser", {
            userId: targetId,
            groupId: session.channelId.toString(),
        }))[0];
        (0, affection_1.normalizeWifeUser)(userData);
        (0, affection_1.settleAffectionDecay)(userData);
        await (0, affection_1.persistWifeUser)(ctx, userData);
        if (!userData.wifeName) {
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), targetId === session.userId ? "你还没有老婆，快去抽一个吧" : "对方还没有老婆"]);
            return;
        }
        const wife = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0];
        const history = (0, affection_1.findWifeHistory)(userData, userData.wifeName);
        const owner = targetId === session.userId ? "你的" : "对方的";
        const lines = [
            `${owner}老婆：${userData.wifeName}`,
            wife?.comeFrom ? `来源：${wife.comeFrom}` : "来源：未记录",
            `当前好感度：${history?.affection ?? userData.currentWifeAffection ?? 0}`,
            `好感等级：${(0, affection_1.formatAffectionLevel)(history?.affectionLevel ?? 0)}`,
            "冷却剩余：",
            `- 日老婆：${(0, affection_1.formatCooldown)(userData.fuckWifeDate, config.fuckWifeCoolingTime)}`,
            `- 亲老婆/亲亲：${(0, affection_1.formatCooldown)(userData.kissWifeDate, config.kissWifeCoolingTime)}`,
            `- 约会：${(0, affection_1.formatCooldown)(userData.dateWifeDate, config.dateWifeCoolingTime)}`,
            `- 离婚：${(0, affection_1.formatCooldown)(userData.divorceDate, config.divorceDateInterval)}`,
            `- 档案查询：${(0, affection_1.formatCooldown)(userData.lpdaDate, config.lpdaDateInterval)}`,
        ];
        const payload = [(0, koishi_1.h)("quote", { id: session.messageId }), lines.join("\n")];
        if (wife?.filepath)
            payload.push(koishi_1.h.image((0, url_1.pathToFileURL)(wife.filepath).href));
        await send(payload);
    });
}
