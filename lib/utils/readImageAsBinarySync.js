"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = readImageAsBinarySync;
const fs_1 = __importDefault(require("fs"));
async function readImageAsBinarySync(imagePath) {
    try {
        return fs_1.default.readFileSync(imagePath);
    }
    catch (error) {
        throw new Error(`读取图片失败: ${error.message}`);
    }
}
