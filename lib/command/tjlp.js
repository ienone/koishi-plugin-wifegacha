"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tjlp = tjlp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function tjlp(ctx, config) {
    let wifegachaPath = "";
    if (path_1.default.join(__dirname).split("\\").pop() == "command") {
        wifegachaPath = path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
    }
    else {
        wifegachaPath = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
    }
    ctx
        .command("添加老婆 <name> <image> 添加老婆信息")
        .action(async ({ session }, name, image) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "add");
        ctx.logger.info(path_1.default.join(__dirname));
        if (!config.wifeUploadGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权添加老婆"];
        }
        // ctx.logger.info(name, comeFrom, image)
        if (!name || !image)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "缺少参数"];
        if (name.split(config.wifeNameSeparator).length < 2) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "老婆名称格式错误,请使用" + config.wifeNameSeparator + "分隔来源和名称"];
        }
        if (!image.includes("<img src=")) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "未检测到图片"];
        }
        const wifeNameList = (await ctx.database.get("wifeData", {})).map(item => item.name);
        if (wifeNameList.includes(name.split(config.wifeNameSeparator)[1])) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆已存在，请使用更新老婆命令"];
        }
        const wifeImageData = await ctx.http.get(image.match(/<img\s+src="([^"]+)"/)?.[1].replaceAll("&amp;", "&"));
        const buffer = Buffer.from(wifeImageData);
        (0, fs_1.writeFileSync)(path_1.default.join(wifegachaPath, `${name}.png`), buffer);
        await ctx.database.create("wifeData", {
            name: name.split(config.wifeNameSeparator)[1],
            comeFrom: name.split(config.wifeNameSeparator)[0],
            filepath: path_1.default.join(wifegachaPath, `${name}.png`),
            createdAt: new Date(),
            groupData: []
        });
        const imageBuffer = await utils_1.default.readImageAsBinarySync(path_1.default.join(wifegachaPath, `${name}.png`));
        send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            "老婆添加成功",
            koishi_1.h.image(imageBuffer, "image/png"),
        ]);
    });
}
