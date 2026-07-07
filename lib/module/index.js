"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.module = module;
const wifeUser_1 = require("./wifeUser");
const wifeData_1 = require("./wifeData");
const groupData_1 = require("./groupData");
async function module(ctx, config) {
    (0, wifeUser_1.wifeUser)(ctx, config);
    (0, wifeData_1.wifeData)(ctx, config);
    (0, groupData_1.groupData)(ctx, config);
}
