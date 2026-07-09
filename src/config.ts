import { Schema } from "koishi";
import type { MessageRecallSettings } from "./utils/messageRecall";

export interface Config {
  blockGroup: string[];
  adminId: string;
  wifeNameSeparator: string;
  wifeImageQuality: number;
  lpdaDateInterval: number;

  ntrOrdinal: number;
  ntrSwitchgear: boolean;
  ntrBlockGroup: string[];

  illustratedBook: boolean;

  divorceDateInterval: number;
  divorceLimit: number;
  divorceSwitchgear: boolean;
  divorceBlockGroup: string[];

  fuckWifeSwitchgear: boolean;
  kissWifeSwitchgear: boolean;
  dateWifeSwitchgear: boolean;
  fuckWifeCoolingTime: number;
  kissWifeCoolingTime: number;
  dateWifeCoolingTime: number;
  fuckWifeBlockGroup: string[];
  kissWifeBlockGroup: string[];
  dateWifeBlockGroup: string[];
  affectionCatastropheSwitchgear: boolean;
  affectionCatastropheProbability: number;
  affectionCatastropheBanSeconds: number;
  affectionEventSwitchgear: boolean;
  affectionEventProbability: number;
  affectionEventHeavyProbability: number;
  customAffectionEvents: Array<{
    id: string;
    enabled: boolean;
    actions: Array<"fuck" | "kiss" | "date">;
    weight: number;
    deltaMode: "add" | "multiply" | "set";
    deltaValue: number;
    message: string;
    heavy: boolean;
    failAction: boolean;
    clearAffection: boolean;
    loseCurrentWife: boolean;
    drawBanSeconds: number;
  }>;

  wifeAllOperationGroup: string[];
  wifeUploadGroup: string[];
  wifeUpdateGroup: string[];
  wifeDeleteGroup: string[];

  messageRecall: MessageRecallSettings;
}

