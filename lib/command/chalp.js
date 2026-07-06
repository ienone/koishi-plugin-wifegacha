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
function chalp(ctx, config) {
    ctx.command("查老婆 [userId] 查看个人老婆或指定群友老婆").action(async ({ session }, userId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "query");
        if (ctx.config.blockGroup.includes(session.channelId.toString())) {
            return;
        }
        if (userId && userId.match(/<at id="(\d+)"\s*\/>/)?.[1]) {
            await utils_1.default.createTarget(ctx, session, userId?.match(/<at id="(\d+)"\s*\/>/)?.[1]);
            const targetData = (await ctx.database.get("wifeUser", {
                userId: userId?.match(/<at id="(\d+)"\s*\/>/)?.[1],
                groupId: session.channelId.toString(),
            }))[0];
            // ctx.logger.info(targetData)
            if (targetData.wifeName === '') {
                send([
                    (0, koishi_1.h)("quote", { id: session.messageId }),
                    `对方还没有老婆`,
                ]);
            }
            else {
                const imageBuffer = await utils_1.default.readImageAsBinarySync((await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].filepath);
                send([
                    (0, koishi_1.h)("quote", { id: session.messageId }),
                    `对方的老婆是 ${targetData.wifeName} ${(await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].comeFrom ? `，来自《${(await ctx.database.get("wifeData", { name: targetData.wifeName }))[0].comeFrom}》` : ""}`,
                    koishi_1.h.image(imageBuffer, "image/png"),
                ]);
            }
        }
        else {
            await utils_1.default.createUserData(ctx, session);
            const userData = (await ctx.database.get("wifeUser", {
                userId: session.userId,
                groupId: session.channelId.toString(),
            }))[0];
            if (userData.wifeName) {
                const wifeImage = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0].filepath;
                const comeFrom = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0].comeFrom;
                send([
                    (0, koishi_1.h)("quote", { id: session.messageId }),
                    `你的老婆是 ${userData.wifeName} ${comeFrom ? `，来自《${comeFrom}》` : ""}`,
                    koishi_1.h.image((0, url_1.pathToFileURL)(wifeImage).href),
                ]);
                return;
            }
            else {
                send([
                    (0, koishi_1.h)("quote", { id: session.messageId }),
                    `你还没有老婆，快去抽一个吧`,
                ]);
            }
        }
    });
}
