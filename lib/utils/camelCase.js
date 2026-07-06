"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCase = camelCase;
/**
 * 计算牛老婆成功率（%）
 * @param lpNum 黄毛老婆数量
 * @param ntrSuccessCount 黄毛牛老婆成功次数
 * @param targetWifeNum 苦主老婆数量
 * @param targetaffectionLevel 苦主老婆好感度等级
 * @param affection 黄毛对苦主老婆的好感度
 * @param targetAffection 苦主老婆好感度
 * @returns 成功率
 */
function camelCase(lpNum, ntrSuccessCount, targetWifeNum, targetaffectionLevel, targetTodayAffection, affection = 0, targetWifeAffection = 0) {
    // const a = 0.8 * Math.pow(0.05,1/(lpNum+ntrSuccessCount))
    // const b = 0.5 + Math.atan(targetWifeNum/targetaffectionLevel)/Math.PI
    // const c = (Math.exp(targetTodayAffection)/6 + 0.5) * Math.pow(0.01,affection)
    // const rate = (a * b / c) * 100
    // console.log(a,b,c,rate)
    // // 保留两位小数（数字类型）
    // return Number(rate.toFixed(2));
    console.log("targetWifeAffection", targetWifeAffection, "affection", affection);
    const result = 50 + (100 * Math.atan((targetWifeAffection - affection) / 10)) / Math.PI;
    return parseFloat(result.toFixed(2)); // 返回数字类型，保留两位小数
}
