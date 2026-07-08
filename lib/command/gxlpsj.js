"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gxlpsj = gxlpsj;
const koishi_1 = require("koishi");
const utils_1 = __importDefault(require("../utils"));
const messageRecall_1 = require("../utils/messageRecall");
function gxlpsj(ctx, config) {
    ctx.command("更新老婆数据", "管理员同步资源目录到 wifeData，并刷新缩略图与图鉴缓存").action(async ({ session }) => {
        const send = (0, messageRecall_1.createRecallSender)(session, ctx, config, "sync");
        if (session.userId !== config.adminId) {
            return;
        }
        await utils_1.default.upWifeData(ctx, config);
        send([(0, koishi_1.h)("quote", { id: session.messageId }), "更新老婆数据完成"]);
    });
}
