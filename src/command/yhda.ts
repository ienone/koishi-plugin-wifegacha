import { Context, h } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import { findWifeHistory, formatAffectionLevel, normalizeWifeUser, persistWifeUser, settleAffectionDecay } from "../utils/affection";

function parseAt(input?: string) {
  return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}

async function sendUserArchive(ctx: Context, config: Config, session, userId?: string) {
  const send = createRecallSender(session, ctx, config, "userArchive");
  const targetId = parseAt(userId) ?? session.userId;
  if (targetId === session.userId) await utils.createUserData(ctx, session);
  else await utils.createTarget(ctx, session, targetId);

  const user = (await ctx.database.get("wifeUser", {
    userId: targetId,
    groupId: session.channelId.toString(),
  }))[0];
  normalizeWifeUser(user);
  settleAffectionDecay(user);
  await persistWifeUser(ctx, user);

  const wifeCount = (await ctx.database.get("wifeData", {})).length;
  const current = user.wifeName ? findWifeHistory(user, user.wifeName) : undefined;
  const successRate = user.ntrTotalCount > 0 ? `${Math.floor((user.ntrSuccessCount / user.ntrTotalCount) * 100)}%` : "0%";
  const owner = targetId === session.userId ? "个人档案" : "目标用户档案";

  await send([h("quote", { id: session.messageId }), [
    `${owner}：`,
    `老婆收集进度：${user.wifeHistories.length}/${wifeCount}`,
    `当前老婆：${user.wifeName || "无"}`,
    `当前好感度：${current?.affection ?? 0}`,
    `好感等级：${formatAffectionLevel(current?.affectionLevel ?? 0)}`,
    `最高好感度：${user.maxAffection ?? 0}`,
    `抽取次数：${user.drawCount ?? 0}`,
    `离婚次数：${user.divorceCount ?? 0}`,
    `交换次数：${user.exchangeCount ?? 0}`,
    `牛老婆次数：${user.ntrTotalCount ?? 0}`,
    `牛老婆成功率：${successRate}`,
    `被牛次数：${user.targetNtrCount ?? 0}`,
    `被牛成功次数：${user.targetNtrSuccessCount ?? 0}`,
    `总好感度：${user.totalAffection ?? 0}`,
  ].join("\n")]);
}

async function sendGroupArchive(ctx: Context, config: Config, session) {
  const send = createRecallSender(session, ctx, config, "userArchive");
  await utils.createGroupData(ctx, session);
  const group = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
  const successRate = group.ntrTotalCount > 0 ? `${Math.floor((group.ntrSuccessCount / group.ntrTotalCount) * 100)}%` : "0%";
  await send([h("quote", { id: session.messageId }), [
    "群档案：",
    `群总抽取：${group.drawCount ?? 0}`,
    `总牛：${group.ntrTotalCount ?? 0}`,
    `牛成功率：${successRate}`,
    `总离婚：${group.divorceTotalCount ?? 0}`,
    `总交换：${group.exchangeCount ?? 0}`,
    `总互动次数：${group.fuckTotalCount ?? 0}`,
  ].join("\n")]);
}

export function yhda(ctx: Context, config: Config) {
  ctx.command("用户档案 [userId]", "查看自己或被 @ 群友在当前群的个人老婆档案").action(async ({ session }, userId) => {
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;
    await sendUserArchive(ctx, config, session, userId);
  });

  ctx.command("群档案", "查看当前群的抽取、牛老婆、离婚、交换、互动聚合统计").action(async ({ session }) => {
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;
    await sendGroupArchive(ctx, config, session);
  });
}
