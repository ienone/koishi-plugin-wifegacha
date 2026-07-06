"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTarget = createTarget;
async function createTarget(ctx, session, userId) {
    if ((await ctx.database.get("wifeUser", {
        userId: userId,
        groupId: session.channelId.toString(),
    })).length === 0) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        ctx.logger.info("还没有抽过老婆，创建用户数据");
        ctx.database.create("wifeUser", {
            userId: userId,
            groupId: session.channelId.toString(),
            wifeHistories: [],
            interactionWithOtherUser: [],
            ntrOrdinal: 0,
            createdAt: new Date(),
            ntrCount: 0,
            ntrTotalCount: 0,
            ntrSuccessCount: 0,
            drawCount: 0,
            exchangeCount: 0,
            divorceCount: 0,
            totalAffection: 0,
            targetNtrCount: 0,
            targetNtrSuccessCount: 0,
            operationDate: yesterday,
            // todayAffection: [],
        });
    }
}
