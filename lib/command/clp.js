"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clp = clp;
const koishi_1 = require("koishi");
const url_1 = require("url");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
function clp(ctx, config) {
    ctx.command("抽老婆", "抽一个老婆").action(async ({ session }) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "draw");
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        await utils_1.default.createUserData(ctx, session);
        await utils_1.default.createGroupData(ctx, session);
        const userData = (await ctx.database.get("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }))[0];
        (0, affection_1.normalizeWifeUser)(userData);
        if (userData.drawBanUntil && userData.drawBanUntil.getTime() > Date.now()) {
            const remain = Math.ceil((userData.drawBanUntil.getTime() - Date.now()) / 1000);
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), `暂时不能抽老婆，剩余 ${Math.floor(remain / 60)}分${remain % 60}秒`]);
            return;
        }
        const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
        const wifeName = await utils_1.default.checkGroupDate(ctx, session.channelId.toString(), new Date(), session);
        if (!wifeName) {
            if (userData.wifeName) {
                const wife = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0];
                await send([
                    (0, koishi_1.h)("quote", { id: session.messageId }),
                    `你今天的老婆是 ${userData.wifeName}${wife?.comeFrom ? `，来自「${wife.comeFrom}」` : ""}`,
                    wife?.filepath ? koishi_1.h.image((0, url_1.pathToFileURL)(wife.filepath).href) : "",
                ]);
            }
            else {
                await ctx.database.set("groupData", { groupId: session.channelId.toString() }, { drawCount: groupData.drawCount + 1 });
                await send([(0, koishi_1.h)("quote", { id: session.messageId }), "遗憾，老婆都被娶走了……"]);
            }
            return;
        }
        await ctx.database.set("groupData", { groupId: session.channelId.toString() }, { drawCount: groupData.drawCount + 1 });
        await utils_1.default.createGroupWifeData(ctx, session, wifeName);
        const wife = (await ctx.database.get("wifeData", { name: wifeName }))[0];
        if (wife) {
            const groupWifeData = wife.groupData.map((item) => {
                if (item.groupId === session.channelId.toString())
                    item.drawCount += 1;
                return item;
            });
            await ctx.database.set("wifeData", { name: wifeName }, { groupData: groupWifeData });
        }
        const existed = Boolean(userData.wifeHistories.find((item) => item.wifeName === wifeName));
        const history = (0, affection_1.ensureWifeHistory)(userData, wifeName, { getNum: 0, isNtr: false });
        history.getNum += 1;
        history.isNtr = false;
        (0, affection_1.setCurrentWife)(userData, wifeName);
        (0, affection_1.syncCurrentAffection)(userData);
        await ctx.database.set("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }, {
            wifeName,
            drawCount: userData.drawCount + 1,
            wifeHistories: userData.wifeHistories,
            currentWifeAffection: userData.currentWifeAffection,
            maxAffection: userData.maxAffection,
            totalAffection: userData.totalAffection,
        });
        await send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            `${existed ? "重复了。" : "出新了！"}\n你今天抽到的老婆是 ${wifeName}${wife?.comeFrom ? `\n来自「${wife.comeFrom}」` : ""}`,
            wife?.filepath ? koishi_1.h.image((0, url_1.pathToFileURL)(wife.filepath).href) : "",
        ]);
    });
}
