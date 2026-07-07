import { Context, h, Session } from "koishi";
import type { Config } from "../config";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

// 交换老婆函数
async function exchangeWife(ctx: Context,session: Session, myId: string, userId: string) {
  // ctx.logger.info("myId",myId,"userId",userId)
  // 获取用户数据
  let userData = (
    await ctx.database.get("wifeUser", {
      userId: myId,
      groupId: session.channelId.toString(),
    })
  )[0];
  // 获取目标用户数据
  let targetUserData = (
    await ctx.database.get("wifeUser", {
      userId: userId,
      groupId: session.channelId.toString(),
    })
  )[0];
  // 获取群数据
  const groupData = (
    await ctx.database.get("groupData", {
      groupId: session.channelId.toString(),
    })
  )[0];
  const myWifeName = userData.wifeName;
  const targetWifeName = targetUserData.wifeName;
  // ctx.logger.info('交换前','本人老婆：',myWifeName,'目标老婆：',targetWifeName)
  // 更新群数据
  ctx.database.set("groupData", {
    groupId: session.channelId.toString(),
  },
{
  exchangeCount: groupData.exchangeCount + 1,
});
  let found = false;
  // 更新用户的数据
  userData.wifeHistories.forEach((item) => {
    if (item.wifeName === targetWifeName) {
      // 找到则更新抽到次数，并设置为非牛老婆
      item.getNum += 1;
      item.isNtr = false;
      found = true;
    } else {
      // 没找到则不更新
      item;
    }
  });
  // 如果没有找到，说明是第一次抽到，新增一条记录
  if (!found) {
    // 新增一条记录
    userData.wifeHistories.push({
      wifeName: targetWifeName,
      getWifeDate: new Date(),
      getNum: 1,
      isNtr: false,
      ntrGetCount: 0,
      exchangeGetCount: 0,
      divorceCount: 0,
      affection: 0,
      affectionLevel: 0,
    });
  }
  // 更新用户的数据
  ctx.database.set(
    "wifeUser",
    { userId: myId, groupId: session.channelId.toString() },
    {
      wifeHistories: userData.wifeHistories,
      wifeName: targetWifeName,
      exchangeCount: userData.exchangeCount + 1,
    }
  );
  // 更新目标用户的数据
  found = false;
  targetUserData.wifeHistories.forEach((item) => {
    if (item.wifeName === myWifeName) {
      // 找到则更新抽到次数，并设置为非牛老婆
      item.getNum += 1;
      item.isNtr = false;
      found = true;
    } else {
      // 没找到则不更新
      item;
    }
  });
  // 如果没有找到，说明是第一次抽到，新增一条记录
  if (!found) {
    // 新增一条记录
    targetUserData.wifeHistories.push({
      wifeName: myWifeName,
      getWifeDate: new Date(),
      getNum: 1,
      isNtr: false,
      ntrGetCount: 0,
      exchangeGetCount: 0,
      divorceCount: 0,
      affection: 0,
      affectionLevel: 0,
    });
  }
  // 更新目标用户的数据
  ctx.database.set(
    "wifeUser",
    { userId: userId, groupId: session.channelId.toString() },
    {
      wifeHistories: targetUserData.wifeHistories,
      wifeName: myWifeName,
      exchangeCount: targetUserData.exchangeCount + 1,
    }
  );
  // 更新目标用户与当前用户交互数据
  ctx.database.set("wifeUser", { userId: myId, groupId: session.channelId.toString() }, {
    interactionWithOtherUser: userData.interactionWithOtherUser.map(item => {
      if(item.otherUserId === userId && item.groupId === session.channelId.toString()){
        item.exchangeCount += 1;
      }
      return item;
    }),
  });
  ctx.database.set("wifeUser", { userId: userId, groupId: session.channelId.toString() }, {
    interactionWithOtherUser: targetUserData.interactionWithOtherUser.map(item => {
      if(item.otherUserId === myId && item.groupId === session.channelId.toString()){
        item.exchangeCount += 1;
      }
      return item;
    }),
  });
}

export function jhlp(ctx: Context, config: Config) {
  ctx.command("交换老婆 <userId> 和指定群友交换老婆").action(async ({ session }, userId) => {
    const send = createRecallSender(session, ctx, config, "exchange");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) {
      return;
    }
    userId = session.content.match(/<at id="(\d+)"\s*\/>/)?.[1];
    const myId = session.userId;
    // 创建用户数据
    await utils.createUserData(ctx, session);
    // 创建目标用户与当前用户交互数据
    await utils.createInteraction(ctx, session, userId);
    // 创建群数据
    await utils.createGroupData(ctx, session);
    // 创建目标用户数据
    await utils.createTarget(ctx, session, userId);
    // 检查是否@了群友
    const messageId = session.messageId;
    if (!userId) {
      send([h("quote", { id: messageId }), "请@要交换的群友"]);
      return;
    }
    // 获取用户数据
  let userData = (
    await ctx.database.get("wifeUser", {
      userId: myId,
      groupId: session.channelId.toString(),
    })
  )[0];
  // 获取目标用户数据
  let targetUserData = (
    await ctx.database.get("wifeUser", {
      userId: userId,
      groupId: session.channelId.toString(),
    })
  )[0];

  if(userData.wifeName === ''){
    send([h("quote", { id: messageId }), "你还没有老婆，不能发起交换请求"]);
    return;
  }
  if(targetUserData.wifeName === ''){
    send([h("quote", { id: messageId }), "对方还没有老婆，不能发起交换请求"]);
    return;
  }
    send([h('at', { id: userId }),
      `${session.author.name} 想和你交换老婆，请在30秒内回复“同意”或“拒绝”`
    ])
    // 等待30秒，启动一个定时器
    // ctx.logger.info('启动监听器')
    const message = ctx.on("message", async (session2) => {
      if (session2.content === "同意" && session2.userId === userId) {
        const send2 = createRecallSender(session2, ctx, config, "exchange");
        await exchangeWife(ctx, session2,myId, userId);
        message();
        // ctx.logger.info(message?'监听器已关闭':'监听器未关闭');
        clearTimeout(timer);
        // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
        send2([h("quote", { id: messageId }), "对方同意了你的交换请求"]);
      } else if (session2.content === "拒绝" && session2.userId === userId) {
        const send2 = createRecallSender(session2, ctx, config, "exchange");
        send2([h("quote", { id: messageId }), "对方拒绝了你的交换请求"]);
        message();
        // ctx.logger.info(message?'监听器已关闭':'监听器未关闭');
        clearTimeout(timer);
        // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
      }
    })
    const timer = setTimeout(() => {
      message();
      // ctx.logger.info(timer?'定时器已关闭':'定时器未关闭');
      clearTimeout(timer);
      send([h("quote", { id: messageId }), "对方没有回复，请求已失效"]);
    }, 30000);
  })
}
