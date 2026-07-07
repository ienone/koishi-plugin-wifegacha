"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.inject = exports.name = void 0;
exports.apply = apply;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const module_1 = require("./module");
const createWifeData_1 = require("./utils/createWifeData");
const command_1 = __importDefault(require("./command"));
const sprit_1 = __importDefault(require("./utils/sprit"));
const config_1 = require("./config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.ConfigSchema; } });
exports.name = "wifegacha";
exports.inject = ["database"];
const wifegachaPath = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
async function apply(ctx, config) {
    await (0, module_1.module)(ctx, config);
    ctx.logger.info("数据库初始化完成");
    sprit_1.default.ensureDirs();
    ctx.logger.info("sprit初始化完成");
    // 初始化老婆图片文件夹
    if (!(0, fs_1.existsSync)(wifegachaPath)) {
        ctx.logger.info("wifegacha文件夹不存在,开始初始化");
        (0, fs_1.mkdirSync)(wifegachaPath);
    }
    // 初始化老婆数据
    if ((await ctx.database.get("wifeData", {})).length === 0) {
        ctx.logger.info("wifeData表中没有数据,开始初始化");
        (0, createWifeData_1.createWifeData)(ctx, config);
    }
    command_1.default.clp(ctx, config);
    command_1.default.nlp(ctx, config);
    command_1.default.chalp(ctx, config);
    command_1.default.lptj(ctx, config);
    command_1.default.lh(ctx, config);
    command_1.default.jhlp(ctx, config);
    command_1.default.rlp(ctx, config);
    command_1.default.tjlp(ctx, config);
    command_1.default.sclp(ctx, config);
    command_1.default.gxlp(ctx, config);
    command_1.default.lpda(ctx, config);
    command_1.default.yhda(ctx, config);
    command_1.default.gxlpsj(ctx, config);
    command_1.default.cmmlp(ctx, config);
}
