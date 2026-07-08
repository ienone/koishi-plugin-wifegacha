"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upWifeData = upWifeData;
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
async function upWifeData(ctx, config) {
    // 获取老婆数据
    const wifeData = await ctx.database.get("wifeData", {});
    // 获取老婆文件列表
    const files = (0, fs_1.readdirSync)(wifegachaPath);
    // 遍历文件列表
    for (const file of files) {
        // 使用 path.parse 拆解文件名
        const parsed = path_1.default.parse(file);
        const splitName = config.wifeNameSeparator;
        const wifeName = parsed.name.split(splitName)[1];
        const comeFrom = parsed.name.split(splitName)[0];
        // 判断老婆数据是否存在
        if (wifeData.find(item => item.name === wifeName)) {
            // 更新老婆数据
            await ctx.database.set('wifeData', { name: wifeName }, {
                comeFrom: comeFrom,
                filepath: path_1.default.join(wifegachaPath, file),
                updatedAt: new Date(),
            });
            continue;
        }
        ctx.logger.info("创建老婆数据", wifeName);
        // 创建老婆数据
        await ctx.database.create('wifeData', {
            name: wifeName,
            comeFrom: comeFrom,
            filepath: path_1.default.join(wifegachaPath, file),
            createdAt: new Date(),
            updatedAt: new Date(),
            groupData: []
        });
    }
    const wifeNewData = await ctx.database.get("wifeData", {});
    // 遍历老婆数据，如果老婆数据不存在，则删除
    for (const item of wifeNewData) {
        const fileNameList = files.map(file => path_1.default.parse(file).name.split(config.wifeNameSeparator)[1]);
        if (!fileNameList.includes(item.name)) {
            ctx.logger.info("删除老婆数据", item.comeFrom + config.wifeNameSeparator + item.name);
            await ctx.database.remove('wifeData', { name: item.name });
        }
    }
    ctx.logger.info('wifeData表更新完成');
    await sprit_1.default.generateThumbnails(ctx);
    sprit_1.default.clearAlbumCache();
}
