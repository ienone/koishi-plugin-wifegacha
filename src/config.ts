import { Schema } from "koishi";
import type { MessageRecallSettings } from "./utils/messageRecall";

export interface Config {
  // 屏蔽的群组
  blockGroup: string[];
  // 牛老婆次数
  ntrOrdinal: number;
  // 牛老婆成功率计算方式
  probabilityMath: number;
  // 直接概率
  probabilityMathDirect: number;
  // 牛老婆总开关
  ntrSwitchgear: boolean;
  // 牛老婆屏蔽群组
  ntrBlockGroup: string[];
  // 图鉴收集是否包含牛老婆
  illustratedBook: boolean;
  // 离婚次数限制
  divorceLimit: number;
  // 离婚总开关
  divorceSwitchgear: boolean;
  // 离婚屏蔽群组
  divorceBlockGroup: string[];
  // 日老婆冷却时间
  fuckWifeCoolingTime: number;
  // 日老婆总开关
  fuckWifeSwitchgear: boolean;
  // 详细回复
  fuckWifeDetailedReply: boolean;
  // 语音回复
  fuckWifeVoiceReply: boolean;
  // 日老婆屏蔽群组
  fuckWifeBlockGroup: string[];
  // 老婆名称来源分隔符
  wifeNameSeparator: string;
  // 允许所有老婆操作权限的用户组
  wifeAllOperationGroup: string[];
  // 仅允许上传老婆权限的用户组
  wifeUploadGroup: string[];
  // 仅允许更新老婆权限的用户组
  wifeUpdateGroup: string[];
  // 仅允许删除老婆权限的用户组
  wifeDeleteGroup: string[];
  // 管理员ID
  adminId: string;
  // 老婆图鉴质量
  wifeImageQuality: number;
  // 档案查询时间间隔
  lpdaDateInterval: number;
  // 离婚时间间隔
  divorceDateInterval: number;
  // 消息撤回设置
  messageRecall: MessageRecallSettings;
}

export const ConfigSchema: Schema<Config> = Schema.intersect([
  Schema.object({
    wifeNameSeparator: Schema.string()
      .default("+")
      .description("老婆'名称' '来源'分隔符"),
    adminId: Schema.string().required().description("管理员ID"),
    wifeImageQuality: Schema.number()
      .default(75)
      .min(50)
      .max(100)
      .step(1)
      .role("slider")
      .description("老婆图鉴质量(50-100)"),
    lpdaDateInterval: Schema.number()
      .default(10)
      .description("档案查询时间间隔(秒)"),
    blockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("屏蔽的群组"),
  }).description("基础设置"),
  Schema.object({
    ntrOrdinal: Schema.number().default(5).description("牛老婆次数"),
    probabilityMath: Schema.union([
      Schema.const(0).description("直接概率"),
      Schema.const(1).description("特定算法"),
    ])
      .role("radio")
      .default(0)
      .description("牛老婆成功率计算方式"),
    probabilityMathDirect: Schema.number()
      .default(50)
      .min(0)
      .max(100)
      .step(1)
      .description("直接概率(只有选择直接概率时有效)"),
    ntrSwitchgear: Schema.boolean().default(true).description("牛老婆总开关"),
    ntrBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("牛老婆屏蔽群组"),
  }).description("牛老婆设置"),
  Schema.object({
    illustratedBook: Schema.boolean()
      .default(false)
      .description("图鉴收集是否包含牛老婆"),
  }).description("图鉴设置"),
  Schema.object({
    divorceDateInterval: Schema.number()
      .default(10)
      .description("离婚时间间隔(秒)"),
    divorceLimit: Schema.number().default(10).description("离婚次数限制"),
    divorceSwitchgear: Schema.boolean().default(true).description("离婚总开关"),
    divorceBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("离婚屏蔽群组"),
  }).description("离婚设置"),
  Schema.object({
    fuckWifeSwitchgear: Schema.boolean()
      .default(true)
      .description("日老婆总开关"),
    fuckWifeCoolingTime: Schema.number()
      .default(10)
      .description("日老婆冷却时间(秒)"),
    fuckWifeDetailedReply: Schema.boolean()
      .default(false)
      .description("详细回复"),
    fuckWifeVoiceReply: Schema.boolean().default(false).description("语音回复"),
    fuckWifeBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("日老婆屏蔽群组"),
  }).description("日老婆设置"),
  Schema.object({
    messageRecall: Schema.object({
      enabled: Schema.boolean().default(false).description("是否开启插件消息撤回"),
      delay: Schema.number().default(60).description("撤回延迟(秒)"),
      draw: Schema.boolean().default(true).description("撤回“抽老婆”相关消息"),
      ntr: Schema.boolean().default(true).description("撤回“牛老婆”相关消息"),
      query: Schema.boolean().default(true).description("撤回“查老婆”相关消息"),
      album: Schema.boolean().default(true).description("撤回“老婆图鉴”相关消息"),
      divorce: Schema.boolean().default(true).description("撤回“离婚”相关消息"),
      exchange: Schema.boolean().default(true).description("撤回“交换老婆”相关消息"),
      affection: Schema.boolean().default(true).description("撤回“日老婆/好感度”相关消息"),
      add: Schema.boolean().default(true).description("撤回“添加老婆”相关消息"),
      remove: Schema.boolean().default(true).description("撤回“删除老婆”相关消息"),
      update: Schema.boolean().default(true).description("撤回“更新老婆”相关消息"),
      archive: Schema.boolean().default(true).description("撤回“老婆档案”相关消息"),
      userArchive: Schema.boolean().default(true).description("撤回“用户档案”相关消息"),
      sync: Schema.boolean().default(true).description("撤回“更新老婆数据”相关消息"),
      rename: Schema.boolean().default(true).description("撤回“重命名老婆”相关消息"),
    })
      .default({} as any)
      .description("为不同指令设置独立的撤回开关"),
  }).description("消息撤回设置"),
  Schema.object({
    wifeAllOperationGroup: Schema.array(Schema.string())
      .role("table")
      .description("允许所有老婆操作权限的用户组"),
    wifeUploadGroup: Schema.array(Schema.string())
      .role("table")
      .description("仅允许上传老婆权限的用户组"),
    wifeUpdateGroup: Schema.array(Schema.string())
      .role("table")
      .description("仅允许更新老婆权限的用户组"),
    wifeDeleteGroup: Schema.array(Schema.string())
      .role("table")
      .description("仅允许删除老婆权限的用户组"),
  }).description("老婆更新权限设置"),
]);