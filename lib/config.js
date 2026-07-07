"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
const koishi_1 = require("koishi");
exports.ConfigSchema = koishi_1.Schema.intersect([
    koishi_1.Schema.object({
        wifeNameSeparator: koishi_1.Schema.string()
            .default("+")
            .description("老婆'名称' '来源'分隔符"),
        adminId: koishi_1.Schema.string().required().description("管理员ID"),
        wifeImageQuality: koishi_1.Schema.number()
            .default(75)
            .min(50)
            .max(100)
            .step(1)
            .role("slider")
            .description("老婆图鉴质量(50-100)"),
        lpdaDateInterval: koishi_1.Schema.number()
            .default(10)
            .description("档案查询时间间隔(秒)"),
        blockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("屏蔽的群组"),
    }).description("基础设置"),
    koishi_1.Schema.object({
        ntrOrdinal: koishi_1.Schema.number().default(5).description("牛老婆次数"),
        probabilityMath: koishi_1.Schema.union([
            koishi_1.Schema.const(0).description("直接概率"),
            koishi_1.Schema.const(1).description("特定算法"),
        ])
            .role("radio")
            .default(0)
            .description("牛老婆成功率计算方式"),
        probabilityMathDirect: koishi_1.Schema.number()
            .default(50)
            .min(0)
            .max(100)
            .step(1)
            .description("直接概率(只有选择直接概率时有效)"),
        ntrSwitchgear: koishi_1.Schema.boolean().default(true).description("牛老婆总开关"),
        ntrBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("牛老婆屏蔽群组"),
    }).description("牛老婆设置"),
    koishi_1.Schema.object({
        illustratedBook: koishi_1.Schema.boolean()
            .default(false)
            .description("图鉴收集是否包含牛老婆"),
    }).description("图鉴设置"),
    koishi_1.Schema.object({
        divorceDateInterval: koishi_1.Schema.number()
            .default(10)
            .description("离婚时间间隔(秒)"),
        divorceLimit: koishi_1.Schema.number().default(10).description("离婚次数限制"),
        divorceSwitchgear: koishi_1.Schema.boolean().default(true).description("离婚总开关"),
        divorceBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("离婚屏蔽群组"),
    }).description("离婚设置"),
    koishi_1.Schema.object({
        fuckWifeSwitchgear: koishi_1.Schema.boolean()
            .default(true)
            .description("日老婆总开关"),
        fuckWifeCoolingTime: koishi_1.Schema.number()
            .default(10)
            .description("日老婆冷却时间(秒)"),
        fuckWifeDetailedReply: koishi_1.Schema.boolean()
            .default(false)
            .description("详细回复"),
        fuckWifeVoiceReply: koishi_1.Schema.boolean().default(false).description("语音回复"),
        fuckWifeBlockGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .default([])
            .collapse()
            .description("日老婆屏蔽群组"),
    }).description("日老婆设置"),
    koishi_1.Schema.object({
        messageRecall: koishi_1.Schema.object({
            enabled: koishi_1.Schema.boolean().default(false).description("是否开启插件消息撤回"),
            delay: koishi_1.Schema.number().default(60).description("撤回延迟(秒)"),
            draw: koishi_1.Schema.boolean().default(true).description("撤回“抽老婆”相关消息"),
            ntr: koishi_1.Schema.boolean().default(true).description("撤回“牛老婆”相关消息"),
            query: koishi_1.Schema.boolean().default(true).description("撤回“查老婆”相关消息"),
            album: koishi_1.Schema.boolean().default(true).description("撤回“老婆图鉴”相关消息"),
            divorce: koishi_1.Schema.boolean().default(true).description("撤回“离婚”相关消息"),
            exchange: koishi_1.Schema.boolean().default(true).description("撤回“交换老婆”相关消息"),
            affection: koishi_1.Schema.boolean().default(true).description("撤回“日老婆/好感度”相关消息"),
            add: koishi_1.Schema.boolean().default(true).description("撤回“添加老婆”相关消息"),
            remove: koishi_1.Schema.boolean().default(true).description("撤回“删除老婆”相关消息"),
            update: koishi_1.Schema.boolean().default(true).description("撤回“更新老婆”相关消息"),
            archive: koishi_1.Schema.boolean().default(true).description("撤回“老婆档案”相关消息"),
            userArchive: koishi_1.Schema.boolean().default(true).description("撤回“用户档案”相关消息"),
            sync: koishi_1.Schema.boolean().default(true).description("撤回“更新老婆数据”相关消息"),
            rename: koishi_1.Schema.boolean().default(true).description("撤回“重命名老婆”相关消息"),
        })
            .default({})
            .description("为不同指令设置独立的撤回开关"),
    }).description("消息撤回设置"),
    koishi_1.Schema.object({
        wifeAllOperationGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .description("允许所有老婆操作权限的用户组"),
        wifeUploadGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .description("仅允许上传老婆权限的用户组"),
        wifeUpdateGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .description("仅允许更新老婆权限的用户组"),
        wifeDeleteGroup: koishi_1.Schema.array(koishi_1.Schema.string())
            .role("table")
            .description("仅允许删除老婆权限的用户组"),
    }).description("老婆更新权限设置"),
]);
