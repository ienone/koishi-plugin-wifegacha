import { Context, h } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import { calculateNtrProbability, clearCurrentWife, ensureWifeHistory, normalizeWifeUser, setCurrentWife, syncCurrentAffection } from "../utils/affection";

function parseAt(input?: string) {
  return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}

export function nlp(ctx: Context, config: Config) {
  ctx.command("牛老婆 [userId]", "尝试牛走被 @ 群友的当前老婆").action(async ({ session }, userId) => {
    const send = createRecallSender(session, ctx, config, "ntr");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;
    if (!config.ntrSwitchgear) {
      await send([h("quote", { id: session.messageId }), "牛老婆功能未开启，请联系管理员"]);
      return;
    }
    if (config.ntrBlockGroup.includes(session.channelId.toString())) {
      await send([h("quote", { id: session.messageId }), "本群牛老婆功能已被禁用，请联系管理员"]);
      return;
    }

    const targetId = parseAt(session.content) ?? parseAt(userId);
    if (!targetId) {
      await send([h("quote", { id: session.messageId }), "请 @ 要牛的群友"]);
      return;
    }
    if (targetId === session.userId) {
      await send([h("quote", { id: session.messageId }), "不能牛自己的老婆"]);
      return;
    }

    await utils.createUserData(ctx, session);
    await utils.createTarget(ctx, session, targetId);
    await utils.createInteraction(ctx, session, targetId);
    await utils.createGroupData(ctx, session);

    const myUserData = (await ctx.database.get("wifeUser", {
      userId: session.userId,
      groupId: session.channelId.toString(),
    }))[0];
    const targetUserData = (await ctx.database.get("wifeUser", {
      userId: targetId,
      groupId: session.channelId.toString(),
    }))[0];
    normalizeWifeUser(myUserData);
    normalizeWifeUser(targetUserData);

    if (!(await utils.isSameDay(ctx, new Date(), session))) {
      myUserData.operationDate = new Date();
      myUserData.ntrCount = 0;
      myUserData.divorceCount = 0;
      clearCurrentWife(myUserData);
    }

    if (myUserData.ntrCount >= config.ntrOrdinal && myUserData.ntrCount > 0) {
      await send([h("quote", { id: session.messageId }), "你今天已经没有牛老婆机会了"]);
      return;
    }
    if (!targetUserData.wifeName) {
      await send([h("quote", { id: session.messageId }), "对方还没有老婆"]);
      return;
    }

    const wifeName = targetUserData.wifeName;
    const probability = calculateNtrProbability(myUserData, targetUserData, wifeName);
    const success = Math.random() * 100 < probability;
    const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
    const wifeData = (await ctx.database.get("wifeData", { name: wifeName }))[0];

    myUserData.ntrCount += 1;
    myUserData.ntrTotalCount += 1;
    targetUserData.targetNtrCount += 1;
    for (const item of myUserData.interactionWithOtherUser) {
      if (item.otherUserId === targetId && item.groupId === session.channelId.toString()) item.ntrCount += 1;
    }

    await ctx.database.set("groupData", { groupId: session.channelId.toString() }, {
      ntrTotalCount: groupData.ntrTotalCount + 1,
      ntrSuccessCount: success ? groupData.ntrSuccessCount + 1 : groupData.ntrSuccessCount,
    });

    if (wifeData) {
      await utils.createGroupWifeData(ctx, session, wifeName);
      const nextGroupWifeData = wifeData.groupData.map((item) => {
        if (item.groupId === session.channelId.toString()) {
          item.ntrCount += 1;
          if (success) item.ntrFailCount += 1;
        }
        return item;
      });
      await ctx.database.set("wifeData", { name: wifeName }, { groupData: nextGroupWifeData });
    }

    if (success) {
      const history = ensureWifeHistory(myUserData, wifeName, { isNtr: true });
      history.ntrGetCount += 1;
      history.isNtr = true;
      myUserData.ntrSuccessCount += 1;
      setCurrentWife(myUserData, wifeName);
      targetUserData.targetNtrSuccessCount += 1;
      clearCurrentWife(targetUserData);
      for (const item of myUserData.interactionWithOtherUser) {
        if (item.otherUserId === targetId && item.groupId === session.channelId.toString()) item.ntrSuccessCount += 1;
      }
    }

    syncCurrentAffection(myUserData);
    syncCurrentAffection(targetUserData);
    await ctx.database.set("wifeUser", { userId: session.userId, groupId: session.channelId.toString() }, {
      wifeName: myUserData.wifeName,
      ntrCount: myUserData.ntrCount,
      ntrTotalCount: myUserData.ntrTotalCount,
      ntrSuccessCount: myUserData.ntrSuccessCount,
      wifeHistories: myUserData.wifeHistories,
      interactionWithOtherUser: myUserData.interactionWithOtherUser,
      currentWifeAffection: myUserData.currentWifeAffection,
      maxAffection: myUserData.maxAffection,
      totalAffection: myUserData.totalAffection,
    });
    await ctx.database.set("wifeUser", { userId: targetId, groupId: session.channelId.toString() }, {
      wifeName: targetUserData.wifeName,
      targetNtrCount: targetUserData.targetNtrCount,
      targetNtrSuccessCount: targetUserData.targetNtrSuccessCount,
      wifeHistories: targetUserData.wifeHistories,
      currentWifeAffection: targetUserData.currentWifeAffection,
      maxAffection: targetUserData.maxAffection,
      totalAffection: targetUserData.totalAffection,
    });

    if (success) {
      await send([h("quote", { id: session.messageId }), `牛老婆成功！${wifeName} 现在是你的老婆了。\n当前成功率：${probability.toFixed(2)}%`]);
    } else {
      await send([h("quote", { id: session.messageId }), `牛老婆失败。你还剩 ${Math.max(0, config.ntrOrdinal - myUserData.ntrCount)} 次机会。\n当前成功率：${probability.toFixed(2)}%`]);
    }
  });
}
