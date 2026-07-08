"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jhlp = jhlp;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
// 交换老婆函数
function markExchangeGet(userData, wifeName) {
    const history = (0, affection_1.ensureWifeHistory)(userData, wifeName, {
        getNum: 0,
        isNtr: false,
        exchangeGetCount: 0,
    });
    history.getNum += 1;
    history.exchangeGetCount = (history.exchangeGetCount ?? 0) + 1;
    history.isNtr = false;
}
function markExchangeInteraction(userData, otherUserId, groupId) {
    userData.interactionWithOtherUser = userData.interactionWithOtherUser.map((item) => {
        if (item.otherUserId === otherUserId && item.groupId === groupId) {
            item.exchangeCount += 1;
        }
        return item;
    });
}
async function exchangeWife(ctx, session, myId, userId) {
    const groupId = session.channelId.toString();
    const userData = (await ctx.database.get("wifeUser", { userId: myId, groupId }))[0];
    const targetUserData = (await ctx.database.get("wifeUser", { userId, groupId }))[0];
    const groupData = (await ctx.database.get("groupData", { groupId }))[0];
    (0, affection_1.normalizeWifeUser)(userData);
    (0, affection_1.normalizeWifeUser)(targetUserData);
    (0, affection_1.settleAffectionDecay)(userData);
    (0, affection_1.settleAffectionDecay)(targetUserData);
    const myWifeName = userData.wifeName;
    const targetWifeName = targetUserData.wifeName;
    if (!myWifeName || !targetWifeName)
        return false;
    await ctx.database.set("groupData", { groupId }, {
        exchangeCount: groupData.exchangeCount + 1,
    });
    markExchangeGet(userData, targetWifeName);
    markExchangeGet(targetUserData, myWifeName);
    (0, affection_1.setCurrentWife)(userData, targetWifeName);
    (0, affection_1.setCurrentWife)(targetUserData, myWifeName);
    userData.exchangeCount += 1;
    targetUserData.exchangeCount += 1;
    markExchangeInteraction(userData, userId, groupId);
    markExchangeInteraction(targetUserData, myId, groupId);
    (0, affection_1.syncCurrentAffection)(userData);
    (0, affection_1.syncCurrentAffection)(targetUserData);
    await ctx.database.set("wifeUser", { userId: myId, groupId }, {
        wifeHistories: userData.wifeHistories,
        wifeName: userData.wifeName,
        exchangeCount: userData.exchangeCount,
        interactionWithOtherUser: userData.interactionWithOtherUser,
        currentWifeAffection: userData.currentWifeAffection,
        maxAffection: userData.maxAffection,
        totalAffection: userData.totalAffection,
        affectionDecayDate: userData.affectionDecayDate,
    });
    await ctx.database.set("wifeUser", { userId, groupId }, {
        wifeHistories: targetUserData.wifeHistories,
        wifeName: targetUserData.wifeName,
        exchangeCount: targetUserData.exchangeCount,
        interactionWithOtherUser: targetUserData.interactionWithOtherUser,
        currentWifeAffection: targetUserData.currentWifeAffection,
        maxAffection: targetUserData.maxAffection,
        totalAffection: targetUserData.totalAffection,
        affectionDecayDate: targetUserData.affectionDecayDate,
    });
    return true;
}
function jhlp(ctx, config) {
    ctx.command("交换老婆 <userId>", "向被 @ 群友发起当前老婆交换请求").action(async ({ session }, userId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "exchange");
        if (ctx.config.blockGroup.includes(session.channelId.toString())) {
            return;
        }
        userId = session.content.match(/<at id="(\d+)"\s*\/>/)?.[1];
        const myId = session.userId;
        // 创建用户数据
        await utils_1.default.createUserData(ctx, session);
        // 创建目标用户与当前用户交互数据
        await utils_1.default.createInteraction(ctx, session, userId);
        // 创建群数据
        await utils_1.default.createGroupData(ctx, session);
        // 创建目标用户数据
        await utils_1.default.createTarget(ctx, session, userId);
        // 检查是否@了群友
        const messageId = session.messageId;
        if (!userId) {
            send([(0, koishi_1.h)("quote", { id: messageId }), "请@要交换的群友"]);
            return;
        }
        // 获取用户数据
        let userData = (await ctx.database.get("wifeUser", {
            userId: myId,
            groupId: session.channelId.toString(),
        }))[0];
        // 获取目标用户数据
        let targetUserData = (await ctx.database.get("wifeUser", {
            userId: userId,
            groupId: session.channelId.toString(),
        }))[0];
        (0, affection_1.normalizeWifeUser)(userData);
        (0, affection_1.normalizeWifeUser)(targetUserData);
        if (userData.wifeName === '') {
            send([(0, koishi_1.h)("quote", { id: messageId }), "你还没有老婆，不能发起交换请求"]);
            return;
        }
        if (targetUserData.wifeName === '') {
            send([(0, koishi_1.h)("quote", { id: messageId }), "对方还没有老婆，不能发起交换请求"]);
            return;
        }
        send([(0, koishi_1.h)('at', { id: userId }),
            `${session.author.name} 想和你交换老婆，请在30秒内回复“同意”或“拒绝”`
        ]);
        // 等待30秒，启动一个定时器
        // ctx.logger.info('启动监听器')
        const message = ctx.on("message", async (session2) => {
            if (session2.content === "同意" && session2.userId === userId) {
                const send2 = (0, messageRecall_1.createRecallSender)(session2, ctx, config, "exchange");
                const exchanged = await exchangeWife(ctx, session2, myId, userId);
                message();
                // ctx.logger.info(message?'监听器已关闭':'监听器未关闭');
                clearTimeout(timer);
                // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
                send2([(0, koishi_1.h)("quote", { id: messageId }), exchanged ? "对方同意了你的交换请求" : "交换失败，双方需要同时拥有当前老婆"]);
            }
            else if (session2.content === "拒绝" && session2.userId === userId) {
                const send2 = (0, messageRecall_1.createRecallSender)(session2, ctx, config, "exchange");
                send2([(0, koishi_1.h)("quote", { id: messageId }), "对方拒绝了你的交换请求"]);
                message();
                // ctx.logger.info(message?'监听器已关闭':'监听器未关闭');
                clearTimeout(timer);
                // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
            }
        });
        const timer = setTimeout(() => {
            message();
            // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
            clearTimeout(timer);
            send([(0, koishi_1.h)("quote", { id: messageId }), "对方没有回复，请求已失效"]);
        }, 30000);
    });
}
