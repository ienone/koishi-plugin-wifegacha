"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWifeData = createWifeData;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sprit_1 = __importDefault(require("./sprit"));
let wifegachaPath = "";
if (path_1.default.join(__dirname).split("\\").pop() == "utils") {
    wifegachaPath = path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
}
else {
    wifegachaPath = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
}
function createWifeData(ctx, config) {
    const files = (0, fs_1.readdirSync)(wifegachaPath);
    // 遍历文件列表
    for (const file of files) {
        // 使用 path.parse 拆解文件名
        const parsed = path_1.default.parse(file);
        const splitName = config.wifeNameSeparator;
        const wifeName = parsed.name.split(splitName)[1];
        const comeFrom = parsed.name.split(splitName)[0];
        ctx.database.create('wifeData', {
            name: wifeName,
            comeFrom: comeFrom,
            filepath: path_1.default.join(wifegachaPath, file),
            createdAt: new Date(),
            groupData: []
        });
    }
    ctx.logger.info('wifeData表初始化完成');
    sprit_1.default.generateThumbnails(ctx);
}
