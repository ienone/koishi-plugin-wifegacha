import { Context, Session } from "koishi";
import { isSameDay } from "./isSameDay";
let wifeNameArray = new Map<string, object>();

/**
 * 检查 group 是否当天重复，并根据情况执行不同逻辑
 * @param {Map} dataMap - 存储数据的 Map 对象
 * @param {string} group - 群号或键名
 * @param {Date} inputTime - 当前时间
 * @param {Session} session - 会话对象
 */
export async function checkGroupDate(
  ctx: Context,
  group: string,
  inputTime: Date,
  session: Session
) {
  // 检查 map 中是否存在该 group
  if (!wifeNameArray.has(group)) {
    wifeNameArray.set(group, {
      wifeName: (await ctx.database.get("wifeData", {})).map(
        (item) => item.name
      ),
    });
  }

  const userData = (
    await ctx.database.get("wifeUser", {
      userId: session.userId,
      groupId: session.channelId.toString(),
    })
  )[0];

  // 判断是否为同一天
  if (await isSameDay(ctx, inputTime, session)) {
    if (userData.wifeName) {
      return null;
    }

    // 同一天执行逻辑2
    if (wifeNameArray.get(group)["wifeName"].length === 0) {
      return null; // 空数组直接返回 null
    }

    // 随机生成一个索引
    // 这里的随机索引应该基于最新的 wifeName 数组长度
    const wifeNames = wifeNameArray.get(group)["wifeName"];
    const index = Math.floor(Math.random() * wifeNames.length);

    // 使用 splice 移除并返回该元素（splice 返回数组）
    const [removed] = wifeNameArray.get(group)["wifeName"].splice(index, 1);
    return removed;
  } else {
    ctx.database.set(
      "wifeUser",
      { userId: session.userId, groupId: session.channelId.toString() },
      { operationDate: new Date(),
        ntrCount:0,
        divorceCount:0,
        wifeName:'',
        currentWifeAffection: 0,
        // todayAffection:[],
       }
    );
    const nowWifeList = (await ctx.database.get("wifeUser", {groupId: session.channelId.toString()})).map(item=>{
      if(item.wifeName!=''){
        return item.wifeName
      }
      return null
    }).filter(Boolean);

    wifeNameArray.get(group)["wifeName"] = (
      await ctx.database.get("wifeData", {})
    ).map((item) => {
      if(item.name && !nowWifeList.includes(item.name)){
        return item.name;
      }
      return null;
    }).filter(Boolean);
    return checkGroupDate(ctx, group, inputTime, session);
  }
}
