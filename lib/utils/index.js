"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createUserData_1 = require("./createUserData");
const createGroupData_1 = require("./createGroupData");
const createGroupWifeData_1 = require("./createGroupWifeData");
const createTarget_1 = require("./createTarget");
const getWifeName_1 = require("./getWifeName");
const affectionLevel_1 = require("./affectionLevel");
const getWavFlieName_1 = require("./getWavFlieName");
const createWifeData_1 = require("./createWifeData");
const sprit_1 = __importDefault(require("./sprit"));
const upWifeData_1 = require("./upWifeData");
const createInteraction_1 = require("./createInteraction");
const readImageAsBinarySync_1 = __importDefault(require("./readImageAsBinarySync"));
const isSameDay_1 = require("./isSameDay");
const affection = __importStar(require("./affection"));
exports.default = {
    createUserData: createUserData_1.createUserData,
    createGroupData: createGroupData_1.createGroupData,
    createGroupWifeData: createGroupWifeData_1.createGroupWifeData,
    createTarget: createTarget_1.createTarget,
    checkGroupDate: getWifeName_1.checkGroupDate,
    affectionLevel: affectionLevel_1.affectionLevel,
    getRandomWavFile: getWavFlieName_1.getRandomWavFile,
    createWifeData: createWifeData_1.createWifeData,
    upWifeData: upWifeData_1.upWifeData,
    sprit: sprit_1.default,
    createInteraction: createInteraction_1.createInteraction,
    readImageAsBinarySync: readImageAsBinarySync_1.default,
    isSameDay: isSameDay_1.isSameDay,
    affection,
};
