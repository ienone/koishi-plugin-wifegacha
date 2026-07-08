"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lptj = lptj;
const koishi_1 = require("koishi");
const crypto_1 = __importDefault(require("crypto"));
const sprit_1 = __importDefault(require("../utils/sprit"));
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function parseAt(input) {
    return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}
function hash(value) {
    return crypto_1.default.createHash("sha1").update(value).digest("hex").slice(0, 20);
}
function lptj(ctx, config) {
    ctx.command("老婆图鉴 [targetUserId]", "查看自己或被 @ 群友在当前群的老婆收集图鉴").action(async ({ session }, targetUserId) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "album");
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        const targetId = parseAt(targetUserId) ?? session.userId;
        await utils_1.default.createUserData(ctx, session);
        if (targetId !== session.userId)
            await utils_1.default.createTarget(ctx, session, targetId);
        const wifeData = await ctx.database.get("wifeData", {});
        const user = (await ctx.database.get("wifeUser", {
            groupId: session.channelId.toString(),
            userId: targetId,
        }))[0];
        const tolletted = user.wifeHistories
            .filter((item) => config.illustratedBook || !item.isNtr)
            .map((item) => item.wifeName)
            .sort();
        const wifeVersion = hash(wifeData.map((item) => `${item.name}:${item.filepath}:${item.updatedAt ?? item.createdAt}`).sort().join("|"));
        const cacheKey = hash([
            session.channelId.toString(),
            targetId,
            config.illustratedBook ? "includeNtr" : "drawOnly",
            wifeVersion,
            tolletted.join("|"),
            String(config.wifeImageQuality),
        ].join("::"));
        const imageBuffer = await sprit_1.default.generateMixedBackgroundImage(ctx, config, tolletted, { cacheKey });
        await send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            "你的老婆图鉴已出炉",
            koishi_1.h.image(imageBuffer, "image/jpeg"),
            `老婆收集进度：${tolletted.length}/${wifeData.length}`,
        ]);
    });
}
