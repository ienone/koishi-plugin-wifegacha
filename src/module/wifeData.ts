import { Context } from "koishi";
import type { Config } from "../config";

export interface WifeData {
  id: number;
  // 老婆名字
  name: string;
  // 来源
  comeFrom: string;
  // 老婆图片路径
  filepath: string;
  // 创建时间
  createdAt: Date;
  // 更新时间
  updatedAt: Date;
  // 当前群数据
  groupData: Array<{
    // 群号
    groupId: string;
    // 被娶次数
    drawCount: number;
    // 被牛次数
    ntrCount: number;
    // 被日次数
    fuckCount: number;
    // 离婚次数
    divorceCount: number;
    // 被牛走次数
    ntrFailCount: number;
  }>;
}

declare module "koishi" {
  interface Tables {
    wifeData: WifeData;
  }
}

export function wifeData(ctx: Context, config: Config) {
  // ctx.database.drop('wifeData')
  ctx.model.extend(
    "wifeData",
    {
      id: "unsigned",
      name: "string",
      comeFrom: "string",
      filepath: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      groupData: "json",
    },
    {
      autoInc: true,
    }
  );
  ctx.logger.info("wifeData 表初始化完成");
}
