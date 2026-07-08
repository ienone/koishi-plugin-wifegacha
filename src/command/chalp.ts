import { Context, h } from "koishi";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import { findWifeHistory, formatAffectionLevel, formatCooldown, normalizeWifeUser, persistWifeUser, settleAffectionDecay } from "../utils/affection";

function parseAt(input?: string) {
  return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}

export function chalp(ctx: Context, config: Config) {
  ctx.command("查老婆 [userId]", "查看自己或被 @ 群友的当前老婆、来源、好感度和冷却信息").action(async ({ session }, userId) => {
    const send = createRecallSender(session, ctx, config, "query");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;

    const targetId = parseAt(userId) ?? session.userId;
    if (targetId === session.userId) await utils.createUserData(ctx, session);
    else await utils.createTarget(ctx, session, targetId);

    const userData = (await ctx.database.get("wifeUser", {
      userId: targetId,
      groupId: session.channelId.toString(),
    }))[0];
    normalizeWifeUser(userData);
    settleAffectionDecay(userData);
    await persistWifeUser(ctx, userData);

    if (!userData.wifeName) {
      await send([h("quote", { id: session.messageId }), targetId === session.userId ? "你还没有老婆，快去抽一个吧" : "对方还没有老婆"]);
      return;
    }

    const wife = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0];
    const history = findWifeHistory(userData, userData.wifeName);
    const owner = targetId === session.userId ? "你的" : "对方的";
    const lines = [
      `${owner}老婆：${userData.wifeName}`,
      wife?.comeFrom ? `来源：${wife.comeFrom}` : "来源：未记录",
      `当前好感度：${history?.affection ?? userData.currentWifeAffection ?? 0}`,
      `好感等级：${formatAffectionLevel(history?.affectionLevel ?? 0)}`,
      "冷却剩余：",
      `- 日老婆：${formatCooldown(userData.fuckWifeDate, config.fuckWifeCoolingTime)}`,
      `- 亲老婆/亲亲：${formatCooldown(userData.kissWifeDate, config.kissWifeCoolingTime)}`,
      `- 约会：${formatCooldown(userData.dateWifeDate, config.dateWifeCoolingTime)}`,
      `- 离婚：${formatCooldown(userData.divorceDate, config.divorceDateInterval)}`,
      `- 档案查询：${formatCooldown(userData.lpdaDate, config.lpdaDateInterval)}`,
    ];

    const payload: any[] = [h("quote", { id: session.messageId }), lines.join("\n")];
    if (wife?.filepath) payload.push(h.image(pathToFileURL(wife.filepath).href));
    await send(payload);
  });
}
