import { Context } from "koishi";
import type { Config } from "../config";


export interface WifeUser {
  id: number;
  // 用户ID
  userId: string;
  // 群号
  groupId: string;
  // 当前老婆名字
  wifeName: string;
  // 操作时间
  operationDate: Date;
  // 牛老婆使用次数
  ntrOrdinal: number;
  // 日老婆时间
  fuckWifeDate: Date;
  // 档案查询时间
  lpdaDate: Date;
  // 离婚时间
  divorceDate: Date;
  // 今日累计获得好感度
  // todayAffection: Array<{
  //   // 老婆名字
  //   wifeName: string;
  //   // 今日获得好感度
  //   todayAffection: number;
  // }>;
  // 老婆历史记录
  wifeHistories: Array<{
    // 老婆名字
    wifeName: string;
    // 抽到老婆时间
    getWifeDate: Date;
    // 抽到老婆次数
    getNum: number;
    // 是否通过牛老婆获得
    isNtr: boolean;
    // 牛到手次数
    ntrGetCount: number;
    // 交换到手次数
    exchangeGetCount: number;
    // 离婚次数
    divorceCount: number;
    // 老婆好感度
    affection: number;
    // 好感等级
    affectionLevel: number;
  }>;
  // 与其他用户交互统计
  interactionWithOtherUser: Array<{
    // 其他用户ID
    otherUserId: string;
    // 群号
    groupId: string;
    // 牛老婆次数
    ntrCount: number;
    // 牛老婆成功次数
    ntrSuccessCount: number;
    // 交换老婆次数
    exchangeCount: number;
  }>;
  // 创建时间
  createdAt: Date;
  // 牛老婆次数
  ntrCount: number;
  // 牛老婆总次数
  ntrTotalCount: number;
  // 牛老婆成功次数
  ntrSuccessCount: number;
  // 抽老婆次数
  drawCount: number;
  // 交换老婆次数
  exchangeCount: number;
  // 离婚次数
  divorceCount: number;
  // 老婆总好感度
  totalAffection: number;
  // 被牛次数
  targetNtrCount: number;
  // 被牛成功次数
  targetNtrSuccessCount: number;
}

declare module "koishi" {
  interface Tables {
    wifeUser: WifeUser;
  }
}


export function wifeUser(ctx: Context, config: Config) {
  // ctx.database.drop("wifeUser");
  ctx.model.extend("wifeUser", {
    id: "unsigned",
    userId: "string",
    groupId: "string",
    wifeName: "string",
    operationDate: "timestamp",
    ntrOrdinal: "integer",
    fuckWifeDate: "timestamp",
    lpdaDate: "timestamp",
    divorceDate: "timestamp",
    // todayAffection: "json",
    wifeHistories: "json",
    interactionWithOtherUser: "json",
    createdAt: "timestamp",
    ntrCount: "integer",
    ntrTotalCount: "integer",
    ntrSuccessCount: "integer",
    drawCount: "integer",
    exchangeCount: "integer",
    divorceCount: "integer",
    totalAffection: "integer",
    targetNtrCount: "integer",
    targetNtrSuccessCount: "integer",
  },{
    autoInc: true
  });
  ctx.logger.info('wifeUser 表初始化完成')
}
