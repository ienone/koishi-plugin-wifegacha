import { Context, h } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import { addAffection, clearCurrentWife, normalizeWifeUser, syncCurrentAffection } from "../utils/affection";

export function lh(ctx: Context, config: Config) {
  ctx.command("离婚", "解除婚姻关系").action(async ({ session }) => {
    const send = createRecallSender(session, ctx, config, "divorce");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;
    if (!config.divorceSwitchgear) {
      await send([h("quote", { id: session.messageId }), "离婚功能未开启，请联系管理员"]);
      return;
    }
    if (config.divorceBlockGroup.includes(session.channelId.toString())) {
      await send([h("quote", { id: session.messageId }), "本群离婚功能已被禁用，请联系管理员"]);
      return;
    }

    await utils.createUserData(ctx, session);
    await utils.createGroupData(ctx, session);
    const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
    const userData = (await ctx.database.get("wifeUser", {
      userId: session.userId,
      groupId: session.channelId.toString(),
    }))[0];
    normalizeWifeUser(userData);

    if (!(await utils.isSameDay(ctx, new Date(), session))) {
      userData.operationDate = new Date();
      userData.divorceCount = 0;
      userData.ntrCount = 0;
      clearCurrentWife(userData);
    }

    const diffSeconds = Math.floor((Date.now() - userData.divorceDate.getTime()) / 1000);
    if (diffSeconds < config.divorceDateInterval) {
      const remain = config.divorceDateInterval - diffSeconds;
      await send([h("quote", { id: session.messageId }), `离婚冷却中，${Math.floor(remain / 60)}分${remain % 60}秒后可以再次离婚`]);
      return;
    }
    if (!userData.wifeName) {
      await send([h("quote", { id: session.messageId }), "你还没有老婆"]);
      return;
    }
    if (userData.divorceCount >= config.divorceLimit && userData.divorceCount > 0) {
      await send([h("quote", { id: session.messageId }), `你今天已经离婚 ${config.divorceLimit} 次了`]);
      return;
    }

    const wifeName = userData.wifeName;
    addAffection(userData, wifeName, -1, "divorce", "离婚");
    clearCurrentWife(userData);
    syncCurrentAffection(userData);
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
      await utils.createGroupWifeData(ctx, session, wifeName);
      const nextGroupWifeData = wifeData.groupData.map((item) => {
        if (item.groupId === session.channelId.toString()) item.divorceCount += 1;
        return item;
      });
      await ctx.database.set("wifeData", { name: wifeName }, { groupData: nextGroupWifeData });
    }

    await send([h("quote", { id: session.messageId }), `你和 ${wifeName} 离婚了\n${wifeName} 对你的好感度 -1`]);
  });
}