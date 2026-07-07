"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroupData = createGroupData;
async function createGroupData(ctx, session) {
    if ((await ctx.database.get("groupData", {
        groupId: session.channelId.toString(),
    })).length === 0) {
        ctx.logger.info("还没有创建群数据，创建群数据");
        ctx.database.create("groupData", {
            groupId: session.channelId.toString(),
            drawCount: 0,
            ntrTotalCount: 0,
            ntrSuccessCount: 0,
            exchangeCount: 0,
            divorceTotalCount: 0,
            fuckTotalCount: 0,
        });
    }
}
