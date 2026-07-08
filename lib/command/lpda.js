"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lpda = lpda;
const koishi_1 = require("koishi");
const url_1 = require("url");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function groupRecord(wife, groupId) {
    return wife.groupData?.find((item) => item.groupId === groupId) ?? {
        groupId,
        drawCount: 0,
        ntrCount: 0,
        fuckCount: 0,
        divorceCount: 0,
        ntrFailCount: 0,
    };
}
async function handleGroupWifeArchive(ctx, config, session, wifeName) {
    const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "archive");
    await utils_1.default.createUserData(ctx, session);
    const user = (await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
    }))[0];
    const now = Date.now();
    const diffSetonds = Math.floor((now - (user.lpdaDate?.getTime?.() ?? 0)) / 1000);
    if (diffSetonds < config.lpdaDateInterval) {
        const remain = config.lpdaDateInterval - diffSetonds;
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), `档案查询冷却中，${Math.floor(remain / 60)}分${remain % 60}秒后可以再次查询`]);
        return;
    }
    await ctx.database.set("wifeUser", { userId: session.userId, groupId: session.channelId.toString() }, { lpdaDate: new Date() });
    const groupId = session.channelId.toString();
    const allWives = await ctx.database.get("wifeData", {});
    if (wifeName) {
        const wife = allWives.find((item) => item.name === wifeName);
        if (!wife) {
            const possible = allWives.filter((item) => item.name.includes(wifeName)).map((item) => item.name);
            await send([(0, koishi_1.h)("quote", { id: session.messageId }), possible.length ? `没有找到精确老婆名。你可能想找：\n${possible.join("\n")}` : "老婆不存在"]);
            return;
        }
        await utils_1.default.createGroupWifeData(ctx, session, wife.name);
        const record = groupRecord(wife, groupId);
        const lines = [
            `群老婆档案：${wife.name}`,
            wife.comeFrom ? `来源：${wife.comeFrom}` : "来源：未记录",
            `本群抽取：${record.drawCount}`,
            `本群被牛：${record.ntrCount}`,
            `本群被牛走：${record.ntrFailCount}`,
            `本群离婚：${record.divorceCount}`,
            `本群互动次数：${record.fuckCount}`,
        ];
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), lines.join("\n"), wife.filepath ? koishi_1.h.image((0, url_1.pathToFileURL)(wife.filepath).href) : ""]);
        return;
    }
    const wivesInGroup = allWives.filter((wife) => wife.groupData?.some((item) => item.groupId === groupId));
    if (!wivesInGroup.length) {
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "本群还没有老婆档案"]);
        return;
    }
    const topBy = (field) => {
        const sorted = [...wivesInGroup].sort((a, b) => groupRecord(b, groupId)[field] - groupRecord(a, groupId)[field]);
        const best = sorted[0];
        const count = groupRecord(best, groupId)[field];
        return count > 0 ? `${best.name}（${count}）` : "暂无";
    };
    await send([(0, koishi_1.h)("quote", { id: session.messageId }), [
            "本群老婆榜单：",
            `抽取最多：${topBy("drawCount")}`,
            `被牛最多：${topBy("ntrCount")}`,
            `被牛走最多：${topBy("ntrFailCount")}`,
            `离婚最多：${topBy("divorceCount")}`,
            `互动最多：${topBy("fuckCount")}`,
        ].join("\n")]);
}
function lpda(ctx, config) {
    ctx.command("群老婆档案 [wifeName]", "查询指定老婆在当前群的统计；不填名称时显示本群老婆榜单").action(async ({ session }, wifeName) => {
        if (ctx.config.blockGroup.includes(session.channelId.toString()))
            return;
        await handleGroupWifeArchive(ctx, config, session, wifeName);
    });
}
