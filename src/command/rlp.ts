import { Context, h } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import {
  addAffection,
  clearCurrentWife,
  formatAffectionLevel,
  normalizeWifeUser,
  persistWifeUser,
  randomAffectionEvent,
  rollAffectionDelta,
  settleAffectionDecay,
} from "../utils/affection";

function actionTitle(action: "fuck" | "kiss" | "date") {
  if (action === "kiss") return "亲老婆";
  if (action === "date") return "约会";
  return "日老婆";
}

function getSwitch(config: Config, action: "fuck" | "kiss" | "date") {
  if (action === "kiss") return config.kissWifeSwitchgear;
  if (action === "date") return config.dateWifeSwitchgear;
  return config.fuckWifeSwitchgear;
}

function getBlockGroups(config: Config, action: "fuck" | "kiss" | "date") {
  if (action === "kiss") return config.kissWifeBlockGroup;
  if (action === "date") return config.dateWifeBlockGroup;
  return config.fuckWifeBlockGroup;
}
function getCooldown(config: Config, action: "fuck" | "kiss" | "date") {
  if (action === "kiss") return config.kissWifeCoolingTime;
  if (action === "date") return config.dateWifeCoolingTime;
  return config.fuckWifeCoolingTime;
}

function getCooldownField(action: "fuck" | "kiss" | "date") {
  if (action === "kiss") return "kissWifeDate" as const;
  if (action === "date") return "dateWifeDate" as const;
  return "fuckWifeDate" as const;
}

async function handleAffection(ctx: Context, config: Config, session, action: "fuck" | "kiss" | "date") {
  const send = createRecallSender(session, ctx, config, "affection");
  if (ctx.config.blockGroup.includes(session.channelId.toString())) return;
  if (!getSwitch(config, action)) {
    await send([h("quote", { id: session.messageId }), `${actionTitle(action)} 功能未开启，请联系管理员`]);
    return;
  }
  if (getBlockGroups(config, action).includes(session.channelId.toString())) {
    await send([h("quote", { id: session.messageId }), `本群 ${actionTitle(action)} 功能已被禁用，请联系管理员`]);
    return;
  }

  await utils.createUserData(ctx, session);
  await utils.createGroupData(ctx, session);

  const userData = (await ctx.database.get("wifeUser", {
    userId: session.userId,
    groupId: session.channelId.toString(),
  }))[0];
  normalizeWifeUser(userData);
  settleAffectionDecay(userData);

  if (!userData.wifeName) {
    await persistWifeUser(ctx, userData);
    await send([h("quote", { id: session.messageId }), "你还没有老婆，先抽一个吧"]);
    return;
  }

  const cooldown = getCooldown(config, action);
  const cooldownField = getCooldownField(action);
  const last = userData[cooldownField] as Date;
  const diffSeconds = Math.floor((Date.now() - last.getTime()) / 1000);
  if (diffSeconds < cooldown) {
    const remain = cooldown - diffSeconds;
    await send([h("quote", { id: session.messageId }), `${actionTitle(action)}冷却中，剩余 ${Math.floor(remain / 60)}分${remain % 60}秒`]);
    return;
  }

  const wifeName = userData.wifeName;
  let delta = rollAffectionDelta(userData, wifeName, action);
  const event = randomAffectionEvent(action, delta);

  const catastrophic = Boolean(config.affectionCatastropheSwitchgear)
    && Math.random() * 100 < config.affectionCatastropheProbability;
  if (catastrophic) {
    delta = -(userData.currentWifeAffection ?? 0);
  }

  const history = addAffection(userData, wifeName, delta, action, event);
  userData[cooldownField] = new Date();

  if (catastrophic) {
    const banUntil = new Date(Date.now() + config.affectionCatastropheBanSeconds * 1000);
    userData.drawBanUntil = banUntil;
    clearCurrentWife(userData);
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
    await utils.createGroupWifeData(ctx, session, wifeName);
    const nextGroupData = wifeData.groupData.map((item) => {
      if (item.groupId === session.channelId.toString()) item.fuckCount += 1;
      return item;
    });
    await ctx.database.set("wifeData", { name: wifeName }, { groupData: nextGroupData });
  }

  if (catastrophic) {
    await send([
      h("quote", { id: session.messageId }),
      `${wifeName} 好感清零，并暂时离开了你。禁抽提示时长：${config.affectionCatastropheBanSeconds} 秒。`,
    ]);
    return;
  }

  await send([
    h("quote", { id: session.messageId }),
    `${wifeName} 好感度 ${delta >= 0 ? "+" : ""}${delta}\n事件：${event}\n当前好感度：${history.affection}\n好感等级：${formatAffectionLevel(history.affectionLevel)}`,
  ]);
}

export function rlp(ctx: Context, config: Config) {
  ctx.command("日老婆", "增加当前老婆好感度").action(async ({ session }) => handleAffection(ctx, config, session, "fuck"));
  ctx.command("亲老婆", "短冷却、低收益、低风险地增加好感度").action(async ({ session }) => handleAffection(ctx, config, session, "kiss"));
  ctx.command("亲亲", "亲老婆的别名").action(async ({ session }) => handleAffection(ctx, config, session, "kiss"));
  ctx.command("约会", "长冷却、高随机性的好感互动").action(async ({ session }) => handleAffection(ctx, config, session, "date"));
}