"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lh = lh;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function lh(ctx, config) {
    ctx.command("离婚 解除婚姻关系").action(async ({ session }) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "divorce");
        if (ctx.config.blockGroup.includes(session.channelId.toString())) {
            return;
        }
        if (!config.divorceSwitchgear) {
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                "离婚功能未开启，请联系管理员",
            ]);
            return;
        }
        if (config.divorceBlockGroup.includes(session.channelId.toString())) {
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                "本群离婚功能已被禁止，请联系管理员",
            ]);
            return;
        }
        // 创建用户数据
        await utils_1.default.createUserData(ctx, session);
        // 创建群数据
        await utils_1.default.createGroupData(ctx, session);
        // 群数据
        const groupData = (await ctx.database.get("groupData", {
            groupId: session.channelId.toString(),
        }))[0];
        // 用户数据
        const userData = (await ctx.database.get("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }))[0];
        if (!(await utils_1.default.isSameDay(ctx, new Date(), session))) {
            ctx.logger.info("离婚次数重置");
            ctx.database.set("wifeUser", { userId: session.userId, groupId: session.channelId.toString() }, {
                operationDate: new Date(),
                divorceCount: 0,
                wifeName: "",
                ntrCount: 0,
                // todayAffection: [],
            });
        }
        if (!userData.divorceDate) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            userData.divorceDate = yesterday;
        }
        const now = new Date().getTime();
        const diffTime = Math.abs(now - userData.divorceDate.getTime());
        const diffSeconds = Math.floor(diffTime / 1000);
        if (diffSeconds < config.divorceDateInterval) {
            const minutes = Math.floor((config.divorceDateInterval - diffSeconds) / 60);
            const seconds = (config.divorceDateInterval - diffSeconds) % 60;
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                `离婚冷却中，${minutes}分${seconds}秒后可以再次离婚`,
            ]);
            return;
        }
        // ctx.logger.info(userData);
        if (!userData?.wifeName) {
            send([(0, koishi_1.h)("quote", { id: session.messageId }), "你还没有老婆"]);
            return;
        }
        // 老婆数据
        const wifeData = (await ctx.database.get("wifeData", {
            name: userData.wifeName,
        }))[0];
        // 离婚次数是否达到上限
        if (userData.divorceCount >= config.divorceLimit &&
            userData.divorceCount > 0) {
            send(`你已经离婚${config.divorceLimit}次了，你这个渣男`);
            return;
        }
        // 更新用户数据
        ctx.database.set("wifeUser", { userId: session.userId, groupId: session.channelId.toString() }, {
            divorceCount: userData.divorceCount + 1,
            wifeName: "",
            wifeHistories: userData.wifeHistories.map((item) => {
                if (item.wifeName === userData.wifeName) {
                    item.affection -= 1;
                }
                return item;
            }),
            divorceDate: new Date(),
            // todayAffection: userData.todayAffection.map(item => {
            //   if(item.wifeName === userData.wifeName){
            //     item.todayAffection -= 1;
            //   }
            //   return item;
            // }),
        });
        // 更新群数据
        ctx.database.set("groupData", { groupId: session.channelId.toString() }, {
            divorceTotalCount: groupData.divorceTotalCount + 1,
        });
        // 更新老婆数据
        await utils_1.default.createGroupWifeData(ctx, session, userData.wifeName);
        const groupWifeData = wifeData.groupData.map((item) => {
            if (item.groupId === session.channelId.toString()) {
                item.divorceCount += 1;
            }
            return item;
        });
        await ctx.database.set("wifeData", {
            name: userData.wifeName,
        }, {
            groupData: groupWifeData,
        });
        send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            `你和${userData.wifeName}离婚了\n${userData.wifeName}对你的好感度 -1`,
        ]);
    });
}
