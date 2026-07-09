"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rlp = rlp;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
const affection_1 = require("../utils/affection");
const affectionEvents_1 = require("../utils/affectionEvents");
function actionTitle(action) {
    if (action === "kiss")
        return "亲老婆";
    if (action === "date")
        return "约会";
    return "日老婆";
}
function getSwitch(config, action) {
    if (action === "kiss")
        return config.kissWifeSwitchgear;
    if (action === "date")
        return config.dateWifeSwitchgear;
    return config.fuckWifeSwitchgear;
}
function getBlockGroups(config, action) {
    if (action === "kiss")
        return config.kissWifeBlockGroup;
    if (action === "date")
        return config.dateWifeBlockGroup;
    return config.fuckWifeBlockGroup;
}
function getCooldown(config, action) {
    if (action === "kiss")
        return config.kissWifeCoolingTime;
    if (action === "date")
        return config.dateWifeCoolingTime;
    return config.fuckWifeCoolingTime;
}
function getCooldownField(action) {
    if (action === "kiss")
        return "kissWifeDate";
    if (action === "date")
        return "dateWifeDate";
    return "fuckWifeDate";
}
async function handleAffection(ctx, config, session, action) {
    const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "affection");
    if (ctx.config.blockGroup.includes(session.channelId.toString()))
        return;
    if (!getSwitch(config, action)) {
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), `${actionTitle(action)} 功能未开启，请联系管理员`]);
        return;
    }
    if (getBlockGroups(config, action).includes(session.channelId.toString())) {
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), `本群 ${actionTitle(action)} 功能已被禁用，请联系管理员`]);
        return;
    }
    await utils_1.default.createUserData(ctx, session);
    await utils_1.default.createGroupData(ctx, session);
    const userData = (await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
    }))[0];
    (0, affection_1.normalizeWifeUser)(userData);
    const decayChanged = (0, affection_1.settleAffectionDecay)(userData);
    if (!userData.wifeName) {
        await (0, affection_1.persistWifeUser)(ctx, userData);
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), "你还没有老婆，先抽一个吧"]);
        return;
    }
    const cooldown = getCooldown(config, action);
    const cooldownField = getCooldownField(action);
    const last = userData[cooldownField];
    const diffSeconds = Math.floor((Date.now() - last.getTime()) / 1000);
    if (diffSeconds < cooldown) {
        if (decayChanged)
            await (0, affection_1.persistWifeUser)(ctx, userData);
        const remain = cooldown - diffSeconds;
        await send([(0, koishi_1.h)("quote", { id: session.messageId }), `${actionTitle(action)}冷却中，剩余 ${Math.floor(remain / 60)}分${remain % 60}秒`]);
        return;
    }
    const wifeName = userData.wifeName;
    let delta = (0, affection_1.rollAffectionDelta)(userData, wifeName, action);
    const rolledEvent = (0, affectionEvents_1.rollAffectionEvent)(config, action, delta);
    delta = rolledEvent.delta;
    const event = rolledEvent.message;
    const eventLine = rolledEvent.applied ? `\n事件：${event}` : "";
    const legacyCatastrophe = Boolean(config.affectionCatastropheSwitchgear)
        && Math.random() * 100 < config.affectionCatastropheProbability;
    const eventClearsAffection = Boolean(rolledEvent.effects.clearAffection);
    const eventLosesWife = Boolean(rolledEvent.effects.loseCurrentWife);
    const catastrophic = legacyCatastrophe || eventClearsAffection || eventLosesWife;
    if (catastrophic) {
        delta = -(userData.currentWifeAffection ?? 0);
    }
    const history = (0, affection_1.addAffection)(userData, wifeName, delta, action, event);
    userData[cooldownField] = new Date();
    if (legacyCatastrophe || eventLosesWife) {
        const banSeconds = rolledEvent.effects.drawBanSeconds || config.affectionCatastropheBanSeconds;
        const banUntil = new Date(Date.now() + banSeconds * 1000);
        userData.drawBanUntil = banUntil;
        (0, affection_1.clearCurrentWife)(userData);
    }
    await ctx.database.set("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
    }, {
        wifeName: userData.wifeName,
        wifeHistories: userData.wifeHistories,
        currentWifeAffection: userData.currentWifeAffection,
        maxAffection: userData.maxAffection,
        totalAffection: userData.totalAffection,
        affectionDecayDate: userData.affectionDecayDate,
        drawBanUntil: userData.drawBanUntil,
        [cooldownField]: userData[cooldownField],
    });
    const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
    await ctx.database.set("groupData", { groupId: session.channelId.toString() }, {
        fuckTotalCount: groupData.fuckTotalCount + 1,
    });
    const wifeData = (await ctx.database.get("wifeData", { name: wifeName }))[0];
    if (wifeData) {
        await utils_1.default.createGroupWifeData(ctx, session, wifeName);
        const nextGroupData = wifeData.groupData.map((item) => {
            if (item.groupId === session.channelId.toString())
                item.fuckCount += 1;
            return item;
        });
        await ctx.database.set("wifeData", { name: wifeName }, { groupData: nextGroupData });
    }
    if (catastrophic) {
        const banSeconds = rolledEvent.effects.drawBanSeconds || config.affectionCatastropheBanSeconds;
        const eventText = rolledEvent.applied ? event : "发生了极低概率好感重事件。";
        await send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            `${eventText}\n${wifeName} 好感清零${legacyCatastrophe || eventLosesWife ? "，并暂时离开了你" : ""}。禁抽提示时长：${legacyCatastrophe || eventLosesWife ? `${banSeconds} 秒` : "无"}。`,
        ]);
        return;
    }
    await send([
        (0, koishi_1.h)("quote", { id: session.messageId }),
        `${wifeName} 好感度 ${delta >= 0 ? "+" : ""}${delta}${eventLine}\n当前好感度：${history.affection}\n好感等级：${(0, affection_1.formatAffectionLevel)(history.affectionLevel)}`,
    ]);
}
function rlp(ctx, config) {
    ctx.command("日老婆", "增加当前老婆好感度").action(async ({ session }) => handleAffection(ctx, config, session, "fuck"));
    ctx.command("亲老婆", "短冷却、低收益、低风险地增加好感度").action(async ({ session }) => handleAffection(ctx, config, session, "kiss"));
    ctx.command("亲亲", "亲老婆的别名").action(async ({ session }) => handleAffection(ctx, config, session, "kiss"));
    ctx.command("约会", "长冷却、高随机性的好感互动").action(async ({ session }) => handleAffection(ctx, config, session, "date"));
}
