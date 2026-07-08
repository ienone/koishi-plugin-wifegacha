"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lh = lh;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
function lh(ctx, config) {
    ctx.command("离婚", "解除婚姻关系").action(async ({ session }) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "divorce");
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        if (!config.divorceSwitchgear) {
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), "离婚功能未开启，请联系管理员"]);
            return;
        }
        if (config.divorceBlockGroup.includes(session.channelId.toString())) {
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), "本群离婚功能已被禁用，请联系管理员"]);
            return;
        }
        await utils_1.default.createUserData(ctx, session);
        await utils_1.default.createGroupData(ctx, session);
        const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
        const userData = (await ctx.database.get("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }))[0];
        (0, affection_1.normalizeWifeUser)(userData);
        if (!(await utils_1.default.isSameDay(ctx, new Date(), session))) {
            userData.operationDate = new Date();
            userData.divorceCount = 0;
            userData.ntrCount = 0;
            (0, affection_1.clearCurrentWife)(userData);
        }
        const diffSeconds = Math.floor((Date.now() - userData.divorceDate.getTime()) / 1000);
        if (diffSeconds < config.divorceDateInterval) {
            const remain = config.divorceDateInterval - diffSeconds;
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), `离婚冷却中，${Math.floor(remain / 60)}分${remain % 60}秒后可以再次离婚`]);
            return;
        }
        if (!userData.wifeName) {
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), "你还没有老婆"]);
            return;
        }
        if (userData.divorceCount >= config.divorceLimit && userData.divorceCount > 0) {
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), `你今天已经离婚 ${config.divorceLimit} 次了`]);
            return;
        }
        const wifeName = userData.wifeName;
        (0, affection_1.addAffection)(userData, wifeName, -1, "divorce", "离婚");
        (0, affection_1.clearCurrentWife)(userData);
        (0, affection_1.syncCurrentAffection)(userData);
        userData.divorceCount += 1;
        userData.divorceDate = new Date();
        await ctx.database.set("wifeUser", { userId: session.userId, groupId: session.channelId.toString() }, {
            divorceCount: userData.divorceCount,
            wifeName: userData.wifeName,
            wifeHistories: userData.wifeHistories,
            divorceDate: userData.divorceDate,
            currentWifeAffection: userData.currentWifeAffection,
            maxAffection: userData.maxAffection,
            totalAffection: userData.totalAffection,
        });
        await ctx.database.set("groupData", { groupId: session.channelId.toString() }, {
            divorceTotalCount: groupData.divorceTotalCount + 1,
        });
        const wifeData = (await ctx.database.get("wifeData", { name: wifeName }))[0];
        if (wifeData) {
            await utils_1.default.createGroupWifeData(ctx, session, wifeName);
            const nextGroupWifeData = wifeData.groupData.map((item) => {
                if (item.groupId === session.channelId.toString())
                    item.divorceCount += 1;
                return item;
            });
            await ctx.database.set("wifeData", { name: wifeName }, { groupData: nextGroupWifeData });
        }
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), `你和 ${wifeName} 离婚了\n${wifeName} 对你的好感度 -1`]);
    });
}
