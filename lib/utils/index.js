"use strict";
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
const camelCase_1 = require("./camelCase");
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
    camelCase: camelCase_1.camelCase,
};
