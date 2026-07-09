import { Context, h } from "koishi";
import crypto from "crypto";
import type { Config } from "../config";
import sprit from "../utils/sprit";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

function parseAt(input?: string) {
  return input?.match(/<at id="(\d+)"\s*\/>/)?.[1];
}

function hash(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 20);
}

export function lptj(ctx: Context, config: Config) {
  ctx.command("老婆图鉴 [targetUserId]", "查看自己或被 @ 群友在当前群的老婆收集图鉴").action(async ({ session }, targetUserId) => {
    const send = createRecallSender(session, ctx, config, "album");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;

    const targetId = parseAt(session.content) ?? parseAt(targetUserId) ?? session.userId;
    await utils.createUserData(ctx, session);
    if (targetId !== session.userId) await utils.createTarget(ctx, session, targetId);

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

    const imageBuffer = await sprit.generateMixedBackgroundImage(ctx, config, tolletted, { cacheKey });
    await send([
      h("quote", { id: session.messageId }),
      "你的老婆图鉴已出炉",
      h.image(imageBuffer, "image/jpeg"),
      `老婆收集进度：${tolletted.length}/${wifeData.length}`,
    ]);
  });
}
