"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gxlp = gxlp;
const koishi_1 = require("koishi");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function gxlp(ctx, config) {
    let wifegachaPath = "";
    if (path_1.default.join(__dirname).split("\\").pop() == "command") {
        wifegachaPath = path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
    }
    else {
        wifegachaPath = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
    }
    ctx
        .command("更新老婆 <name> <image> 更新老婆信息")
        .action(async ({ session }, name, image) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "update");
        if (!config.wifeUpdateGroup.includes(session.userId.toString()) && !config.wifeAllOperationGroup.includes(session.userId.toString()) && session.userId !== config.adminId) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "你无权更新老婆"];
        }
        if (!name || !image)
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "缺少参数"];
        if (!image.includes("<img src=")) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "未检测到图片"];
        }
        const wifeData = (await ctx.database.get("wifeData", { name: name }));
        if (wifeData.length === 0) {
            return [(0, koishi_1.h)("quote", { id: session.messageId }), "该老婆不存在，请使用添加老婆命令"];
        }
        const wifeImageData = await ctx.http.get(image.match(/<img\s+src="([^"]+)"/)?.[1].replaceAll("&amp;", "&"));
        const wifeComeFrom = wifeData[0].comeFrom;
        const buffer = Buffer.from(wifeImageData);
        (0, fs_1.unlinkSync)(wifeData[0].filepath);
        (0, fs_1.writeFileSync)(path_1.default.join(wifegachaPath, `${wifeComeFrom ? wifeComeFrom + config.wifeNameSeparator : ''}${name}.png`), buffer);
        await ctx.database.set("wifeData", {
            name: name
        }, {
            comeFrom: wifeComeFrom,
            filepath: path_1.default.join(wifegachaPath, `${wifeComeFrom ? wifeComeFrom + config.wifeNameSeparator : ''}${name}.png`),
        });
        const imageBuffer = await utils_1.default.readImageAsBinarySync(path_1.default.join(wifegachaPath, `${wifeComeFrom ? wifeComeFrom + config.wifeNameSeparator : ''}${name}.png`));
        send([
            (0, koishi_1.h)("quote", { id: session.messageId }),
            "老婆更新成功",
            koishi_1.h.image(imageBuffer, "image/png"),
        ]);
    });
}
