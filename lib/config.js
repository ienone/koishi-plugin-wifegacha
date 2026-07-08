"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
const koishi_1 = require("koishi");
exports.ConfigSchema = koishi_1.Schema.intersect([
    koishi_1.Schema.object({
        wifeNameSeparator: koishi_1.Schema.string()
            .default("+")
            .description("老婆资源文件名中的来源和名称分隔符，例如 来源+名称.png。影响新增老婆、更新老婆数据、重命名老婆。"),
        adminId: koishi_1.Schema.string()
            .required()
            .description("插件管理员用户 ID。拥有新增、更新、删除、重命名、更新老婆数据等管理命令权限。"),
        wifeImageQuality: koishi_1.Schema.number()
            .default(75)
            .min(50)
            .max(100)
            .step(1)
            .role("slider")
            .description("老婆图鉴最终 JPG 输出质量，范围 50-100，默认 75。影响 老婆图鉴。"),
        lpdaDateInterval: koishi_1.Schema.number()
            .default(10)
            .description("档案查询冷却时间，单位秒，按用户+群分别计算，默认 10。影响 用户档案、群老婆档案。"),
        blockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("全局屏蔽群号列表。命中的群不会响应本插件任何命令。"),
    }).description("基础设置"),
    koishi_1.Schema.object({
        ntrSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用 牛老婆 命令。"),
        ntrOrdinal: koishi_1.Schema.number()
            .default(5)
            .description("每个用户每天在每个群的 牛老婆 尝试次数上限，默认 5。"),
        ntrBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("禁用 牛老婆 命令的群号列表。"),
    }).description("牛老婆设置"),
    koishi_1.Schema.object({
        illustratedBook: koishi_1.Schema.boolean()
            .default(false)
            .description("老婆图鉴是否把通过 牛老婆 获得的老婆计入收集进度。默认 false，仅统计正常抽取。"),
    }).description("图鉴设置"),
    koishi_1.Schema.object({
        divorceSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用 离婚 命令。"),
        divorceDateInterval: koishi_1.Schema.number()
            .default(10)
            .description("离婚冷却时间，单位秒，按用户+群分别计算，默认 10。影响 离婚。"),
        divorceLimit: koishi_1.Schema.number()
            .default(10)
            .description("每个用户每天在每个群的 离婚 次数上限，默认 10。"),
        divorceBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("禁用 离婚 命令的群号列表。"),
    }).description("离婚设置"),
    koishi_1.Schema.object({
        fuckWifeSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用 日老婆 命令。"),
        kissWifeSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用 亲老婆/亲亲 命令。"),
        dateWifeSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用 约会 命令。"),
        fuckWifeCoolingTime: koishi_1.Schema.number()
            .default(10)
            .description("日老婆冷却时间，单位秒，按用户+群分别计算，默认 10。"),
        kissWifeCoolingTime: koishi_1.Schema.number()
            .default(60)
            .description("亲老婆/亲亲冷却时间，单位秒，按用户+群分别计算，默认 60。"),
        dateWifeCoolingTime: koishi_1.Schema.number()
            .default(21600)
            .description("约会冷却时间，单位秒，按用户+群分别计算，默认 21600（6 小时）。"),
        fuckWifeBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("禁用 日老婆 命令的群号列表。"),
        kissWifeBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("禁用 亲老婆/亲亲 命令的群号列表。"),
        dateWifeBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("禁用 约会 命令的群号列表。"),
        affectionCatastropheSwitchgear: koishi_1.Schema.boolean()
            .default(false)
            .description("是否启用极低概率好感重事件。触发后当前老婆好感清零、失去当前老婆，并进入禁抽提示时间。"),
        affectionCatastropheProbability: koishi_1.Schema.number()
            .default(0.1)
            .min(0)
            .max(100)
            .description("好感重事件触发概率，单位百分比，默认 0.1。影响 日老婆、亲老婆/亲亲、约会。"),
        affectionCatastropheBanSeconds: koishi_1.Schema.number()
            .default(3600)
            .description("好感重事件后的禁抽提示时间，单位秒，默认 3600。影响 抽老婆。"),
        affectionEventSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("是否启用好感互动彩蛋事件。影响 日老婆、亲老婆/亲亲、约会。"),
        affectionEventProbability: koishi_1.Schema.number()
            .default(35)
            .min(0)
            .max(100)
            .step(1)
            .description("每次好感互动触发普通彩蛋事件的概率，单位百分比，默认 35。"),
        affectionEventHeavyProbability: koishi_1.Schema.number()
            .default(1)
            .min(0)
            .max(100)
            .step(0.1)
            .description("彩蛋池中允许重事件进入抽取的概率，单位百分比，默认 1。重事件可能导致失败、清零、失去当前老婆或禁抽。"),
        affectionEventPreset: koishi_1.Schema.union([
            koishi_1.Schema.const("balanced").description("标准：正负事件都有，重事件受独立概率限制"),
            koishi_1.Schema.const("light").description("温和：过滤重事件和高惩罚事件"),
            koishi_1.Schema.const("chaos").description("混沌：使用完整事件池，适合娱乐群"),
        ])
            .role("radio")
            .default("balanced")
            .description("好感彩蛋预设。"),
        customAffectionEvents: koishi_1.Schema.array(koishi_1.Schema.object({
            id: koishi_1.Schema.string().required().description("事件 ID，建议使用英文或拼音，不能重复"),
            enabled: koishi_1.Schema.boolean().default(true).description("是否启用该自定义事件"),
            actions: koishi_1.Schema.array(koishi_1.Schema.union([
                koishi_1.Schema.const("fuck").description("日老婆"),
                koishi_1.Schema.const("kiss").description("亲老婆/亲亲"),
                koishi_1.Schema.const("date").description("约会"),
            ])).default([]).description("该事件可触发的命令"),
            weight: koishi_1.Schema.number().default(1).min(0).description("事件权重，越高越容易被抽中"),
            deltaMode: koishi_1.Schema.union([
                koishi_1.Schema.const("add").description("在原好感变化上加减 deltaValue"),
                koishi_1.Schema.const("multiply").description("把原好感变化乘以 deltaValue"),
                koishi_1.Schema.const("set").description("把好感变化直接设为 deltaValue"),
            ]).default("add").description("好感变化计算方式"),
            deltaValue: koishi_1.Schema.number().default(0).description("好感变化参数，含义由 deltaMode 决定"),
            message: koishi_1.Schema.string().required().description("触发后展示给用户的事件文案"),
            heavy: koishi_1.Schema.boolean().default(false).description("是否为重事件；重事件还会受重事件概率限制"),
            failAction: koishi_1.Schema.boolean().default(false).description("是否让本次互动失败并把好感变化设为 0"),
            clearAffection: koishi_1.Schema.boolean().default(false).description("是否清空当前老婆好感度"),
            loseCurrentWife: koishi_1.Schema.boolean().default(false).description("是否失去当前老婆"),
            drawBanSeconds: koishi_1.Schema.number().default(0).description("触发后禁抽秒数；0 表示使用重事件默认禁抽时间"),
        }))
            .role("table")
            .default([])
            .description("自定义好感彩蛋事件。留空时使用内置事件池。"),
    }).description("好感互动设置"),
    koishi_1.Schema.object({
        messageRecall: koishi_1.Schema.object({
            enabled: koishi_1.Schema.boolean().default(false).description("是否开启插件消息撤回。"),
            delay: koishi_1.Schema.number().default(60).description("插件消息撤回延迟，单位秒，默认 60。"),
            draw: koishi_1.Schema.boolean().default(true).description("撤回 抽老婆 相关消息。"),
            ntr: koishi_1.Schema.boolean().default(true).description("撤回 牛老婆 相关消息。"),
            query: koishi_1.Schema.boolean().default(true).description("撤回 查老婆 相关消息。"),
            album: koishi_1.Schema.boolean().default(true).description("撤回 老婆图鉴 相关消息。"),
            divorce: koishi_1.Schema.boolean().default(true).description("撤回 离婚 相关消息。"),
            exchange: koishi_1.Schema.boolean().default(true).description("撤回 交换老婆 相关消息。"),
            affection: koishi_1.Schema.boolean().default(true).description("撤回 日老婆、亲老婆/亲亲、约会 相关消息。"),
            add: koishi_1.Schema.boolean().default(true).description("撤回 新增老婆 相关消息。"),
            remove: koishi_1.Schema.boolean().default(true).description("撤回 删除老婆 相关消息。"),
            update: koishi_1.Schema.boolean().default(true).description("撤回 更新老婆 相关消息。"),
            archive: koishi_1.Schema.boolean().default(true).description("撤回 群老婆档案 相关消息。"),
            userArchive: koishi_1.Schema.boolean().default(true).description("撤回 用户档案、群档案 相关消息。"),
            sync: koishi_1.Schema.boolean().default(true).description("撤回 更新老婆数据 相关消息。"),
            rename: koishi_1.Schema.boolean().default(true).description("撤回 重命名老婆 相关消息。"),
        })
            .default({})
            .description("为不同命令设置独立的插件消息撤回开关。"),
    }).description("消息撤回设置"),
    koishi_1.Schema.object({
        wifeAllOperationGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .default([])
            .description("拥有所有老婆管理权限的用户 ID 列表。影响 新增老婆、更新老婆、删除老婆、重命名老婆。"),
        wifeUploadGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .default([])
            .description("允许使用 新增老婆 的用户 ID 列表。"),
        wifeUpdateGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .default([])
            .description("允许使用 更新老婆、重命名老婆 的用户 ID 列表。"),
        wifeDeleteGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .default([])
            .description("允许使用 删除老婆 的用户 ID 列表。"),
    }).description("老婆管理权限设置"),
]);
