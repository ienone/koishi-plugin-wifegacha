"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wifeMigration = wifeMigration;
function wifeMigration(ctx, config) {
    ctx.model.extend("wifeMigration", {
        id: "unsigned",
        key: "string",
        value: "string",
        updatedAt: "timestamp",
    }, {
        autoInc: true,
    });
    ctx.logger.info("wifeMigration 表初始化完成");
}