export const ConfigSchema: Schema<Config> = Schema.intersect([
  Schema.object({
    wifeNameSeparator: Schema.string()
      .default("+")
      .description("老婆资源文件名中的来源和名称分隔符，例如 来源+名称.png。影响新增老婆、更新老婆数据、重命名老婆。"),
    adminId: Schema.string()
      .required()
      .description("插件管理员用户 ID。拥有新增、更新、删除、重命名、更新老婆数据等管理命令权限。"),
    wifeImageQuality: Schema.number()
      .default(75)
      .min(50)
      .max(100)
      .step(1)
      .role("slider")
      .description("老婆图鉴最终 JPG 输出质量，范围 50-100，默认 75。影响 老婆图鉴。"),
    lpdaDateInterval: Schema.number()
      .default(10)
      .description("档案查询冷却时间，单位秒，按用户+群分别计算，默认 10。影响 用户档案、群老婆档案。"),
    blockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("全局屏蔽群号列表。命中的群不会响应本插件任何命令。"),
  }).description("基础设置"),

  Schema.object({
    ntrSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用 牛老婆 命令。"),
    ntrOrdinal: Schema.number()
      .default(5)
      .description("每个用户每天在每个群的 牛老婆 尝试次数上限，默认 5。"),
    ntrBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("禁用 牛老婆 命令的群号列表。"),
  }).description("牛老婆设置"),

  Schema.object({
    illustratedBook: Schema.boolean()
      .default(false)
      .description("老婆图鉴是否把通过 牛老婆 获得的老婆计入收集进度。默认 false，仅统计正常抽取。"),
  }).description("图鉴设置"),

  Schema.object({
    divorceSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用 离婚 命令。"),
    divorceDateInterval: Schema.number()
      .default(10)
      .description("离婚冷却时间，单位秒，按用户+群分别计算，默认 10。影响 离婚。"),
    divorceLimit: Schema.number()
      .default(10)
      .description("每个用户每天在每个群的 离婚 次数上限，默认 10。"),
    divorceBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("禁用 离婚 命令的群号列表。"),
  }).description("离婚设置"),

  Schema.object({
    fuckWifeSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用 日老婆 命令。"),
    kissWifeSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用 亲老婆/亲亲 命令。"),
    dateWifeSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用 约会 命令。"),
    fuckWifeCoolingTime: Schema.number()
      .default(10)
      .description("日老婆冷却时间，单位秒，按用户+群分别计算，默认 10。"),
    kissWifeCoolingTime: Schema.number()
      .default(60)
      .description("亲老婆/亲亲冷却时间，单位秒，按用户+群分别计算，默认 60。"),
    dateWifeCoolingTime: Schema.number()
      .default(21600)
      .description("约会冷却时间，单位秒，按用户+群分别计算，默认 21600（6 小时）。"),
    fuckWifeBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("禁用 日老婆 命令的群号列表。"),
    kissWifeBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("禁用 亲老婆/亲亲 命令的群号列表。"),
    dateWifeBlockGroup: Schema.array(Schema.string())
      .default([])
      .collapse()
      .description("禁用 约会 命令的群号列表。"),
    affectionCatastropheSwitchgear: Schema.boolean()
      .default(false)
      .description("是否启用极低概率好感重事件。触发后当前老婆好感清零、失去当前老婆，并进入禁抽提示时间。"),
    affectionCatastropheProbability: Schema.number()
      .default(0.1)
      .min(0)
      .max(100)
      .description("好感重事件触发概率，单位百分比，默认 0.1。影响 日老婆、亲老婆/亲亲、约会。"),
    affectionCatastropheBanSeconds: Schema.number()
      .default(3600)
      .description("好感重事件后的禁抽提示时间，单位秒，默认 3600。影响 抽老婆。"),
    affectionEventSwitchgear: Schema.boolean()
      .default(true)
      .description("是否启用好感互动彩蛋事件。影响 日老婆、亲老婆/亲亲、约会。"),
    affectionEventProbability: Schema.number()
      .default(35)
      .min(0)
      .max(100)
      .step(1)
      .description("每次好感互动触发普通彩蛋事件的概率，单位百分比，默认 35。"),
    affectionEventHeavyProbability: Schema.number()
      .default(1)
      .min(0)
      .max(100)
      .step(0.1)
      .description("彩蛋池中允许重事件进入抽取的概率，单位百分比，默认 1。重事件可能导致失败、清零、失去当前老婆或禁抽。"),
    customAffectionEvents: Schema.array(Schema.object({
      id: Schema.string().required().description("事件 ID，建议使用英文或拼音，不能重复"),
      enabled: Schema.boolean().default(true).description("是否启用该自定义事件"),
      actions: Schema.array(Schema.union([
        Schema.const("fuck").description("日老婆"),
        Schema.const("kiss").description("亲老婆/亲亲"),
        Schema.const("date").description("约会"),
      ])).default([]).description("该事件可触发的命令"),
      weight: Schema.number().default(1).min(0).description("事件权重，越高越容易被抽中"),
      deltaMode: Schema.union([
        Schema.const("add").description("在原好感变化上加减 deltaValue"),
        Schema.const("multiply").description("把原好感变化乘以 deltaValue"),
        Schema.const("set").description("把好感变化直接设为 deltaValue"),
      ]).default("add").description("好感变化计算方式"),
      deltaValue: Schema.number().default(0).description("好感变化参数，含义由 deltaMode 决定"),
      message: Schema.string().required().description("触发后展示给用户的事件文案"),
      heavy: Schema.boolean().default(false).description("是否为重事件；重事件还会受重事件概率限制"),
      failAction: Schema.boolean().default(false).description("是否让本次互动失败并把好感变化设为 0"),
      clearAffection: Schema.boolean().default(false).description("是否清空当前老婆好感度"),
      loseCurrentWife: Schema.boolean().default(false).description("是否失去当前老婆"),
      drawBanSeconds: Schema.number().default(0).description("触发后禁抽秒数；0 表示使用重事件默认禁抽时间"),
    }))
      .role("table")
      .default([])
      .description("自定义好感彩蛋事件。留空时使用内置事件池。"),
  }).description("好感互动设置"),

  Schema.object({
    messageRecall: Schema.object({
      enabled: Schema.boolean().default(false).description("是否开启插件消息撤回。"),
      delay: Schema.number().default(60).description("插件消息撤回延迟，单位秒，默认 60。"),
      draw: Schema.boolean().default(true).description("撤回 抽老婆 相关消息。"),
      ntr: Schema.boolean().default(true).description("撤回 牛老婆 相关消息。"),
      query: Schema.boolean().default(true).description("撤回 查老婆 相关消息。"),
      album: Schema.boolean().default(true).description("撤回 老婆图鉴 相关消息。"),
      divorce: Schema.boolean().default(true).description("撤回 离婚 相关消息。"),
      exchange: Schema.boolean().default(true).description("撤回 交换老婆 相关消息。"),
      affection: Schema.boolean().default(true).description("撤回 日老婆、亲老婆/亲亲、约会 相关消息。"),
      add: Schema.boolean().default(true).description("撤回 新增老婆 相关消息。"),
      remove: Schema.boolean().default(true).description("撤回 删除老婆 相关消息。"),
      update: Schema.boolean().default(true).description("撤回 更新老婆 相关消息。"),
      archive: Schema.boolean().default(true).description("撤回 群老婆档案 相关消息。"),
      userArchive: Schema.boolean().default(true).description("撤回 用户档案、群档案 相关消息。"),
      sync: Schema.boolean().default(true).description("撤回 更新老婆数据 相关消息。"),
      rename: Schema.boolean().default(true).description("撤回 重命名老婆 相关消息。"),
    })
      .default({} as any)
      .description("为不同命令设置独立的插件消息撤回开关。"),
  }).description("消息撤回设置"),

  Schema.object({
    wifeAllOperationGroup: Schema.array(Schema.string())
      .role("table")
      .default([])
      .description("拥有所有老婆管理权限的用户 ID 列表。影响 新增老婆、更新老婆、删除老婆、重命名老婆。"),
    wifeUploadGroup: Schema.array(Schema.string())
      .role("table")
      .default([])
      .description("允许使用 新增老婆 的用户 ID 列表。"),
    wifeUpdateGroup: Schema.array(Schema.string())
      .role("table")
      .default([])
      .description("允许使用 更新老婆、重命名老婆 的用户 ID 列表。"),
    wifeDeleteGroup: Schema.array(Schema.string())
      .role("table")
      .default([])
      .description("允许使用 删除老婆 的用户 ID 列表。"),
  }).description("老婆管理权限设置"),
]);
