"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lptj = lptj;
const koishi_1 = require("koishi");
const sprit_1 = __importDefault(require("../utils/sprit"));
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function lptj(ctx, config) {
    ctx.command("老婆图鉴 [targetUserId] 查看老婆图鉴").action(async ({ session }, targetUserId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "album");
        if (ctx.config.blockGroup.includes(session.channelId.toString())) {
            return;
        }
        let userId = session.userId;
        if (targetUserId) {
            userId = targetUserId.match(/<at id="(\d+)"\s*\/>/)?.[1];
        }
        // 创建用户数据
        await utils_1.default.createUserData(ctx, session);
        // 创建目标用户数据
        if (targetUserId) {
            await utils_1.default.createTarget(ctx, session, userId);
        }
        const lpAllNum = (await ctx.database.get("wifeData", {})).length;
        // ctx.logger.info("老婆总数：", lpAllNum);
        if (config.illustratedBook) {
            const lpList = (await ctx.database.get("wifeUser", {
                groupId: session.channelId.toString(),
                userId: userId,
            }))[0].wifeHistories.map((item) => item.wifeName);
            const imageBuffer = await sprit_1.default.generateMixedBackgroundImage(ctx, config, lpList);
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                `你的老婆图鉴已出炉~`,
                koishi_1.h.image(imageBuffer, "png"),
                `老婆收集进度：${lpList.length}/${lpAllNum}`,
            ]);
        }
        else {
            const lpList = (await ctx.database.get("wifeUser", {
                groupId: session.channelId.toString(),
                userId: userId,
            }))[0].wifeHistories
                .filter((item) => !item.isNtr)
                .map((item) => item.wifeName);
            const imageBuffer = await sprit_1.default.generateMixedBackgroundImage(ctx, config, lpList);
            send([
                (0, koishi_1.h)("quote", { id: session.messageId }),
                "你的老婆图鉴已出炉~",
                koishi_1.h.image(imageBuffer, "png"),
                `老婆收集进度：${lpList.length}/${lpAllNum}`,
            ]);
        }
    });
}
