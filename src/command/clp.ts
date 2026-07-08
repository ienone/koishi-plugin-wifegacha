import { Context, h } from "koishi";
import { pathToFileURL } from "url";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
import { ensureWifeHistory, normalizeWifeUser, setCurrentWife, syncCurrentAffection } from "../utils/affection";

export function clp(ctx: Context, config: Config) {
  ctx.command("抽老婆", "抽一个老婆").action(async ({ session }) => {
    const send = createRecallSender(session, ctx, config, "draw");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) return;

    await utils.createUserData(ctx, session);
    await utils.createGroupData(ctx, session);

    const userData = (await ctx.database.get("wifeUser", {
      userId: session.userId,
      groupId: session.channelId.toString(),
    }))[0];
    normalizeWifeUser(userData);

    if (userData.drawBanUntil && userData.drawBanUntil.getTime() > Date.now()) {
      const remain = Math.ceil((userData.drawBanUntil.getTime() - Date.now()) / 1000);
      await send([h("quote", { id: session.messageId }), `暂时不能抽老婆，剩余 ${Math.floor(remain / 60)}分${remain % 60}秒`]);
      return;
    }

    const groupData = (await ctx.database.get("groupData", { groupId: session.channelId.toString() }))[0];
    const wifeName = await utils.checkGroupDate(ctx, session.channelId.toString(), new Date(), session);

    if (!wifeName) {
      if (userData.wifeName) {
        const wife = (await ctx.database.get("wifeData", { name: userData.wifeName }))[0];
        await send([
          h("quote", { id: session.messageId }),
          `你今天的老婆是 ${userData.wifeName}${wife?.comeFrom ? `，来自「${wife.comeFrom}」` : ""}`,
          wife?.filepath ? h.image(pathToFileURL(wife.filepath).href) : "",
        ]);
      } else {
        await ctx.database.set("groupData", { groupId: session.channelId.toString() }, { drawCount: groupData.drawCount + 1 });
        await send([h("quote", { id: session.messageId }), "遗憾，老婆都被娶走了……"]);
      }
      return;
    }

    await ctx.database.set("groupData", { groupId: session.channelId.toString() }, { drawCount: groupData.drawCount + 1 });
    await utils.createGroupWifeData(ctx, session, wifeName);
    const wife = (await ctx.database.get("wifeData", { name: wifeName }))[0];
    if (wife) {
      const groupWifeData = wife.groupData.map((item) => {
        if (item.groupId === session.channelId.toString()) item.drawCount += 1;
        return item;
      });
      await ctx.database.set("wifeData", { name: wifeName }, { groupData: groupWifeData });
    }

    const existed = Boolean(userData.wifeHistories.find((item) => item.wifeName === wifeName));
    const history = ensureWifeHistory(userData, wifeName, { getNum: 0, isNtr: false });
    history.getNum += 1;
    history.isNtr = false;
    setCurrentWife(userData, wifeName);
    syncCurrentAffection(userData);

    await ctx.database.set("wifeUser", {
      userId: session.userId,
      groupId: session.channelId.toString(),
    }, {
      wifeName,
      drawCount: userData.drawCount + 1,
      wifeHistories: userData.wifeHistories,
      currentWifeAffection: userData.currentWifeAffection,
      maxAffection: userData.maxAffection,
      totalAffection: userData.totalAffection,
    });

    await send([
      h("quote", { id: session.messageId }),
      `${existed ? "重复了。" : "出新了！"}\n你今天抽到的老婆是 ${wifeName}${wife?.comeFrom ? `\n来自「${wife.comeFrom}」` : ""}`,
      wife?.filepath ? h.image(pathToFileURL(wife.filepath).href) : "",
    ]);
  });
}