import { Context, h } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function gxlpsj(ctx: Context, config: Config) {
  ctx.command("更新老婆数据", "管理员同步资源目录到 wifeData，并刷新缩略图与图鉴缓存").action(async ({ session }) => {
        const send = createRecallSender(session, ctx, config, "sync");
    if(session.userId !== config.adminId){
      return
    }
    await utils.upWifeData(ctx, config);
    send([h("quote", { id: session.messageId }), "更新老婆数据完成"]);
  });
}
