"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wifeData = wifeData;
function wifeData(ctx, config) {
    // ctx.database.drop('wifeData')
    ctx.model.extend("wifeData", {
        id: "unsigned",
        name: "string",
        comeFrom: "string",
        filepath: "string",
        createdAt: "timestamp",
        updatedAt: "timestamp",
        groupData: "json",
    }, {
        autoInc: true,
    });
    ctx.logger.info("wifeData 表初始化完成");
}
