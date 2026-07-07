"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmmlp = cmmlp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function cmmlp(ctx, config) {
    let wifegachaPath = "";
    if (path_1.default.join(__dirname).split("\\").pop() == "command") {
        wifegachaPath = path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
    }
    else {
        wifegachaPath = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
    }
    ctx
        .command("重命名 <name> <newName> 重命名老婆")
        .action(async ({ session }, name, newName) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "rename");
        if (!config.wifeUpdateGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权重命名老婆"];
        }
        if (!name || !newName)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "缺少参数"];
        if (name.split(config.wifeNameSeparator).length < 2 || newName.split(config.wifeNameSeparator).length < 2) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "老婆名称格式错误,请使用" + config.wifeNameSeparator + "分隔来源和名称"];
        }
        if (name === newName) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "新名称与旧名称相同"];
        }
        const wifeData = (await ctx.database.get("wifeData", { name: name.split(config.wifeNameSeparator)[1] }));
        if (wifeData.length === 0) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在，请使用添加老婆命令"];
        }
        (0, fs_1.renameSync)(wifeData[0].filepath, path_1.default.join(wifegachaPath, `${newName}.png`));
        await ctx.database.set("wifeData", {
            name: newName.split(config.wifeNameSeparator)[1]
        }, {
            comeFrom: newName.split(config.wifeNameSeparator)[0],
            filepath: path_1.default.join(wifegachaPath, `${newName}.png`),
        });
        const imageBuffer = await utils_1.default.readImageAsBinarySync(path_1.default.join(wifegachaPath, `${newName}.png`));
        send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            "老婆更新成功",
            koishi_1.h.image(imageBuffer, "image/png"),
        ]);
    });
}
