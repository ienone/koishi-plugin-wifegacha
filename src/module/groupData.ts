import { Context } from "koishi";
import type { Config } from "../config";

export interface GroupData {
  id: number;
  // 群号
  groupId: string;
  // 抽老婆总次数
  drawCount: number;
  // 牛老婆总次数
  ntrTotalCount: number;
  // 牛成功次数
  ntrSuccessCount: number;
  // 交换老婆总次数
  exchangeCount: number;
  // 离婚总次数
  divorceTotalCount: number;
  // 日老婆总次数
  fuckTotalCount: number;
}

declare module "koishi" {
  interface Tables {
    groupData: GroupData;
  }
}

export function groupData(ctx: Context, config: Config) {
  // ctx.database.drop('groupData')
  ctx.model.extend('groupData', {
    id: 'unsigned',
    groupId: 'string',
    drawCount: 'integer',
    ntrTotalCount: 'integer',
    ntrSuccessCount: 'integer',
    exchangeCount: 'integer',
    divorceTotalCount: 'integer',
    fuckTotalCount: 'integer',
  },{
    autoInc: true
  })
  ctx.logger.info('groupData 表初始化完成')
}
