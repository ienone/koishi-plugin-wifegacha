"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yhda = yhda;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function yhda(ctx, config) {
    ctx
        .command("用户档案 [userId] 查看用户档案")
        .action(async ({ session }, userId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "userArchive");
        if (ctx.config.blockGroup.includes(session.channelId.toString())) {
            return;
        }
        // 查看是否关闭了某些功能
        // 离婚功能
        let divorceSwitchgear = true;
        if (!config.divorceSwitchgear) {
            divorceSwitchgear = false;
        }
        if (config.divorceBlockGroup.includes(session.channelId.toString())) {
            divorceSwitchgear = false;
        }
        // 日老婆功能
        let fuckWifeSwitchgear = true;
        if (!config.fuckWifeSwitchgear) {
            fuckWifeSwitchgear = false;
        }
        if (config.fuckWifeBlockGroup.includes(session.channelId.toString())) {
            fuckWifeSwitchgear = false;
        }
        // 牛老婆功能
        let ntrSwitchgear = true;
        if (!config.ntrSwitchgear) {
            ntrSwitchgear = false;
        }
        if (config.ntrBlockGroup.includes(session.channelId.toString())) {
            ntrSwitchgear = false;
        }
        // 创建用户数据
        await utils_1.default.createUserData(ctx, session);
        // 创建群数据
        await utils_1.default.createGroupData(ctx, session);
        // 获取用户数据
        const wifeUser = (await ctx.database.get("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }))[0];
        // 获取群数据
        const groupData = (await ctx.database.get("groupData", {
            groupId: session.channelId.toString(),
        }))[0];
        // 获取老婆总数
        const wifeDataNum = (await ctx.database.get("wifeData", {})).length;
        const now = new Date().getTime();
        const diffTime = Math.abs(now - wifeUser.lpdaDate.getTime());
        const diffSeconds = Math.floor(diffTime / 1000);
        if (diffSeconds < config.lpdaDateInterval) {
            const minutes = Math.floor((config.lpdaDateInterval - diffSeconds) / 60);
            const seconds = (config.lpdaDateInterval - diffSeconds) % 60;
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                `档案查询冷却中，${minutes}分${seconds}秒后可以再次查询`,
            ]);
            return;
        }
        // 更新用户档案查询时间
        await ctx.database.set("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }, {
            lpdaDate: new Date(),
        });
        // 获取老婆历史记录数量
        if (userId) {
            userId = userId.match(/<at id="(\d+)"\s*\/>/)?.[1];
            // 创建目标用户数据
            await utils_1.default.createTarget(ctx, session, userId);
            // 获取目标用户数据
            const targetwifeUser = (await ctx.database.get("wifeUser", {
                userId: userId,
                groupId: session.channelId.toString(),
            }))[0];
            // 创建目标用户与当前用户交互数据
            await utils_1.default.createInteraction(ctx, session, userId);
            // 获取目标的老婆历史记录数量
            const wifeHistoriesNum = targetwifeUser.wifeHistories.length;
            // 获取目抽老婆次数
            const drawCount = targetwifeUser.drawCount;
            // 获取目标牛老婆总次数
            const ntrTotalCount = targetwifeUser.ntrTotalCount;
            // 获取目标牛老婆成功次数
            const ntrSuccessCount = targetwifeUser.ntrSuccessCount;
            // 获取目标离婚次数
            const divorceCount = targetwifeUser.divorceCount;
            // 获取目标交换次数
            const exchangeCount = targetwifeUser.exchangeCount;
            // 获取目标老婆总好感度
            const totalAffection = targetwifeUser.totalAffection;
            // 获取目标被牛次数
            const targetNtrCount = targetwifeUser.targetNtrCount;
            // 获取目标被牛成功次数
            const targetNtrSuccessCount = targetwifeUser.targetNtrSuccessCount;
            // 获取与他人交互数据
            const interactionWithOtherUser = targetwifeUser.interactionWithOtherUser;
            let interactionFlag = false;
            // 获取交互数据中牛老婆最多的用户id和次数
            let maxNtrCountUser = "";
            let maxNtrCount = 0;
            // 获取交互数据中牛老婆成功最多的用户id和次数
            let maxNtrSuccessCountUser = "";
            let maxNtrSuccessCount = 0;
            // 获取交互数据中交换最多的用户id和次数
            let maxExchangeCountUser = "";
            let maxExchangeCount = 0;
            if (interactionWithOtherUser.length > 0) {
                interactionFlag = true;
                for (const item of interactionWithOtherUser) {
                    if (item.ntrCount > maxNtrCount) {
                        maxNtrCount = item.ntrCount;
                        maxNtrCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                    if (item.ntrSuccessCount >= maxNtrSuccessCount) {
                        maxNtrSuccessCount = item.ntrSuccessCount;
                        maxNtrSuccessCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                    if (item.exchangeCount >= maxExchangeCount) {
                        maxExchangeCount = item.exchangeCount;
                        maxExchangeCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                }
            }
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                `- 目标用户档案：\n`,
                `- 老婆收集进度：${wifeHistoriesNum}/${wifeDataNum}\n`,
                `${drawCount ? `- 抽老婆次数：${drawCount}\n` : ""}`,
                `${ntrSwitchgear && ntrTotalCount ? `- 牛老婆总次数：${ntrTotalCount}\n` : ""}`,
                `${ntrSwitchgear && ntrSuccessCount ? `- 牛老婆成功次数：${ntrSuccessCount}\n` : ""}`,
                `${ntrSwitchgear && ntrTotalCount
                    ? `- 牛老婆成功率：${Math.floor((ntrSuccessCount / ntrTotalCount) * 100)}%\n`
                    : ""}`,
                `${divorceSwitchgear && divorceCount ? `- 离婚次数：${divorceCount}\n` : ""}`,
                `${exchangeCount && exchangeCount ? `- 交换次数：${exchangeCount}\n` : ""}`,
                `${fuckWifeSwitchgear && totalAffection ? `- 老婆总好感度：${totalAffection}\n` : ""}`,
                `${ntrSwitchgear && targetNtrCount ? `- 被牛次数：${targetNtrCount}\n` : ""}`,
                `${ntrSwitchgear && targetNtrSuccessCount ? `- 被牛成功次数：${targetNtrSuccessCount}\n` : ""}`,
            ]);
        }
        else {
            // 获取个人的老婆历史记录数量
            const wifeHistoriesNum = wifeUser.wifeHistories.length;
            // 获取个人抽老婆次数
            const drawCount = wifeUser.drawCount;
            // 获取个人牛老婆总次数
            const ntrTotalCount = wifeUser.ntrTotalCount;
            // 获取个人牛老婆成功次数
            const ntrSuccessCount = wifeUser.ntrSuccessCount;
            // 获取个人离婚次数
            const divorceCount = wifeUser.divorceCount;
            // 获取个人交换次数
            const exchangeCount = wifeUser.exchangeCount;
            // 获取个人老婆总好感度
            const totalAffection = wifeUser.totalAffection;
            // 获取个人被牛次数
            const targetNtrCount = wifeUser.targetNtrCount;
            // 获取个人被牛成功次数
            const targetNtrSuccessCount = wifeUser.targetNtrSuccessCount;
            // 获取群数据
            // 群总抽老婆次数
            const groupDrawCount = groupData.drawCount;
            // 群总牛老婆次数
            const groupNtrCount = groupData.ntrTotalCount;
            // 群总牛老婆成功次数
            const groupNtrSuccessCount = groupData.ntrSuccessCount;
            // 群总离婚次数
            const groupDivorceCount = groupData.divorceTotalCount;
            // 群总交换次数
            const groupExchangeCount = groupData.exchangeCount;
            // 群总日老婆次数
            const groupFuckCount = groupData.fuckTotalCount;
            // 获取与他人交互数据
            const interactionWithOtherUser = wifeUser.interactionWithOtherUser;
            let interactionFlag = false;
            // 获取交互数据中牛老婆最多的用户id和次数
            let maxNtrCountUser = "";
            let maxNtrCount = 0;
            // 获取交互数据中牛老婆成功最多的用户id和次数
            let maxNtrSuccessCountUser = "";
            let maxNtrSuccessCount = 0;
            // 获取交互数据中交换最多的用户id和次数
            let maxExchangeCountUser = "";
            let maxExchangeCount = 0;
            if (interactionWithOtherUser.length > 0) {
                interactionFlag = true;
                for (const item of interactionWithOtherUser) {
                    if (item.ntrCount > maxNtrCount) {
                        maxNtrCount = item.ntrCount;
                        maxNtrCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                    if (item.ntrSuccessCount >= maxNtrSuccessCount) {
                        maxNtrSuccessCount = item.ntrSuccessCount;
                        maxNtrSuccessCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                    if (item.exchangeCount >= maxExchangeCount) {
                        maxExchangeCount = item.exchangeCount;
                        maxExchangeCountUser = (await session.bot.getUser(item.otherUserId)).name;
                    }
                }
            }
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                `- 群档案：\n`,
                `${groupDrawCount ? `- 群总抽老婆次数：${groupDrawCount}\n` : ""}`,
                `${ntrSwitchgear && groupNtrCount ? `- 群总牛老婆次数：${groupNtrCount}\n` : ""}`,
                `${ntrSwitchgear && groupNtrSuccessCount
                    ? `- 群总牛老婆成功次数：${groupNtrSuccessCount}\n`
                    : ""}`,
                `${divorceSwitchgear && groupDivorceCount ? `- 群总离婚次数：${groupDivorceCount}\n` : ""}`,
                `${groupExchangeCount && groupExchangeCount ? `- 群总交换次数：${groupExchangeCount}\n` : ""}`,
                `${fuckWifeSwitchgear && groupFuckCount ? `- 群老婆总好感度：${groupFuckCount}\n` : ""}`,
                `---------------\n`,
                `- 个人档案：\n`,
                `- 老婆收集进度：${wifeHistoriesNum}/${wifeDataNum}\n`,
                `${drawCount ? `- 抽老婆次数：${drawCount}\n` : ""}`,
                `${ntrSwitchgear && ntrTotalCount ? `- 牛老婆总次数：${ntrTotalCount}\n` : ""}`,
                `${ntrSwitchgear && ntrSuccessCount ? `- 牛老婆成功次数：${ntrSuccessCount}\n` : ""}`,
                `${ntrSwitchgear && ntrTotalCount
                    ? `- 牛老婆成功率：${Math.floor((ntrSuccessCount / ntrTotalCount) * 100)}%\n`
                    : ""}`,
                `${divorceSwitchgear && divorceCount ? `- 离婚次数：${divorceCount}\n` : ""}`,
                `${exchangeCount && exchangeCount ? `- 交换次数：${exchangeCount}\n` : ""}`,
                `${fuckWifeSwitchgear && totalAffection ? `- 老婆总好感度：${totalAffection}\n` : ""}`,
                `${ntrSwitchgear && targetNtrCount ? `- 被牛次数：${targetNtrCount}\n` : ""}`,
                `${ntrSwitchgear && targetNtrSuccessCount ? `- 被牛成功次数：${targetNtrSuccessCount}\n` : ""}`,
                `${interactionFlag && maxNtrCount ? `- 最喜欢牛的是${maxNtrCountUser}，共${maxNtrCount}次\n` : ""}`,
                `${interactionFlag && maxNtrSuccessCount ? `- 牛成功最多的是${maxNtrSuccessCountUser}，共${maxNtrSuccessCount}次\n` : ""}`,
                `${interactionFlag && maxExchangeCount ? `- 和${maxExchangeCountUser}交换老婆次数最多，共${maxExchangeCount}次\n` : ""}`,
            ]);
        }
    });
}
